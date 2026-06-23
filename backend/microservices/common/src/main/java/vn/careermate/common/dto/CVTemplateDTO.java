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
public class CVTemplateDTO {
    private UUID id;
    private String name;
    private String description;
    private String templateUrl;
    private String previewUrl;
    private Boolean isPremium;
    private String templateHtml;
    private String templateCss;
}
