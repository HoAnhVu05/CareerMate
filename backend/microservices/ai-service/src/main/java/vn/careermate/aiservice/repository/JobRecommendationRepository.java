package vn.careermate.aiservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.aiservice.model.JobRecommendation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRecommendationRepository extends JpaRepository<JobRecommendation, UUID> {
    
    Page<JobRecommendation> findByStudentIdOrderByMatchScoreDescCreatedAtDesc(UUID studentId, Pageable pageable);
    
    List<JobRecommendation> findByStudentIdOrderByMatchScoreDescCreatedAtDesc(UUID studentId);
    
    Optional<JobRecommendation> findByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    // Note: JobRecommendation now uses studentId (UUID) directly, not student entity
    @Query("SELECT jr FROM JobRecommendation jr WHERE jr.studentId = :studentId AND jr.isViewed = false ORDER BY jr.matchScore DESC, jr.createdAt DESC")
    List<JobRecommendation> findUnviewedByStudentId(@Param("studentId") UUID studentId);
    
    @Query("SELECT jr FROM JobRecommendation jr WHERE jr.studentId = :studentId AND jr.isApplied = false ORDER BY jr.matchScore DESC")
    List<JobRecommendation> findUnappliedByStudentId(@Param("studentId") UUID studentId);
    
    long countByStudentId(UUID studentId);
    
    long countByStudentIdAndIsViewed(UUID studentId, Boolean isViewed);
    
    @Modifying
    @Query("UPDATE JobRecommendation jr SET jr.isViewed = true, jr.viewedAt = CURRENT_TIMESTAMP WHERE jr.studentId = :studentId AND jr.isViewed = false")
    void markAllAsViewedByStudentId(@Param("studentId") UUID studentId);
}

