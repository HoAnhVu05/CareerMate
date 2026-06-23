package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
// TODO: Company entity has been moved to content-service
// import vn.careermate.contentservice.model.Company;
import vn.careermate.common.dto.CompanyDTO;
import vn.careermate.common.dto.RecruiterProfileDTO;
import vn.careermate.userservice.dto.RecruiterProfileUpdateRequest;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.service.RecruiterProfileService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/recruiters")
@RequiredArgsConstructor
public class RecruiterProfileController {

    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        try {
            RecruiterProfile profile = recruiterProfileService.getMyProfile();
            User user = profile.getUser();
            
            Map<String, Object> userMap = new HashMap<>();
            if (user != null) {
                userMap.put("id", user.getId());
                userMap.put("fullName", user.getFullName() != null ? user.getFullName() : "");
                userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
                userMap.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
            } else {
                userMap.put("id", "");
                userMap.put("fullName", "");
                userMap.put("email", "");
                userMap.put("avatarUrl", "");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", profile.getId());
            response.put("position", profile.getPosition() != null ? profile.getPosition() : "");
            response.put("department", profile.getDepartment() != null ? profile.getDepartment() : "");
            response.put("phone", profile.getPhone() != null ? profile.getPhone() : "");
            response.put("bio", profile.getBio() != null ? profile.getBio() : "");
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting recruiter profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error loading profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<RecruiterProfile> updateProfile(@RequestBody RecruiterProfileUpdateRequest request) {
        return ResponseEntity.ok(recruiterProfileService.updateProfile(
            request.getPosition(),
            request.getDepartment(),
            request.getPhone(),
            request.getBio()
        ));
    }

    @GetMapping("/company")
    public ResponseEntity<?> getMyCompany() {
        try {
            CompanyDTO company = recruiterProfileService.getMyCompany();
            if (company == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(company);
        } catch (RuntimeException e) {
            log.error("Error getting company: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Map.of("error", "Error loading company: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error getting company: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error loading company: " + e.getMessage()));
        }
    }

    @PostMapping("/company")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> createOrUpdateCompany(@RequestBody CompanyDTO companyDTO) {
        try {
            CompanyDTO result = recruiterProfileService.createOrUpdateCompany(companyDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating/updating company: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error creating/updating company: " + e.getMessage()));
        }
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<RecruiterProfile> getRecruiterByUserId(@PathVariable UUID userId) {
        RecruiterProfile profile = recruiterProfileService.getRecruiterByUserId(userId);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }
    
    // Endpoints for Feign Clients
    @GetMapping("/profile/current")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<RecruiterProfileDTO> getCurrentRecruiterProfileForFeign() {
        try {
            RecruiterProfile profile = recruiterProfileService.getCurrentRecruiterProfile();
            RecruiterProfileDTO dto = RecruiterProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                    .companyId(profile.getCompanyId())
                    .position(profile.getPosition())
                    .department(profile.getDepartment())
                    .phone(profile.getPhone())
                    .bio(profile.getBio())
                    .linkedinUrl(null) // RecruiterProfile doesn't have linkedinUrl field
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting current recruiter profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/profile/{recruiterId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<RecruiterProfileDTO> getRecruiterProfileById(@PathVariable UUID recruiterId) {
        try {
            RecruiterProfile profile = recruiterProfileService.getRecruiterProfileById(recruiterId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            RecruiterProfileDTO dto = RecruiterProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                    .companyId(profile.getCompanyId())
                    .position(profile.getPosition())
                    .department(profile.getDepartment())
                    .phone(profile.getPhone())
                    .bio(profile.getBio())
                    .linkedinUrl(null) // RecruiterProfile doesn't have linkedinUrl field
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting recruiter profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/profile/user/{userId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<RecruiterProfileDTO> getRecruiterProfileByUserId(@PathVariable UUID userId) {
        try {
            RecruiterProfile profile = recruiterProfileService.getRecruiterByUserId(userId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            RecruiterProfileDTO dto = RecruiterProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                    .companyId(profile.getCompanyId())
                    .position(profile.getPosition())
                    .department(profile.getDepartment())
                    .phone(profile.getPhone())
                    .bio(profile.getBio())
                    .linkedinUrl(null) // RecruiterProfile doesn't have linkedinUrl field
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting recruiter profile by user ID: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/company/logo")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, String>> uploadCompanyLogo(@RequestParam("file") MultipartFile file) {
        try {
            String logoUrl = recruiterProfileService.uploadCompanyLogo(file);
            return ResponseEntity.ok(Map.of("logoUrl", logoUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading logo: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            return ResponseEntity.ok(recruiterProfileService.getDashboardStats());
        } catch (Exception e) {
            log.error("Error getting dashboard stats: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error loading dashboard stats: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/fullName")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, String>> updateFullName(@RequestBody Map<String, String> request) {
        try {
            String fullName = request.get("fullName");
            if (fullName == null || fullName.trim().isEmpty()) {
                return ResponseEntity.status(400)
                    .body(Map.of("error", "Full name cannot be empty"));
            }
            User user = recruiterProfileService.updateFullName(fullName);
            return ResponseEntity.ok(Map.of("fullName", user.getFullName()));
        } catch (Exception e) {
            log.error("Error updating full name: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error updating full name: " + e.getMessage()));
        }
    }

    @PostMapping("/profile/avatar")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String avatarUrl = recruiterProfileService.uploadAvatar(file);
            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (RuntimeException e) {
            log.error("Runtime error uploading avatar: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("IO error uploading avatar", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error uploading avatar", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading avatar: " + e.getMessage()));
        }
    }
    @PostMapping("/company/reset")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> resetCompanyLink() {
        try {
            recruiterProfileService.resetCompanyLink();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error resetting company link: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    @GetMapping("/by-company/{companyId}")
    @PreAuthorize("permitAll()") // Internal use mostly, but can be open
    public ResponseEntity<RecruiterProfileDTO> getRecruiterByCompanyId(@PathVariable UUID companyId) {
        try {
            RecruiterProfile profile = recruiterProfileService.getRecruiterByCompanyId(companyId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            RecruiterProfileDTO dto = RecruiterProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .fullName(profile.getUser() != null ? profile.getUser().getFullName() : null)
                    .companyId(profile.getCompanyId())
                    .position(profile.getPosition())
                    .department(profile.getDepartment())
                    .phone(profile.getPhone())
                    .bio(profile.getBio())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting recruiter by company ID: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/experts")
    @PreAuthorize("permitAll()")
    public ResponseEntity<java.util.List<Map<String, Object>>> getExperts() {
        return ResponseEntity.ok(recruiterProfileService.getAllExperts());
    }
}
