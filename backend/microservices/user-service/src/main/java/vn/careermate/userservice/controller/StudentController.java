package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.userservice.service.StudentService;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    
    // TODO: Job and Application endpoints have been moved to job-service
    // TODO: AI Chat and Recommendations endpoints have been moved to ai-service
    // All endpoints below return 410 Gone status with redirect message

    @GetMapping("/jobs")
    public ResponseEntity<?> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Job search endpoint has been moved to job-service. Please use /api/jobs/search");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/search endpoint from job-service"
        ));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<?> getJob(@PathVariable UUID jobId) {
        log.warn("Get job endpoint has been moved to job-service. Please use /api/jobs/{}", jobId);
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/" + jobId + " endpoint from job-service"
        ));
    }

    @PostMapping("/applications")
    public ResponseEntity<?> applyForJob(
            @RequestParam UUID jobId,
            @RequestParam(required = false) UUID cvId,
            @RequestParam(required = false) String coverLetter
    ) {
        log.warn("Apply for job endpoint has been moved to job-service. Please use /api/jobs/{}/apply", jobId);
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/" + jobId + "/apply endpoint from job-service"
        ));
    }

    @GetMapping("/applications/check/{jobId}")
    public ResponseEntity<?> checkApplication(@PathVariable UUID jobId) {
        log.warn("Check application endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/applications/check/" + jobId + " endpoint from job-service"
        ));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Get applications endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/applications endpoint from job-service"
        ));
    }

    @PostMapping("/saved-jobs")
    public ResponseEntity<?> saveJob(@RequestParam UUID jobId, @RequestParam(required = false) String notes) {
        log.warn("Save job endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/" + jobId + "/save endpoint from job-service"
        ));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<?> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Get saved jobs endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/saved endpoint from job-service"
        ));
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    public ResponseEntity<?> deleteSavedJob(@PathVariable UUID jobId) {
        log.warn("Delete saved job endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/" + jobId + "/unsave endpoint from job-service"
        ));
    }

    @GetMapping("/saved-jobs/check/{jobId}")
    public ResponseEntity<?> checkJobSaved(@PathVariable UUID jobId) {
        log.warn("Check job saved endpoint has been moved to job-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to job-service",
            "message", "Please use /api/jobs/" + jobId + "/saved endpoint from job-service"
        ));
    }

    @GetMapping("/chat/conversations")
    public ResponseEntity<?> getChatConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Get chat conversations endpoint has been moved to ai-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to ai-service",
            "message", "Please use /api/ai/chat/conversations endpoint from ai-service"
        ));
    }

    @GetMapping("/chat/conversations/{conversationId}/messages")
    public ResponseEntity<?> getChatMessages(@PathVariable UUID conversationId) {
        log.warn("Get chat messages endpoint has been moved to ai-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to ai-service",
            "message", "Please use /api/ai/chat/conversations/" + conversationId + "/messages endpoint from ai-service"
        ));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getJobRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.warn("Get job recommendations endpoint has been moved to ai-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to ai-service",
            "message", "Please use /api/ai/job-recommendations endpoint from ai-service"
        ));
    }

    @GetMapping("/recommendations/unviewed")
    public ResponseEntity<?> getUnviewedRecommendations() {
        log.warn("Get unviewed recommendations endpoint has been moved to ai-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to ai-service",
            "message", "Please use /api/ai/job-recommendations/unviewed endpoint from ai-service"
        ));
    }

    @PutMapping("/recommendations/{recommendationId}/viewed")
    public ResponseEntity<?> markRecommendationAsViewed(@PathVariable UUID recommendationId) {
        log.warn("Mark recommendation viewed endpoint has been moved to ai-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to ai-service",
            "message", "Please use /api/ai/job-recommendations/" + recommendationId + "/viewed endpoint from ai-service"
        ));
    }

    @PutMapping("/recommendations/{recommendationId}/applied")
    public ResponseEntity<?> markRecommendationAsApplied(@PathVariable UUID recommendationId) {
        log.warn("Mark recommendation applied endpoint has been moved to ai-service");
        return ResponseEntity.status(410).body(Map.of(
            "error", "This endpoint has been moved to ai-service",
            "message", "Please use /api/ai/job-recommendations/" + recommendationId + "/applied endpoint from ai-service"
        ));
    }
}
