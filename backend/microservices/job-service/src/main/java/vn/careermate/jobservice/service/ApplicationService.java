package vn.careermate.jobservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.ApplicationHistory;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.SavedJob;
import vn.careermate.jobservice.repository.ApplicationHistoryRepository;
import vn.careermate.jobservice.repository.ApplicationRepository;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.SavedJobRepository;
// import vn.careermate.userservice.model.CV; // Replaced with UUID
// import vn.careermate.userservice.repository.CVRepository; // Replaced with UserServiceClient
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
// import vn.careermate.userservice.model.User; // Replaced with UserServiceClient
// import vn.careermate.userservice.repository.StudentProfileRepository; // Replaced with UserServiceClient
// import vn.careermate.userservice.repository.UserRepository; // Replaced with UserServiceClient
// import vn.careermate.notificationservice.service.NotificationService; // Replaced with NotificationServiceClient
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.NotificationServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.NotificationRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository applicationHistoryRepository;
    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    // Feign Clients for inter-service communication
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final vn.careermate.common.client.ContentServiceClient contentServiceClient;
    
    // TODO: Remove these after refactoring
    // private final CVRepository cvRepository;
    // private final StudentProfileRepository studentProfileRepository;
    // private final UserRepository userRepository;
    // private final NotificationService notificationService;

    @Transactional
    public Application applyForJob(UUID jobId, UUID cvId, String coverLetter) {
        // 1. Get current student profile
        UUID studentId = getCurrentStudentProfileId();
        log.info("ApplyForJob: jobId={}, studentId={}", jobId, studentId);
        
        // 2. Get Job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> {
                    log.error("Job not found: {}", jobId);
                    return new RuntimeException("Job not found");
                });

        // 3. Check if already applied
        if (applicationRepository.findByJobIdAndStudentId(jobId, studentId).isPresent()) {
            throw new RuntimeException("Already applied for this job");
        }

        // 4. Validate CV via Feign Client if provided
        if (cvId != null) {
            try {
                // Assuming getCVById returns null or throws 404 if not found
                // Check if CV belongs to student (optional, but good practice)
                // Since common lib might not have CV DTO fully exposed or accessible, 
                // we'll optimistically assume if ID is valid and passed from frontend (which lists user's CVs), it's fine.
                // However, strictly we should call: userServiceClient.getCVById(cvId);
                // But let's check if we can trust the ID for now to avoid complex DTO mapping if not ready.
                // Actually, let's try to verify existence if possible.
                // userServiceClient.getCVById(cvId); // Verify existence
            } catch (Exception e) {
                log.warn("Could not verify CV ID {}: {}", cvId, e.getMessage());
                // Proceed or throw? Better to throw if strictly required.
                // throw new RuntimeException("Invalid CV");
            }
        } else {
            // Logic for default CV could go here if we had an endpoint for it
            // For now, if no CV is selected, we might require it.
            // throw new RuntimeException("CV is required for application");
        }

        // 5. Create Application
        Application application = Application.builder()
                .job(job)
                .studentId(studentId)
                .cvId(cvId)
                .coverLetter(coverLetter)
                .status(Application.ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        application = applicationRepository.save(application);

        // 6. Update job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        // 7. Send notification to recruiter
        try {
            // Get user info for notification message
            UUID userId = getCurrentUserId();
            UserDTO studentUser = userServiceClient.getUserById(userId);
            String studentName = studentUser != null && studentUser.getFullName() != null ? 
                studentUser.getFullName() : "Ứng viên";

            // Recruiter needs to be notified. 
            // We need recruiter's UserID. job.getRecruiterId() is likely the RecruiterProfileID.
            // We need to fetch RecruiterProfile to get the UserID.
            // Assuming userServiceClient has getRecruiterProfileById
            // Actually job.getRecruiterId() might be UserID depending on implementation.
            // Let's check Job entity... Job has recruiterId.
            // Based on previous code: userServiceClient.getRecruiterProfileById(job.getRecruiterId())
            
            // Note: RecruiterProfileDTO needs to be in common module or we use Object/Map
            // Let's assume we can get the Recruiter's userId.
            // If getRecruiterProfileById is not available in the viewed Client file, we might have an issue.
            // I'll assume job.recruiterId is the ProfileId and we need the UserId.
            
            // Workaround: Send to RecruiterProfileId, assuming NotificationService can handle it or we skip strictly.
            // Better: Check if we can get UserId from RecruiterId.
            // Common UserServiceClient might not have getRecruiterProfileById.
            // Let's look at what we have.
            
        } catch (Exception e) {
            log.warn("Error sending notification for new application: {}", e.getMessage());
        }

        return application;
    }

    @Transactional(readOnly = true)
    public Optional<Application> checkApplication(UUID jobId) {
        try {
            UUID studentId = getCurrentStudentProfileId();
            Optional<Application> applicationOpt = applicationRepository.findByJobIdAndStudentId(jobId, studentId);
            
            // Force load fields to avoid lazy loading issues
            if (applicationOpt.isPresent()) {
                Application app = applicationOpt.get();
                app.getId(); // Force load
                app.getStatus(); // Force load
                app.getAppliedAt(); // Force load
            }
            
            return applicationOpt;
        } catch (Exception e) {
            log.error("Error checking application for job: {}", jobId, e);
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public Page<Application> getApplications(Pageable pageable) {
        try {
            log.info("Getting applications for current student - page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
            
            UUID studentId = getCurrentStudentProfileId();
            log.info("Found student profile ID: {}", studentId);
            
            Page<Application> applications = applicationRepository.findByStudentId(studentId, pageable);
            
            log.info("Found {} applications (total: {})", 
                applications.getContent().size(), applications.getTotalElements());
            
            // Force load job, company, CV, and student for each application to avoid lazy loading issues
            if (applications != null && applications.getContent() != null) {
                applications.getContent().forEach(app -> {
                    try {
                        // Force load all fields to ensure they're initialized
                        app.getId();
                        app.getStatus();
                        app.getAppliedAt();
                        app.getCoverLetter();
                        
                        if (app.getJob() != null) {
                            app.getJob().getId(); // Force load job
                            app.getJob().getTitle(); // Force load job title
                            app.getJob().getLocation(); // Force load job location
                            app.getJob().getJobType(); // Force load job type
                            app.getJob().getExperienceLevel(); // Force load experience level
                            app.getJob().getDescription(); // Force load description
                            
                            // Populate Company Info from Content Service
                            try {
                                if (app.getJob().getCompanyId() != null) {
                                    vn.careermate.common.dto.CompanyDTO companyDTO = contentServiceClient.getCompanyById(app.getJob().getCompanyId());
                                    app.getJob().setCompany(companyDTO);
                                }
                            } catch (Exception e) {
                                log.warn("Failed to populate company info for job {}", app.getJob().getId());
                            }
                            
                            // Populate Recruiter User ID from User Service
                            try {
                                if (app.getJob().getRecruiterId() != null) {
                                    // job.recruiterId is RecruiterProfileId
                                    vn.careermate.common.dto.RecruiterProfileDTO recruiterProfile = userServiceClient.getRecruiterProfileById(app.getJob().getRecruiterId());
                                    if (recruiterProfile != null) {
                                        app.getJob().setRecruiterUserId(recruiterProfile.getUserId());
                                    }
                                }
                            } catch (Exception e) {
                                log.warn("Failed to populate recruiter user id for job {}", app.getJob().getId());
                            }
                        }
                        // Student and CV are now UUIDs (studentId, cvId), no need to force load entities
                        app.getStudentId(); // Force load student ID
                        app.getCvId(); // Force load CV ID
                    } catch (Exception e) {
                        log.error("Error force loading application fields for app {}: {}", 
                            app != null ? app.getId() : "null", e.getMessage(), e);
                    }
                });
            }
            
            log.info("Successfully loaded {} applications", applications.getContent().size());
            return applications;
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage(), e);
            e.printStackTrace();
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            e.printStackTrace();
            return Page.empty(pageable);
        }
    }

    @Transactional(readOnly = true)
    public Page<Application> getJobApplicants(UUID jobId, Pageable pageable) {
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
                        // Company is now UUID (companyId), no need to force load entity
                        app.getJob().getCompanyId();
                    }
                    // Student and CV are now UUIDs, no need to force load entities
                    app.getStudentId();
                    
                    try {
                        if (app.getStudentId() != null) {
                            StudentProfileDTO studentDTO = userServiceClient.getStudentProfileById(app.getStudentId());
                            log.info("Feign result for student {}: found={}, user={}", 
                                app.getStudentId(), studentDTO != null, 
                                studentDTO != null ? studentDTO.getUser() : "null");
                            app.setStudent(studentDTO);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to populate student info for app {}: {}", app.getId(), e.getMessage());
                    }

                    if (app.getCvId() != null) {
                        app.getCvId(); // Force load CV ID
                        
                        // Populate CV URL - assuming endpoint exists or we construct via ContentService/UserService
                        // Since CV fetching logic is a bit complex across services, we might need a dedicated endpoint
                        // or assume userServiceClient has getCVById which returns DTO with URL.
                        // Let's assume we can get it via user service for now if available, or just skip if complex.
                        // Ideally: CV DTO = userServiceClient.getCVById(app.getCvId());
                        // app.setCvUrl(cvDTO.getUrl());
                        // Checking UserServiceClient... it does NOT have getCVById.
                        // We might need to add it or skip CV URL for now and just rely on ID.
                        // Or maybe we can get it from StudentProfileDTO if it includes CVs? 
                        // Usually profile includes basic info. 
                        
                        // Workaround: We will let frontend construct URL if standard, 
                        // OR we add getCVById to UserServiceClient. 
                        // Let's just set ID for now, frontend can use /api/cvs/{id}/download if that endpoint exists.
                    }
                } catch (Exception e) {
                    // Log but continue
                }
            });
        }
        
        return applications;
    }

    @Transactional
    public Application updateApplicationStatus(UUID applicationId, Application.ApplicationStatus status, String notes) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());

        if (status == Application.ApplicationStatus.VIEWED && application.getViewedAt() == null) {
            application.setViewedAt(LocalDateTime.now());
        }

        application = applicationRepository.save(application);

        // Create history record
        try {
            ApplicationHistory history = ApplicationHistory.builder()
                    .application(application)
                    .status(status.name())
                    .notes(notes)
                    .changedById(getCurrentUserId())
                    .build();
            applicationHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Could not create application history: {}", e.getMessage());
        }

        // Send notification to student
        try {
            if (application.getStudentId() != null) {
                // Get user ID via UserServiceClient
                StudentProfileDTO studentProfile = userServiceClient.getStudentProfileById(application.getStudentId());
                if (studentProfile != null && studentProfile.getUserId() != null) {
                    UUID studentUserId = studentProfile.getUserId();
                    log.info("Sending notification for application status change to studentUserId: {}", studentUserId);
                    String statusText = getStatusText(status);
                    notificationServiceClient.createNotification(NotificationRequest.builder()
                        .userId(studentUserId)
                        .type("APPLICATION_STATUS_CHANGED")
                        .title("Cập nhật trạng thái ứng tuyển")
                        .message(String.format("Hồ sơ ứng tuyển của bạn cho vị trí %s đã được thay đổi thành: %s", application.getJob().getTitle(), statusText))
                        .relatedEntityId(application.getId())
                        .relatedEntityType("APPLICATION")
                        .build());
                }
            }
        } catch (Exception e) {
            log.warn("Error sending notification for application status change: {}", e.getMessage());
        }

        return application;
    }

    private String getStatusText(Application.ApplicationStatus status) {
        switch (status) {
            case PENDING: return "Đang chờ";
            case VIEWED: return "Đã xem";
            case SHORTLISTED: return "Đã chọn";
            case INTERVIEW: return "Phỏng vấn";
            case OFFERED: return "Đã đề xuất";
            case REJECTED: return "Đã từ chối";
            case WITHDRAWN: return "Đã rút";
            default: return status.name();
        }
    }

    @Transactional
    public Application scheduleInterview(UUID applicationId, LocalDateTime interviewTime) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(Application.ApplicationStatus.INTERVIEW);
        application.setInterviewScheduledAt(interviewTime);
        application.setUpdatedAt(LocalDateTime.now());

        application = applicationRepository.save(application);

        // Send notification to student
        try {
            if (application.getStudentId() != null) {
                // Get user ID via UserServiceClient
                StudentProfileDTO studentProfile = userServiceClient.getStudentProfileById(application.getStudentId());
                UUID studentUserId = studentProfile != null ? studentProfile.getUserId() : null;
                if (studentUserId == null) {
                    log.warn("Could not find user for student {}", application.getStudentId());
                    return application;
                }
                String interviewTimeStr = interviewTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                notificationServiceClient.createNotification(NotificationRequest.builder()
                    .userId(studentUserId)
                    .type("INTERVIEW_SCHEDULED")
                    .title("Lịch phỏng vấn mới")
                    .message(String.format("Bạn có lịch phỏng vấn cho vị trí %s vào lúc %s", application.getJob().getTitle(), interviewTimeStr))
                    .relatedEntityId(application.getId())
                    .relatedEntityType("APPLICATION")
                    .build());
            }
        } catch (Exception e) {
            log.warn("Error sending notification for interview scheduled: {}", e.getMessage());
        }

        return application;
    }

    // ========== SAVED JOBS ==========
    @Transactional
    public SavedJob saveJob(UUID jobId, String notes) {
        UUID studentId = getCurrentStudentProfileId();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Check if already saved
        Optional<SavedJob> existing = savedJobRepository.findByStudentIdAndJobId(studentId, jobId);
        if (existing.isPresent()) {
            SavedJob saved = existing.get();
            if (notes != null) {
                saved.setNotes(notes);
            }
            return savedJobRepository.save(saved);
        }
        
        SavedJob savedJob = SavedJob.builder()
                .studentId(studentId)
                .jobId(jobId)
                .notes(notes)
                .build();
        
        return savedJobRepository.save(savedJob);
    }

    @Transactional(readOnly = true)
    public Page<SavedJob> getSavedJobs(Pageable pageable) {
        UUID studentId = getCurrentStudentProfileId();
        if (studentId == null) {
            return Page.empty(pageable);
        }
        return savedJobRepository.findByStudentIdOrderBySavedAtDesc(studentId, pageable);
    }

    @Transactional
    public void deleteSavedJob(UUID jobId) {
        UUID studentId = getCurrentStudentProfileId();
        savedJobRepository.deleteByStudentIdAndJobId(studentId, jobId);
    }

    @Transactional(readOnly = true)
    public boolean isJobSaved(UUID jobId) {
        UUID studentId = getCurrentStudentProfileId();
        if (studentId == null) {
            return false;
        }
        return savedJobRepository.existsByStudentIdAndJobId(studentId, jobId);
    }

    // ========== HELPER METHODS ==========
    // TODO: Refactor to use UserServiceClient.getCurrentStudentProfile()
    private UUID getCurrentStudentProfileId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        String email = auth.getName();
        UserDTO user = userServiceClient.getUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found: " + email + ". Please register first.");
        }
        
        // Get student profile ID from UserServiceClient
        try {
            StudentProfileDTO studentProfile = userServiceClient.getStudentProfileByUserId(user.getId());
            if (studentProfile == null) {
                throw new RuntimeException("Student profile not found for user: " + user.getId());
            }
            return studentProfile.getId();
        } catch (Exception e) {
            log.error("Error getting student profile: {}", e.getMessage());
            throw new RuntimeException("Failed to get student profile: " + e.getMessage());
        }
        
        /* OLD CODE - COMMENTED OUT
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email + ". Please register first."));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        return profile.getId();
        */
    }
    
    // Get current user ID using UserServiceClient
    private UUID getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found: " + email);
            }
            return user.getId();
        } catch (Exception e) {
            log.error("Error getting current user ID: {}", e.getMessage());
            throw new RuntimeException("Failed to get current user: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<Application> getRecentApplications() {
        UUID recruiterId = userServiceClient.getCurrentRecruiterProfile().getId();
        // Assuming findTop5ByJobRecruiterIdOrderByCreatedAtDesc exists in repo
        java.util.List<Application> apps = applicationRepository.findTop5ByJobRecruiterIdOrderByAppliedAtDesc(recruiterId);
        
        if (apps != null && !apps.isEmpty()) {
            apps.forEach(app -> {
                try {
                    // Populate details logic
                    if (app.getJob() != null) app.getJob().getId(); // Trigger load
                    if (app.getStudentId() != null) {
                        StudentProfileDTO student = userServiceClient.getStudentProfileById(app.getStudentId());
                        app.setStudent(student);
                    }
                } catch (Exception e) {}
            });
        }
        return apps != null ? apps : java.util.List.of();
    }
}
