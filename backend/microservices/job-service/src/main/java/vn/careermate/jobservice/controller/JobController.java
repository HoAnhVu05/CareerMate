package vn.careermate.jobservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.service.JobService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> createJob(
            @RequestBody Job job,
            @RequestParam(required = false) List<String> requiredSkills,
            @RequestParam(required = false) List<String> optionalSkills
    ) {
        try {
            return ResponseEntity.ok(jobService.createJob(job, requiredSkills, optionalSkills));
        } catch (RuntimeException e) {
            log.error("Error creating job: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating job: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error creating job: " + e.getMessage()));
        }
    }

    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Job>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.getMyJobs(pageable));
    }

    @GetMapping
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Job> jobs = jobService.searchJobs(keyword, location, companyId, status, pageable);
            return ResponseEntity.ok(jobs);
        } catch (RuntimeException e) {
            log.error("Runtime error searching jobs: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Page.empty());
        } catch (Exception e) {
            log.error("Unexpected error searching jobs", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJob(@PathVariable UUID jobId) {
        try {
            Job job = jobService.getJob(jobId);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            log.error("Runtime error getting job: {}", e.getMessage());
            return ResponseEntity.status(404)
                .build();
        } catch (Exception e) {
            log.error("Unexpected error getting job", e);
            return ResponseEntity.status(500)
                .build();
        }
    }

    // Admin endpoints
    @PostMapping("/{jobId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Job> approveJob(@PathVariable UUID jobId, @RequestParam UUID adminId) {
        return ResponseEntity.ok(jobService.approveJob(jobId, adminId));
    }

    @PostMapping("/{jobId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Job> rejectJob(@PathVariable UUID jobId, @RequestParam UUID adminId) {
        return ResponseEntity.ok(jobService.rejectJob(jobId, adminId));
    }

    @PostMapping("/{jobId}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Job> hideJob(@PathVariable UUID jobId, @RequestParam UUID adminId, @RequestParam String reason) {
        return ResponseEntity.ok(jobService.hideJob(jobId, adminId, reason));
    }

    @PostMapping("/{jobId}/unhide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Job> unhideJob(@PathVariable UUID jobId, @RequestParam UUID adminId) {
        return ResponseEntity.ok(jobService.unhideJob(jobId, adminId));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID jobId, @RequestParam UUID adminId, @RequestParam String reason) {
        jobService.deleteJob(jobId, adminId, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Job>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.getAllJobs(status, pageable));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Job>> getPendingJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.getPendingJobs(pageable));
    }

    @GetMapping("/admin/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getJobCount(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    ) {
        return ResponseEntity.ok(jobService.getJobCount(status, beforeDate));
    }

    @GetMapping("/applications/admin/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getApplicationCount(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    ) {
        return ResponseEntity.ok(jobService.getApplicationCount(beforeDate));
    }

    @GetMapping("/recruiter/stats")
    public ResponseEntity<Map<String, Object>> getRecruiterStats(@RequestParam UUID recruiterId) {
        return ResponseEntity.ok(jobService.getRecruiterStats(recruiterId));
    }
}
