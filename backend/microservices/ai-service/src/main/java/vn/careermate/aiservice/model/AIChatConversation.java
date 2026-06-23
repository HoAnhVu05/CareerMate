package vn.careermate.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ai_chat_conversations", schema = "aiservice", indexes = {
    @Index(name = "idx_ai_chat_student", columnList = "student_id"),
    @Index(name = "idx_ai_chat_created", columnList = "created_at")
})
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AIChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // Changed from StudentProfile entity to UUID

    @Column(name = "conversation_title")
    private String conversationTitle; // Auto-generated from first message

    @Column(name = "role")
    private String role; // CAREER_COACH, CV_ADVISOR, INTERVIEW_PREP, etc.

    @Column(name = "context", columnDefinition = "TEXT")
    private String context; // Additional context for the conversation

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AIChatMessage> messages;
}

