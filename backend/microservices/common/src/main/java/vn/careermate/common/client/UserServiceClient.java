package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.CVDTO;
import vn.careermate.common.dto.RecruiterProfileDTO;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.config.FeignClientConfiguration;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "user-service", configuration = FeignClientConfiguration.class)
public interface UserServiceClient {
    @GetMapping("/users/{userId}")
    UserDTO getUserById(@PathVariable UUID userId);
    
    @GetMapping("/users/email/{email}")
    UserDTO getUserByEmail(@PathVariable String email);
    
    // Recruiter Profile endpoints
    @GetMapping("/recruiters/profile/current")
    RecruiterProfileDTO getCurrentRecruiterProfile();
    
    @GetMapping("/recruiters/profile/user/{userId}")
    RecruiterProfileDTO getRecruiterProfileByUserId(@PathVariable UUID userId);
    
    @GetMapping("/recruiters/profile/{recruiterId}")
    RecruiterProfileDTO getRecruiterProfileById(@PathVariable UUID recruiterId);
    
    @GetMapping("/recruiters/by-company/{companyId}")
    RecruiterProfileDTO getRecruiterByCompanyId(@PathVariable UUID companyId);
    
    // Student Profile endpoints
    @GetMapping("/students/profile/current")
    StudentProfileDTO getCurrentStudentProfile();
    
    @GetMapping("/students/profile/{studentId}")
    StudentProfileDTO getStudentProfileById(@PathVariable UUID studentId);
    
    @GetMapping("/students/profile/user/{userId}")
    StudentProfileDTO getStudentProfileByUserId(@PathVariable UUID userId);
    
    // CV endpoints
    @GetMapping("/students/cv/{cvId}")
    CVDTO getCVById(@PathVariable UUID cvId);

    @GetMapping("/students/cv/all")
    List<CVDTO> getAllCVs();

    @GetMapping("/students/cv/download/{cvId}")
    feign.Response downloadCV(@PathVariable UUID cvId);

    // Get users by roles (for notifications)
    @PostMapping("/users/by-roles")
    List<UserDTO> getUsersByRoles(@RequestBody List<String> roles);

    @PutMapping("/users/{userId}/status")
    UserDTO updateUserStatus(@PathVariable UUID userId, @RequestParam String status);

    @DeleteMapping("/users/{userId}")
    void deleteUser(@PathVariable UUID userId);
}
