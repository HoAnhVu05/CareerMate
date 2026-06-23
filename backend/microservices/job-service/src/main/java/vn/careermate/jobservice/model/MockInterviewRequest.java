package vn.careermate.jobservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "mock_interview_requests", schema = "jobservice")
@EntityListeners(AuditingEntityListener.class)
public class MockInterviewRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private UUID recruiterId;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @Column(columnDefinition = "TEXT")
    private String message; // Message from student

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime scheduledTime;

    public enum RequestStatus {
        PENDING, ACCEPTED, REJECTED, COMPLETED
    }
}
