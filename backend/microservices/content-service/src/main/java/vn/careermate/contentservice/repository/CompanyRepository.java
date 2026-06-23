package vn.careermate.contentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.contentservice.model.Company;

import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    long countByCreatedAtBefore(java.time.LocalDateTime createdAt);
}
