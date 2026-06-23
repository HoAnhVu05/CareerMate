package vn.careermate.jobservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.careermate.jobservice.model.MockInterviewRequest;

import java.util.List;
import java.util.UUID;

public interface MockInterviewRequestRepository extends JpaRepository<MockInterviewRequest, UUID> {
    List<MockInterviewRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<MockInterviewRequest> findByRecruiterIdOrderByCreatedAtDesc(UUID recruiterId);
    
    // Check if pending request exists
    boolean existsByStudentIdAndRecruiterIdAndStatus(UUID studentId, UUID recruiterId, MockInterviewRequest.RequestStatus status);
}
