package vn.careermate.common.dto;

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
public class ApplicationDTO {
    private UUID id;
    private UUID jobId;
    private UUID studentId;
    private String status;
    private String coverLetter;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
