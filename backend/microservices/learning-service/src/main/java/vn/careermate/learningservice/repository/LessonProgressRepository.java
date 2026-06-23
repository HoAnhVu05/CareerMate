package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.careermate.learningservice.model.LessonProgress;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    
    // Note: LessonProgress now uses studentId (UUID) directly, not enrollment entity
    Optional<LessonProgress> findByStudentIdAndLessonId(UUID studentId, UUID lessonId);
    
    List<LessonProgress> findByStudentId(UUID studentId);
    
    // Note: Changed from enrollment.id to studentId
    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.studentId = :studentId AND lp.isCompleted = true")
    Long countCompletedLessonsByStudentId(@Param("studentId") UUID studentId);
    
    // Note: This query needs CourseEnrollment to get courseId, but we can use studentId to find enrollment
    // CourseEnrollment has course entity, not courseId
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.course.id IN (SELECT e.course.id FROM CourseEnrollment e WHERE e.studentId = :studentId)")
    Long countTotalLessonsByStudentId(@Param("studentId") UUID studentId);
}
