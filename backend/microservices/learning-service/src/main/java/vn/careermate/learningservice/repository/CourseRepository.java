package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.Course;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByCategory(String category);
    List<Course> findByIsPremium(Boolean isPremium);
}
