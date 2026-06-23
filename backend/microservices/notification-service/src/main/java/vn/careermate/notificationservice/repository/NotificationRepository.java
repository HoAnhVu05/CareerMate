package vn.careermate.notificationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.notificationservice.model.Notification;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUserIdAndStatus(UUID userId, Notification.NotificationStatus status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = :status WHERE n.userId = :userId AND n.status = :oldStatus")
    int markAllAsReadByUserId(@Param("userId") UUID userId, 
                              @Param("status") Notification.NotificationStatus status,
                              @Param("oldStatus") Notification.NotificationStatus oldStatus);

    @Modifying
    @Query("UPDATE Notification n SET n.status = :status WHERE n.id = :id")
    int markAsRead(@Param("id") UUID id, @Param("status") Notification.NotificationStatus status);
}
