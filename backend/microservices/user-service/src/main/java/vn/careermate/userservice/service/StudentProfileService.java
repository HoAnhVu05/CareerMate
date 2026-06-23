package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.FileStorageService;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        log.info("Getting current student profile. Authentication: {}, Name: {}", 
            auth != null ? "present" : "null",
            auth != null ? auth.getName() : "N/A");
        
        if (auth == null) {
            log.error("Authentication is null - user not authenticated");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        if (auth.getName() == null) {
            log.error("Authentication name is null");
            throw new RuntimeException("Authentication name is null. Please login again.");
        }
        
        if ("anonymousUser".equals(auth.getName())) {
            log.error("User is anonymous - token may be missing or invalid");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        try {
            String email = auth.getName();
            log.info("Looking up user with email: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found in database for email: {}", email);
                        return new RuntimeException("User not found: " + email + ". Please register first.");
                    });

            log.info("Found user: {} (ID: {})", user.getEmail(), user.getId());

            StudentProfile profile = studentProfileRepository.findWithUserByUserId(user.getId())
                    .orElse(null);

            // Tạo profile mới nếu chưa có
            if (profile == null) {
                log.info("Creating default profile for user: {} (ID: {})", email, user.getId());
                profile = createDefaultProfile(user);
                log.info("Default profile created with ID: {}", profile.getId());
            } else {
                log.info("Found existing profile with ID: {}", profile.getId());
            }

            log.info("Profile retrieved. ID: {}, University: {}, Major: {}", 
                profile.getId(), profile.getUniversity(), profile.getMajor());

            return profile;
        } catch (RuntimeException e) {
            log.error("RuntimeException getting student profile: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting student profile", e);
            throw new RuntimeException("Error getting student profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    private StudentProfile createDefaultProfile(User user) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setCurrentStatus("STUDENT");
        return studentProfileRepository.save(profile);
    }

    @Transactional
    public StudentProfile updateProfile(StudentProfile profile) {
        try {
            // Get current profile WITHOUT detaching - we need it to be managed
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                throw new RuntimeException("Authentication required. Please login first.");
            }
            
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            // Get existing profile - DO NOT detach, we need it managed
            StudentProfile existing = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found for user: " + email));
            
            log.info("Updating profile ID: {}, current university: {}, new university: {}", 
                existing.getId(), existing.getUniversity(), profile.getUniversity());
            log.info("Profile update data - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                profile.getGender(), profile.getAddress(), profile.getCity(), profile.getUniversity(), profile.getMajor());
            
            // Update all fields - allow null to clear fields
            existing.setDateOfBirth(profile.getDateOfBirth());
            existing.setGender(profile.getGender());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setCountry(profile.getCountry() != null ? profile.getCountry() : "Vietnam");
            existing.setUniversity(profile.getUniversity());
            existing.setMajor(profile.getMajor());
            existing.setGraduationYear(profile.getGraduationYear());
            existing.setGpa(profile.getGpa());
            existing.setBio(profile.getBio());
            existing.setLinkedinUrl(profile.getLinkedinUrl());
            existing.setGithubUrl(profile.getGithubUrl());
            existing.setPortfolioUrl(profile.getPortfolioUrl());
            existing.setAvatarUrl(profile.getAvatarUrl());
            existing.setCurrentStatus(profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");
            
            log.info("After setting fields - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                existing.getGender(), existing.getAddress(), existing.getCity(), existing.getUniversity(), existing.getMajor());
            
            return studentProfileRepository.save(existing);
        } catch (Exception e) {
            log.error("Error in updateProfile service", e);
            throw new RuntimeException("Failed to update profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    public String uploadAvatar(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        if (fileName == null || (contentType != null && !contentType.startsWith("image/"))) {
            throw new RuntimeException("Invalid file type. Only image files are allowed.");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size too large. Maximum size is 5MB.");
        }

        // Save file using FileStorageService
        String filePath = fileStorageService.storeFile(file, "avatars");

        // Get current user and profile
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        StudentProfile profile = getCurrentStudentProfile();
        
        // Delete old avatars if exist
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(profile.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old profile avatar: {}", e.getMessage());
            }
        }
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old user avatar: {}", e.getMessage());
            }
        }
        
        // Update both User and StudentProfile with avatar URL
        profile.setAvatarUrl(filePath);
        user.setAvatarUrl(filePath);
        
        studentProfileRepository.save(profile);
        userRepository.save(user);
        
        log.info("Avatar uploaded and synced to both User and StudentProfile: {}", filePath);

        return filePath;
    }

    public StudentProfile getStudentProfileById(UUID studentId) {
        return studentProfileRepository.findWithUserById(studentId).orElse(null);
    }

    public StudentProfile getStudentProfileByUserId(UUID userId) {
        return studentProfileRepository.findWithUserByUserId(userId).orElse(null);
    }
}
