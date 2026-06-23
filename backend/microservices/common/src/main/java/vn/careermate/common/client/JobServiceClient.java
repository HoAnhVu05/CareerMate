package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.common.dto.ApplicationDTO;
import vn.careermate.common.config.FeignClientConfiguration;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "job-service", configuration = FeignClientConfiguration.class)
public interface JobServiceClient {
    @GetMapping("/jobs/{jobId}")
    JobDTO getJobById(@PathVariable UUID jobId);
    
    @GetMapping("/jobs")
    List<JobDTO> getJobsByRecruiter(@RequestParam UUID recruiterId);
    
    @GetMapping("/applications")
    List<ApplicationDTO> getApplicationsByStudent(@RequestParam UUID studentId);
    
    @GetMapping("/applications/{applicationId}")
    ApplicationDTO getApplicationById(@PathVariable UUID applicationId);
    
    @GetMapping("/saved-jobs")
    List<JobDTO> getSavedJobsByStudent(@RequestParam UUID studentId);
    
    @PostMapping("/saved-jobs")
    void saveJob(@RequestParam UUID studentId, @RequestParam UUID jobId);
    
    @DeleteMapping("/saved-jobs/{savedJobId}")
    void unsaveJob(@PathVariable UUID savedJobId);
    
    // Admin endpoints (TODO: Implement in job-service)
    @PostMapping("/jobs/{jobId}/approve")
    JobDTO approveJob(@PathVariable UUID jobId, @RequestParam UUID adminId);
    
    @PostMapping("/jobs/{jobId}/reject")
    JobDTO rejectJob(@PathVariable UUID jobId, @RequestParam UUID adminId);
    
    @PostMapping("/jobs/{jobId}/hide")
    JobDTO hideJob(@PathVariable UUID jobId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @PostMapping("/jobs/{jobId}/unhide")
    JobDTO unhideJob(@PathVariable UUID jobId, @RequestParam UUID adminId);
    
    @DeleteMapping("/jobs/{jobId}")
    void deleteJob(@PathVariable UUID jobId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @GetMapping("/jobs/admin/all")
    Page<JobDTO> getAllJobs(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/jobs/admin/pending")
    Page<JobDTO> getPendingJobs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/jobs/admin/count")
    Long getJobCount(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    );

    @GetMapping("/jobs/applications/admin/count")
    Long getApplicationCount(
       @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    );

    @GetMapping("/jobs/recruiter/stats")
    java.util.Map<String, Object> getRecruiterStats(@RequestParam UUID recruiterId);
}
