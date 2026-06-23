package vn.careermate.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
// import vn.careermate.jobservice.model.Job; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_recommendations", schema = "aiservice", indexes = {
    @Index(name = "idx_job_recommendations_student", columnList = "student_id"),
    @Index(name = "idx_job_recommendations_job", columnList = "job_id"),
    @Index(name = "idx_job_recommendations_score", columnList = "match_score"),
    @Index(name = "idx_job_recommendations_created", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class JobRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // Changed from StudentProfile entity to UUID

    @Column(name = "job_id", nullable = false)
    private UUID jobId; // Changed from Job entity to UUID

    @Column(name = "match_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal matchScore; // 0-100

    @Column(name = "match_reason", columnDefinition = "TEXT")
    private String matchReason; // Why this job was recommended

    @Column(name = "is_viewed")
    @Builder.Default
    private Boolean isViewed = false;

    @Column(name = "is_applied")
    @Builder.Default
    private Boolean isApplied = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;
}

