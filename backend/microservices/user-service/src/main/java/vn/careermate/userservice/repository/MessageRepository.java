package vn.careermate.userservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.Message;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    Page<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);

    long countByConversationIdAndIsReadFalseAndSenderIdNot(UUID conversationId, UUID senderId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    int markAsRead(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT m.conversation.id) FROM Message m WHERE " +
           "(m.conversation.participant1.id = :userId OR m.conversation.participant2.id = :userId) " +
           "AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadConversations(@Param("userId") UUID userId);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC")
    Page<Message> findLastMessageByConversationId(@Param("conversationId") UUID conversationId, Pageable pageable);
}
