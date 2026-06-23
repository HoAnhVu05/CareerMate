package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.Quiz;
import vn.careermate.learningservice.model.QuizAttempt;
import vn.careermate.learningservice.service.QuizService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/students/quizzes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAvailableQuizzes(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(quizService.getAvailableQuizzes(category));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId));
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<QuizAttempt> startQuiz(@PathVariable UUID quizId) {
        UUID studentId = getCurrentStudentId();
        return ResponseEntity.ok(quizService.startQuiz(quizId, studentId));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(
            @PathVariable UUID attemptId,
            @RequestBody Map<UUID, String> answers
    ) {
        try {
            return ResponseEntity.ok(quizService.submitQuiz(attemptId, answers));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getMyAttempts() {
        UUID studentId = getCurrentStudentId();
        return ResponseEntity.ok(quizService.getStudentAttempts(studentId));
    }

    // TODO: This method should use UserServiceClient
    // For now, throw exception as repositories are not available
    private UUID getCurrentStudentId() {
        throw new RuntimeException("getCurrentStudentId() needs to be implemented with UserServiceClient");
    }
}
