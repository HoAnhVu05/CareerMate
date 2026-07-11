package vn.careermate.gateway.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
public class FallbackController {

    @RequestMapping("/fallback/user-service")
    public Mono<Map<String, Object>> userServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống Quản lý tài khoản (User Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }

    @RequestMapping("/fallback/job-service")
    public Mono<Map<String, Object>> jobServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống Tuyển dụng (Job Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }

    @RequestMapping("/fallback/ai-service")
    public Mono<Map<String, Object>> aiServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống AI Assistant (AI Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }

    @RequestMapping("/fallback/content-service")
    public Mono<Map<String, Object>> contentServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống Quản lý bài viết (Content Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }

    @RequestMapping("/fallback/learning-service")
    public Mono<Map<String, Object>> learningServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống Học tập (Learning Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }

    @RequestMapping("/fallback/notification-service")
    public Mono<Map<String, Object>> notificationServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống Thông báo (Notification Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }

    @RequestMapping("/fallback/admin-service")
    public Mono<Map<String, Object>> adminServiceFallback() {
        return Mono.just(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Hệ thống Admin (Admin Service) tạm thời không khả dụng. Vui lòng thử lại sau."
        ));
    }
}
