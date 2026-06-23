package vn.careermate.learningservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cv_templates", schema = "learningservice")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CVTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "template_html", columnDefinition = "TEXT", nullable = false)
    private String templateHtml;

    @Column(name = "template_css", columnDefinition = "TEXT")
    private String templateCss;

    private String category;

    @Builder.Default
    @Column(name = "is_premium")
    private Boolean isPremium = false;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
