package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.RecruiterProfile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, UUID> {
    Optional<RecruiterProfile> findByUserId(UUID userId);
    
    // Note: companyId is now a UUID reference, not an entity relationship
    // Company info should be fetched via ContentServiceClient when needed
    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.user WHERE rp.id = :id")
    Optional<RecruiterProfile> findByIdWithCompany(@Param("id") UUID id);
    
    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.user WHERE rp.user.id = :userId")
    Optional<RecruiterProfile> findByUserIdWithCompany(@Param("userId") UUID userId);
    
    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.user WHERE rp.user.id = :userId")
    Optional<RecruiterProfile> findByUserIdWithUser(@Param("userId") UUID userId);
    
    // Find by companyId (UUID, not entity)
    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.user WHERE rp.companyId = :companyId")
    Optional<RecruiterProfile> findByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.user")
    List<RecruiterProfile> findAllWithUser();

    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.user WHERE rp.isExpert = true")
    List<RecruiterProfile> findByIsExpertTrue();
}
