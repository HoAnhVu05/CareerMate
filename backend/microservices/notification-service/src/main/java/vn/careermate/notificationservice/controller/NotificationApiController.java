package vn.careermate.notificationservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.NotificationRequest;
import vn.careermate.notificationservice.model.Notification;
import vn.careermate.notificationservice.service.NotificationService;

@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationApiController {
    
    private final NotificationService notificationService;
    
    @PostMapping("/create")
    public ResponseEntity<Void> createNotification(@RequestBody NotificationRequest request) {
        log.info("Received request to create notification: type={}, title={}, targetUserId={}", 
                request.getType(), request.getTitle(), request.getUserId());
        try {
            notificationService.createNotification(
                request.getUserId(),
                request.getTitle(),
                request.getMessage(),
                Notification.NotificationType.valueOf(request.getType()),
                null,
                request.getRelatedEntityType(),
                request.getRelatedEntityId()
            );
            log.info("Notification created successfully for user={}", request.getUserId());
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
        }
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/job-approved")
    public ResponseEntity<Void> notifyJobApproved(@RequestBody NotificationRequest request) {
        notificationService.notifyJobApproved(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/job-rejected")
    public ResponseEntity<Void> notifyJobRejected(@RequestBody NotificationRequest request) {
        notificationService.notifyJobRejected(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/job-hidden")
    public ResponseEntity<Void> notifyJobHidden(@RequestBody NotificationRequest request) {
        notificationService.notifyJobHidden(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/job-unhidden")
    public ResponseEntity<Void> notifyJobUnhidden(@RequestBody NotificationRequest request) {
        notificationService.notifyJobUnhidden(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/job-deleted")
    public ResponseEntity<Void> notifyJobDeleted(@RequestBody NotificationRequest request) {
        notificationService.notifyJobDeleted(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/article-approved")
    public ResponseEntity<Void> notifyArticleApproved(@RequestBody NotificationRequest request) {
        notificationService.notifyArticleApproved(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/article-rejected")
    public ResponseEntity<Void> notifyArticleRejected(@RequestBody NotificationRequest request) {
        notificationService.notifyArticleRejected(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/article-hidden")
    public ResponseEntity<Void> notifyArticleHidden(@RequestBody NotificationRequest request) {
        notificationService.notifyArticleHidden(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/article-unhidden")
    public ResponseEntity<Void> notifyArticleUnhidden(@RequestBody NotificationRequest request) {
        notificationService.notifyArticleUnhidden(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/article-deleted")
    public ResponseEntity<Void> notifyArticleDeleted(@RequestBody NotificationRequest request) {
        notificationService.notifyArticleDeleted(
            request.getUserId(),
            request.getRelatedEntityId(),
            request.getTitle(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/challenge-completed")
    public ResponseEntity<Void> notifyChallengeCompleted(@RequestBody NotificationRequest request) {
        notificationService.createNotification(
            request.getUserId(),
            request.getTitle(),
            request.getMessage(),
            Notification.NotificationType.CHALLENGE_COMPLETED,
            null,
            request.getRelatedEntityType(),
            request.getRelatedEntityId()
        );
        return ResponseEntity.ok().build();
    }
}
