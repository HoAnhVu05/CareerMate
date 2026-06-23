package vn.careermate.learningservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts", schema = "learningservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // Changed from StudentProfile entity to UUID

    @Column(name = "score")
    private Integer score;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_answers")
    private Integer correctAnswers;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @CreatedDate
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @LastModifiedDate
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAnswer> answers;

    public enum AttemptStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }
}
