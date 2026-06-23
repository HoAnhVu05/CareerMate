package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.CourseEnrollment;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {
    List<CourseEnrollment> findByStudentId(UUID studentId);
    List<CourseEnrollment> findByCourseId(UUID courseId);
}
