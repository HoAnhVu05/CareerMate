package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.StudentBadge;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentBadgeRepository extends JpaRepository<StudentBadge, UUID> {
    List<StudentBadge> findByStudentId(UUID studentId);
    Optional<StudentBadge> findByStudentIdAndBadgeId(UUID studentId, UUID badgeId);
    boolean existsByStudentIdAndBadgeId(UUID studentId, UUID badgeId);
}
