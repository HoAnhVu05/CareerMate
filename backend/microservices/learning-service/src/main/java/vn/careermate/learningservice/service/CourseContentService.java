package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.*;
import vn.careermate.learningservice.repository.*;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.UserDTO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseContentService {

    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final UserServiceClient userServiceClient;

    @Transactional(readOnly = true)
    public List<CourseModule> getCourseModulesWithLessons(UUID courseId) {
        // Use repository method that fetches modules with lessons
        List<CourseModule> modules = moduleRepository.findModulesWithLessonsByCourseId(courseId);
        // Ensure lessons are loaded
        modules.forEach(module -> {
            if (module.getLessons() == null || module.getLessons().isEmpty()) {
                List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId());
                module.setLessons(lessons);
            }
        });
        return modules;
    }

    public List<CourseModule> getCourseModules(UUID courseId) {
        return getCourseModulesWithLessons(courseId);
    }

    public List<Lesson> getModuleLessons(UUID moduleId) {
        return lessonRepository.findByModuleIdOrderByOrderIndexAsc(moduleId);
    }

    public Lesson getLessonById(UUID lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    @Transactional
    public LessonProgress updateLessonProgress(UUID enrollmentId, UUID lessonId, Integer currentTimeSeconds, Boolean completed) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Verify enrollment belongs to current user
        UUID currentStudentId = getCurrentStudentId();
        // Student is now UUID (studentId)
        UUID enrollmentStudentId = enrollment.getStudentId();
        if (!enrollmentStudentId.equals(currentStudentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }

        Lesson lesson = getLessonById(lessonId);
        
        // Use studentId from enrollment already loaded above
        UUID studentId = enrollment.getStudentId();
        
        Optional<LessonProgress> existingProgress = progressRepository.findByStudentIdAndLessonId(studentId, lessonId);
        
        LessonProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            if (currentTimeSeconds != null) {
                progress.setWatchTimeSeconds(currentTimeSeconds);
                progress.setLastPositionSeconds(currentTimeSeconds);
            }
            if (completed != null) {
                progress.setIsCompleted(completed);
                if (completed && progress.getCompletedAt() == null) {
                    progress.setCompletedAt(LocalDateTime.now());
                } else if (!completed) {
                    progress.setCompletedAt(null);
                }
            }
        } else {
            // If marking complete without existing progress, set watch time to lesson duration
            int watchTime = currentTimeSeconds != null ? currentTimeSeconds : 
                (lesson.getDurationMinutes() != null ? lesson.getDurationMinutes() * 60 : 0);
            
            progress = LessonProgress.builder()
                    .studentId(currentStudentId)
                    .lesson(lesson)
                    .watchTimeSeconds(watchTime)
                    .lastPositionSeconds(watchTime)
                    .isCompleted(completed != null ? completed : false)
                    .build();
            if (completed != null && completed) {
                progress.setCompletedAt(LocalDateTime.now());
            }
        }

        progress = progressRepository.save(progress);
        
        // Update overall course progress
        updateCourseEnrollmentProgress(enrollmentId);
        
        // Force initialize basic fields before returning to avoid lazy loading issues
        progress.getId();
        progress.getIsCompleted();
        progress.getWatchTimeSeconds();
        progress.getLastPositionSeconds();
        progress.getCompletedAt();
        
        return progress;
    }

    @Transactional
    public LessonProgress markLessonComplete(UUID enrollmentId, UUID lessonId) {
        try {
            // Verify enrollment exists and belongs to current user
            CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));
            
            UUID currentStudentId = getCurrentStudentId();
            UUID enrollmentStudentId = enrollment.getStudentId();
            if (!enrollmentStudentId.equals(currentStudentId)) {
                throw new RuntimeException("Unauthorized access to enrollment");
            }
            
            // Verify lesson exists (will throw exception if not found)
            getLessonById(lessonId);
            
            // Update progress
            LessonProgress progress = updateLessonProgress(enrollmentId, lessonId, null, true);
            
            // Verify it was marked complete
            if (progress == null) {
                throw new RuntimeException("Progress is null after update");
            }
            if (!progress.getIsCompleted()) {
                throw new RuntimeException("Failed to mark lesson as complete - isCompleted is still false");
            }
            
            return progress;
        } catch (RuntimeException e) {
            // Re-throw RuntimeException as-is
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error marking lesson complete: " + e.getMessage(), e);
        }
    }

    @Transactional
    public LessonProgress completeLessonByLessonId(UUID lessonId) {
        UUID studentId = getCurrentStudentId();
        Optional<LessonProgress> existing = progressRepository.findByStudentIdAndLessonId(studentId, lessonId);
        
        if (existing.isPresent()) {
            LessonProgress progress = existing.get();
            if (!progress.getIsCompleted()) {
                progress.setIsCompleted(true);
                progress.setCompletedAt(LocalDateTime.now());
                progress = progressRepository.save(progress);
                updateEnrollmentProgress(studentId, lessonId);
            }
            return progress;
        } else {
            LessonProgress progress = LessonProgress.builder()
                    .studentId(studentId)
                    .lesson(lessonRepository.findById(lessonId)
                            .orElseThrow(() -> new RuntimeException("Lesson not found")))
                    .isCompleted(true)
                    .completedAt(LocalDateTime.now())
                    .build();
            progress = progressRepository.save(progress);
            updateEnrollmentProgress(studentId, lessonId);
            return progress;
        }
    }

    @Transactional(readOnly = true)
    public LessonProgress getLessonProgressByLessonId(UUID lessonId) {
        UUID studentId = getCurrentStudentId();
        Optional<LessonProgress> progress = progressRepository.findByStudentIdAndLessonId(studentId, lessonId);
        return progress.orElse(null);
    }

    @Transactional(readOnly = true)
    public List<LessonProgress> getEnrollmentProgress(UUID enrollmentId) {
        UUID currentStudentId = getCurrentStudentId();
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if (!enrollment.getStudentId().equals(currentStudentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }
        
        // Use studentId from enrollment already loaded above
        UUID studentId = enrollment.getStudentId();
        
        List<LessonProgress> progressList = progressRepository.findByStudentId(studentId);
        
        // Force initialize basic fields to avoid lazy loading issues
        progressList.forEach(progress -> {
            progress.getId();
            progress.getIsCompleted();
            progress.getWatchTimeSeconds();
            progress.getLastPositionSeconds();
            progress.getCompletedAt();
            // Don't access enrollment or lesson to avoid lazy loading
        });
        
        return progressList;
    }

    public LessonProgress getLessonProgress(UUID enrollmentId, UUID lessonId) {
        // Get studentId from enrollment
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElse(null);
        if (enrollment == null) {
            return null;
        }
        UUID studentId = enrollment.getStudentId();
        return progressRepository.findByStudentIdAndLessonId(studentId, lessonId)
                .orElse(null);
    }

    @Transactional
    public LessonProgress getOrCreateLessonProgress(UUID enrollmentId, UUID lessonId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        UUID studentId = enrollment.getStudentId();
        
        Optional<LessonProgress> existing = progressRepository.findByStudentIdAndLessonId(studentId, lessonId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Verify enrollment belongs to current user
        UUID currentStudentId = getCurrentStudentId();
        if (!enrollment.getStudentId().equals(currentStudentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }
        
        Lesson lesson = getLessonById(lessonId);
        
        LessonProgress progress = LessonProgress.builder()
                .studentId(currentStudentId)
                .lesson(lesson)
                .watchTimeSeconds(0)
                .lastPositionSeconds(0)
                .isCompleted(false)
                .build();
        
        return progressRepository.save(progress);
    }

    @Transactional
    public void updateCourseEnrollmentProgress(UUID enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        UUID studentId = enrollment.getStudentId();
        Long completedLessons = progressRepository.countCompletedLessonsByStudentId(studentId);
        Long totalLessons = progressRepository.countTotalLessonsByStudentId(studentId);

        if (totalLessons > 0) {
            BigDecimal progress = new BigDecimal(completedLessons)
                    .divide(new BigDecimal(totalLessons), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .setScale(2, RoundingMode.HALF_UP);
            
            enrollment.setProgressPercentage(progress);
            
            if (progress.compareTo(new BigDecimal("100")) >= 0) {
                enrollment.setCompletedAt(LocalDateTime.now());
            } else {
                enrollment.setCompletedAt(null);
            }
            
            enrollmentRepository.save(enrollment);
        } else {
            enrollment.setProgressPercentage(BigDecimal.ZERO);
            enrollmentRepository.save(enrollment);
        }
    }

    @Transactional
    private void updateEnrollmentProgress(UUID studentId, UUID lessonId) {
        // Find the course for this lesson
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        UUID courseId = lesson.getModule().getCourse().getId();
        
        // Find enrollment for this course and student
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        Optional<CourseEnrollment> enrollment = enrollments.stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst();
        
        if (enrollment.isPresent()) {
            updateCourseEnrollmentProgress(enrollment.get().getId());
        }
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
            throw new RuntimeException("Student profile not found");
        }
    }
}
