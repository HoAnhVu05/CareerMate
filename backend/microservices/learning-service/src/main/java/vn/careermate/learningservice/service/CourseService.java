package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.Course;
import vn.careermate.learningservice.model.CourseEnrollment;
import vn.careermate.learningservice.model.Quiz;
import vn.careermate.learningservice.model.QuizAttempt;
import vn.careermate.learningservice.model.QuizQuestion;
import vn.careermate.learningservice.dto.QuizDTO;
import vn.careermate.learningservice.dto.QuizQuestionDTO;
import vn.careermate.learningservice.repository.CourseEnrollmentRepository;
import vn.careermate.learningservice.repository.CourseRepository;
import vn.careermate.learningservice.repository.QuizRepository;
import vn.careermate.learningservice.repository.QuizAttemptRepository;
import vn.careermate.learningservice.repository.QuizQuestionRepository;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.UserDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final UserServiceClient userServiceClient;
    private final QuizService quizService;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;

    @Transactional(readOnly = true)
    public List<Course> getAllCourses(String category) {
        log.info("CourseService.getAllCourses - category: {}", category);
        List<Course> courses;
        if (category != null && !category.isEmpty()) {
            courses = courseRepository.findByCategory(category);
        } else {
            courses = courseRepository.findAll();
        }
        // Detach entities to prevent lazy loading issues
        courses.forEach(course -> {
            // Force initialization of basic fields only
            course.getId();
            course.getTitle();
            course.getDescription();
        });
        log.info("CourseService.getAllCourses - Found {} courses", courses.size());
        return courses;
    }

    @Transactional(readOnly = true)
    public List<Course> getFreeCourses() {
        log.info("CourseService.getFreeCourses");
        List<Course> courses = courseRepository.findByIsPremium(false);
        // Detach entities to prevent lazy loading issues
        courses.forEach(course -> {
            // Force initialization of basic fields only
            course.getId();
            course.getTitle();
            course.getDescription();
        });
        log.info("CourseService.getFreeCourses - Found {} free courses", courses.size());
        return courses;
    }

    public Course getCourseById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public CourseEnrollment enrollInCourse(UUID courseId) {
        Course course = getCourseById(courseId);
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

        // Check if already enrolled
        Optional<CourseEnrollment> existingEnrollment = enrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst();
        
        if (existingEnrollment.isPresent()) {
            log.info("Student {} already enrolled in course {}", studentId, courseId);
            return existingEnrollment.get(); // Return existing enrollment instead of throwing error
        }

        // Check if course is premium and student has subscription
        if (course.getIsPremium() != null && course.getIsPremium()) {
            // TODO: Check subscription status
            // For now, allow enrollment (subscription check should be done in controller)
            log.info("Enrolling in premium course {} for student {}", courseId, studentId);
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .studentId(studentId) // Use UUID instead of entity
                .course(course)
                .progressPercentage(BigDecimal.ZERO)
                .build();

        log.info("Created new enrollment for course {} and student {}", courseId, studentId);
        return enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<CourseEnrollment> getMyEnrollments() {
        UUID studentId = getCurrentStudentId();
        log.info("CourseService.getMyEnrollments - studentId: {}", studentId);
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        // Force initialization of course to avoid lazy loading issues
        enrollments.forEach(enrollment -> {
            if (enrollment.getCourse() != null) {
                // Force load course basic fields
                enrollment.getCourse().getId();
                enrollment.getCourse().getTitle();
                enrollment.getCourse().getDescription();
            }
        });
        
        log.info("CourseService.getMyEnrollments - Found {} enrollments", enrollments.size());
        return enrollments;
    }

    public CourseEnrollment getEnrollmentById(UUID enrollmentId) {
        UUID studentId = getCurrentStudentId();
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if (!enrollment.getStudentId().equals(studentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }
        
        return enrollment;
    }

    @Transactional
    public CourseEnrollment updateProgress(UUID enrollmentId, BigDecimal progressPercentage) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setProgressPercentage(progressPercentage);
        if (progressPercentage.compareTo(new BigDecimal("100")) >= 0) {
            enrollment.setCompletedAt(java.time.LocalDateTime.now());
        }

        return enrollmentRepository.save(enrollment);
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

    @Transactional(readOnly = true)
    public QuizDTO getCourseQuiz(UUID courseId) {
        Optional<Quiz> quizOpt = quizRepository.findByCourseIdAndIsActiveTrue(courseId);
        if (quizOpt.isEmpty()) {
            log.warn("No quiz found for course: {}", courseId);
            return null;
        }
        
        Quiz quiz = quizOpt.get();
        
        // Load questions explicitly to ensure they're available
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByOrderIndex(quiz.getId());
        log.info("Found {} questions in database for quiz {}", questions.size(), quiz.getId());
        
        // Convert Quiz entity to DTO to avoid Hibernate serialization issues
        QuizDTO quizDTO = QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(quiz.getCategory())
                .courseId(quiz.getCourseId())
                .type(quiz.getType() != null ? quiz.getType().name() : null)
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .totalQuestions(quiz.getTotalQuestions())
                .passingScore(quiz.getPassingScore())
                .isActive(quiz.getIsActive())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
        
        // Convert questions to DTOs
        if (questions != null && !questions.isEmpty()) {
            List<QuizQuestionDTO> questionDTOs = questions.stream()
                    .map(q -> QuizQuestionDTO.builder()
                            .id(q.getId())
                            .question(q.getQuestion())
                            .questionType(q.getQuestionType() != null ? q.getQuestionType().name() : null)
                            .options(q.getOptions())
                            .correctAnswer(q.getCorrectAnswer())
                            .points(q.getPoints())
                            .orderIndex(q.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());
            
            quizDTO.setQuestions(questionDTOs);
            log.info("Converted {} questions to DTOs for quiz {}", questionDTOs.size(), quiz.getId());
            
            if (!questionDTOs.isEmpty()) {
                QuizQuestionDTO firstQ = questionDTOs.get(0);
                log.info("First question DTO: ID={}, Question={}, Options count={}", 
                        firstQ.getId(),
                        firstQ.getQuestion(),
                        firstQ.getOptions() != null ? firstQ.getOptions().size() : 0);
            }
        } else {
            log.warn("No questions found for quiz {} in course {}", quiz.getId(), courseId);
            quizDTO.setQuestions(java.util.Collections.emptyList());
        }
        
        log.info("Loaded quiz DTO {} with {} questions for course {}", quizDTO.getId(), 
                quizDTO.getQuestions() != null ? quizDTO.getQuestions().size() : 0, courseId);
        
        return quizDTO;
    }
    
    // Keep the old method for backward compatibility (used by submitCourseQuiz)
    @Transactional(readOnly = true)
    public Quiz getCourseQuizEntity(UUID courseId) {
        Optional<Quiz> quizOpt = quizRepository.findByCourseIdAndIsActiveTrue(courseId);
        if (quizOpt.isEmpty()) {
            log.warn("No quiz found for course: {}", courseId);
            return null;
        }
        return quizOpt.get();
    }

    public List<QuizAttempt> getCourseQuizAttempts(UUID courseId) {
        UUID studentId = getCurrentStudentId();
        Optional<Quiz> quiz = quizRepository.findByCourseIdAndIsActiveTrue(courseId);
        if (quiz.isPresent()) {
            return quizAttemptRepository.findByStudentId(studentId).stream()
                    .filter(attempt -> attempt.getQuiz().getId().equals(quiz.get().getId()))
                    .collect(java.util.stream.Collectors.toList());
        }
        return List.of();
    }

    @Transactional
    public QuizAttempt submitCourseQuiz(UUID courseId, Map<UUID, String> answers) {
        try {
            log.info("=== SUBMIT COURSE QUIZ SERVICE ===");
            log.info("Course ID: {}", courseId);
            log.info("Answers count: {}", answers != null ? answers.size() : 0);
            
            UUID studentId = getCurrentStudentId();
            if (studentId == null) {
                log.error("Student ID is null - authentication may not be set correctly");
                throw new RuntimeException("Student ID not found. Please login again.");
            }
            log.info("Student ID: {}", studentId);
            
            Quiz quiz = getCourseQuizEntity(courseId);
            if (quiz == null) {
                log.error("Quiz not found for course: {}", courseId);
                throw new RuntimeException("Quiz not found for this course");
            }
            log.info("Quiz found: {} (ID: {})", quiz.getTitle(), quiz.getId());
            
            // Use QuizService to handle quiz submission
            // First, start or get existing attempt
            List<QuizAttempt> existingAttempts = quizAttemptRepository.findByStudentId(studentId).stream()
                    .filter(attempt -> attempt.getQuiz().getId().equals(quiz.getId()))
                    .filter(attempt -> attempt.getStatus() == QuizAttempt.AttemptStatus.IN_PROGRESS)
                    .collect(java.util.stream.Collectors.toList());
            
            QuizAttempt attempt;
            if (!existingAttempts.isEmpty()) {
                attempt = existingAttempts.get(0);
                log.info("Using existing attempt: {}", attempt.getId());
            } else {
                log.info("Creating new quiz attempt for student: {} and quiz: {}", studentId, quiz.getId());
                attempt = quizService.startQuiz(quiz.getId(), studentId);
                log.info("Created new attempt: {}", attempt.getId());
            }
            
            // Submit the quiz
            log.info("Submitting quiz with attempt ID: {}", attempt.getId());
            QuizAttempt result = quizService.submitQuiz(attempt.getId(), answers);
            log.info("Quiz submitted successfully. Attempt ID: {}, Score: {}/{}", 
                    result.getId(), result.getCorrectAnswers(), result.getTotalQuestions());
            return result;
        } catch (Exception e) {
            log.error("Error in submitCourseQuiz for course {}: {}", courseId, e.getMessage(), e);
            throw e;
        }
    }
}
