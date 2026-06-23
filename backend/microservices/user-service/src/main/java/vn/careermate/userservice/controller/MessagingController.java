package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.userservice.model.Conversation;
import vn.careermate.userservice.model.Message;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.service.MessagingService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/messaging")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/conversations")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<List<Conversation>> getMyConversations() {
        return ResponseEntity.ok(messagingService.getMyConversations());
    }

    @GetMapping("/conversations/{conversationId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<Conversation> getConversation(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(messagingService.getConversation(conversationId));
    }

    @PostMapping("/conversations")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<Conversation> getOrCreateConversation(@RequestParam UUID otherUserId) {
        return ResponseEntity.ok(messagingService.getOrCreateConversation(otherUserId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(messagingService.getMessages(conversationId, page, size));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<Message> sendMessage(
            @PathVariable UUID conversationId,
            @RequestBody Map<String, String> request
    ) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(messagingService.sendMessage(conversationId, content));
    }

    @PostMapping("/messages")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<Message> sendMessageToUser(
            @RequestParam UUID recipientId,
            @RequestBody Map<String, String> request
    ) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(messagingService.sendMessageToUser(recipientId, content));
    }

    @PutMapping("/conversations/{conversationId}/read")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID conversationId) {
        messagingService.markMessagesAsRead(conversationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = messagingService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Public endpoints for discovering users to chat with
    @GetMapping("/available-recruiters")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<User>> getAvailableRecruiters() {
        return ResponseEntity.ok(messagingService.getAllRecruiters());
    }

    @GetMapping("/available-students")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<User>> getAvailableStudents() {
        return ResponseEntity.ok(messagingService.getAllStudents());
    }

    // Admin endpoints
    @GetMapping("/admin/recruiters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllRecruiters() {
        return ResponseEntity.ok(messagingService.getAllRecruiters());
    }

    @GetMapping("/admin/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Conversation>> getAdminConversations() {
        return ResponseEntity.ok(messagingService.getMyConversations());
    }

    @GetMapping("/admin/conversations/{conversationId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Message>> getAdminMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(messagingService.getMessages(conversationId, page, size));
    }

    @PostMapping("/admin/conversations/{conversationId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Message> sendAdminMessage(
            @PathVariable UUID conversationId,
            @RequestBody Map<String, String> request
    ) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(messagingService.sendMessage(conversationId, content));
    }

    @PostMapping("/admin/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Conversation> getOrCreateAdminConversation(@RequestParam UUID recruiterId) {
        return ResponseEntity.ok(messagingService.getOrCreateConversation(recruiterId));
    }

    @PutMapping("/admin/conversations/{conversationId}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAdminAsRead(@PathVariable UUID conversationId) {
        messagingService.markMessagesAsRead(conversationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'ADMIN')")
    public ResponseEntity<Void> deleteAllMessages(@PathVariable UUID conversationId) {
        messagingService.deleteAllMessages(conversationId);
        return ResponseEntity.ok().build();
    }
}
