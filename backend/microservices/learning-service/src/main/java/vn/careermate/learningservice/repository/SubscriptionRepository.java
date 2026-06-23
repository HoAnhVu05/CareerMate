package vn.careermate.learningservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.Subscription;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByUserIdAndStatus(UUID userId, Subscription.SubscriptionStatus status);
    List<Subscription> findByUserId(UUID userId);
    
    @Query("SELECT s FROM Subscription s LEFT JOIN FETCH s.packageEntity WHERE s.userId = :userId")
    List<Subscription> findByUserIdWithPackage(@Param("userId") UUID userId);
    
    // Note: Subscription now uses userId (UUID) directly, not user entity
    @Query("SELECT DISTINCT s FROM Subscription s " +
           "LEFT JOIN FETCH s.packageEntity " +
           "WHERE s.status = :status " +
           "ORDER BY s.createdAt DESC")
    List<Subscription> findByStatusWithDetails(@Param("status") Subscription.SubscriptionStatus status);
    
    // Note: Removed JOIN with user entity (now using userId UUID)
    @Query("SELECT DISTINCT s FROM Subscription s " +
           "LEFT JOIN FETCH s.packageEntity " +
           "ORDER BY s.createdAt DESC")
    List<Subscription> findAllWithDetails();
    
    // Use default method for pagination since JOIN FETCH doesn't work well with Page
    Page<Subscription> findByStatusOrderByCreatedAtDesc(Subscription.SubscriptionStatus status, Pageable pageable);
}
