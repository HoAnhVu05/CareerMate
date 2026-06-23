package vn.careermate.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
// import vn.careermate.userservice.model.CV; // Replaced with UUID
// import vn.careermate.jobservice.model.Job; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "mock_interviews", schema = "aiservice", indexes = {
    @Index(name = "idx_mock_interviews_student", columnList = "student_id"),
    @Index(name = "idx_mock_interviews_job", columnList = "job_id"),
    @Index(name = "idx_mock_interviews_status", columnList = "status")
})
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MockInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // Changed from StudentProfile entity to UUID

    @Column(name = "job_id", nullable = true)
    private UUID jobId; // Changed from Job entity to UUID

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "cv_id")
    private UUID cvId; // Changed from CV entity to UUID (optional)

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false)
    private InterviewStatus status = InterviewStatus.NOT_STARTED;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private java.math.BigDecimal overallScore;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "answered_questions")
    private Integer answeredQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_feedback", columnDefinition = "jsonb")
    private Map<String, Object> aiFeedback; // Overall feedback from AI

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "transcript", columnDefinition = "jsonb")
    private String transcript; // Full conversation JSON string or list

    @CreatedDate
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @LastModifiedDate
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "mockInterview", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MockInterviewQuestion> questions;

    public enum InterviewStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
    }
}
