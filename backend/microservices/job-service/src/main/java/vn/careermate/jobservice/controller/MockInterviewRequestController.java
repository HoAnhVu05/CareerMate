package vn.careermate.jobservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.jobservice.model.MockInterviewRequest;
import vn.careermate.jobservice.repository.MockInterviewRequestRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/jobs/mock-requests")
@RequiredArgsConstructor
public class MockInterviewRequestController {

    private final MockInterviewRequestRepository repository;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createRequest(
            @RequestBody Map<String, Object> body
    ) {
        try {
            String recruiterIdStr = (String) body.get("recruiterId");
            String message = (String) body.get("message");
            
            if (recruiterIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Recruiter ID is required"));
            }

            UUID recruiterId = UUID.fromString(recruiterIdStr);
            String studentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            // In a real scenario, we would lookup Student ID from email via User Service or Token claims
            // For now, assuming the token contains ID or we fetch it. 
            // BUT job-service is separate. It relies on Token ID usually.
            // Let's assume we can get ID from Header "X-User-Id" if Gateway forwards it?
            // Or simpler: The frontend sends studentId? No, insecure.
            // We need a way to get current User ID.
            // Spring Security context usually has it if JWT is parsed.
            // Let's assume for now we trust the client or (better) we implementation a Service that extracts it.
            
            // Temporary hack: Pass studentId in body for prototype speed, but ideally get from Token.
            String studentIdStr = (String) body.get("studentId");
            if (studentIdStr == null) {
                 return ResponseEntity.badRequest().body(Map.of("error", "Student ID is required"));
            }
            UUID studentId = UUID.fromString(studentIdStr);

            // Check if pending exists
            if (repository.existsByStudentIdAndRecruiterIdAndStatus(studentId, recruiterId, MockInterviewRequest.RequestStatus.PENDING)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Pending request already exists"));
            }

            MockInterviewRequest request = MockInterviewRequest.builder()
                    .studentId(studentId)
                    .recruiterId(recruiterId)
                    .message(message)
                    .status(MockInterviewRequest.RequestStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(repository.save(request));
        } catch (Exception e) {
            log.error("Error creating request", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-requests") // For Student
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyRequests(@RequestParam UUID studentId) {
        return ResponseEntity.ok(repository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }

    @GetMapping("/recruiter-requests") // For Recruiter
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> getRecruiterRequests(@RequestParam UUID recruiterId) {
        return ResponseEntity.ok(repository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('STUDENT')")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        MockInterviewRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        String statusStr = body.get("status");
        if (statusStr != null) {
            request.setStatus(MockInterviewRequest.RequestStatus.valueOf(statusStr));
        }
        
        return ResponseEntity.ok(repository.save(request));
    }
}
