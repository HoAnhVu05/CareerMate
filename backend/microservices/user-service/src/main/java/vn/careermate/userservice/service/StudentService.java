package vn.careermate.userservice.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.common.client.AIServiceClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.ApplicationDTO;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.userservice.model.CV;
import vn.careermate.userservice.repository.CVRepository;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.FileStorageService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    @PersistenceContext
    private EntityManager entityManager;

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final FileStorageService fileStorageService;
    // Feign Clients for inter-service communication
    private final JobServiceClient jobServiceClient;
    private final AIServiceClient aiServiceClient;

    @Transactional
    public StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        log.info("Getting current student profile. Authentication: {}, Name: {}", 
            auth != null ? "present" : "null",
            auth != null ? auth.getName() : "N/A");
        
        if (auth == null) {
            log.error("Authentication is null - user not authenticated");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        if (auth.getName() == null) {
            log.error("Authentication name is null");
            throw new RuntimeException("Authentication name is null. Please login again.");
        }
        
        if ("anonymousUser".equals(auth.getName())) {
            log.error("User is anonymous - token may be missing or invalid");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        try {
            String email = auth.getName();
            log.info("Looking up user with email: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found in database for email: {}", email);
                        return new RuntimeException("User not found: " + email + ". Please register first.");
                    });

            log.info("Found user: {} (ID: {})", user.getEmail(), user.getId());

            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElse(null);

            // Tạo profile mới nếu chưa có
            if (profile == null) {
                log.info("Creating default profile for user: {} (ID: {})", email, user.getId());
                profile = createDefaultProfile(user);
                log.info("Default profile created with ID: {}", profile.getId());
            } else {
                log.info("Found existing profile with ID: {}", profile.getId());
            }

            // Reload từ database để đảm bảo có data mới nhất (tránh cache)
            UUID profileId = profile.getId();
            entityManager.flush(); // Ensure any pending changes are saved
            entityManager.clear(); // Clear persistence context
            StudentProfile freshProfile = studentProfileRepository.findById(profileId)
                    .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));
            
            log.info("Profile reloaded from database. ID: {}, University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                freshProfile.getId(), freshProfile.getUniversity(), freshProfile.getMajor(), 
                freshProfile.getCity(), freshProfile.getAddress(), freshProfile.getGender());

            // Detach entity khỏi persistence context để tránh cascade operations
            entityManager.detach(freshProfile);
            
            log.info("Profile detached from persistence context. ID: {}", freshProfile.getId());
            return freshProfile;
        } catch (RuntimeException e) {
            log.error("RuntimeException getting student profile: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting student profile", e);
            throw new RuntimeException("Error getting student profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    private StudentProfile createDefaultProfile(User user) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setCurrentStatus("STUDENT");
        return studentProfileRepository.save(profile);
    }

    @Transactional
    public StudentProfile updateProfile(StudentProfile profile) {
        try {
            // Get current profile WITHOUT detaching - we need it to be managed
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                throw new RuntimeException("Authentication required. Please login first.");
            }
            
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            // Get existing profile - DO NOT detach, we need it managed
            StudentProfile existing = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found for user: " + email));
            
            log.info("Updating profile ID: {}, current university: {}, new university: {}", 
                existing.getId(), existing.getUniversity(), profile.getUniversity());
            log.info("Profile update data - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                profile.getGender(), profile.getAddress(), profile.getCity(), profile.getUniversity(), profile.getMajor());
            
            // Update all fields - allow null to clear fields
            // Use reflection or check if field was explicitly set in the profile object
            // For now, update all fields that are in the profile object
            existing.setDateOfBirth(profile.getDateOfBirth());
            existing.setGender(profile.getGender());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setCountry(profile.getCountry() != null ? profile.getCountry() : "Vietnam");
            existing.setUniversity(profile.getUniversity());
            existing.setMajor(profile.getMajor());
            existing.setGraduationYear(profile.getGraduationYear());
            existing.setGpa(profile.getGpa());
            existing.setBio(profile.getBio());
            existing.setLinkedinUrl(profile.getLinkedinUrl());
            existing.setGithubUrl(profile.getGithubUrl());
            existing.setPortfolioUrl(profile.getPortfolioUrl());
            existing.setAvatarUrl(profile.getAvatarUrl());
            existing.setCurrentStatus(profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");
            
            log.info("After setting fields - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                existing.getGender(), existing.getAddress(), existing.getCity(), existing.getUniversity(), existing.getMajor());
            
            // Save và flush để đảm bảo data được lưu vào database ngay lập tức
            log.info("Before save - existing profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                existing.getId(), existing.getUniversity(), existing.getMajor(), existing.getCity(), existing.getAddress(), existing.getGender());
            
            StudentProfile saved = studentProfileRepository.save(existing);
            entityManager.flush(); // Force write to database
            entityManager.clear(); // Clear persistence context để reload fresh data
            
            log.info("After save and flush - saved profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                saved.getId(), saved.getUniversity(), saved.getMajor(), saved.getCity(), saved.getAddress(), saved.getGender());
            
            // Reload từ database bằng cách query trực tiếp để đảm bảo có data mới nhất
            UUID profileId = saved.getId();
            StudentProfile freshData = studentProfileRepository.findById(profileId)
                    .orElseThrow(() -> new RuntimeException("Profile not found after save: " + profileId));
            
            log.info("After reload from DB - fresh profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                freshData.getId(), freshData.getUniversity(), freshData.getMajor(), freshData.getCity(), freshData.getAddress(), freshData.getGender());
            
            // Verify data was actually saved - log comparison
            log.info("Data verification - Existing University: {}, Fresh University: {}", 
                existing.getUniversity(), freshData.getUniversity());
            log.info("Data verification - Existing City: {}, Fresh City: {}", 
                existing.getCity(), freshData.getCity());
            log.info("Data verification - Existing Address: {}, Fresh Address: {}", 
                existing.getAddress(), freshData.getAddress());
            
            // Detach fresh data before returning
            entityManager.detach(freshData);
            
            return freshData;
        } catch (Exception e) {
            log.error("Error in updateProfile service", e);
            throw new RuntimeException("Failed to update profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    public String uploadAvatar(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        if (fileName == null || (contentType != null && !contentType.startsWith("image/"))) {
            throw new RuntimeException("Invalid file type. Only image files are allowed.");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size too large. Maximum size is 5MB.");
        }

        // Save file using FileStorageService
        String filePath = fileStorageService.storeFile(file, "avatars");

        // Update profile with avatar URL
        StudentProfile profile = getCurrentStudentProfile();
        // Delete old avatar if exists
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(profile.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old avatar: {}", e.getMessage());
            }
        }
        profile.setAvatarUrl(filePath);
        studentProfileRepository.save(profile);

        return filePath;
    }

    // Note: CV operations (uploadCV, deleteCV, getCVs, createCVFromTemplate) have been moved to CVService in userservice
    // cvRepository is kept here for applyForJob() which needs to access CV entities

    // TODO: Refactor to use JobServiceClient.searchJobs() when job-service is ready
    // This method requires job-service to expose search endpoint
    public Page<JobDTO> searchJobs(String keyword, String location, Pageable pageable) {
        log.warn("searchJobs() is not available in microservice architecture. Use job-service endpoints directly.");
        throw new RuntimeException("Job search functionality has been moved to job-service. Please use /api/jobs/search endpoint.");
        
        /* Original implementation - commented for microservice refactoring
        try {
            // Normalize null/empty strings
            String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
            String normalizedLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
            
            Page<Job> jobs = jobRepository.searchJobs(normalizedKeyword, normalizedLocation, pageable);
            
            // Force load company for each job to avoid lazy loading issues
            if (jobs != null && jobs.getContent() != null) {
                jobs.getContent().forEach(job -> {
                    if (job.getCompany() != null) {
                        job.getCompany().getId(); // Force load
                        job.getCompany().getName(); // Force load
                    }
                });
            }
            
            return jobs != null ? jobs : Page.empty(pageable);
        } catch (RuntimeException e) {
            log.error("Runtime error searching jobs: keyword={}, location={}, error={}", keyword, location, e.getMessage());
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error searching jobs: keyword={}, location={}", keyword, location, e);
            return Page.empty(pageable);
        }
        */
    }

    // TODO: Refactor to use JobServiceClient.getJobById() when job-service is ready
    public JobDTO getJob(UUID jobId) {
        log.warn("getJob() is not available in microservice architecture. Use job-service endpoints directly.");
        throw new RuntimeException("Job retrieval has been moved to job-service. Please use /api/jobs/{jobId} endpoint.");
        
        /* Original implementation - commented for microservice refactoring
        try {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            // Detach lazy-loaded relations
            // KHÔNG set null cho collections có cascade="all-delete-orphan" (skills, applications)
            // @JsonIgnore sẽ đảm bảo chúng không được serialize
            if (job != null) {
                job.setRecruiter(null);
            }
            return job;
        } catch (RuntimeException e) {
            log.error("Runtime error getting job: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting job", e);
            throw new RuntimeException("Error getting job: " + e.getMessage(), e);
        }
        */
    }

    // TODO: Refactor to use JobServiceClient.applyToJob() when job-service is ready
    @Transactional
    public ApplicationDTO applyForJob(UUID jobId, UUID cvId, String coverLetter) {
        log.warn("applyForJob() is not available in microservice architecture. Use job-service endpoints directly.");
        throw new RuntimeException("Job application has been moved to job-service. Please use /api/jobs/{jobId}/apply endpoint.");
        
        /* Original implementation - commented for microservice refactoring
        StudentProfile student = getCurrentStudentProfile();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if already applied
        if (applicationRepository.findByJobIdAndStudentId(jobId, student.getId()).isPresent()) {
            throw new RuntimeException("Already applied for this job");
        }

        CV cv = null;
        if (cvId != null) {
            cv = cvRepository.findById(cvId)
                    .orElseThrow(() -> new RuntimeException("CV not found"));
        } else {
            // Use default CV
            cv = cvRepository.findByStudentIdAndIsDefaultTrue(student.getId())
                    .orElse(null);
        }

        Application application = Application.builder()
                .job(job)
                .student(student)
                .cv(cv)
                .coverLetter(coverLetter)
                .status(Application.ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        application = applicationRepository.save(application);

        // Calculate match score with AI (async)
        // TODO: Implement job matching calculation
        // aiService.calculateJobMatchAsync(application);

        // Update job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        return application;
        */
    }

    @Transactional(readOnly = true)
    public Optional<ApplicationDTO> checkApplication(UUID jobId) {
        // TODO: This method should use JobServiceClient to check application
        // For now, return empty as Application entity is in job-service
        log.warn("checkApplication() is not available in microservice architecture. Use job-service endpoints directly.");
        return Optional.empty();
        /* Original implementation - commented for microservice refactoring
        try {
            StudentProfile student = getCurrentStudentProfile();
            if (student == null || student.getId() == null) {
                return Optional.empty();
            }
            
            // Force load student to ensure it's in the session
            UUID studentId = student.getId();
            StudentProfile loadedStudent = studentProfileRepository.findById(studentId)
                .orElse(null);
            if (loadedStudent == null) {
                return Optional.empty();
            }
            
            Optional<Application> applicationOpt = applicationRepository.findByJobIdAndStudentId(jobId, loadedStudent.getId());
            
            // Force load fields to avoid lazy loading issues
            if (applicationOpt.isPresent()) {
                Application app = applicationOpt.get();
                app.getId(); // Force load
                app.getStatus(); // Force load
                app.getAppliedAt(); // Force load
            }
            
            return applicationOpt;
        } catch (Exception e) {
            log.error("Error checking application for job: {}", jobId, e);
            return Optional.empty();
        }
        */
    }

    // TODO: Refactor to use JobServiceClient.getApplicationsByStudent() when job-service is ready
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getApplications(Pageable pageable) {
        log.warn("getApplications() is not available in microservice architecture. Use job-service endpoints directly.");
        return Page.empty(pageable);
        
        /* Original implementation - commented for microservice refactoring
        try {
            log.info("Getting applications for current student - page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
            
            StudentProfile student = getCurrentStudentProfile();
            if (student == null || student.getId() == null) {
                log.warn("Student profile not found or ID is null");
                return Page.empty(pageable);
            }
            
            // Force load student to ensure it's in the session
            UUID studentId = student.getId();
            StudentProfile loadedStudent = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            log.info("Found student profile: {}", loadedStudent.getId());
            
            Page<Application> applications = applicationRepository.findByStudentId(loadedStudent.getId(), pageable);
            
            log.info("Found {} applications (total: {})", 
                applications.getContent().size(), applications.getTotalElements());
            
            // Force load job, company, CV, and student for each application to avoid lazy loading issues
            if (applications != null && applications.getContent() != null) {
                applications.getContent().forEach(app -> {
                    try {
                        // Force load all fields to ensure they're initialized
                        app.getId();
                        app.getStatus();
                        app.getAppliedAt();
                        app.getCoverLetter();
                        
                        if (app.getJob() != null) {
                            app.getJob().getId(); // Force load job
                            app.getJob().getTitle(); // Force load job title
                            app.getJob().getLocation(); // Force load job location
                            app.getJob().getJobType(); // Force load job type
                            app.getJob().getExperienceLevel(); // Force load experience level
                            app.getJob().getDescription(); // Force load description
                            if (app.getJob().getCompany() != null) {
                                app.getJob().getCompany().getId(); // Force load company
                                app.getJob().getCompany().getName(); // Force load company name
                                app.getJob().getCompany().getLogoUrl(); // Force load logo
                            }
                        }
                        // Force load student to avoid lazy loading
                        if (app.getStudent() != null) {
                            app.getStudent().getId();
                        }
                        // Force load CV to avoid lazy loading
                        if (app.getCv() != null) {
                            app.getCv().getId();
                            app.getCv().getFileName();
                            app.getCv().getFileUrl();
                        }
                    } catch (Exception e) {
                        log.error("Error force loading application fields for app {}: {}", 
                            app != null ? app.getId() : "null", e.getMessage(), e);
                    }
                });
            }
            
            log.info("Successfully loaded {} applications", applications.getContent().size());
            return applications;
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage(), e);
            e.printStackTrace();
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            e.printStackTrace();
            return Page.empty(pageable);
        }
    }

    // ========== SAVED JOBS ==========
    @Transactional
    public SavedJob saveJob(UUID jobId, String notes) {
        StudentProfile student = getCurrentStudentProfile();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Check if already saved
        Optional<SavedJob> existing = savedJobRepository.findByStudentIdAndJobId(student.getId(), jobId);
        if (existing.isPresent()) {
            SavedJob saved = existing.get();
            if (notes != null) {
                saved.setNotes(notes);
            }
            return savedJobRepository.save(saved);
        }
        
        SavedJob savedJob = SavedJob.builder()
                .student(student)
                .job(job)
                .notes(notes)
                .build();
        
        return savedJobRepository.save(savedJob);
    }

    // TODO: Refactor to use JobServiceClient.getSavedJobsByStudent() when job-service is ready
    public Page<Object> getSavedJobs(Pageable pageable) {
        log.warn("getSavedJobs() is not available in microservice architecture. Use job-service endpoints directly.");
        return Page.empty(pageable);
        /* Original implementation - commented for microservice refactoring
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return Page.empty(pageable);
        }
        return savedJobRepository.findByStudentIdOrderBySavedAtDesc(student.getId(), pageable);
        */
    }

    // TODO: SavedJob functionality has been moved to job-service
    // Use JobServiceClient to interact with saved jobs
    @Transactional
    public void deleteSavedJob(UUID jobId) {
        log.warn("deleteSavedJob() is not available in microservice architecture. Use job-service endpoints directly.");
        throw new RuntimeException("SavedJob functionality has been moved to job-service. Please use /api/jobs/{jobId}/save endpoint.");
    }

    // TODO: SavedJob functionality has been moved to job-service
    public boolean isJobSaved(UUID jobId) {
        log.warn("isJobSaved() is not available in microservice architecture. Use job-service endpoints directly.");
        return false;
    }

    // ========== AI CHAT CONVERSATIONS ==========
    // TODO: Refactor to use AIServiceClient.getChatConversations() when ai-service is ready
    public Page<Object> getChatConversations(Pageable pageable) {
        log.warn("getChatConversations() is not available in microservice architecture. Use ai-service endpoints directly.");
        return Page.empty(pageable);
        /* Original implementation - commented for microservice refactoring
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return Page.empty(pageable);
        }
        return aiChatConversationRepository.findByStudentIdOrderByCreatedAtDesc(student.getId(), pageable);
        */
    }

    // TODO: Refactor to use AIServiceClient.createChatConversation() when ai-service is ready
    @Transactional
    public Object createChatConversation(String role, String context) {
        log.warn("createChatConversation() is not available in microservice architecture. Use ai-service endpoints directly.");
        throw new RuntimeException("AI chat has been moved to ai-service. Please use /api/ai/chat/conversations endpoint.");
        /* Original implementation - commented for microservice refactoring
        StudentProfile student = getCurrentStudentProfile();
        AIChatConversation conversation = AIChatConversation.builder()
                .student(student)
                .role(role)
                .context(context)
                .build();
        return aiChatConversationRepository.save(conversation);
        */
    }

    // TODO: Refactor to use AIServiceClient.getChatMessages() when ai-service is ready
    public List<Object> getChatMessages(UUID conversationId) {
        log.warn("getChatMessages() is not available in microservice architecture. Use ai-service endpoints directly.");
        return List.of();
        /* Original implementation - commented for microservice refactoring
        return aiChatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        */
    }

    // TODO: Refactor to use AIServiceClient.sendChatMessage() when ai-service is ready
    @Transactional
    public Object saveChatMessage(UUID conversationId, String senderType, String message, Integer tokensUsed) {
        log.warn("saveChatMessage() is not available in microservice architecture. Use ai-service endpoints directly.");
        throw new RuntimeException("AI chat messages have been moved to ai-service. Please use /api/ai/chat/messages endpoint.");
        /* Original implementation - commented for microservice refactoring
        AIChatConversation conversation = aiChatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        AIChatMessage chatMessage = AIChatMessage.builder()
                .conversation(conversation)
                .senderType(senderType)
                .message(message)
                .tokensUsed(tokensUsed)
                .build();
        
        return aiChatMessageRepository.save(chatMessage);
        */
    }

    // ========== JOB RECOMMENDATIONS ==========
    // TODO: Refactor to use AIServiceClient.getJobRecommendations() when ai-service is ready
    public Page<Object> getJobRecommendations(Pageable pageable) {
        log.warn("getJobRecommendations() is not available in microservice architecture. Use ai-service endpoints directly.");
        return Page.empty(pageable);
        /* Original implementation - commented for microservice refactoring
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return Page.empty(pageable);
        }
        return jobRecommendationRepository.findByStudentIdOrderByMatchScoreDescCreatedAtDesc(student.getId(), pageable);
        */
    }

    // TODO: Refactor to use AIServiceClient.markRecommendationViewed() when ai-service is ready
    @Transactional
    public void markRecommendationAsViewed(UUID recommendationId) {
        log.warn("markRecommendationAsViewed() is not available in microservice architecture. Use ai-service endpoints directly.");
        throw new RuntimeException("Job recommendations have been moved to ai-service. Please use /api/ai/job-recommendations/{id}/viewed endpoint.");
        /* Original implementation - commented for microservice refactoring
        JobRecommendation recommendation = jobRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        recommendation.setIsViewed(true);
        recommendation.setViewedAt(LocalDateTime.now());
        jobRecommendationRepository.save(recommendation);
        */
    }

    // TODO: Refactor to use AIServiceClient.markRecommendationApplied() when ai-service is ready
    @Transactional
    public void markRecommendationAsApplied(UUID recommendationId) {
        log.warn("markRecommendationAsApplied() is not available in microservice architecture. Use ai-service endpoints directly.");
        throw new RuntimeException("Job recommendations have been moved to ai-service. Please use /api/ai/job-recommendations/{id}/applied endpoint.");
        /* Original implementation - commented for microservice refactoring
        JobRecommendation recommendation = jobRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        recommendation.setIsApplied(true);
        jobRecommendationRepository.save(recommendation);
        */
    }

    // TODO: Refactor to use AIServiceClient.getUnviewedRecommendations() when ai-service is ready
    public List<Object> getUnviewedRecommendations() {
        log.warn("getUnviewedRecommendations() is not available in microservice architecture. Use ai-service endpoints directly.");
        return List.of();
        /* Original implementation - commented for microservice refactoring
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return List.of();
        }
        return jobRecommendationRepository.findUnviewedByStudentId(student.getId());
        */
    }
}

