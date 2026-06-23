package vn.careermate.jobservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
// import vn.careermate.userservice.model.CV; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "applications", schema = "jobservice", indexes = {
    @Index(name = "idx_applications_job", columnList = "job_id"),
    @Index(name = "idx_applications_student", columnList = "student_id"),
    @Index(name = "idx_applications_status", columnList = "status"),
    @Index(name = "idx_applications_match_score", columnList = "match_score")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Transient
    private vn.careermate.common.dto.StudentProfileDTO student;

    @Column(name = "cv_id")
    private UUID cvId;
    
    @Transient
    private String cvUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "match_score", precision = 5, scale = 2)
    private BigDecimal matchScore;

    @Column(name = "ai_notes", columnDefinition = "TEXT")
    private String aiNotes;

    @CreatedDate
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @Column(name = "interview_scheduled_at")
    private LocalDateTime interviewScheduledAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ApplicationHistory> history;

    public enum ApplicationStatus {
        PENDING, VIEWED, SHORTLISTED, INTERVIEW, OFFERED, REJECTED, WITHDRAWN
    }
}
