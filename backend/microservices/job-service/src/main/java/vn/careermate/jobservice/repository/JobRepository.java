package vn.careermate.jobservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.jobservice.model.Job;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
    
    // Use native query to avoid bytea casting issues
    @Query(value = "SELECT * FROM jobservice.jobs j WHERE j.status = 'ACTIVE' AND " +
           "(j.hidden IS NULL OR j.hidden = false) AND " +
           "(:location IS NULL OR LOWER(CAST(j.location AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:location AS TEXT), '%'))) AND " +
           "(:keyword IS NULL OR LOWER(CAST(j.title AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%')) OR LOWER(CAST(j.description AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%'))) " +
           "ORDER BY j.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM jobservice.jobs j WHERE j.status = 'ACTIVE' AND " +
           "(j.hidden IS NULL OR j.hidden = false) AND " +
           "(:location IS NULL OR LOWER(CAST(j.location AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:location AS TEXT), '%'))) AND " +
           "(:keyword IS NULL OR LOWER(CAST(j.title AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%')) OR LOWER(CAST(j.description AS TEXT)) LIKE LOWER(CONCAT('%', CAST(:keyword AS TEXT), '%')))",
           nativeQuery = true)
    Page<Job> searchJobs(@Param("keyword") String keyword, 
                        @Param("location") String location, 
                        Pageable pageable);
    
    List<Job> findByRecruiterId(UUID recruiterId);
    
    @Query("SELECT j FROM Job j WHERE j.recruiterId = :recruiterId")
    Page<Job> findByRecruiterId(@Param("recruiterId") UUID recruiterId, Pageable pageable);
    
    long countByRecruiterIdAndStatus(UUID recruiterId, Job.JobStatus status);
    
    long countByStatus(Job.JobStatus status);
    
    long countByStatusAndCreatedAtBefore(Job.JobStatus status, java.time.LocalDateTime createdAt);
    
    long countByCreatedAtBefore(java.time.LocalDateTime createdAt);
    
    // Find jobs by company
    Page<Job> findByCompanyId(UUID companyId, Pageable pageable);
    
    Page<Job> findByCompanyIdAndStatus(UUID companyId, Job.JobStatus status, Pageable pageable);
}
