package vn.careermate.contentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.careermate.contentservice.model.ArticleComment;
import vn.careermate.common.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCommentDTO {
    private UUID id;
    private UserDTO user;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ArticleCommentDTO> replies;

    public static ArticleCommentDTO fromEntity(ArticleComment comment) {
        if (comment == null) {
            return null;
        }

        ArticleCommentDTO dto = ArticleCommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();

        // Map user - Note: User info needs to be fetched separately via Service
        // We set a placeholder with ID here
        if (comment.getUserId() != null) {
            dto.setUser(UserDTO.builder()
                    .id(comment.getUserId())
                    .fullName("Loading...")
                    .build());
        }

        // Map replies recursively (support unlimited nested levels)
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            dto.setReplies(comment.getReplies().stream()
                    .map(ArticleCommentDTO::fromEntity) // Recursive mapping for nested replies
                    .collect(Collectors.toList()));
        } else {
            dto.setReplies(java.util.Collections.emptyList());
        }

        return dto;
    }
}
