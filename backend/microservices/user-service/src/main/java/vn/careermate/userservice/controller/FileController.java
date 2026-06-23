package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class FileController {

    @Value("${app.storage.local.path:./uploads}")
    private String uploadPath;

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Extract file path from request URI
            String uri = request.getRequestURI();
            log.info("Request URI: {}", uri);
            
            // Remove /api/uploads or /uploads prefix
            String requestPath;
            if (uri.startsWith("/api/uploads/")) {
                requestPath = uri.substring("/api/uploads/".length());
            } else if (uri.startsWith("/uploads/")) {
                requestPath = uri.substring("/uploads/".length());
            } else {
                log.warn("Unexpected URI format: {}", uri);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Serving file: {}", requestPath);
            
            // Resolve file path
            Path filePath = Paths.get(uploadPath).resolve(requestPath).normalize();
            
            // Security check: ensure file is within upload directory
            Path uploadDir = Paths.get(uploadPath).normalize();
            if (!filePath.startsWith(uploadDir)) {
                log.warn("Attempted access outside upload directory: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            File file = filePath.toFile();
            if (!file.exists() || !file.isFile()) {
                log.warn("File not found: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(file);
            
            // Determine content type
            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (Exception e) {
                log.warn("Could not determine content type for: {}", filePath);
            }
            
            if (contentType == null) {
                String fileName = file.getName().toLowerCase();
                if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (fileName.endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (fileName.endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else {
                    contentType = "application/octet-stream";
                }
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error serving file", e);
            return ResponseEntity.notFound().build();
        }
    }
}
