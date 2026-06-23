package vn.careermate.jobservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.SavedJob;
import vn.careermate.jobservice.service.ApplicationService;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> applyForJob(
            @RequestParam UUID jobId,
            @RequestParam(required = false) UUID cvId,
            @RequestParam(required = false) String coverLetter
    ) {
        try {
            Application application = applicationService.applyForJob(jobId, cvId, coverLetter);
            // Application entity now uses UUIDs instead of entity references
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            log.error("Runtime error applying for job: {}", e.getMessage());
            int statusCode = e.getMessage().contains("Already applied") ? 409 : 400;
            return ResponseEntity.status(statusCode)
                .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error applying for job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error applying for job: " + e.getMessage()));
        }
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> checkApplication(@PathVariable UUID jobId) {
        try {
            Optional<Application> application = applicationService.checkApplication(jobId);
            if (application.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "applied", true,
                    "applicationId", application.get().getId(),
                    "status", application.get().getStatus().name(),
                    "appliedAt", application.get().getAppliedAt()
                ));
            }
            return ResponseEntity.ok(Map.of("applied", false));
        } catch (Exception e) {
            log.error("Error checking application", e);
            return ResponseEntity.ok(Map.of("applied", false));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<Application>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            log.info("GET /api/applications - page={}, size={}", page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Application> applications = applicationService.getApplications(pageable);
            
            log.info("Applications retrieved: {} total, {} in page", 
                applications.getTotalElements(), applications.getContent().size());
            
            // TODO: Map to DTOs to avoid entity exposure
            // Applications now use UUID references, no lazy-loading issues
            
            log.info("Returning applications successfully");
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Page.empty());
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> getRecentApplications() {
        try {
            java.util.List<Application> apps = applicationService.getRecentApplications();
             return ResponseEntity.ok(apps);
        } catch (Exception e) {
            log.error("Error getting recent applications", e);
            return ResponseEntity.status(500).body(java.util.List.of());
        }
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Application>> getJobApplicants(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            log.info("GET /api/applications/job/{} - page={}, size={}", jobId, page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Application> applications = applicationService.getJobApplicants(jobId, pageable);
            
            log.info("Found {} applicants (total: {})", 
                applications.getContent().size(), applications.getTotalElements());
            
            // TODO: Map to DTOs to avoid entity exposure
            // Applications now use UUID references, no lazy-loading issues
            
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            log.error("Error getting job applicants", e);
            e.printStackTrace();
            return ResponseEntity.status(400).body(Page.empty());
        }
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @RequestParam Application.ApplicationStatus status,
            @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status, notes));
    }

    @PostMapping("/{applicationId}/interview")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Application> scheduleInterview(
            @PathVariable UUID applicationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime interviewTime
    ) {
        return ResponseEntity.ok(applicationService.scheduleInterview(applicationId, interviewTime));
    }

    // ========== SAVED JOBS ==========
    @PostMapping("/saved-jobs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> saveJob(@RequestParam UUID jobId, @RequestParam(required = false) String notes) {
        try {
            SavedJob savedJob = applicationService.saveJob(jobId, notes);
            // TODO: Map to DTO to avoid entity exposure
            // SavedJob now uses UUID references, no lazy-loading issues
            return ResponseEntity.ok(savedJob);
        } catch (RuntimeException e) {
            log.error("Error saving job: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error saving job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error saving job: " + e.getMessage()));
        }
    }

    @GetMapping("/saved-jobs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<SavedJob>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<SavedJob> savedJobs = applicationService.getSavedJobs(pageable);
            // TODO: Map to DTOs to avoid entity exposure
            // SavedJob now uses UUID references, no lazy-loading issues
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            log.error("Error getting saved jobs", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> deleteSavedJob(@PathVariable UUID jobId) {
        try {
            applicationService.deleteSavedJob(jobId);
            return ResponseEntity.ok(Map.of("message", "Job removed from saved list"));
        } catch (Exception e) {
            log.error("Error deleting saved job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error deleting saved job: " + e.getMessage()));
        }
    }

    @GetMapping("/saved-jobs/check/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Boolean>> checkJobSaved(@PathVariable UUID jobId) {
        try {
            boolean isSaved = applicationService.isJobSaved(jobId);
            return ResponseEntity.ok(Map.of("isSaved", isSaved));
        } catch (Exception e) {
            log.error("Error checking saved job", e);
            return ResponseEntity.status(500)
                .body(Map.of("isSaved", false));
        }
    }
}
