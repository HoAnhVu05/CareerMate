package vn.careermate.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVDTO {
    private UUID id;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String fileType;
    private Boolean isDefault;
    private Map<String, Object> aiAnalysis;
    private BigDecimal aiScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

