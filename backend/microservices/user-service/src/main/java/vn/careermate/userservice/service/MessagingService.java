package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.userservice.model.Conversation;
import vn.careermate.userservice.model.Message;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.ConversationRepository;
import vn.careermate.userservice.repository.MessageRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.common.client.NotificationServiceClient;
import vn.careermate.common.dto.NotificationRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationServiceClient notificationServiceClient;

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Conversation getOrCreateConversation(UUID otherUserId) {
        User currentUser = getCurrentUser();
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + otherUserId));

        // Ensure participant1 < participant2 for consistency
        UUID userId1 = currentUser.getId();
        UUID userId2 = otherUser.getId();
        if (userId1.compareTo(userId2) > 0) {
            UUID temp = userId1;
            userId1 = userId2;
            userId2 = temp;
        }

        Optional<Conversation> existing = conversationRepository.findByParticipants(userId1, userId2);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new conversation
        User p1 = userId1.equals(currentUser.getId()) ? currentUser : otherUser;
        User p2 = userId1.equals(currentUser.getId()) ? otherUser : currentUser;

        Conversation conversation = Conversation.builder()
                .participant1(p1)
                .participant2(p2)
                .build();
        return conversationRepository.save(conversation);
    }

    @Transactional(readOnly = true)
    public List<Conversation> getMyConversations() {
        User currentUser = getCurrentUser();
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByLastMessageAtDesc(currentUser.getId());
        
        // Force load all participant fields to avoid lazy loading issues during serialization
        return conversations.stream().map(conv -> {
            User p1 = conv.getParticipant1();
            User p2 = conv.getParticipant2();
            if (p1 != null) {
                p1.getId();
                p1.getFullName();
                p1.getEmail();
                p1.getAvatarUrl();
                p1.getRole();
            }
            if (p2 != null) {
                p2.getId();
                p2.getFullName();
                p2.getEmail();
                p2.getAvatarUrl();
                p2.getRole();
            }
            
            // Load last message for preview
            Page<Message> lastMessagePage = messageRepository.findLastMessageByConversationId(
                conv.getId(), PageRequest.of(0, 1));
            if (!lastMessagePage.getContent().isEmpty()) {
                Message lastMsg = lastMessagePage.getContent().get(0);
                if (lastMsg.getSender() != null) {
                    lastMsg.getSender().getId();
                    lastMsg.getSender().getFullName();
                }
            }
            
            return conv;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Conversation getConversation(UUID conversationId) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.hasParticipant(currentUser.getId())) {
            throw new RuntimeException("Access denied to this conversation");
        }

        // Force load all participant fields
        User p1 = conversation.getParticipant1();
        User p2 = conversation.getParticipant2();
        if (p1 != null) {
            p1.getId();
            p1.getFullName();
            p1.getEmail();
            p1.getAvatarUrl();
            p1.getRole();
        }
        if (p2 != null) {
            p2.getId();
            p2.getFullName();
            p2.getEmail();
            p2.getAvatarUrl();
            p2.getRole();
        }

        return conversation;
    }

    @Transactional
    public List<Message> getMessages(UUID conversationId, int page, int size) {
        // Validate access
        getConversation(conversationId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
        List<Message> messages = messagePage.getContent();

        // Force load sender fields to avoid lazy loading issues
        messages.forEach(message -> {
            if (message.getSender() != null) {
                message.getSender().getId();
                message.getSender().getFullName();
                message.getSender().getEmail();
                message.getSender().getRole();
                message.getSender().getAvatarUrl();
            }
        });

        // Mark messages as read (needs write transaction)
        markMessagesAsRead(conversationId);

        // Reverse to show oldest first
        return messages.stream()
                .sorted((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional
    public Message sendMessage(UUID conversationId, String content) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversation(conversationId);

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(currentUser)
                .content(content.trim())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        // Update conversation last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Mark as read for sender
        message.setIsRead(true);
        message = messageRepository.save(message);

        // Send notification to recipient
        User recipient = conversation.getParticipant1().getId().equals(currentUser.getId()) 
            ? conversation.getParticipant2() 
            : conversation.getParticipant1();
        
        if (recipient != null && !recipient.getId().equals(currentUser.getId())) {
            try {
                String preview = content.length() > 100 ? content.substring(0, 100) + "..." : content;
                notificationServiceClient.createNotification(NotificationRequest.builder()
                    .userId(recipient.getId())
                    .type("MESSAGE")
                    .title("New message from " + currentUser.getFullName())
                    .message(preview)
                    .relatedEntityId(conversation.getId())
                    .relatedEntityType("CONVERSATION")
                    .build());
            } catch (Exception e) {
                log.error("Error sending message notification: {}", e.getMessage(), e);
            }
        }

        return message;
    }

    @Transactional
    public Message sendMessageToUser(UUID recipientId, String content) {
        Conversation conversation = getOrCreateConversation(recipientId);
        return sendMessage(conversation.getId(), content);
    }

    @Transactional
    public void markMessagesAsRead(UUID conversationId) {
        User currentUser = getCurrentUser();
        messageRepository.markAsRead(conversationId, currentUser.getId());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = getCurrentUser();
        return messageRepository.countUnreadConversations(currentUser.getId());
    }

    // Admin methods
    @Transactional(readOnly = true)
    public List<User> getAllRecruiters() {
        return userRepository.findByRoleIn(List.of(User.UserRole.RECRUITER));
    }

    @Transactional(readOnly = true)
    public List<User> getAllStudents() {
        return userRepository.findByRoleIn(List.of(User.UserRole.STUDENT));
    }

    @Transactional
    public void deleteAllMessages(UUID conversationId) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversation(conversationId);
        
        // Verify user is participant
        if (!conversation.hasParticipant(currentUser.getId())) {
            throw new RuntimeException("Access denied to this conversation");
        }
        
        messageRepository.deleteAll(messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId));
        
        // Update last message time
        conversation.setLastMessageAt(null);
        conversationRepository.save(conversation);
    }
}
