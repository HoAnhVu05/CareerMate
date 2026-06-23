package vn.careermate.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.notificationservice.model.Notification;
import vn.careermate.notificationservice.service.NotificationService;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserServiceClient userServiceClient; // Replaced UserRepository with Feign Client

    @GetMapping
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            UUID userId = getCurrentUserId();
            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notifications = notificationService.getUserNotifications(userId, pageable);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error getting notifications: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Page.empty());
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        try {
            UUID userId = getCurrentUserId();
            if (userId == null) {
                log.warn("User ID is null, returning 0 count");
                return ResponseEntity.ok(Map.of("count", 0L));
            }
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (RuntimeException e) {
            log.error("Error getting unread count: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("count", 0L)); // Return 0 instead of 500
        } catch (Exception e) {
            log.error("Unexpected error getting unread count: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("count", 0L)); // Return 0 instead of 500
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead() {
        try {
            UUID userId = getCurrentUserId();
            notificationService.markAllAsRead(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error marking all notifications as read: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    private UUID getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                log.warn("Authentication is null or anonymous");
                throw new RuntimeException("User not authenticated");
            }
            String email = auth.getName();
            log.debug("Getting user ID for email: {}", email);
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                log.error("User not found for email: {}", email);
                throw new RuntimeException("User not found for email: " + email);
            }
            return user.getId();
        } catch (Exception e) {
            log.error("Error in getCurrentUserId: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get current user ID: " + e.getMessage(), e);
        }
    }
}
