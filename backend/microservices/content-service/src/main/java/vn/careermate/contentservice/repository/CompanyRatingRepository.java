package vn.careermate.contentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.contentservice.model.CompanyRating;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyRatingRepository extends JpaRepository<CompanyRating, UUID> {
    // Note: Using studentId (UUID) instead of student entity
    List<CompanyRating> findByCompanyId(UUID companyId);
    
    CompanyRating findByCompanyIdAndStudentId(UUID companyId, UUID studentId);
    
    @Query(value = "SELECT AVG(rating) FROM contentservice.company_ratings WHERE company_id = :companyId", nativeQuery = true)
    Double getAverageRatingByCompanyId(@Param("companyId") UUID companyId);
    
    @Query(value = "SELECT COUNT(*) FROM contentservice.company_ratings WHERE company_id = :companyId", nativeQuery = true)
    Long countByCompanyId(@Param("companyId") UUID companyId);
    
    void deleteByCompanyId(UUID companyId);
}
