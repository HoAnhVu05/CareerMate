package vn.careermate.aiservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import vn.careermate.aiservice.service.AIService;
import vn.careermate.aiservice.service.VectorDBService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.common.dto.CVDTO;
import org.springframework.util.StreamUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for AI services
 * CV Analysis, Job Matching, Mock Interview
 */
@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final VectorDBService vectorDBService;
    private final UserServiceClient userServiceClient;
    private final JobServiceClient jobServiceClient;

    /**
     * Analyze CV
     * POST /ai/cv/analyze/{cvId}
     * Requires CV content in request body
     */
    @PostMapping("/cv/analyze/{cvId}")
    public ResponseEntity<Map<String, Object>> analyzeCV(
            @PathVariable String cvId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            log.info("Analyzing CV with ID: {}", cvId);
            
            // Get CV content from request body
            String cvContent = "";
            if (request != null && request.containsKey("content")) {
                cvContent = request.get("content");
            } else if (request != null && !request.isEmpty()) {
                // Try to build CV content from structured fields
                StringBuilder sb = new StringBuilder();
                if (request.containsKey("profile")) sb.append(request.get("profile")).append("\n\n");
                if (request.containsKey("experience")) sb.append("Experience:\n").append(request.get("experience")).append("\n\n");
                if (request.containsKey("education")) sb.append("Education:\n").append(request.get("education")).append("\n\n");
                if (request.containsKey("skills")) sb.append("Skills:\n").append(request.get("skills")).append("\n\n");
                if (request.containsKey("certifications")) sb.append("Certifications:\n").append(request.get("certifications")).append("\n\n");
                if (request.containsKey("fileName")) sb.append("File: ").append(request.get("fileName")).append("\n\n");
                cvContent = sb.toString();
            } else {
                // Request body is empty, try to fetch CV from User Service
                try {
                    log.info("Request body empty. Fetching CV {} from User Service...", cvId);
                    CVDTO cv = userServiceClient.getCVById(UUID.fromString(cvId));
                    if (cv != null && cv.getExtractedContent() != null) {
                        cvContent = cv.getExtractedContent();
                        log.info("Successfully fetched CV content from User Service. Length: {}", cvContent.length());
                    } else {
                        log.warn("CV fetched but content is null or empty");
                    }
                } catch (Exception e) {
                    log.error("Failed to fetch CV from User Service", e);
                }
            }

            // If still empty, try to download file and use multimodal
            if (cvContent == null || cvContent.trim().isEmpty()) {
                try {
                    log.info("Extracted content is empty. Attempting multimodal analysis for CV: {}", cvId);
                    feign.Response feignResponse = userServiceClient.downloadCV(UUID.fromString(cvId));
                    if (feignResponse.status() == 200) {
                        byte[] fileBytes = StreamUtils.copyToByteArray(feignResponse.body().asInputStream());
                        String contentType = feignResponse.headers().get("Content-Type").stream().findFirst().orElse("application/pdf");
                        
                        log.info("Successfully downloaded raw CV file. Size: {}, Type: {}", fileBytes.length, contentType);
                        Map<String, Object> result = aiService.analyzeCV(contentType, fileBytes);
                        return ResponseEntity.ok(result);
                    } else {
                        log.warn("Failed to download CV file from User Service. Status: {}", feignResponse.status());
                    }
                } catch (Exception e) {
                    log.error("Error during multimodal CV analysis", e);
                }
            }

            // If still empty or multimodal failed, return error with helpful message
            if (cvContent == null || cvContent.trim().isEmpty()) {
                log.warn("CV analysis requested for cvId {} but no content provided and multimodal failed", cvId);
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "error", "CV content is required for analysis",
                        "message", "Please provide CV content in one of these formats:",
                        "format1", "{ \"content\": \"full CV text\" }",
                        "format2", "{ \"profile\": \"...\", \"experience\": \"...\", \"education\": \"...\", \"skills\": \"...\", \"certifications\": \"...\" }",
                        "cvId", cvId
                    ));
            }

            // Analyze CV using AI service
            Map<String, Object> analysis = aiService.analyzeCV(cvContent);
            
            log.info("CV analysis completed for CV ID: {}", cvId);
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Error analyzing CV", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error analyzing CV: " + e.getMessage()));
        }
    }

    /**
     * Get job matching candidates using AI
     * GET /ai/jobs/{jobId}/matching
     */
    @GetMapping("/jobs/{jobId}/matching")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, Object>> getJobMatching(@PathVariable String jobId) {
        try {
            // Get job via Feign Client
            JobDTO job;
            try {
                job = jobServiceClient.getJobById(UUID.fromString(jobId));
                if (job == null) {
                    return ResponseEntity.notFound().build();
                }
            } catch (Exception e) {
                log.error("Error fetching job: {}", e.getMessage());
                return ResponseEntity.notFound().build();
            }

            // Build job description for matching
            StringBuilder jobDescBuilder = new StringBuilder();
            jobDescBuilder.append(job.getTitle()).append(". ");
            if (job.getDescription() != null) {
                jobDescBuilder.append(job.getDescription()).append(". ");
            }
            // Note: JobDTO may not have requirements field, or it might be in description
            // TODO: Add requirements field to JobDTO if needed
            
            String jobDescription = jobDescBuilder.toString();

            // Use vector DB for semantic search if enabled
            if (vectorDBService.isEnabled()) {
                List<String> matchingCVIds = vectorDBService.findMatchingCVs(jobDescription, 10);
                return ResponseEntity.ok(Map.of(
                    "jobId", jobId,
                    "matchingCVs", matchingCVIds,
                    "method", "vector-db"
                ));
            } else {
                // Fallback to AI-based matching
                try {
                    List<vn.careermate.common.dto.CVDTO> allCVs = userServiceClient.getAllCVs();
                    List<Map<String, Object>> rankedCandidates = aiService.rankCandidates(jobDescription, allCVs);
                    
                    return ResponseEntity.ok(Map.of(
                        "jobId", jobId,
                        "matchingCVs", rankedCandidates,
                        "method", "ai-ranking-fallback",
                        "message", "Vector DB not enabled, using AI-based ranking"
                    ));
                } catch (Exception e) {
                    log.error("AI matching fallback failed: {}", e.getMessage());
                    return ResponseEntity.ok(Map.of(
                        "jobId", jobId,
                        "matchingCVs", List.of(),
                        "method", "fallback-failed",
                        "message", "Both vector-db and AI matching failed"
                    ));
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error finding matching candidates: " + e.getMessage()));
        }
    }

    // Note: Mock Interview endpoints moved to MockInterviewController
    // Keeping startMockInterview as a redirect/deprecated if needed or just remove it

    /**
     * Get career roadmap
     * POST /ai/career/roadmap
     */
    @PostMapping("/career/roadmap")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getCareerRoadmap(
            @RequestBody Map<String, String> request) {
        String currentSkills = request.get("currentSkills");
        String targetRole = request.get("targetRole");
        
        Map<String, Object> roadmap = aiService.getCareerRoadmap(currentSkills, targetRole);
        return ResponseEntity.ok(roadmap);
    }

    /**
     * AI Chat endpoint
     * POST /ai/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String context = request.getOrDefault("context", "general");
            String role = request.getOrDefault("role", "STUDENT");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message is required"));
            }
            
            String response = aiService.chat(message, context, role);
            
            return ResponseEntity.ok(Map.of(
                "response", response,
                "context", context,
                "role", role
            ));
        } catch (RuntimeException e) {
            log.error("Error in chat", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error processing chat: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error in chat", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error: " + e.getClass().getSimpleName()));
        }
    }
}
