package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
    private UUID id;
    private UUID recruiterId;
    private String title;
    private String description;
    private String location;
    private String employmentType;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Hidden fields
    private Boolean hidden;
    private String hiddenReason;
    private LocalDateTime hiddenAt;
}
