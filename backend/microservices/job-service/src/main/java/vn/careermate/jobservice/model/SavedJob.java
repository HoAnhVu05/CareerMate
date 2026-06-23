package vn.careermate.jobservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_jobs", schema = "jobservice", indexes = {
    @Index(name = "idx_saved_jobs_student", columnList = "student_id"),
    @Index(name = "idx_saved_jobs_job", columnList = "job_id"),
    @Index(name = "idx_saved_jobs_unique", columnList = "student_id,job_id", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SavedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Student's notes about this job

    @CreatedDate
    @Column(name = "saved_at", updatable = false)
    private LocalDateTime savedAt;
}
