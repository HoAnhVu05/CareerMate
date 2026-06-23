package vn.careermate.learningservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDTO {
    private UUID id;
    private String question;
    private String questionType;
    private List<String> options;
    private String correctAnswer;
    private Integer points;
    private Integer orderIndex;
}
