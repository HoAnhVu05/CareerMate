package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.userservice.model.CV;
import vn.careermate.userservice.service.CVService;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/students/cv")
@RequiredArgsConstructor
public class CVController {

    private final CVService cvService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) {
        try {
            CV cv = cvService.uploadCV(file);
            // Detach lazy-loaded relations
            if (cv != null) {
                cv.setStudent(null);
            }
            return ResponseEntity.ok(cv);
        } catch (RuntimeException e) {
            log.error("Runtime error uploading CV: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("IO error uploading CV", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error uploading CV", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading CV: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CV>> getCVs() {
        try {
            List<CV> cvs = cvService.getCVs();
            return ResponseEntity.ok(cvs);
        } catch (RuntimeException e) {
            log.error("Runtime error getting CVs: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(List.of());
        } catch (Exception e) {
            log.error("Unexpected error getting CVs", e);
            return ResponseEntity.status(500)
                .body(List.of());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<List<CV>> getAllCVs() {
        try {
            List<CV> cvs = cvService.getAllCVs();
            return ResponseEntity.ok(cvs);
        } catch (Exception e) {
            log.error("Error getting all CVs", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{cvId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<?> getCV(@PathVariable UUID cvId) {
        try {
            CV cv = cvService.getCV(cvId);
            // Detach lazy-loaded relations
            if (cv != null) {
                cv.setStudent(null);
            }
            return ResponseEntity.ok(cv);
        } catch (RuntimeException e) {
            log.error("Error getting CV: {}", e.getMessage());
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error getting CV", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error getting CV: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{cvId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> deleteCV(@PathVariable UUID cvId) {
        try {
            log.info("DELETE /students/cv/{} - Request received", cvId);
            cvService.deleteCV(cvId);
            log.info("DELETE /students/cv/{} - CV deleted successfully", cvId);
            return ResponseEntity.ok(Map.of("message", "CV deleted successfully"));
        } catch (RuntimeException e) {
            log.error("DELETE /students/cv/{} - Runtime error: {}", cvId, e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("DELETE /students/cv/{} - Unexpected error", cvId, e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error deleting CV: " + e.getMessage()));
        }
    }

    @PostMapping("/from-template")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createCVFromTemplate(
            @RequestParam UUID templateId,
            @RequestParam String cvDataJson,
            @RequestParam(required = false) MultipartFile photoFile
    ) {
        try {
            // Parse JSON data
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> cvData = mapper.readValue(cvDataJson, Map.class);
            
            CV cv = cvService.createCVFromTemplate(templateId, cvData, photoFile);
            // Detach lazy-loaded relations
            if (cv != null) {
                cv.setStudent(null);
            }
            return ResponseEntity.ok(cv);
        } catch (RuntimeException e) {
            log.error("Runtime error creating CV from template: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("IO error creating CV from template", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error creating CV: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating CV from template", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error creating CV: " + e.getMessage()));
        }
    }
    @GetMapping("/download/{cvId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<org.springframework.core.io.Resource> downloadCV(@PathVariable UUID cvId) {
        try {
            Map<String, Object> result = cvService.downloadCV(cvId);
            org.springframework.core.io.Resource resource = (org.springframework.core.io.Resource) result.get("resource");
            String fileName = (String) result.get("fileName");
            String contentType = (String) result.get("contentType");
            
            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
        } catch (RuntimeException e) {
            log.error("Error downloading CV: {}", e.getMessage());
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            log.error("Unexpected error downloading CV", e);
            return ResponseEntity.status(500).build();
        }
    }
}
