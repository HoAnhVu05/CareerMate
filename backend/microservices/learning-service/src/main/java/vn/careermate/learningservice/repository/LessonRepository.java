package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.careermate.learningservice.model.Lesson;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    
    List<Lesson> findByModuleIdOrderByOrderIndexAsc(UUID moduleId);
    
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId ORDER BY l.module.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findAllByCourseId(@Param("courseId") UUID courseId);
}
