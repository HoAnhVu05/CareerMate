package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.StudentProfileService;
import vn.careermate.common.dto.UserDTO;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        try {
            log.info("GET /students/profile - Request received");
            
            // Check authentication first
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                log.warn("GET /students/profile - No authentication found");
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication required. Please login first."));
            }
            
            log.info("GET /students/profile - Authenticated user: {}", auth.getName());
            
            StudentProfile profile = studentProfileService.getCurrentStudentProfile();
            
            if (profile == null) {
                log.warn("GET /students/profile - Profile is null after service call");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Profile not found"));
            }

            log.info("GET /students/profile - Profile found with ID: {}", profile.getId());
            log.info("GET /students/profile - Profile data - University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                profile.getUniversity(), profile.getMajor(), profile.getCity(), profile.getAddress(), profile.getGender());

            // Get user to check avatar URL (User.avatarUrl takes priority)
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            // Priority: User.avatarUrl > StudentProfile.avatarUrl
            String avatarUrl = null;
            if (user != null && user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                avatarUrl = user.getAvatarUrl();
            } else if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isEmpty()) {
                avatarUrl = profile.getAvatarUrl();
            }
            
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", profile.getId() != null ? profile.getId().toString() : null);
            dto.put("dateOfBirth", profile.getDateOfBirth());
            dto.put("gender", profile.getGender());
            dto.put("address", profile.getAddress());
            dto.put("city", profile.getCity());
            dto.put("country", profile.getCountry() != null ? profile.getCountry() : "Vietnam");
            dto.put("university", profile.getUniversity());
            dto.put("major", profile.getMajor());
            dto.put("graduationYear", profile.getGraduationYear());
            dto.put("gpa", profile.getGpa());
            dto.put("bio", profile.getBio());
            dto.put("linkedinUrl", profile.getLinkedinUrl());
            dto.put("githubUrl", profile.getGithubUrl());
            dto.put("portfolioUrl", profile.getPortfolioUrl());
            dto.put("avatarUrl", avatarUrl);
            dto.put("currentStatus", profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");
            
            log.info("GET /students/profile - Avatar URL: {}", avatarUrl);

            log.info("GET /students/profile - DTO data - University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                dto.get("university"), dto.get("major"), dto.get("city"), dto.get("address"), dto.get("gender"));
            log.info("GET /students/profile - Returning profile data successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("GET /students/profile - RuntimeException: {}", e.getMessage(), e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Authentication required")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", errorMsg));
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", errorMsg != null ? errorMsg : "Unknown error"));
        } catch (Exception e) {
            log.error("GET /students/profile - Unexpected error", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error loading profile: " + e.getMessage(), 
                    "type", e.getClass().getSimpleName()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> profileData) {
        try {
            log.info("PUT /students/profile - Request received");
            
            // Check authentication first
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                log.warn("PUT /students/profile - No authentication found");
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication required. Please login first."));
            }
            
            log.info("PUT /students/profile - Authenticated user: {}", auth.getName());
            log.info("PUT /students/profile - Profile data received: {}", profileData);
            
            // Convert Map to StudentProfile object
            StudentProfile profileUpdate = new StudentProfile();
            
            if (profileData.containsKey("dateOfBirth") && profileData.get("dateOfBirth") != null) {
                try {
                    String dateStr = profileData.get("dateOfBirth").toString();
                    if (!dateStr.isEmpty()) {
                        profileUpdate.setDateOfBirth(java.time.LocalDate.parse(dateStr));
                    }
                } catch (Exception e) {
                    log.warn("Error parsing dateOfBirth: {}", e.getMessage());
                }
            }
            
            // Handle fields - allow null values to clear fields
            if (profileData.containsKey("gender")) {
                profileUpdate.setGender(profileData.get("gender") != null && !profileData.get("gender").toString().isEmpty() 
                    ? (String) profileData.get("gender") : null);
            }
            if (profileData.containsKey("address")) {
                profileUpdate.setAddress(profileData.get("address") != null && !profileData.get("address").toString().isEmpty() 
                    ? (String) profileData.get("address") : null);
            }
            if (profileData.containsKey("city")) {
                profileUpdate.setCity(profileData.get("city") != null && !profileData.get("city").toString().isEmpty() 
                    ? (String) profileData.get("city") : null);
            }
            
            // Handle country
            String country = (String) profileData.getOrDefault("country", "Vietnam");
            if (country != null && (country.equals("Việt Nam") || country.equals("Vietnam"))) {
                profileUpdate.setCountry("Vietnam");
            } else if (country != null && !country.isEmpty()) {
                profileUpdate.setCountry(country);
            } else {
                profileUpdate.setCountry("Vietnam");
            }
            
            if (profileData.containsKey("university")) {
                profileUpdate.setUniversity(profileData.get("university") != null && !profileData.get("university").toString().isEmpty() 
                    ? (String) profileData.get("university") : null);
            }
            if (profileData.containsKey("major")) {
                profileUpdate.setMajor(profileData.get("major") != null && !profileData.get("major").toString().isEmpty() 
                    ? (String) profileData.get("major") : null);
            }
            
            if (profileData.containsKey("graduationYear") && profileData.get("graduationYear") != null) {
                try {
                    Object gradYear = profileData.get("graduationYear");
                    if (gradYear instanceof Number) {
                        profileUpdate.setGraduationYear(((Number) gradYear).intValue());
                    } else if (gradYear instanceof String && !gradYear.toString().isEmpty()) {
                        profileUpdate.setGraduationYear(Integer.parseInt(gradYear.toString()));
                    }
                } catch (Exception e) {
                    log.warn("Error parsing graduationYear: {}", e.getMessage());
                }
            }
            
            if (profileData.containsKey("gpa") && profileData.get("gpa") != null) {
                try {
                    Object gpaObj = profileData.get("gpa");
                    if (gpaObj instanceof Number) {
                        profileUpdate.setGpa(java.math.BigDecimal.valueOf(((Number) gpaObj).doubleValue()));
                    } else if (gpaObj instanceof String && !gpaObj.toString().isEmpty()) {
                        profileUpdate.setGpa(new java.math.BigDecimal(gpaObj.toString()));
                    }
                } catch (Exception e) {
                    log.warn("Error parsing GPA: {}", e.getMessage());
                }
            }
            
            if (profileData.containsKey("bio")) {
                profileUpdate.setBio(profileData.get("bio") != null && !profileData.get("bio").toString().isEmpty() 
                    ? (String) profileData.get("bio") : null);
            }
            if (profileData.containsKey("linkedinUrl")) {
                profileUpdate.setLinkedinUrl(profileData.get("linkedinUrl") != null && !profileData.get("linkedinUrl").toString().isEmpty() 
                    ? (String) profileData.get("linkedinUrl") : null);
            }
            if (profileData.containsKey("githubUrl")) {
                profileUpdate.setGithubUrl(profileData.get("githubUrl") != null && !profileData.get("githubUrl").toString().isEmpty() 
                    ? (String) profileData.get("githubUrl") : null);
            }
            if (profileData.containsKey("portfolioUrl")) {
                profileUpdate.setPortfolioUrl(profileData.get("portfolioUrl") != null && !profileData.get("portfolioUrl").toString().isEmpty() 
                    ? (String) profileData.get("portfolioUrl") : null);
            }
            if (profileData.containsKey("avatarUrl")) {
                profileUpdate.setAvatarUrl(profileData.get("avatarUrl") != null && !profileData.get("avatarUrl").toString().isEmpty() 
                    ? (String) profileData.get("avatarUrl") : null);
            }
            if (profileData.containsKey("currentStatus")) {
                profileUpdate.setCurrentStatus(profileData.get("currentStatus") != null && !profileData.get("currentStatus").toString().isEmpty() 
                    ? (String) profileData.get("currentStatus") : "STUDENT");
            } else {
                profileUpdate.setCurrentStatus("STUDENT");
            }
            
            log.info("Updating profile with data: dateOfBirth={}, gender={}, university={}, major={}", 
                profileUpdate.getDateOfBirth(), profileUpdate.getGender(), profileUpdate.getUniversity(), profileUpdate.getMajor());
            
            StudentProfile updated = studentProfileService.updateProfile(profileUpdate);
            
            log.info("PUT /students/profile - Profile updated successfully. ID: {}", updated.getId());
            
            // Return as Map to avoid serialization issues
            Map<String, Object> response = new HashMap<>();
            response.put("id", updated.getId() != null ? updated.getId().toString() : null);
            response.put("dateOfBirth", updated.getDateOfBirth());
            response.put("gender", updated.getGender());
            response.put("address", updated.getAddress());
            response.put("city", updated.getCity());
            response.put("country", updated.getCountry());
            response.put("university", updated.getUniversity());
            response.put("major", updated.getMajor());
            response.put("graduationYear", updated.getGraduationYear());
            response.put("gpa", updated.getGpa());
            response.put("bio", updated.getBio());
            response.put("linkedinUrl", updated.getLinkedinUrl());
            response.put("githubUrl", updated.getGithubUrl());
            response.put("portfolioUrl", updated.getPortfolioUrl());
            response.put("avatarUrl", updated.getAvatarUrl());
            response.put("currentStatus", updated.getCurrentStatus());
            response.put("message", "Profile updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("PUT /students/profile - RuntimeException: {}", e.getMessage(), e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Authentication required")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", errorMsg));
            }
            if (errorMsg != null && errorMsg.contains("User not found")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", errorMsg + ". Please login again."));
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", errorMsg != null ? errorMsg : "Unknown error", 
                    "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            log.error("PUT /students/profile - Unexpected error", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error updating profile: " + e.getMessage(), 
                    "type", e.getClass().getSimpleName(),
                    "details", e.toString()));
        }
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String avatarUrl = studentProfileService.uploadAvatar(file);
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

    // Endpoints for Feign Clients
    @GetMapping("/profile/current")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<vn.careermate.common.dto.StudentProfileDTO> getCurrentStudentProfileForFeign() {
        try {
            StudentProfile profile = studentProfileService.getCurrentStudentProfile();
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            vn.careermate.common.dto.StudentProfileDTO dto = vn.careermate.common.dto.StudentProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .dateOfBirth(profile.getDateOfBirth())
                    .gender(profile.getGender())
                    .address(profile.getAddress())
                    .city(profile.getCity())
                    .country(profile.getCountry())
                    .university(profile.getUniversity())
                    .major(profile.getMajor())
                    .graduationYear(profile.getGraduationYear())
                    .gpa(profile.getGpa())
                    .bio(profile.getBio())
                    .linkedinUrl(profile.getLinkedinUrl())
                    .githubUrl(profile.getGithubUrl())
                    .portfolioUrl(profile.getPortfolioUrl())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .user(profile.getUser() != null ? vn.careermate.common.dto.UserDTO.builder()
                            .id(profile.getUser().getId())
                            .email(profile.getUser().getEmail())
                            .fullName(profile.getUser().getFullName())
                            .avatarUrl(profile.getUser().getAvatarUrl())
                            .build() : null)
                    .avatarUrl(profile.getAvatarUrl() != null ? profile.getAvatarUrl() : 
                              (profile.getUser() != null ? profile.getUser().getAvatarUrl() : null))
                    .build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting current student profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/profile/{studentId}")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<vn.careermate.common.dto.StudentProfileDTO> getStudentProfileById(@PathVariable java.util.UUID studentId) {
        try {
            StudentProfile profile = studentProfileService.getStudentProfileById(studentId);
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            vn.careermate.common.dto.StudentProfileDTO dto = vn.careermate.common.dto.StudentProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .dateOfBirth(profile.getDateOfBirth())
                    .gender(profile.getGender())
                    .address(profile.getAddress())
                    .city(profile.getCity())
                    .country(profile.getCountry())
                    .university(profile.getUniversity())
                    .major(profile.getMajor())
                    .graduationYear(profile.getGraduationYear())
                    .gpa(profile.getGpa())
                    .bio(profile.getBio())
                    .linkedinUrl(profile.getLinkedinUrl())
                    .githubUrl(profile.getGithubUrl())
                    .portfolioUrl(profile.getPortfolioUrl())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .user(profile.getUser() != null ? vn.careermate.common.dto.UserDTO.builder()
                            .id(profile.getUser().getId())
                            .email(profile.getUser().getEmail())
                            .fullName(profile.getUser().getFullName())
                            .avatarUrl(profile.getUser().getAvatarUrl())
                            .build() : null)
                    .avatarUrl(profile.getAvatarUrl() != null ? profile.getAvatarUrl() : 
                              (profile.getUser() != null ? profile.getUser().getAvatarUrl() : null))
                    .build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting student profile by ID: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/profile/user/{userId}")
    @org.springframework.security.access.prepost.PreAuthorize("permitAll()")
    public ResponseEntity<vn.careermate.common.dto.StudentProfileDTO> getStudentProfileByUserId(@PathVariable java.util.UUID userId) {
        try {
            log.info("GET /students/profile/user/{} - Request received from Feign client", userId);
            StudentProfile profile = studentProfileService.getStudentProfileByUserId(userId);
            if (profile == null) {
                log.warn("GET /students/profile/user/{} - Profile not found", userId);
                return ResponseEntity.notFound().build();
            }
            vn.careermate.common.dto.StudentProfileDTO dto = vn.careermate.common.dto.StudentProfileDTO.builder()
                    .id(profile.getId())
                    .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                    .dateOfBirth(profile.getDateOfBirth())
                    .gender(profile.getGender())
                    .address(profile.getAddress())
                    .city(profile.getCity())
                    .country(profile.getCountry())
                    .university(profile.getUniversity())
                    .major(profile.getMajor())
                    .graduationYear(profile.getGraduationYear())
                    .gpa(profile.getGpa())
                    .bio(profile.getBio())
                    .linkedinUrl(profile.getLinkedinUrl())
                    .githubUrl(profile.getGithubUrl())
                    .portfolioUrl(profile.getPortfolioUrl())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .user(profile.getUser() != null ? vn.careermate.common.dto.UserDTO.builder()
                            .id(profile.getUser().getId())
                            .email(profile.getUser().getEmail())
                            .fullName(profile.getUser().getFullName())
                            .avatarUrl(profile.getUser().getAvatarUrl())
                            .build() : null)
                    .avatarUrl(profile.getAvatarUrl() != null ? profile.getAvatarUrl() : 
                              (profile.getUser() != null ? profile.getUser().getAvatarUrl() : null))
                    .build();
            log.info("GET /students/profile/user/{} - Profile found: ID={}", userId, profile.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error getting student profile by user ID: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}
