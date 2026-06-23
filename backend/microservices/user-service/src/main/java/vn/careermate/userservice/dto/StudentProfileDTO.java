package vn.careermate.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {
    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
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
    private String currentStatus;
    private List<StudentSkillDTO> skills;
}

