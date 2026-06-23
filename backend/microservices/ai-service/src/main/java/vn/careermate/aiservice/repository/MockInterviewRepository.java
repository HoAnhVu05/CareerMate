package vn.careermate.aiservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.aiservice.model.MockInterview;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MockInterviewRepository extends JpaRepository<MockInterview, UUID> {
    
    Page<MockInterview> findByStudentIdOrderByStartedAtDesc(UUID studentId, Pageable pageable);
    
    List<MockInterview> findByStudentIdOrderByStartedAtDesc(UUID studentId);
    
    Optional<MockInterview> findByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    // Note: MockInterview now uses studentId (UUID) directly, not student entity
    @Query("SELECT mi FROM MockInterview mi WHERE mi.studentId = :studentId AND mi.status = :status ORDER BY mi.startedAt DESC")
    List<MockInterview> findByStudentIdAndStatus(@Param("studentId") UUID studentId, @Param("status") MockInterview.InterviewStatus status);
    
    long countByStudentId(UUID studentId);
    
    long countByStudentIdAndStatus(UUID studentId, MockInterview.InterviewStatus status);
}
