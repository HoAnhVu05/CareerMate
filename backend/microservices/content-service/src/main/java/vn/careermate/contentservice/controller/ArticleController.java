package vn.careermate.contentservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.careermate.contentservice.dto.CreateArticleRequest;
import vn.careermate.contentservice.model.Article;
import vn.careermate.contentservice.model.ArticleComment;
import vn.careermate.contentservice.model.ArticleReaction;
// import vn.careermate.userservice.repository.UserRepository; // Replaced with Feign Client
import vn.careermate.contentservice.service.ArticleCommentService;
import vn.careermate.contentservice.service.ArticleReactionService;
import vn.careermate.contentservice.service.ArticleService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleReactionService reactionService;
    private final ArticleCommentService commentService;
    private final UserServiceClient userServiceClient;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Article>> getPublishedArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            log.info("=== ArticleController.getPublishedArticles ===");
            log.info("keyword: {}, category: {}, page: {}, size: {}", keyword, category, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            log.info("Calling articleService.getPublishedArticles...");
            
            Page<Article> articles = articleService.getPublishedArticles(keyword, category, pageable);
            
            log.info("Articles retrieved: {} total, {} in page", articles.getTotalElements(), articles.getContent().size());
            
            // Note: Author info now fetched via Feign Client when needed
            // No need to force load entity fields since we use UUID (authorId)
            
            // Log first article if exists
            if (!articles.getContent().isEmpty()) {
                Article first = articles.getContent().get(0);
                log.info("First article: id={}, title={}, author={}", 
                    first.getId(), first.getTitle(), 
                    first.getAuthorId() != null ? "Author ID: " + first.getAuthorId() : "null");
            }
            
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            log.error("ERROR in getPublishedArticles: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<vn.careermate.common.dto.ArticleDTO> getArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(articleService.getArticleDTOById(articleId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Article> createArticle(@RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(articleService.createArticle(request));
    }
    
    @GetMapping("/{articleId}/author-name")
    public ResponseEntity<String> getAuthorDisplayName(@PathVariable UUID articleId) {
        Article article = articleService.getArticleById(articleId);
        return ResponseEntity.ok(articleService.getAuthorDisplayName(article));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Article>> getPendingArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getPendingArticles(pageable));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Article>> getAllArticles(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getAllArticles(status, pageable));
    }

    @PutMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> updateArticle(
            @PathVariable UUID articleId,
            @RequestBody Article article
    ) {
        return ResponseEntity.ok(articleService.updateArticle(articleId, article));
    }

    @PostMapping("/{articleId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> approveArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(articleService.approveArticle(articleId));
    }

    @PostMapping("/{articleId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> rejectArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(articleService.rejectArticle(articleId));
    }

    @PostMapping("/{articleId}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> hideArticle(
            @PathVariable UUID articleId,
            @RequestParam String reason
    ) {
        return ResponseEntity.ok(articleService.hideArticle(articleId, reason));
    }

    @PostMapping("/{articleId}/unhide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> unhideArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(articleService.unhideArticle(articleId));
    }

    @DeleteMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteArticle(
            @PathVariable UUID articleId,
            @RequestParam String reason
    ) {
        articleService.deleteArticle(articleId, reason);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getArticleCount(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    ) {
        return ResponseEntity.ok(articleService.getArticleCount(status, beforeDate));
    }

    @PostMapping("/{articleId}/reactions")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ArticleReaction> toggleReaction(
            @PathVariable UUID articleId,
            @RequestParam String reactionType
    ) {
        ArticleReaction.ReactionType type = ArticleReaction.ReactionType.valueOf(reactionType.toUpperCase());
        ArticleReaction reaction = reactionService.toggleReaction(articleId, type);
        if (reaction == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reaction);
    }

    @GetMapping("/{articleId}/reactions")
    public ResponseEntity<Map<ArticleReaction.ReactionType, Long>> getReactionCounts(@PathVariable UUID articleId) {
        return ResponseEntity.ok(reactionService.getReactionCounts(articleId));
    }

    @GetMapping("/{articleId}/reactions/my")
    public ResponseEntity<ArticleReaction> getMyReaction(@PathVariable UUID articleId) {
        try {
            ArticleReaction reaction = reactionService.getUserReaction(articleId);
            if (reaction == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(reaction);
        } catch (Exception e) {
            log.error("Error getting my reaction: {}", e.getMessage());
            // Return 204 to avoid console errors in frontend
            return ResponseEntity.noContent().build();
        }
    }

    // Comments endpoints
    @GetMapping("/{articleId}/comments")
    public ResponseEntity<?> getComments(@PathVariable UUID articleId) {
        try {
            System.out.println("=== GET /articles/" + articleId + "/comments ===");
            // Use DTO to avoid serialization issues
            List<vn.careermate.contentservice.dto.ArticleCommentDTO> comments = commentService.getCommentsAsDTO(articleId);
            System.out.println("Found " + comments.size() + " comments");
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            System.err.println("ERROR in getComments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Article>> getMyArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getMyArticles(pageable));
    }

    @PostMapping("/{articleId}/comments")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ArticleComment> createComment(
            @PathVariable UUID articleId,
            @RequestBody java.util.Map<String, Object> request
    ) {
        try {
            String content = (String) request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            UUID parentCommentId = null;
            if (request.get("parentCommentId") != null) {
                try {
                    parentCommentId = UUID.fromString(request.get("parentCommentId").toString());
                } catch (IllegalArgumentException e) {
                    // Invalid UUID format, treat as null
                    parentCommentId = null;
                }
            }
            return ResponseEntity.ok(commentService.createComment(articleId, content, parentCommentId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ArticleComment> updateComment(
            @PathVariable UUID commentId,
            @RequestBody java.util.Map<String, String> request
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request.get("content")));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
