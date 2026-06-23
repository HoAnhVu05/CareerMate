package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRecommendationDTO {
    private UUID jobId;
    private String title;
    private String companyName;
    private Double matchScore;
    private String reason;
}
