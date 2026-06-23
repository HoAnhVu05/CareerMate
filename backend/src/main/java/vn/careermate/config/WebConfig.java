package vn.careermate.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.local.path:./uploads}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from uploads directory
        // Maps /uploads/** to the actual uploads directory on disk
        String uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize().toString();
        
        // Normalize path separators for Windows compatibility
        if (uploadDir.contains("\\")) {
            uploadDir = uploadDir.replace("\\", "/");
        }
        
        // Ensure path ends with /
        if (!uploadDir.endsWith("/")) {
            uploadDir += "/";
        }
        
        // Map /uploads/** to file system uploads directory
        // For Windows, need to handle path correctly
        String fileUrl = uploadDir;
        if (!fileUrl.startsWith("file:///")) {
            // Windows path: C:/path/to/uploads/ -> file:///C:/path/to/uploads/
            // Unix path: /path/to/uploads/ -> file:///path/to/uploads/
            if (fileUrl.contains(":")) {
                // Windows absolute path
                fileUrl = "file:///" + fileUrl;
            } else {
                // Unix absolute path
                fileUrl = "file://" + fileUrl;
            }
        }
        
        log.info("Configuring static resource handler: /uploads/** and /api/uploads/** -> {}", fileUrl);
        
        // Map both /uploads/** and /api/uploads/** to handle context-path
        // Also map without /api prefix for direct access
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileUrl)
                .setCachePeriod(3600); // Cache for 1 hour
        
        // Map /api/uploads/** for context-path compatibility
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(fileUrl)
                .setCachePeriod(3600);
    }
}

