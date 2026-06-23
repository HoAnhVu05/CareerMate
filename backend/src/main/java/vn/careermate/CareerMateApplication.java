package vn.careermate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
    exclude = {OAuth2ClientAutoConfiguration.class},
    scanBasePackages = {
        "vn.careermate.adminservice",      // Admin Service
        "vn.careermate.userservice",      // User Service - Văn Tân
        "vn.careermate.jobservice",       // Job Service - Ngọc Thi
        "vn.careermate.aiservice",         // AI Service - Anh Vũ
        "vn.careermate.contentservice",     // Content Service - Hiệu Hiệu
        "vn.careermate.learningservice",    // Learning Service - Bảo Hân
        "vn.careermate.notificationservice", // Notification Service
        "vn.careermate.common",            // Common code (will be created)
        "vn.careermate.config",            // Shared configs (if any remain at root)
        "vn.careermate.model",             // Models (remaining, will be moved to respective services)
        "vn.careermate.repository",        // Repositories (remaining, will be moved)
        "vn.careermate.service",           // Services (remaining, will be moved)
        "vn.careermate.controller",        // Controllers (remaining, will be moved)
        "vn.careermate.dto",               // DTOs (remaining, will be moved)
        "vn.careermate.util"               // Utilities
    }
)
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class CareerMateApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerMateApplication.class, args);
    }
}

