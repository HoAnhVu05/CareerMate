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
public class UserInfo {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private String status;
}
