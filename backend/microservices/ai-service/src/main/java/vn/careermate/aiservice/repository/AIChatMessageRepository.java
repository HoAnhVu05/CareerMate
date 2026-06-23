package vn.careermate.aiservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.aiservice.model.AIChatMessage;

import java.util.List;
import java.util.UUID;

@Repository
public interface AIChatMessageRepository extends JpaRepository<AIChatMessage, UUID> {
    
    List<AIChatMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
    
    Page<AIChatMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId, Pageable pageable);
    
    @Query("SELECT m FROM AIChatMessage m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    List<AIChatMessage> findAllByConversationId(@Param("conversationId") UUID conversationId);
    
    long countByConversationId(UUID conversationId);
    
    void deleteByConversationId(UUID conversationId);
}

