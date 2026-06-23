package vn.careermate.userservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import vn.careermate.userservice.model.StudentProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "cvs", schema = "userservice", indexes = {
    @Index(name = "idx_cvs_student", columnList = "student_id"),
    @Index(name = "idx_cvs_default", columnList = "student_id,is_default")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CV {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Builder.Default
    @Column(name = "is_default")
    private Boolean isDefault = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_analysis", columnDefinition = "jsonb")
    private Map<String, Object> aiAnalysis;

    @Column(name = "extracted_content", columnDefinition = "TEXT")
    private String extractedContent;

    @Column(name = "ai_score", precision = 5, scale = 2)
    private java.math.BigDecimal aiScore;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

