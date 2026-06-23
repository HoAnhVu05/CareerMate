package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVAnalysisDTO {
    private String summary;
    private List<String> strengths;
    private List<String> weaknesses;
    private Map<String, Object> skills;
    private Double matchScore;
}
