package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVDTO {
    private UUID id;
    private UUID studentId;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private Boolean isDefault;
    private Map<String, Object> aiAnalysis;
    private String extractedContent;
    private Double aiScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
