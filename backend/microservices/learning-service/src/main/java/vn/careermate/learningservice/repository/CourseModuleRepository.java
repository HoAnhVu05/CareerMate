package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.careermate.learningservice.model.CourseModule;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {
    
    List<CourseModule> findByCourseIdOrderByOrderIndexAsc(UUID courseId);
    
    long countByCourseId(UUID courseId);
    
    @Query("SELECT DISTINCT m FROM CourseModule m LEFT JOIN FETCH m.lessons WHERE m.course.id = :courseId ORDER BY m.orderIndex ASC")
    List<CourseModule> findModulesWithLessonsByCourseId(@Param("courseId") UUID courseId);
}
