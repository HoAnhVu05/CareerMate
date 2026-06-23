package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import vn.careermate.common.dto.UserDTO;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    private UUID id;
    private UUID authorId;
    private UserDTO author;
    private String title;
    private String content;
    private String excerpt;
    private String category;
    private List<String> tags;
    private String thumbnailUrl;
    private String status; // PENDING, PUBLISHED, REJECTED, HIDDEN
    private Boolean hidden;
    private String hiddenReason;
    private LocalDateTime hiddenAt;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long viewsCount;
    private Long likesCount;
    private Long reactionsCount;
    private Long commentsCount;
}
