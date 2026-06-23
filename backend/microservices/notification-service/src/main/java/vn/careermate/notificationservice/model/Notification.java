package vn.careermate.notificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications", schema = "notificationservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId; // Changed from User entity to UUID

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;

    @Column(name = "link_url", length = 500)
    private String linkUrl; // URL để chuyển đến trang liên quan

    @Column(name = "related_entity_type", length = 100)
    private String relatedEntityType; // ARTICLE, JOB, APPLICATION, etc.

    @Column(name = "related_entity_id")
    private UUID relatedEntityId; // ID của entity liên quan

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum NotificationType {
        ARTICLE_APPROVED,      // Admin duyệt bài viết
        ARTICLE_REJECTED,     // Admin từ chối bài viết
        ARTICLE_PENDING,       // Có bài viết mới cần admin duyệt
        JOB_APPROVED,         // Admin duyệt job
        JOB_REJECTED,         // Admin từ chối job
        JOB_PENDING,          // Có job mới cần admin duyệt
        NEW_APPLICATION,      // Có application mới
        APPLICATION_STATUS_CHANGED, // Trạng thái application thay đổi
        JOB_RECOMMENDATION,   // Có job recommendation mới
        NEW_COMMENT,          // Có comment mới trên bài viết
        NEW_REACTION,         // Có reaction mới trên bài viết
        INTERVIEW_SCHEDULED,  // Đã lên lịch phỏng vấn
        SYSTEM_ANNOUNCEMENT,  // Thông báo hệ thống
        NEW_MESSAGE,          // Tin nhắn mới
        SUBSCRIPTION_REQUEST, // Sinh viên đăng ký gói dịch vụ (thông báo cho admin)
        SUBSCRIPTION_APPROVED, // Admin duyệt đăng ký gói dịch vụ (thông báo cho sinh viên)
        SUBSCRIPTION_REJECTED,  // Admin từ chối đăng ký gói dịch vụ (thông báo cho sinh viên)
        JOB_HIDDEN,           // Admin ẩn tin tuyển dụng
        JOB_UNHIDDEN,         // Admin hiện lại tin tuyển dụng
        JOB_DELETED,          // Admin xóa tin tuyển dụng
        ARTICLE_HIDDEN,       // Admin ẩn bài viết
        ARTICLE_UNHIDDEN,     // Admin hiện lại bài viết
        ARTICLE_DELETED,      // Admin xóa bài viết
        CHALLENGE_COMPLETED   // Challenge completed
    }

    public enum NotificationStatus {
        UNREAD,
        READ
    }
}
