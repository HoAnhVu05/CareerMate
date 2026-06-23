package vn.careermate.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationHistoryDTO {
    private UUID id;
    private UUID applicationId;
    private String status;
    private String notes;
    private UUID changedById;
    private String changedByName;
    private LocalDateTime createdAt;
}
