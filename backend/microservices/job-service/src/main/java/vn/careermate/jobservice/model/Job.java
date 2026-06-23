package vn.careermate.jobservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.RecruiterProfile; // Replaced with UUID
// import vn.careermate.userservice.model.User; // Not needed in microservice
// import vn.careermate.contentservice.model.Company; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jobs", schema = "jobservice", indexes = {
    @Index(name = "idx_jobs_recruiter", columnList = "recruiter_id"),
    @Index(name = "idx_jobs_company", columnList = "company_id"),
    @Index(name = "idx_jobs_status", columnList = "status"),
    @Index(name = "idx_jobs_location", columnList = "location"),
    @Index(name = "idx_jobs_created", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recruiter_id", nullable = false)
    private UUID recruiterId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Transient
    private vn.careermate.common.dto.CompanyDTO company;
    
    @Transient
    private UUID recruiterUserId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;

    @Column(name = "min_salary", precision = 18, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "max_salary", precision = 18, scale = 2)
    private BigDecimal maxSalary;

    @Builder.Default
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobStatus status = JobStatus.PENDING;

    @Builder.Default
    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Builder.Default
    @Column(name = "applications_count")
    private Integer applicationsCount = 0;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_by")
    private UUID approvedBy; // UUID reference to User in user-service

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Builder.Default
    @Column(name = "hidden")
    private Boolean hidden = false;

    @Column(name = "hidden_reason", columnDefinition = "TEXT")
    private String hiddenReason;

    @Column(name = "hidden_at")
    private LocalDateTime hiddenAt;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<JobSkill> skills;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Application> applications;

    public enum JobType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    }

    public enum ExperienceLevel {
        ENTRY, JUNIOR, MID, SENIOR, LEAD, EXPERT
    }

    public enum JobStatus {
        DRAFT, PENDING, ACTIVE, CLOSED, REJECTED, HIDDEN
    }
}
