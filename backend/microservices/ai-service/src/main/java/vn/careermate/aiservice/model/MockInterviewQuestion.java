package vn.careermate.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "mock_interview_questions", schema = "aiservice", indexes = {
    @Index(name = "idx_mock_questions_interview", columnList = "mock_interview_id"),
    @Index(name = "idx_mock_questions_order", columnList = "mock_interview_id,question_order")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MockInterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    @JsonIgnore
    private MockInterview mockInterview;

    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "student_answer", columnDefinition = "TEXT")
    private String studentAnswer;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "score", precision = 5, scale = 2)
    private java.math.BigDecimal score;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private QuestionStatus status; // NOT_ANSWERED, ANSWERED, SKIPPED

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    public enum QuestionStatus {
        NOT_ANSWERED, ANSWERED, SKIPPED
    }
}
