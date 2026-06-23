package vn.careermate.learningservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private UUID id;
    private String title;
    private String description;
    private String category;
    private UUID courseId;
    private String type;
    private Integer timeLimitMinutes;
    private Integer totalQuestions;
    private Integer passingScore;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuizQuestionDTO> questions;
}
