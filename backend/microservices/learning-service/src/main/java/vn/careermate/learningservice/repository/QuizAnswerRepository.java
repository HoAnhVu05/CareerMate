package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.QuizAnswer;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {
    List<QuizAnswer> findByAttemptId(UUID attemptId);
    List<QuizAnswer> findByQuestionId(UUID questionId);
}
