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
public class RecruiterProfileDTO {
    private UUID id;
    private UUID userId;
    private String fullName; // Added to map user name
    private UUID companyId; // Reference to company in content-service
    private String position;
    private String department;
    private String phone;
    private String bio;
    private String linkedinUrl; // Optional field
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
