package vn.careermate.adminservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", schema = "adminservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "admin_email")
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType actionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "entity_name")
    private String entityName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum ActionType {
        CREATE, UPDATE, DELETE, APPROVE, REJECT, HIDE, UNHIDE
    }

    public enum EntityType {
        USER, JOB, ARTICLE, PACKAGE, SUBSCRIPTION, CV_TEMPLATE, COMPANY
    }
}
