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
public class SavedJobDTO {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String jobLocation;
    private String companyName;
    private String companyLogoUrl;
    private String notes;
    private LocalDateTime savedAt;
}
