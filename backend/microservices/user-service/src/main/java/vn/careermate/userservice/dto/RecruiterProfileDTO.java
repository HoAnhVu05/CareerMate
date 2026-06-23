package vn.careermate.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileDTO {
    private UUID id;
    private String position;
    private String department;
    private String phone;
    private String bio;
    private UUID companyId;
    private String companyName;
}

