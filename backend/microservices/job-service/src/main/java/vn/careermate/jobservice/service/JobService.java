package vn.careermate.jobservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.JobSkill;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.JobSkillRepository;
import vn.careermate.jobservice.repository.ApplicationRepository;
// import vn.careermate.contentservice.model.Company; // Replaced with ContentServiceClient
// import vn.careermate.userservice.model.RecruiterProfile; // Replaced with UserServiceClient
// import vn.careermate.userservice.model.User; // Replaced with UserServiceClient
// import vn.careermate.userservice.repository.UserRepository; // Replaced with UserServiceClient
// import vn.careermate.userservice.service.RecruiterProfileService; // Replaced with UserServiceClient
// import vn.careermate.notificationservice.service.NotificationService; // Replaced with NotificationServiceClient
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.ContentServiceClient;
import vn.careermate.common.client.NotificationServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.CompanyDTO;
import vn.careermate.common.dto.NotificationRequest;
import vn.careermate.common.dto.RecruiterProfileDTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final ApplicationRepository applicationRepository;
    // Feign Clients for inter-service communication
    private final UserServiceClient userServiceClient;
    private final ContentServiceClient contentServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    
    // TODO: Remove these after refactoring
    // private final RecruiterProfileService recruiterProfileService;
    // private final NotificationService notificationService;
    // private final UserRepository userRepository;

    @Transactional
    public Job createJob(Job job, List<String> requiredSkills, List<String> optionalSkills) {
        log.info("Starting job creation process...");
        
        try {
            // Get current recruiter profile using Feign Client
            RecruiterProfileDTO recruiter = userServiceClient.getCurrentRecruiterProfile();
            if (recruiter == null || recruiter.getId() == null) {
                throw new RuntimeException("Recruiter profile not found. Please complete your recruiter profile first.");
            }
            
            log.info("Found recruiter profile: id={}", recruiter.getId());
            
            // Get company using ContentServiceClient
            if (recruiter.getCompanyId() == null) {
                throw new RuntimeException("Recruiter must have a company to post jobs. Please create a company profile first.");
            }
            
            CompanyDTO company = contentServiceClient.getCompanyById(recruiter.getCompanyId());
            if (company == null || company.getId() == null) {
                throw new RuntimeException("Company not found. Please update your company profile.");
            }
            
            log.info("Found company: id={}, name={}", company.getId(), company.getName());
            
            // Set recruiter and company IDs
            job.setRecruiterId(recruiter.getId());
            job.setCompanyId(company.getId());
            
            // Validate required fields
            if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
                throw new RuntimeException("Job title is required");
            }
            if (job.getDescription() == null || job.getDescription().trim().isEmpty()) {
                throw new RuntimeException("Job description is required");
            }
            if (job.getLocation() == null || job.getLocation().trim().isEmpty()) {
                throw new RuntimeException("Job location is required");
            }
            
            // Validate salary values
            java.math.BigDecimal maxSalaryValue = new java.math.BigDecimal("999999999999.99");
            if (job.getMinSalary() != null && job.getMinSalary().compareTo(maxSalaryValue) > 0) {
                throw new RuntimeException("Mức lương tối thiểu quá lớn. Vui lòng nhập giá trị nhỏ hơn 999,999 triệu VND.");
            }
            if (job.getMaxSalary() != null && job.getMaxSalary().compareTo(maxSalaryValue) > 0) {
                throw new RuntimeException("Mức lương tối đa quá lớn. Vui lòng nhập giá trị nhỏ hơn 999,999 triệu VND.");
            }
            
            // Ensure status is set
            if (job.getStatus() == null) {
                job.setStatus(Job.JobStatus.PENDING); // Needs admin approval
            }
            
            log.info("Saving job: title={}, companyId={}, recruiterId={}", job.getTitle(), company.getId(), recruiter.getId());
            
            // Save job
            job = jobRepository.save(job);
            log.info("Job saved successfully: id={}", job.getId());
            
            // Add required skills
            if (requiredSkills != null) {
                for (String skill : requiredSkills) {
                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skillName(skill)
                            .isRequired(true)
                            .build();
                    jobSkillRepository.save(jobSkill);
                }
            }
            
            // Add optional skills
            if (optionalSkills != null) {
                for (String skill : optionalSkills) {
                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skillName(skill)
                            .isRequired(false)
                            .build();
                    jobSkillRepository.save(jobSkill);
                }
            }
            
            // Send notification if job is PENDING
            if (job.getStatus() == Job.JobStatus.PENDING) {
                try {
                    UserDTO user = userServiceClient.getUserById(recruiter.getUserId());
                    String recruiterName = user != null && user.getFullName() != null ? user.getFullName() : "Nhà tuyển dụng";
                    
                    NotificationRequest request = NotificationRequest.builder()
                            .type("JOB_PENDING")
                            .title("Job đang chờ duyệt")
                            .message("Job \"" + job.getTitle() + "\" từ " + recruiterName + " đang chờ duyệt")
                            .relatedEntityId(job.getId())
                            .relatedEntityType("JOB")
                            .build();
                    notificationServiceClient.createNotification(request);
                } catch (Exception e) {
                    // Log but don't fail job creation
                    log.warn("Error sending pending job notification: {}", e.getMessage());
                }
            }
            
            return job;
        } catch (RuntimeException e) {
            log.error("Error creating job: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating job", e);
            throw new RuntimeException("Error creating job: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<Job> getMyJobs(Pageable pageable) {
        try {
            // Get current recruiter profile using Feign Client
            RecruiterProfileDTO recruiter = userServiceClient.getCurrentRecruiterProfile();
            if (recruiter == null || recruiter.getId() == null) {
                log.warn("Recruiter profile not found");
                return Page.empty(pageable);
            }
            
            Page<Job> jobs = jobRepository.findByRecruiterId(recruiter.getId(), pageable);
            
            // Company info will be fetched via ContentServiceClient when needed in DTOs
            populateCompanyDetails(jobs);
            return jobs;
        } catch (Exception e) {
            log.error("Error getting my jobs: {}", e.getMessage(), e);
            throw new RuntimeException("Error getting my jobs: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<Job> searchJobs(String keyword, String location, UUID companyId, String status, Pageable pageable) {
        try {
            // Normalize null/empty strings
            String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
            String normalizedLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
            
            Page<Job> jobs;
            
            // If companyId is specified, filter by company
            if (companyId != null) {
                // Convert status string to enum if provided
                Job.JobStatus jobStatus = null;
                if (status != null && !status.trim().isEmpty()) {
                    try {
                        jobStatus = Job.JobStatus.valueOf(status.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid job status: {}", status);
                    }
                }
                
                if (jobStatus != null) {
                    jobs = jobRepository.findByCompanyIdAndStatus(companyId, jobStatus, pageable);
                } else {
                    jobs = jobRepository.findByCompanyId(companyId, pageable);
                }
            } else {
                jobs = jobRepository.searchJobs(normalizedKeyword, normalizedLocation, pageable);
            }
            
            // Company info will be fetched via ContentServiceClient when needed
            populateCompanyDetails(jobs);
            
            return jobs != null ? jobs : Page.empty(pageable);
        } catch (RuntimeException e) {
            log.error("Runtime error searching jobs: keyword={}, location={}, companyId={}, error={}", keyword, location, companyId, e.getMessage());
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error searching jobs: keyword={}, location={}, companyId={}", keyword, location, companyId, e);
            return Page.empty(pageable);
        }
    }

    @Transactional(readOnly = true)
    public Job getJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        populateCompanyDetails(job);
        return job;
    }

    @Transactional(readOnly = true)
    public long getJobCount(String status) {
        return getJobCount(status, null);
    }
    
    @Transactional(readOnly = true)
    public long getJobCount(String status, java.time.LocalDateTime beforeDate) {
        if (beforeDate == null) {
            if (status == null || status.trim().isEmpty()) {
                return jobRepository.count();
            }
            try {
                return jobRepository.countByStatus(Job.JobStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status for job count: {}", status);
                return 0L;
            }
        } else {
            if (status == null || status.trim().isEmpty()) {
                return jobRepository.countByCreatedAtBefore(beforeDate);
            }
            try {
                return jobRepository.countByStatusAndCreatedAtBefore(Job.JobStatus.valueOf(status.toUpperCase()), beforeDate);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status for job count: {}", status);
                return 0L;
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<Job> getAllJobs(String status, Pageable pageable) {
        Page<Job> jobs;
        if (status == null || status.trim().isEmpty()) {
            jobs = jobRepository.findAll(pageable);
        } else {
            try {
                jobs = jobRepository.findByStatus(Job.JobStatus.valueOf(status.toUpperCase()), pageable);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status for get all jobs: {}", status);
                return Page.empty(pageable);
            }
        }
        populateCompanyDetails(jobs);
        return jobs;
    }

    @Transactional(readOnly = true)
    public Page<Job> getPendingJobs(Pageable pageable) {
        Page<Job> jobs = jobRepository.findByStatus(Job.JobStatus.PENDING, pageable);
        populateCompanyDetails(jobs);
        return jobs;
    }

    @Transactional
    public Job approveJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.JobStatus.ACTIVE);
        // In a real app, we might store who approved it
        return jobRepository.save(job);
    }

    @Transactional
    public Job rejectJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.JobStatus.REJECTED);
        return jobRepository.save(job);
    }

    @Transactional
    public Job hideJob(UUID jobId, UUID adminId, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setHidden(true);
        job.setHiddenReason(reason);
        job.setHiddenAt(java.time.LocalDateTime.now());
        return jobRepository.save(job);
    }

    @Transactional
    public Job unhideJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setHidden(false);
        job.setHiddenReason(null);
        job.setHiddenAt(null);
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(UUID jobId, UUID adminId, String reason) {
        if (!jobRepository.existsById(jobId)) {
            throw new RuntimeException("Job not found");
        }
        jobRepository.deleteById(jobId);
    }
    
    @Transactional
    public void deleteJobsByRecruiterId(UUID recruiterId) {
        List<Job> recruiterJobs = jobRepository.findByRecruiterId(recruiterId);
        
        log.info("Deleting {} jobs for recruiter {}", recruiterJobs.size(), recruiterId);
        
        for (Job job : recruiterJobs) {
            // Delete related data first
            applicationRepository.deleteByJobId(job.getId());
            jobSkillRepository.deleteByJobId(job.getId());
            
            // Delete the job
            jobRepository.delete(job);
        }
        
        log.info("Successfully deleted all jobs for recruiter {}", recruiterId);
    }

    @Transactional(readOnly = true)
    public long getApplicationCount() {
        return applicationRepository.count();
    }
    
    @Transactional(readOnly = true)
    public long getApplicationCount(java.time.LocalDateTime beforeDate) {
        if (beforeDate == null) {
            return applicationRepository.count();
        }
        return applicationRepository.countByAppliedAtBefore(beforeDate);
    }

    private void populateCompanyDetails(Page<Job> jobs) {
        if (jobs == null || jobs.isEmpty()) return;
        jobs.forEach(this::populateCompanyDetails);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRecruiterStats(UUID recruiterId) {
        long activeJobs = jobRepository.countByRecruiterIdAndStatus(recruiterId, Job.JobStatus.ACTIVE);
        long newApplications = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, vn.careermate.jobservice.model.Application.ApplicationStatus.PENDING);
        long successfulHires = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, vn.careermate.jobservice.model.Application.ApplicationStatus.OFFERED);
        long upcomingInterviews = applicationRepository.countUpcomingInterviewsByRecruiter(recruiterId, java.time.LocalDateTime.now());
        
        return Map.of(
            "activeJobs", activeJobs,
            "newApplications", newApplications,
            "upcomingInterviews", upcomingInterviews,
            "successfulHires", successfulHires
        );
    }

    
    private void populateCompanyDetails(Job job) {
        if (job.getCompanyId() != null) {
            try {
                CompanyDTO company = contentServiceClient.getCompanyById(job.getCompanyId());
                job.setCompany(company);
            } catch (Exception e) {
                log.error("Error fetching company details for job {}: {}", job.getId(), e.getMessage());
                CompanyDTO placeholder = new CompanyDTO();
                placeholder.setId(job.getCompanyId());
                placeholder.setName("Công ty (Lỗi tải)");
                job.setCompany(placeholder);
            }
        }
    }
}
