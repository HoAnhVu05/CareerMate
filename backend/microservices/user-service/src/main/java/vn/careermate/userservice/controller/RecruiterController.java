package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recruiters")
@RequiredArgsConstructor
@Slf4j
public class RecruiterController {

    // TODO: Job and Application endpoints have been moved to job-service
    // All endpoints below return 410 Gone status with redirect message

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> createJob(
            @RequestBody Object job,
            @RequestParam(required = false) java.util.List<String> requiredSkills,
            @RequestParam(required = false) java.util.List<String> optionalSkills
    ) {
        log.warn("Create job endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs endpoint from job-service"
        ));
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Get my jobs endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/my-jobs endpoint from job-service"
        ));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<?> getJobApplicants(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Get job applicants endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/" + jobId + "/applicants endpoint from job-service"
        ));
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @RequestParam String status,
            @RequestParam(required = false) String notes
    ) {
        log.warn("Update application status endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/applications/" + applicationId + "/status endpoint from job-service"
        ));
    }

    @PostMapping("/applications/{applicationId}/interview")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable UUID applicationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime interviewTime
    ) {
        log.warn("Schedule interview endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/applications/" + applicationId + "/schedule-interview endpoint from job-service"
        ));
    }
}
