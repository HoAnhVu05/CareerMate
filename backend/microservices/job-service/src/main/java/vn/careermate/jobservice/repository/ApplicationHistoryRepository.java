package vn.careermate.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.jobservice.model.ApplicationHistory;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationHistoryRepository extends JpaRepository<ApplicationHistory, UUID> {
    List<ApplicationHistory> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}
