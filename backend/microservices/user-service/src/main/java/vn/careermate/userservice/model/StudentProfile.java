package vn.careermate.userservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import vn.careermate.userservice.model.CV;
import vn.careermate.userservice.model.StudentSkill;

@Entity
@Table(name = "student_profiles", schema = "userservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    @JsonIgnore // tránh lỗi lazy loading khi serialize sang JSON
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;

    @Builder.Default
    private String country = "Vietnam";

    private String university;

    private String major;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(precision = 3, scale = 2)
    private java.math.BigDecimal gpa;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl; // URL to profile avatar image

    @Column(name = "current_status")
    private String currentStatus; // STUDYING, GRADUATED, LOOKING_FOR_JOB

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CV> cvs;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<StudentSkill> skills;

    // Note: References to StudentSkill, CV, Application are kept for now
    // They can be accessed via UUID references if needed in future microservice architecture
    // @OneToMany relationships removed to keep User Service independent
}
