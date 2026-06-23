package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {
    private UUID id;
    private UUID userId;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String country;
    private String university;
    private String major;
    private Integer graduationYear;
    private BigDecimal gpa;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String avatarUrl;
    private String currentStatus; // STUDYING, GRADUATED, LOOKING_FOR_JOB
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDTO user; // Include UserDTO for convenience
}
