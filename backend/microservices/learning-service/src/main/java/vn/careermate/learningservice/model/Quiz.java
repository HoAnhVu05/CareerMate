package vn.careermate.learningservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
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
@Table(name = "quizzes", schema = "learningservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category; // CAREER_ORIENTATION, SKILLS_ASSESSMENT, etc.

    @Column(name = "course_id")
    private UUID courseId; // Link quiz to a specific course (optional)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuizType type;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "passing_score")
    private Integer passingScore;

    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonProperty("questions")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<QuizQuestion> questions;

    public enum QuizType {
        CAREER_ORIENTATION, SKILLS_ASSESSMENT, PERSONALITY_TEST, TECHNICAL_TEST
    }
}
