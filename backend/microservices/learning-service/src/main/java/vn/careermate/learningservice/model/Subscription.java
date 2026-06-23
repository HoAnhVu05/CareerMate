package vn.careermate.learningservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.User; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions", schema = "learningservice", indexes = {
    @Index(name = "idx_subscriptions_user", columnList = "user_id"),
    @Index(name = "idx_subscriptions_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId; // Changed from User entity to UUID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Package packageEntity;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum SubscriptionStatus {
        PENDING,      // Đang chờ admin duyệt
        APPROVED,     // Đã được admin duyệt (tương đương ACTIVE)
        REJECTED,     // Bị admin từ chối
        ACTIVE,       // Đang hoạt động (backward compatibility)
        EXPIRED,      // Hết hạn
        CANCELLED     // Đã hủy
    }
}
