package vn.careermate.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileUpdateRequest {
    private String position;
    private String department;
    private String phone;
    private String bio;
}
