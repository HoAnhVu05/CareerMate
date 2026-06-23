package vn.careermate.aiservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.aiservice.model.AIChatConversation;

import java.util.List;
import java.util.UUID;

@Repository
public interface AIChatConversationRepository extends JpaRepository<AIChatConversation, UUID> {
    
    Page<AIChatConversation> findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable pageable);
    
    List<AIChatConversation> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    
    // Note: AIChatConversation now uses studentId (UUID) directly, not student entity
    @Query("SELECT c FROM AIChatConversation c WHERE c.studentId = :studentId AND c.role = :role ORDER BY c.createdAt DESC")
    List<AIChatConversation> findByStudentIdAndRole(@Param("studentId") UUID studentId, @Param("role") String role);
    
    long countByStudentId(UUID studentId);
}

