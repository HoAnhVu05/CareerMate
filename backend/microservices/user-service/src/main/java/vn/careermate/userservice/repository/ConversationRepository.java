package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.Conversation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    // Find conversation between two users (order-independent)
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1.id = :userId1 AND c.participant2.id = :userId2) OR " +
           "(c.participant1.id = :userId2 AND c.participant2.id = :userId1)")
    Optional<Conversation> findByParticipants(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    // Find all conversations for a user
    @Query("SELECT c FROM Conversation c WHERE c.participant1.id = :userId OR c.participant2.id = :userId " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(@Param("userId") UUID userId);

    // Find conversations with unread messages for a user
    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.messages m " +
           "WHERE (c.participant1.id = :userId OR c.participant2.id = :userId) " +
           "AND m.sender.id != :userId AND m.isRead = false " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findUnreadConversations(@Param("userId") UUID userId);
}
