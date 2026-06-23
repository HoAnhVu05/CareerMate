package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.RecruiterProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.FileStorageService;
import vn.careermate.common.client.ContentServiceClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.CompanyDTO;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    // Feign Clients for inter-service communication
    private final ContentServiceClient contentServiceClient;
    private final JobServiceClient jobServiceClient;

    @Transactional(readOnly = true)
    public RecruiterProfile getCurrentRecruiterProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Use JOIN FETCH to load user eagerly
        RecruiterProfile profile = recruiterProfileRepository.findByUserIdWithUser(user.getId())
                .orElseGet(() -> {
                    // Auto-create profile if it doesn't exist
                    RecruiterProfile newProfile = RecruiterProfile.builder()
                            .user(user)
                            .position("Nhà tuyển dụng")
                            .build();
                    RecruiterProfile saved = recruiterProfileRepository.save(newProfile);
                    // Reload with JOIN FETCH to ensure user is loaded
                    return recruiterProfileRepository.findByUserIdWithUser(user.getId())
                            .orElse(saved);
                });
        
        // Force load user fields to ensure they're initialized
        if (profile.getUser() != null) {
            profile.getUser().getId();
            profile.getUser().getFullName();
            profile.getUser().getEmail();
            profile.getUser().getAvatarUrl();
        }
        
        return profile;
    }

    public RecruiterProfile getRecruiterByUserId(java.util.UUID userId) {
        return recruiterProfileRepository.findByUserIdWithUser(userId).orElse(null);
    }
    
    public RecruiterProfile getRecruiterProfileById(UUID recruiterId) {
        return recruiterProfileRepository.findByIdWithCompany(recruiterId).orElse(null);
    }

    public RecruiterProfile getMyProfile() {
        return getCurrentRecruiterProfile();
    }

    @Transactional
    public RecruiterProfile updateProfile(String position, String department, String phone, String bio) {
        RecruiterProfile profile = getCurrentRecruiterProfile();
        if (position != null) profile.setPosition(position);
        if (department != null) profile.setDepartment(department);
        if (phone != null) profile.setPhone(phone);
        if (bio != null) profile.setBio(bio);
        return recruiterProfileRepository.save(profile);
    }

    // TODO: Refactor to use ContentServiceClient.getCompanyById() when content-service is ready
    @Transactional(readOnly = true)
    public CompanyDTO getMyCompany() {
        // Fetch companyId from RecruiterProfile and use ContentServiceClient
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        if (recruiter.getCompanyId() == null) {
            return null;
        }
        try {
            CompanyDTO companyDTO = contentServiceClient.getCompanyById(recruiter.getCompanyId());
            log.info("Fetched company info from content-service. Company ID: {}", recruiter.getCompanyId());
            return companyDTO;
        } catch (Exception e) {
            log.error("Error fetching company from content-service: {}", e.getMessage());
            return null;
        }
    }

    // TODO: Refactor to use ContentServiceClient.createOrUpdateCompany() when content-service is ready
    @Transactional
    public CompanyDTO createOrUpdateCompany(CompanyDTO companyDTO) {
        // Fetch current recruiter to ensure they are authorized
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID infoRecruiterId = recruiter.getId();
        UUID infoCompanyId = recruiter.getCompanyId();
        
        log.info("Starting createOrUpdateCompany for Recruiter: {}. Existing CompanyID: {}", infoRecruiterId, infoCompanyId);

        // Delegate to content-service
        try {
            // Ensure we are updating the existing company if the recruiter already has one
            if (infoCompanyId != null) {
                log.info("Recruiter {} linked to Company {}. Injecting ID to DTO to force UPDATE.", infoRecruiterId, infoCompanyId);
                companyDTO.setId(infoCompanyId);
            } else {
                log.info("Recruiter {} has NO Company. Requesting CREATE.", infoRecruiterId);
                companyDTO.setId(null); // Ensure ID is null for creation
            }

            log.info("Sending request to Content Service. Payload Name: {}", companyDTO.getName());
            CompanyDTO result = contentServiceClient.createOrUpdateCompany(companyDTO);
            log.info("Received result from Content Service. Result ID: {}", result.getId());
            
            // Critical link step: If recruiter didn't have ID, or if it changed (unlikely but possible), save it now.
            if (recruiter.getCompanyId() == null || !recruiter.getCompanyId().equals(result.getId())) {
                log.info("Updating RecruiterProfile {} with new CompanyID: {}", infoRecruiterId, result.getId());
                recruiter.setCompanyId(result.getId());
                
                // FORCE FLUSH to ensure this specific field update hits the DB immediately
                recruiterProfileRepository.saveAndFlush(recruiter);
                log.info("RecruiterProfile saved and flushed to DB.");
                
                // Verification fetch
                Optional<RecruiterProfile> verify = recruiterProfileRepository.findById(infoRecruiterId);
                log.info("Verification fetch - Recruiter CompanyID in DB is now: {}", verify.map(RecruiterProfile::getCompanyId).orElse(null));
            } else {
                log.info("RecruiterProfile already linked to Company {}. No update needed.", infoCompanyId);
            }
            
            return result;
        } catch (Exception e) {
            log.error("CRITICAL ERROR in createOrUpdateCompany: {}", e.getMessage(), e);
            throw new RuntimeException("Error communicating with content-service: " + e.getMessage(), e);
        }
    }

    @Transactional
    public String uploadCompanyLogo(MultipartFile file) throws IOException {
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
        String filePath = fileStorageService.storeFile(file, "company-logos");

        // Update company with logo URL via content-service
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID companyId = recruiter.getCompanyId();
        
        if (companyId == null) {
            throw new RuntimeException("Company not found. Please create company profile first.");
        }

        try {
            // Get current company
            CompanyDTO company = contentServiceClient.getCompanyById(companyId);
            
            // Delete old logo if exists
            if (company.getLogoUrl() != null && !company.getLogoUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(company.getLogoUrl());
                } catch (Exception e) {
                    log.warn("Could not delete old logo: {}", e.getMessage());
                    // Continue anyway
                }
            }
            
            // Update company with new logo URL
            company.setLogoUrl(filePath);
            contentServiceClient.createOrUpdateCompany(company);
            
            log.info("Updated company {} logo to: {}", companyId, filePath);
        } catch (Exception e) {
            log.error("Error updating company logo: {}", e.getMessage(), e);
            // Delete uploaded file since we couldn't update the company
            try {
                fileStorageService.deleteFile(filePath);
            } catch (Exception ex) {
                log.warn("Could not delete uploaded file after error: {}", ex.getMessage());
            }
            throw new RuntimeException("Failed to update company logo: " + e.getMessage());
        }

        return filePath;
    }

    // TODO: Refactor to use JobServiceClient.getDashboardStats() when job-service is ready
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        log.warn("getDashboardStats() is not available in microservice architecture. Use job-service endpoints directly.");
        // Return empty stats - should be fetched from job-service
        try {
            RecruiterProfile recruiter = getCurrentRecruiterProfile();
            return jobServiceClient.getRecruiterStats(recruiter.getId());
        } catch (Exception e) {
            log.error("Error fetching stats from job-service: {}", e.getMessage());
            return Map.of(
                "activeJobs", 0L,
                "newApplications", 0L,
                "upcomingInterviews", 0L,
                "successfulHires", 0L
            );
        }
    }
        
        /* Original implementation - commented for microservice refactoring
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID recruiterId = recruiter.getId();
        
        // Count active jobs
        long activeJobsCount = jobRepository.countByRecruiterIdAndStatus(recruiterId, Job.JobStatus.ACTIVE);
        
        // Count new applications (PENDING status)
        long newApplicationsCount = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, Application.ApplicationStatus.PENDING);
        
        // Count upcoming interviews (INTERVIEW status with scheduled time in future)
        long upcomingInterviewsCount = applicationRepository.countUpcomingInterviewsByRecruiter(
            recruiterId, LocalDateTime.now());
        
        // Count successful hires (OFFERED status)
        long successfulHiresCount = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, Application.ApplicationStatus.OFFERED);
        
        return Map.of(
            "activeJobs", activeJobsCount,
            "newApplications", newApplicationsCount,
            "upcomingInterviews", upcomingInterviewsCount,
            "successfulHires", successfulHiresCount
        );
        */
    

    @Transactional
    public User updateFullName(String fullName) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        User user = recruiter.getUser();
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
            return userRepository.save(user);
        }
        return user;
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

        // Update user avatar URL
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        User user = recruiter.getUser();
        
        // Delete old avatar if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old avatar: {}", e.getMessage());
            }
        }
        
        user.setAvatarUrl(filePath);
        userRepository.save(user);

        return filePath;
    }

    public RecruiterProfile getRecruiterByCompanyId(UUID companyId) {
        return recruiterProfileRepository.findByCompanyId(companyId).orElse(null);
    }

    @Transactional(readOnly = true)
    public java.util.List<Map<String, Object>> getAllExperts() {
        java.util.List<RecruiterProfile> profiles = recruiterProfileRepository.findByIsExpertTrue();
        return profiles.stream().map(rp -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", rp.getId());
            map.put("userId", rp.getUser() != null ? rp.getUser().getId() : null);
            map.put("name", rp.getUser() != null ? rp.getUser().getFullName() : "Chuyên gia");
            map.put("avatarUrl", rp.getUser() != null ? rp.getUser().getAvatarUrl() : null);
            map.put("position", rp.getPosition());
            map.put("companyId", rp.getCompanyId());
            
            // Try to set company name if companyId exists
            if (rp.getCompanyId() != null) {
                try {
                    // Cache or just fetch (small number of recruiters for now)
                    CompanyDTO company = contentServiceClient.getCompanyById(rp.getCompanyId());
                    map.put("companyName", company != null ? company.getName() : "Công ty");
                } catch (Exception e) {
                    map.put("companyName", "Công ty");
                }
            } else {
                map.put("companyName", "Tự do");
            }
            
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void resetCompanyLink() {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        recruiter.setCompanyId(null);
        recruiterProfileRepository.save(recruiter);
        log.info("Company link reset for recruiter: {}", recruiter.getId());
    }
}
