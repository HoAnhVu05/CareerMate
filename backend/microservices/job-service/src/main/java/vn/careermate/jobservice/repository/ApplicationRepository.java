package vn.careermate.jobservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.jobservice.model.Application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByStudentId(UUID studentId);
    List<Application> findByJobId(UUID jobId);
    Optional<Application> findByJobIdAndStudentId(UUID jobId, UUID studentId);
    Page<Application> findByStudentId(UUID studentId, Pageable pageable);
    Page<Application> findByJobId(UUID jobId, Pageable pageable);
    
    List<Application> findTop5ByJobRecruiterIdOrderByAppliedAtDesc(UUID recruiterId);

    // Note: Job.recruiterId is now a UUID, not an entity relationship
    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiterId = :recruiterId AND a.status = :status")
    long countByJobRecruiterIdAndStatus(@Param("recruiterId") UUID recruiterId, 
                                        @Param("status") Application.ApplicationStatus status);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiterId = :recruiterId " +
           "AND a.status = 'INTERVIEW' AND a.interviewScheduledAt IS NOT NULL AND a.interviewScheduledAt > :now")
    long countUpcomingInterviewsByRecruiter(@Param("recruiterId") UUID recruiterId, 
                                            @Param("now") LocalDateTime now);
                                            
    long countByAppliedAtBefore(LocalDateTime appliedAt);
    
    void deleteByJobId(UUID jobId);
}
