package vn.careermate.contentservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
// import vn.careermate.userservice.model.User; // Replaced with UUID
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
import java.util.UUID;

@Entity
@Table(name = "articles", schema = "contentservice", indexes = {
    @Index(name = "idx_articles_author", columnList = "author_id"),
    @Index(name = "idx_articles_status", columnList = "status"),
    @Index(name = "idx_articles_published", columnList = "published_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    private String category;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    @JsonIgnore
    private List<String> tags;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Builder.Default
    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Builder.Default
    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Builder.Default
    @Column(name = "reactions_count")
    private Integer reactionsCount = 0;

    @Builder.Default
    @Column(name = "comments_count")
    private Integer commentsCount = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Builder.Default
    @Column(name = "hidden")
    private Boolean hidden = false;

    @Column(name = "hidden_reason", columnDefinition = "TEXT")
    private String hiddenReason;

    @Column(name = "hidden_at")
    private LocalDateTime hiddenAt;

    public enum ArticleStatus {
        DRAFT, PENDING, PUBLISHED, REJECTED, HIDDEN
    }
}
