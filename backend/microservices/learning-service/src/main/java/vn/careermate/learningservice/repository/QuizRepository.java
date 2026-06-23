package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.Quiz;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCategoryAndIsActiveTrue(String category);
    List<Quiz> findByTypeAndIsActiveTrue(Quiz.QuizType type);
    List<Quiz> findByIsActiveTrue();
    Optional<Quiz> findByCourseIdAndIsActiveTrue(UUID courseId);
    List<Quiz> findByCourseId(UUID courseId);
}
