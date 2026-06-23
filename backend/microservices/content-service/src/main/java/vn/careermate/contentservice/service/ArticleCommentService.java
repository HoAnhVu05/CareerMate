package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.dto.ArticleCommentDTO;
import vn.careermate.contentservice.model.Article;
import vn.careermate.contentservice.model.ArticleComment;
// import vn.careermate.userservice.model.User; // Replaced with Feign Client
// import vn.careermate.userservice.model.StudentProfile; // Replaced with Feign Client
import vn.careermate.contentservice.repository.ArticleCommentRepository;
import vn.careermate.contentservice.repository.ArticleRepository;
// import vn.careermate.userservice.repository.UserRepository; // Replaced with Feign Client
// import vn.careermate.userservice.repository.StudentProfileRepository; // Replaced with Feign Client
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.StudentProfileDTO;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleCommentService {

    private final ArticleCommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserServiceClient userServiceClient;

    // TODO: Refactor to use UserServiceClient for fetching user details
    // Currently returns comments with userId (UUID) - client should fetch user details separately
    @Transactional(readOnly = true)
    public List<ArticleComment> getComments(UUID articleId) {
        try {
            log.info("Getting comments for articleId: {}", articleId);
            List<ArticleComment> comments = commentRepository.findByArticleIdAndParentCommentIsNullOrderByCreatedAtAsc(articleId);
            log.info("Found {} top-level comments", comments.size());
            
            // Load replies for each comment
            for (ArticleComment comment : comments) {
                List<ArticleComment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
                comment.setReplies(replies);
            }
            
            log.info("Successfully loaded {} comments with replies", comments.size());
            return comments;
        } catch (Exception e) {
            log.error("ERROR in getComments: {}", e.getMessage(), e);
            throw new RuntimeException("Error loading comments: " + e.getMessage(), e);
        }
    }

    // TODO: Refactor to use UserServiceClient for fetching user details
    // Currently returns comments with userId (UUID) - client should fetch user details separately
    @Transactional(readOnly = true)
    public List<ArticleCommentDTO> getCommentsAsDTO(UUID articleId) {
        try {
            log.info("Getting comments as DTO for articleId: {}", articleId);
            List<ArticleComment> comments = commentRepository.findByArticleIdAndParentCommentIsNullOrderByCreatedAtAsc(articleId);
            log.info("Found {} top-level comments", comments.size());
            
            // Load all replies recursively for each comment
            for (ArticleComment comment : comments) {
                loadRepliesRecursively(comment);
            }
            
            // Convert to DTOs - TODO: Fetch user details via UserServiceClient in DTO conversion
            List<ArticleCommentDTO> dtos = comments.stream()
                    .map(comment -> {
                        ArticleCommentDTO dto = ArticleCommentDTO.fromEntity(comment);
                        populateUserInfo(dto);
                        return dto;
                    })
                    .collect(Collectors.toList());
            
            log.info("Successfully converted {} comments to DTOs", dtos.size());
            return dtos;
        } catch (Exception e) {
            log.error("ERROR in getCommentsAsDTO: {}", e.getMessage(), e);
            throw new RuntimeException("Error loading comments: " + e.getMessage(), e);
        }
    }

    /**
     * Load all nested replies recursively for a comment
     */
    private void loadRepliesRecursively(ArticleComment comment) {
        List<ArticleComment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
        for (ArticleComment reply : replies) {
            // Recursively load nested replies
            loadRepliesRecursively(reply);
        }
        comment.setReplies(replies);
    }

    private void populateUserInfo(ArticleCommentDTO dto) {
        if (dto.getUser() != null && dto.getUser().getId() != null) {
            try {
                UserDTO user = userServiceClient.getUserById(dto.getUser().getId());
                if (user != null) {
                    dto.setUser(user);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch user info for comment {}: {}", dto.getId(), e.getMessage());
                dto.getUser().setFullName("Unknown User");
            }
        }

        // Recursively populate user info for replies
        if (dto.getReplies() != null) {
            for (ArticleCommentDTO reply : dto.getReplies()) {
                populateUserInfo(reply);
            }
        }
    }

    @Transactional
    public ArticleComment createComment(UUID articleId, String content, UUID parentCommentId) {
        try {
            UserDTO user = getCurrentUser();
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new RuntimeException("Article not found"));

            ArticleComment comment = ArticleComment.builder()
                    .article(article)
                    .userId(user.getId())
                    .content(content)
                    .build();

            if (parentCommentId != null) {
                ArticleComment parent = commentRepository.findById(parentCommentId)
                        .orElseThrow(() -> new RuntimeException("Parent comment not found"));
                comment.setParentComment(parent);
            }

            ArticleComment saved = commentRepository.save(comment);
            
            // Note: User info now fetched via Feign Client when needed
            // No need to force load entity fields since we use UUID
            
            updateArticleCommentsCount(articleId);
            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public ArticleComment updateComment(UUID commentId, String content) {
        ArticleComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        UserDTO user = getCurrentUser();
        if (!comment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own comments");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        ArticleComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        UserDTO user = getCurrentUser();
        if (!comment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own comments");
        }

        UUID articleId = comment.getArticle().getId();
        commentRepository.delete(comment);
        updateArticleCommentsCount(articleId);
    }

    @Transactional
    private void updateArticleCommentsCount(UUID articleId) {
        Article article = articleRepository.findById(articleId).orElse(null);
        if (article != null) {
            long count = commentRepository.countByArticleId(articleId);
            article.setCommentsCount((int) count);
            articleRepository.save(article);
        }
    }

    private UserDTO getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO user = userServiceClient.getUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }
}
