package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.common.client.ContentServiceClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.CompanyDTO;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.common.dto.ApplicationDTO;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.RecruiterProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.FileStorageService;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    // Feign Clients for inter-service communication
    private final JobServiceClient jobServiceClient;
    private final ContentServiceClient contentServiceClient;

    public RecruiterProfile getCurrentRecruiterProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Auto-create profile if it doesn't exist
                    RecruiterProfile profile = RecruiterProfile.builder()
                            .user(user)
                            .position("Nhà tuyển dụng")
                            .build();
                    return recruiterProfileRepository.save(profile);
                });
    }

    public RecruiterProfile getRecruiterByUserId(UUID userId) {
        return recruiterProfileRepository.findByUserId(userId).orElse(null);
    }

    // TODO: Refactor to use JobServiceClient.createJob() when job-service is ready
    // Note: This method is already commented above, but keeping for reference

    // TODO: Refactor to use JobServiceClient.getJobsByRecruiter() when job-service is ready
    public Page<JobDTO> getMyJobs(Pageable pageable) {
        log.warn("getMyJobs() is not available in microservice architecture. Use job-service endpoints directly.");
        return Page.empty(pageable);
        /* Original implementation - commented for microservice refactoring
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        return jobRepository.findByRecruiterId(recruiter.getId(), pageable);
        */
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getJobApplicants(UUID jobId, Pageable pageable) {
        // TODO: This method should use JobServiceClient to get applications
        // For now, return empty page as Application entity is in job-service
        log.warn("getJobApplicants() is not available in microservice architecture. Use job-service endpoints directly.");
        return Page.empty(pageable);
        /* Original implementation - commented for microservice refactoring
        Page<Application> applications = applicationRepository.findByJobId(jobId, pageable);
        
        // Force load all fields to avoid lazy loading issues
        if (applications != null && applications.getContent() != null) {
            applications.getContent().forEach(app -> {
                try {
                    app.getId();
                    app.getStatus();
                    app.getAppliedAt();
                    
                    if (app.getJob() != null) {
                        app.getJob().getId();
                        app.getJob().getTitle();
                        app.getJob().getLocation();
                        if (app.getJob().getCompany() != null) {
                            app.getJob().getCompany().getId();
                            app.getJob().getCompany().getName();
                        }
                    }
                    if (app.getStudent() != null) {
                        app.getStudent().getId();
                    }
                    if (app.getCv() != null) {
                        app.getCv().getId();
                        app.getCv().getFileName();
                    }
                } catch (Exception e) {
                    // Log but continue
                }
            });
        }
        
        return applications;
    }

    // TODO: Refactor to use JobServiceClient.updateApplicationStatus() when job-service is ready
    @Transactional
    public ApplicationDTO updateApplicationStatus(UUID applicationId, String status, String notes) {
        log.warn("updateApplicationStatus() is not available in microservice architecture. Use job-service endpoints directly.");
        throw new RuntimeException("Application status update has been moved to job-service. Please use /api/applications/{id}/status endpoint.");
        
        /* Original implementation - commented for microservice refactoring
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());

        if (status == Application.ApplicationStatus.VIEWED && application.getViewedAt() == null) {
            application.setViewedAt(LocalDateTime.now());
        }

        application = applicationRepository.save(application);

        // Create history record (if repository exists)
        // Note: ApplicationHistoryRepository may not be available yet
        // ApplicationHistory history = ApplicationHistory.builder()
        //         .application(application)
        //         .status(status.name())
        //         .notes(notes)
        //         .changedBy(getCurrentUser())
        //         .build();
        // applicationHistoryRepository.save(history);

        return application;
        */
    }

    // TODO: Refactor to use JobServiceClient.scheduleInterview() when job-service is ready
    @Transactional
    public ApplicationDTO scheduleInterview(UUID applicationId, LocalDateTime interviewTime) {
        log.warn("scheduleInterview() is not available in microservice architecture. Use job-service endpoints directly.");
        throw new RuntimeException("Interview scheduling has been moved to job-service. Please use /api/applications/{id}/schedule-interview endpoint.");
        
        /* Original implementation - commented for microservice refactoring
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(Application.ApplicationStatus.INTERVIEW);
        application.setInterviewScheduledAt(interviewTime);
        application.setUpdatedAt(LocalDateTime.now());

        return applicationRepository.save(application);
        */
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
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

    // TODO: Refactor to use ContentServiceClient.createOrUpdateCompany() when content-service is ready
    @Transactional
    public CompanyDTO createOrUpdateCompany(CompanyDTO companyDTO) {
        log.warn("createOrUpdateCompany() is not available in microservice architecture. Use content-service endpoints directly.");
        throw new RuntimeException("Company management has been moved to content-service. Please use /api/companies endpoint.");
        
        /* Original implementation - commented for microservice refactoring
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        
        // Force load company if it exists
        Company existingCompany = recruiter.getCompany();
        if (existingCompany != null) {
            // Force load by accessing ID
            existingCompany.getId();
        }
        
        if (existingCompany != null) {
            // Update existing company
            if (company.getName() != null) existingCompany.setName(company.getName());
            if (company.getWebsiteUrl() != null) existingCompany.setWebsiteUrl(company.getWebsiteUrl());
            if (company.getHeadquarters() != null) existingCompany.setHeadquarters(company.getHeadquarters());
            if (company.getDescription() != null) existingCompany.setDescription(company.getDescription());
            if (company.getCompanySize() != null) existingCompany.setCompanySize(company.getCompanySize());
            if (company.getIndustry() != null) existingCompany.setIndustry(company.getIndustry());
            if (company.getFoundedYear() != null) existingCompany.setFoundedYear(company.getFoundedYear());
            if (company.getLogoUrl() != null) existingCompany.setLogoUrl(company.getLogoUrl());
            company = companyRepository.save(existingCompany);
        } else {
            // Create new company
            company = companyRepository.save(company);
            // Link company to recruiter
            recruiter.setCompany(company);
            recruiterProfileRepository.save(recruiter);
            // Flush to ensure company_id is set
            recruiterProfileRepository.flush();
        }
        
        return company;
        */
    }

    // TODO: Refactor to use ContentServiceClient.getCompanyById() when content-service is ready
    @Transactional(readOnly = true)
    public CompanyDTO getMyCompany() {
        log.warn("getMyCompany() is not available in microservice architecture. Use content-service endpoints directly.");
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID companyId = recruiter.getCompanyId();
        if (companyId == null) {
            return null;
        }
        // Fetch from content-service via Feign Client
        try {
            return contentServiceClient.getCompanyById(companyId);
        } catch (Exception e) {
            log.error("Error fetching company from content-service: {}", e.getMessage());
            return null;
        }
        
        /* Original implementation - commented for microservice refactoring
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        Company company = recruiter.getCompany();
        if (company != null) {
            // Force load by accessing ID to trigger fetch
            company.getId();
            company.getName();
        }
        return company;
        */
    }

    // TODO: Refactor to use JobServiceClient.getDashboardStats() when job-service is ready
    public Map<String, Object> getDashboardStats() {
        log.warn("getDashboardStats() is not available in microservice architecture. Use job-service endpoints directly.");
        return Map.of(
            "activeJobs", 0L,
            "newApplications", 0L,
            "upcomingInterviews", 0L,
            "successfulHires", 0L
        );
        
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

        // TODO: Update company logo via ContentServiceClient
        log.warn("Company logo update should be handled by content-service. Company ID: {}, Logo URL: {}", companyId, filePath);
        
        /* Original implementation - commented for microservice refactoring
        Company company = recruiter.getCompany();
        
        if (company == null) {
            throw new RuntimeException("Company not found. Please create company profile first.");
        }

        // Delete old logo if exists
        if (company.getLogoUrl() != null && !company.getLogoUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(company.getLogoUrl());
            } catch (Exception e) {
                // Log warning but continue
            }
        }
        
        company.setLogoUrl(filePath);
        companyRepository.save(company);
        */

        return filePath;
    }
}

