package vn.careermate.jobservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.careermate.jobservice.model.Job;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
    private UUID id;
    private String title;
    private String description;
    private String requirements;
    private String location;
    private Job.JobType jobType;
    private Job.ExperienceLevel experienceLevel;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private Job.JobStatus status;
    private Integer viewsCount;
    private Integer applicationsCount;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Company info
    private UUID companyId;
    private String companyName;
    private String companyLogoUrl;
    
    // Skills
    private List<String> requiredSkills;
    private List<String> optionalSkills;
}
