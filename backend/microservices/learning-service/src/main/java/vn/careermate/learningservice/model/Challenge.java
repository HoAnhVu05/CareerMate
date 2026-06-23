package vn.careermate.learningservice.model;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@Table(name = "challenges", schema = "learningservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;

    private String difficulty;

    @Column(name = "badge_id")
    private UUID badgeId; // Changed from Badge entity to UUID (optional)

    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Badge badge; // Transient field for JSON serialization - loaded when needed

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "passing_score")
    @Builder.Default
    private Integer passingScore = 70; // Default 70% to pass

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions; // Instructions for the challenge

    @Column(name = "expected_keywords", columnDefinition = "TEXT")
    private String expectedKeywords; // Comma-separated keywords for auto-grading

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
