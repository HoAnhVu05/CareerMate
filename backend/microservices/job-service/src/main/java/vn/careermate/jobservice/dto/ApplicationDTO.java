package vn.careermate.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.careermate.jobservice.model.Application;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDTO {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private UUID studentId;
    private String studentName;
    private UUID cvId;
    private String coverLetter;
    private Application.ApplicationStatus status;
    private BigDecimal matchScore;
    private String aiNotes;
    private LocalDateTime appliedAt;
    private LocalDateTime viewedAt;
    private LocalDateTime interviewScheduledAt;
}
