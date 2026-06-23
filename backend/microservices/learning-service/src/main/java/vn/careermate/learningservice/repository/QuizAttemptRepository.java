package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.QuizAttempt;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByStudentId(UUID studentId);
    List<QuizAttempt> findByQuizId(UUID quizId);
    List<QuizAttempt> findByStudentIdAndStatus(UUID studentId, QuizAttempt.AttemptStatus status);
}
