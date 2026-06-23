package vn.careermate.aiservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.aiservice.service.MockInterviewService;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.JobDTO;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/ai/students/mock-interview")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final JobServiceClient jobServiceClient;

    // @PreAuthorize("isAuthenticated()")
    @PostMapping("/start/{jobId}")
    public ResponseEntity<Map<String, Object>> startInterview(
            @PathVariable String jobId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        log.info("Starting mock interview for job ID string: {}", jobId);
        
        UUID uuid;
        try {
            uuid = UUID.fromString(jobId);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", jobId);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Job ID format: " + jobId));
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        log.info("Current user authorities: {}", auth != null ? auth.getAuthorities() : "null");
        try {
            String profile = body != null ? body.get("profile") : "";
            Map<String, Object> interview = mockInterviewService.startMockInterview(uuid, profile);
            log.info("Successfully started mock interview for job: {}", uuid);
            return ResponseEntity.ok(interview);
        } catch (Exception e) {
            log.error("Error in startInterview controller: {}", e.getMessage(), e);
            if (e.getMessage().contains("429") || e.getMessage().contains("Quota")) {
                 return ResponseEntity.status(429).body(Map.of("error", "AI Quota Exhausted. Please try again later."));
            }
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // @PreAuthorize("isAuthenticated()")
    @PostMapping("/start-custom")
    public ResponseEntity<Map<String, Object>> startCustomInterview(
            @RequestBody Map<String, String> body
    ) {
        String jobTitle = body.get("jobTitle");
        String jobDescription = body.get("jobDescription");
        Map<String, Object> interview = mockInterviewService.startCustomMockInterview(jobTitle, jobDescription);
        return ResponseEntity.ok(interview);
    }

    // @PreAuthorize("isAuthenticated()")
    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateAnswer(
            @RequestBody Map<String, String> request
    ) {
        String question = request.get("question");
        String answer = request.get("answer");
        String jobContext = request.get("jobContext");

        Map<String, Object> evaluation = mockInterviewService.evaluateAnswer(question, answer, jobContext);
        return ResponseEntity.ok(evaluation);
    }
    
    @PostMapping("/finish")
    public ResponseEntity<?> finishInterview(@RequestBody vn.careermate.aiservice.model.MockInterview interview) {
        log.info("Received finish interview request: {}", interview);
        return ResponseEntity.ok(mockInterviewService.saveInterview(interview));
    }
    
    @GetMapping("/history/{studentId}")
    public ResponseEntity<?> getHistory(@PathVariable UUID studentId) {
        return ResponseEntity.ok(mockInterviewService.getHistory(studentId));
    }

    @GetMapping("/admin/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminHistory() {
        return ResponseEntity.ok(mockInterviewService.getAllHistory());
    }
}
