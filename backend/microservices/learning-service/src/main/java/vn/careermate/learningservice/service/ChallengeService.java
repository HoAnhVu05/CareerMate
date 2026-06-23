package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.Badge;
import vn.careermate.learningservice.model.Challenge;
import vn.careermate.learningservice.model.ChallengeParticipation;
import vn.careermate.learningservice.model.StudentBadge;
import vn.careermate.learningservice.repository.BadgeRepository;
import vn.careermate.learningservice.repository.ChallengeParticipationRepository;
import vn.careermate.learningservice.repository.ChallengeRepository;
import vn.careermate.learningservice.repository.StudentBadgeRepository;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserServiceClient userServiceClient;

    public List<Challenge> getAvailableChallenges(String category) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Challenge> challenges;
            
            if (category != null && !category.isEmpty()) {
                challenges = challengeRepository.findByCategory(category);
                // Filter by date for category query too
                challenges = challenges.stream()
                    .filter(c -> (c.getStartDate() == null || !c.getStartDate().isAfter(now))
                              && (c.getEndDate() == null || !c.getEndDate().isBefore(now)))
                    .collect(java.util.stream.Collectors.toList());
            } else {
                // Get all challenges, then filter by active dates
                // Include challenges with null startDate or endDate (always active)
                challenges = challengeRepository.findAll().stream()
                    .filter(c -> (c.getStartDate() == null || !c.getStartDate().isAfter(now))
                              && (c.getEndDate() == null || !c.getEndDate().isBefore(now)))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            log.debug("Found {} available challenges (category: {})", challenges.size(), category);
            return challenges;
        } catch (Exception e) {
            log.error("Error getting available challenges", e);
            throw new RuntimeException("Error getting available challenges: " + e.getMessage(), e);
        }
    }

    public Challenge getChallengeById(UUID challengeId) {
        try {
            Challenge challenge = challengeRepository.findById(challengeId)
                    .orElseThrow(() -> new RuntimeException("Challenge not found"));
            // Load badge entity if badgeId exists
            if (challenge.getBadgeId() != null) {
                try {
                    Badge badge = badgeRepository.findById(challenge.getBadgeId()).orElse(null);
                    if (badge != null) {
                        challenge.setBadge(badge);
                        log.debug("Loaded challenge {} with badge {}", challengeId, badge.getId());
                    }
                } catch (Exception e) {
                    log.warn("Could not load badge {} for challenge {}: {}", 
                            challenge.getBadgeId(), challengeId, e.getMessage());
                }
            } else {
                log.debug("Loaded challenge {} without badge", challengeId);
            }
            return challenge;
        } catch (java.util.NoSuchElementException e) {
            log.warn("Challenge not found: {}", challengeId);
            throw new RuntimeException("Challenge not found");
        } catch (Exception e) {
            log.error("Error getting challenge by id: {}", challengeId, e);
            throw new RuntimeException("Error getting challenge: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ChallengeParticipation joinChallenge(UUID challengeId) {
        Challenge challenge = getChallengeById(challengeId);
        UUID studentId = getCurrentStudentId();
        
        // Verify student exists via Feign Client
        try {
            StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            log.error("Error fetching student profile: {}", e.getMessage());
            throw new RuntimeException("Student not found");
        }

        // Check if already joined
        participationRepository.findByStudentId(studentId).stream()
                .filter(p -> p.getChallenge().getId().equals(challengeId))
                .findFirst()
                .ifPresent(p -> {
                    throw new RuntimeException("Already joined this challenge");
                });

        ChallengeParticipation participation = ChallengeParticipation.builder()
                .studentId(studentId) // Use UUID instead of entity
                .challenge(challenge)
                .status(ChallengeParticipation.ParticipationStatus.IN_PROGRESS)
                .build();

        return participationRepository.save(participation);
    }

    @Transactional
    public ChallengeParticipation submitChallenge(UUID challengeId, String answer, String attachmentUrl) {
        UUID studentId = getCurrentStudentId();
        
        // Get challenge to access passing score and expected keywords
        Challenge challenge = getChallengeById(challengeId);
        
        // Find or create participation
        ChallengeParticipation participation = participationRepository.findByStudentId(studentId).stream()
                .filter(p -> p.getChallenge().getId().equals(challengeId))
                .findFirst()
                .orElse(null);
        
        if (participation == null) {
            // Auto-join if not already joined
            participation = joinChallenge(challengeId);
        }
        
        // Update submission
        participation.setAnswer(answer);
        participation.setAttachmentUrl(attachmentUrl);
        participation.setSubmittedAt(LocalDateTime.now());
        
        // Auto-grade the submission
        Integer score = autoGradeSubmission(answer, challenge);
        participation.setScore(score);
        log.info("Submission scored: {} points for challenge {}", score, challengeId);
        
        // Get passing score (default 70 if not set)
        Integer passingScore = challenge.getPassingScore() != null ? challenge.getPassingScore() : 70;
        log.info("Passing score required: {} for challenge {}", passingScore, challengeId);
        log.info("Challenge badgeId: {} for challenge {}", challenge.getBadgeId(), challengeId);
        
        // If score meets passing requirement, automatically complete and award badge
        if (score >= passingScore) {
            participation.setStatus(ChallengeParticipation.ParticipationStatus.COMPLETED);
            participation.setCompletedAt(LocalDateTime.now());
            log.info("Challenge completed! Score: {}, Passing: {}, Status set to COMPLETED", score, passingScore);
            
            // Award badge if challenge has one
            if (challenge.getBadgeId() != null) {
                try {
                    awardBadge(studentId, challenge.getBadgeId());
                    log.info("Awarded badge {} to student {} for completing challenge {}", 
                            challenge.getBadgeId(), studentId, challengeId);
                } catch (Exception e) {
                    log.error("Error awarding badge: {}", e.getMessage(), e);
                    // Continue even if badge award fails
                }
            } else {
                log.warn("Challenge {} has no badgeId - no badge will be awarded", challengeId);
            }
        } else {
            participation.setStatus(ChallengeParticipation.ParticipationStatus.FAILED);
            log.info("Challenge failed! Score: {}, Passing: {}, Status set to FAILED", score, passingScore);
        }
        
        participation = participationRepository.save(participation);
        
        // Load badge information if challenge has one and participation is completed
        try {
            // Reload challenge to ensure it's in persistence context
            Challenge reloadedChallenge = challengeRepository.findById(challengeId).orElse(null);
            if (reloadedChallenge != null) {
                // Load all challenge fields
                reloadedChallenge.getId();
                reloadedChallenge.getTitle();
                reloadedChallenge.getDescription();
                reloadedChallenge.getCategory();
                reloadedChallenge.getDifficulty();
                
                // Load badge entity if badgeId exists and participation is completed
                log.info("Checking badge for challenge {}: badgeId={}, status={}", 
                        challengeId, reloadedChallenge.getBadgeId(), participation.getStatus());
                if (reloadedChallenge.getBadgeId() != null && 
                    participation.getStatus() == ChallengeParticipation.ParticipationStatus.COMPLETED) {
                    try {
                        Badge badge = badgeRepository.findById(reloadedChallenge.getBadgeId()).orElse(null);
                        if (badge != null) {
                            reloadedChallenge.setBadge(badge);
                            log.info("Loaded badge {} ({}) for challenge {} in participation response", 
                                    badge.getId(), badge.getName(), challengeId);
                        } else {
                            log.warn("Badge {} not found in repository for challenge {}", 
                                    reloadedChallenge.getBadgeId(), challengeId);
                        }
                    } catch (Exception e) {
                        log.error("Could not load badge {} for challenge {}: {}", 
                                reloadedChallenge.getBadgeId(), challengeId, e.getMessage(), e);
                    }
                } else {
                    if (reloadedChallenge.getBadgeId() == null) {
                        log.warn("Challenge {} has no badgeId assigned", challengeId);
                    }
                    if (participation.getStatus() != ChallengeParticipation.ParticipationStatus.COMPLETED) {
                        log.info("Participation status is {} (not COMPLETED), badge will not be loaded", 
                                participation.getStatus());
                    }
                }
                
                // Set the reloaded challenge to participation
                participation.setChallenge(reloadedChallenge);
                log.info("Challenge and badge loaded for participation response. Badge ID: {}", 
                        reloadedChallenge.getBadgeId() != null ? reloadedChallenge.getBadgeId() : "none");
            }
        } catch (Exception e) {
            log.error("Error loading challenge/badge for participation response: {}", e.getMessage(), e);
        }
        
        return participation;
    }
    
    /**
     * Auto-grade submission based on expected keywords
     * Simple keyword matching algorithm - can be enhanced with AI later
     */
    private Integer autoGradeSubmission(String answer, Challenge challenge) {
        if (answer == null || answer.trim().isEmpty()) {
            return 0;
        }
        
        String answerLower = answer.toLowerCase().trim();
        String expectedKeywords = challenge.getExpectedKeywords();
        
        // If no expected keywords, give a default score based on answer length
        if (expectedKeywords == null || expectedKeywords.trim().isEmpty()) {
            // Scoring based on answer length and quality
            int length = answer.trim().length();
            if (length < 10) return 30; // Very short answers
            if (length < 20) return 50; // Short answers
            if (length < 50) return 65; // Medium answers
            if (length < 100) return 75; // Good answers
            if (length < 200) return 85; // Very good answers
            if (length < 500) return 90; // Excellent answers
            return 95; // Outstanding answers
        }
        
        // Keyword-based scoring
        String[] keywords = expectedKeywords.toLowerCase().split(",");
        int matchedKeywords = 0;
        
        for (String keyword : keywords) {
            keyword = keyword.trim();
            if (!keyword.isEmpty() && answerLower.contains(keyword)) {
                matchedKeywords++;
            }
        }
        
        // Calculate score based on keyword matching
        int totalKeywords = keywords.length;
        if (totalKeywords == 0) {
            // No keywords defined, use length-based scoring
            int length = answer.trim().length();
            if (length < 20) return 50;
            if (length < 50) return 65;
            if (length < 100) return 75;
            if (length < 200) return 85;
            return 90;
        }
        
        // Score calculation with hybrid approach:
        // - If keywords matched: use keyword-based scoring
        // - If no keywords matched: use length-based scoring (more fair)
        int length = answer.trim().length();
        
        if (matchedKeywords == 0) {
            // No keywords matched - use length-based scoring instead of just 40
            if (length < 10) return 30;
            if (length < 20) return 50;
            if (length < 50) return 60;
            if (length < 100) return 70;
            if (length < 200) return 75;
            if (length < 500) return 80;
            return 85; // Long answers even without keywords show effort
        }
        
        // Keywords matched - use keyword-based scoring
        // Base score: 50 (for attempting and matching at least one keyword)
        // Keyword matching: (matched / total) * 50
        // This gives range: 50-100 when keywords are matched
        int baseScore = 50;
        int keywordScore = (matchedKeywords * 50) / totalKeywords;
        int score = baseScore + keywordScore;
        
        // Bonus for longer answers (shows effort)
        if (length > 200) {
            score = Math.min(100, score + 5); // +5 bonus for detailed answers
        }
        if (length > 500) {
            score = Math.min(100, score + 5); // Additional +5 for very detailed answers
        }
        
        return Math.min(100, score); // Cap at 100
    }

    @Transactional
    public ChallengeParticipation completeChallenge(UUID participationId) {
        ChallengeParticipation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        UUID studentId = getCurrentStudentId();
        
        // Verify this participation belongs to current student
        if (!participation.getStudentId().equals(studentId)) {
            throw new RuntimeException("This participation does not belong to current student");
        }

        participation.setStatus(ChallengeParticipation.ParticipationStatus.COMPLETED);
        participation.setCompletedAt(LocalDateTime.now());
        
        participation = participationRepository.save(participation);

        // Award badge if challenge has one
        Challenge challenge = participation.getChallenge();
        if (challenge.getBadgeId() != null) {
            awardBadge(studentId, challenge.getBadgeId());
        }

        return participation;
    }

    @Transactional
    public void awardBadge(UUID studentId, UUID badgeId) {
        // Check if student already has this badge
        if (studentBadgeRepository.existsByStudentIdAndBadgeId(studentId, badgeId)) {
            log.info("Student {} already has badge {}", studentId, badgeId);
            return;
        }

        // Verify student exists via Feign Client
        try {
            StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            log.error("Error fetching student profile: {}", e.getMessage());
            throw new RuntimeException("Student not found");
        }

        // Get badge from repository
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge not found"));

        StudentBadge studentBadge = StudentBadge.builder()
                .studentId(studentId) // Use UUID instead of entity
                .badge(badge) // Badge is still an entity in learning-service
                .build();

        studentBadgeRepository.save(studentBadge);
        log.info("Awarded badge {} to student {}", badge.getId(), studentId);
    }

    @Transactional(readOnly = true)
    public List<ChallengeParticipation> getMyParticipations() {
        UUID studentId = getCurrentStudentId();
        // Use JOIN FETCH to eagerly load challenges
        List<ChallengeParticipation> participations = participationRepository.findByStudentIdWithChallenge(studentId);
        
        // Filter out orphan participations (where challenge was deleted) and eagerly load remaining ones
        List<ChallengeParticipation> validParticipations = new java.util.ArrayList<>();
        
        for (ChallengeParticipation participation : participations) {
            try {
                // Verify student exists via Feign Client (optional check)
                UUID participationStudentId = participation.getStudentId();
                try {
                    StudentProfileDTO student = userServiceClient.getStudentProfileById(participationStudentId);
                    if (student == null) {
                        log.warn("Skipping participation {} - student {} not found", participation.getId(), participationStudentId);
                        continue;
                    }
                } catch (Exception e) {
                    log.warn("Skipping participation {} - error fetching student: {}", participation.getId(), e.getMessage());
                    continue;
                }
                
                // Challenge should already be loaded via JOIN FETCH
                Challenge challenge = participation.getChallenge();
                if (challenge != null) {
                    // Verify challenge still exists in database
                    UUID challengeId = challenge.getId();
                    if (challengeRepository.existsById(challengeId)) {
                        // Load all challenge fields to ensure they're initialized
                        challenge.getTitle();
                        challenge.getDescription();
                        challenge.getCategory();
                        challenge.getDifficulty();
                        challenge.getPassingScore();
                        challenge.getInstructions();
                        challenge.getExpectedKeywords();
                        
                        // Load badge if badgeId exists
                        if (challenge.getBadgeId() != null) {
                            try {
                                Badge badge = badgeRepository.findById(challenge.getBadgeId()).orElse(null);
                                if (badge != null) {
                                    challenge.setBadge(badge);
                                    log.debug("Loaded badge {} for challenge {} in participation {}", 
                                            badge.getId(), challengeId, participation.getId());
                                }
                            } catch (Exception e) {
                                log.warn("Could not load badge {} for challenge {}: {}", 
                                        challenge.getBadgeId(), challengeId, e.getMessage());
                            }
                        }
                        
                        validParticipations.add(participation);
                        log.debug("Added participation {} for challenge {} (status: {}, score: {})", 
                                participation.getId(), challengeId, participation.getStatus(), participation.getScore());
                    } else {
                        // Challenge was deleted, skip this participation
                        log.warn("Skipping participation {} - challenge {} no longer exists", 
                                participation.getId(), challengeId);
                    }
                } else {
                    log.warn("Skipping participation {} - challenge is null", participation.getId());
                }
            } catch (Exception e) {
                log.warn("Error processing participation {}: {}", participation.getId(), e.getMessage());
                // Skip this participation
            }
        }
        
        return validParticipations;
    }

    public List<Badge> getMyBadges() {
        UUID studentId = getCurrentStudentId();
        List<StudentBadge> studentBadges = studentBadgeRepository.findByStudentId(studentId);
        return studentBadges.stream()
                .map(StudentBadge::getBadge)
                .collect(Collectors.toList());
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        try {
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            StudentProfileDTO studentProfile = userServiceClient.getStudentProfileByUserId(user.getId());
            if (studentProfile == null) {
                throw new RuntimeException("Student profile not found");
            }
            
            return studentProfile.getId();
        } catch (Exception e) {
            log.error("Error getting current student ID: {}", e.getMessage());
            throw new RuntimeException("Student profile not found");
        }
    }

    @Transactional
    public void deleteParticipation(UUID challengeId) {
        UUID studentId = getCurrentStudentId();
        
        // Find participation
        ChallengeParticipation participation = participationRepository.findByStudentId(studentId).stream()
                .filter(p -> p.getChallenge().getId().equals(challengeId))
                .findFirst()
                .orElse(null);
        
        if (participation == null) {
            throw new RuntimeException("Participation not found for this challenge");
        }
        
        // Verify this participation belongs to current student
        if (!participation.getStudentId().equals(studentId)) {
            throw new RuntimeException("This participation does not belong to current student");
        }
        
        // Delete participation
        participationRepository.delete(participation);
        log.info("Deleted participation {} for challenge {} by student {}", 
                participation.getId(), challengeId, studentId);
    }
}
