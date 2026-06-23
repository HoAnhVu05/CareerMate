package vn.careermate.aiservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "mock_interview_sessions")
public class MockInterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID studentId; // ID of the student taking the interview

    @Column(nullable = false)
    private UUID jobId; // Job context

    private String jobTitle;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer score; // Overall score (0-100)

    @Column(columnDefinition = "TEXT")
    private String feedback; // Overall feedback

    @Column(columnDefinition = "TEXT")
    private String transcript; // JSON string of questions and answers
}
