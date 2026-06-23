package vn.careermate.learningservice.model;

import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "challenge_participations", schema = "learningservice", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "challenge_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ChallengeParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // Changed from StudentProfile entity to UUID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ParticipationStatus status = ParticipationStatus.IN_PROGRESS;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "score")
    private Integer score; // Score out of 100

    public enum ParticipationStatus {
        IN_PROGRESS, COMPLETED, FAILED
    }
}
