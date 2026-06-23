package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.Course;
import vn.careermate.learningservice.model.CourseEnrollment;
import vn.careermate.learningservice.model.Quiz;
import vn.careermate.learningservice.model.QuizAttempt;
import vn.careermate.learningservice.model.QuizQuestion;
import vn.careermate.learningservice.dto.QuizDTO;
import vn.careermate.learningservice.service.CourseService;
import vn.careermate.learningservice.service.QuizService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Slf4j
public class CourseController {

    private final CourseService courseService;
    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(
            @RequestParam(required = false) String category
    ) {
        log.info("GET /courses - category: {}", category);
        List<Course> courses = courseService.getAllCourses(category);
        log.info("GET /courses - Returning {} courses", courses.size());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/free")
    public ResponseEntity<List<Course>> getFreeCourses() {
        log.info("GET /courses/free");
        List<Course> courses = courseService.getFreeCourses();
        log.info("GET /courses/free - Returning {} free courses", courses.size());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> enrollInCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.enrollInCourse(courseId));
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseEnrollment>> getMyEnrollments() {
        log.info("GET /courses/my-enrollments");
        List<CourseEnrollment> enrollments = courseService.getMyEnrollments();
        log.info("GET /courses/my-enrollments - Returning {} enrollments", enrollments.size());
        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/enrollments/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> updateProgress(
            @PathVariable UUID enrollmentId,
            @RequestParam BigDecimal progressPercentage
    ) {
        return ResponseEntity.ok(courseService.updateProgress(enrollmentId, progressPercentage));
    }

    @GetMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> getEnrollment(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(courseService.getEnrollmentById(enrollmentId));
    }

    @GetMapping("/{courseId}/quiz")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizDTO> getCourseQuiz(@PathVariable UUID courseId) {
        log.info("=== GET COURSE QUIZ ===");
        log.info("Course ID: {}", courseId);
        log.info("Authentication: {}", org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
        QuizDTO quizDTO = courseService.getCourseQuiz(courseId);
        log.info("Quiz DTO found: {}", quizDTO != null);
        if (quizDTO != null) {
            log.info("Quiz ID: {}", quizDTO.getId());
            log.info("Quiz title: {}", quizDTO.getTitle());
            List<vn.careermate.learningservice.dto.QuizQuestionDTO> questions = quizDTO.getQuestions();
            log.info("Questions list: {}", questions);
            log.info("Questions is null? {}", questions == null);
            if (questions != null) {
                log.info("Questions count: {}", questions.size());
                if (!questions.isEmpty()) {
                    log.info("First question ID: {}, Question: {}", questions.get(0).getId(), questions.get(0).getQuestion());
                    log.info("First question options: {}", questions.get(0).getOptions());
                } else {
                    log.warn("Questions list is EMPTY!");
                }
            } else {
                log.error("Questions list is NULL!");
            }
        } else {
            log.warn("Quiz DTO is NULL for course: {}", courseId);
        }
        return ResponseEntity.ok(quizDTO);
    }

    @GetMapping("/{courseId}/quiz-attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<QuizAttempt>> getCourseQuizAttempts(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getCourseQuizAttempts(courseId));
    }

    @PostMapping("/{courseId}/quiz/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<QuizAttempt> submitCourseQuiz(
            @PathVariable UUID courseId,
            @RequestBody java.util.Map<UUID, String> answers
    ) {
        try {
            log.info("=== SUBMIT COURSE QUIZ CONTROLLER ===");
            log.info("Course ID: {}", courseId);
            log.info("Answers count: {}", answers != null ? answers.size() : 0);
            log.info("Answers: {}", answers);
            
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            log.info("Authentication: {}", auth);
            if (auth != null) {
                log.info("User: {}, Authorities: {}", auth.getName(), auth.getAuthorities());
            } else {
                log.error("Authentication is null!");
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .build();
            }
            
            QuizAttempt attempt = courseService.submitCourseQuiz(courseId, answers);
            log.info("Quiz attempt created successfully: {}", attempt.getId());
            return ResponseEntity.ok(attempt);
        } catch (RuntimeException e) {
            log.error("Error submitting course quiz: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        } catch (Exception e) {
            log.error("Unexpected error submitting course quiz: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
