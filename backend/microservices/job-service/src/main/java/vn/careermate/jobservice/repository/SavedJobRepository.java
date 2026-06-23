package vn.careermate.jobservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.jobservice.model.SavedJob;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    
    Page<SavedJob> findByStudentIdOrderBySavedAtDesc(UUID studentId, Pageable pageable);
    
    List<SavedJob> findByStudentIdOrderBySavedAtDesc(UUID studentId);
    
    Optional<SavedJob> findByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    boolean existsByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    void deleteByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    long countByStudentId(UUID studentId);
    
    // Note: SavedJob uses UUID references (studentId, jobId), not entity relationships
    @Query("SELECT sj FROM SavedJob sj WHERE sj.studentId = :studentId AND sj.jobId = :jobId")
    Optional<SavedJob> findSavedJob(@Param("studentId") UUID studentId, @Param("jobId") UUID jobId);
    
    // Note: SavedJob uses UUID references (jobId), not entity relationships
    @Query("SELECT sj FROM SavedJob sj WHERE sj.jobId = :jobId")
    List<SavedJob> findByJobId(@Param("jobId") UUID jobId);
}
