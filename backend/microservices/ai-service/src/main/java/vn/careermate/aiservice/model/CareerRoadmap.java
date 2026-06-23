package vn.careermate.aiservice.model;

import jakarta.persistence.*;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "career_roadmaps", schema = "aiservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CareerRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // Changed from StudentProfile entity to UUID

    @Column(nullable = false)
    private String careerGoal; // Target job title or career path

    @Column(name = "current_level")
    private String currentLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column(name = "target_level")
    private String targetLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "roadmap_data", columnDefinition = "jsonb")
    private Map<String, Object> roadmapData; // Steps, milestones, timeline

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills_gap", columnDefinition = "jsonb")
    private List<String> skillsGap; // Skills needed to learn

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommended_courses", columnDefinition = "jsonb")
    private List<Map<String, Object>> recommendedCourses;

    @Column(name = "estimated_duration_months")
    private Integer estimatedDurationMonths;

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
