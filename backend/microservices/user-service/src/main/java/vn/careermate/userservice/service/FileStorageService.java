package vn.careermate.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.storage.local.path:./uploads}")
    private String uploadPath;

    public String getUploadDir() {
        return uploadPath;
    }

    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        // Create directory if not exists
        Path uploadDir = Paths.get(uploadPath, subdirectory);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("File saved: {}", filePath.toString());
        
        // Return web-accessible relative path
        String relativePath = "/uploads/" + subdirectory + "/" + fileName;
        
        log.info("Returning relative path for web: {}", relativePath);
        return relativePath;
    }

    public void deleteFile(String filePath) {
        try {
            if (filePath == null || filePath.isEmpty()) {
                log.warn("Cannot delete file: path is null or empty");
                return;
            }
            
            String actualPath = resolveFilePath(filePath);
            if (actualPath == null) {
                actualPath = filePath;
                log.warn("Could not resolve file path, trying direct path: {}", actualPath);
            }
            
            Path path = Paths.get(actualPath);
            
            if (!Files.exists(path)) {
                log.warn("File not found for deletion: {} (resolved: {})", filePath, actualPath);
                if (filePath.startsWith("/uploads/")) {
                    String altPath = filePath.substring(1);
                    Path alt = Paths.get(uploadPath).resolve(altPath.replace("uploads/", "")).normalize();
                    if (Files.exists(alt)) {
                        path = alt;
                        actualPath = alt.toString();
                        log.info("Found file at alternative path: {}", actualPath);
                    }
                }
            }
            
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted successfully: {} (resolved from: {})", actualPath, filePath);
            } else {
                log.error("File not found for deletion after all attempts: {} (resolved: {})", filePath, actualPath);
            }
        } catch (IOException e) {
            log.error("Error deleting file: {} - {}", filePath, e.getMessage(), e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    public String resolveFilePath(String webPath) {
        if (webPath == null || webPath.isEmpty()) {
            return null;
        }
        
        // If it already starts with our actual target storage path, return it directly
        if (webPath.startsWith(uploadPath)) {
            return webPath;
        }
        
        String cleanPath = webPath.startsWith("/") ? webPath.substring(1) : webPath;
        
        if (cleanPath.startsWith("uploads/")) {
            cleanPath = cleanPath.substring("uploads/".length());
        }
        
        Path resolvedPath = Paths.get(uploadPath).resolve(cleanPath).normalize();
        
        log.info("Resolving web path '{}' to file system path '{}'", webPath, resolvedPath.toString());
        return resolvedPath.toString();
    }
    public org.springframework.core.io.Resource loadFileAsResource(String filePath) {
        try {
            String actualPath = resolveFilePath(filePath);
            if (actualPath == null) {
                throw new RuntimeException("File path invalid: " + filePath);
            }
            
            Path path = Paths.get(actualPath);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filePath);
            }
        } catch (java.net.MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filePath, e);
        }
    }
}
