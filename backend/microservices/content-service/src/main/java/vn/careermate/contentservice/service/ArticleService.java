package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.dto.CreateArticleRequest;
import vn.careermate.contentservice.model.Article;
// import vn.careermate.userservice.model.RecruiterProfile; // Replaced with Feign Client
// import vn.careermate.userservice.model.User; // Replaced with Feign Client
import vn.careermate.contentservice.repository.ArticleRepository;
// import vn.careermate.userservice.repository.RecruiterProfileRepository; // Replaced with Feign Client
// import vn.careermate.userservice.repository.UserRepository; // Replaced with Feign Client
// import vn.careermate.notificationservice.service.NotificationService; // Replaced with Feign Client
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.NotificationServiceClient;
import vn.careermate.common.client.ContentServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.RecruiterProfileDTO;
import vn.careermate.common.dto.CompanyDTO;
import vn.careermate.common.dto.NotificationRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final ContentServiceClient contentServiceClient;

    @Transactional(readOnly = true)
    public Page<Article> getPublishedArticles(String keyword, String category, Pageable pageable) {
        try {
            log.info("Getting published articles: keyword={}, category={}, page={}, size={}", 
                keyword, category, pageable.getPageNumber(), pageable.getPageSize());
            
            // Get all published articles first
            List<Article> allArticles = articleRepository.findAll().stream()
                .filter(a -> a.getStatus() == Article.ArticleStatus.PUBLISHED)
                .filter(a -> a.getPublishedAt() != null)
                .filter(a -> a.getHidden() == null || !a.getHidden()) // Filter out hidden articles
                .filter(a -> {
                    // Filter by keyword - search in title, content, excerpt, and author name
                    if (keyword != null && !keyword.trim().isEmpty()) {
                        String lowerKeyword = keyword.toLowerCase().trim();
                        boolean matchesTitle = a.getTitle() != null && 
                               a.getTitle().toLowerCase().contains(lowerKeyword);
                        boolean matchesContent = a.getContent() != null && 
                               a.getContent().toLowerCase().contains(lowerKeyword);
                        boolean matchesExcerpt = a.getExcerpt() != null && 
                               a.getExcerpt().toLowerCase().contains(lowerKeyword);
                        
                        // Search by author name (fullName) - TODO: Use UserServiceClient
                        boolean matchesAuthor = false;
                        if (a.getAuthorId() != null) {
                            try {
                                UserDTO author = userServiceClient.getUserById(a.getAuthorId());
                                if (author != null && author.getFullName() != null) {
                                    matchesAuthor = author.getFullName().toLowerCase().contains(lowerKeyword);
                                }
                                
                                // If author is RECRUITER, also search by company name
                                if (!matchesAuthor && author != null && 
                                    "RECRUITER".equals(author.getRole())) {
                                    try {
                                        RecruiterProfileDTO profile = userServiceClient.getRecruiterProfileByUserId(a.getAuthorId());
                                        if (profile != null && profile.getCompanyId() != null) {
                                            CompanyDTO company = contentServiceClient.getCompanyById(profile.getCompanyId());
                                            if (company != null && company.getName() != null) {
                                                matchesAuthor = company.getName().toLowerCase().contains(lowerKeyword);
                                            }
                                        }
                                    } catch (Exception e) {
                                        log.debug("Error checking company name for article search: {}", e.getMessage());
                                    }
                                }
                            } catch (Exception e) {
                                log.debug("Error fetching author for article search: {}", e.getMessage());
                            }
                        }
                        
                        return matchesTitle || matchesContent || matchesExcerpt || matchesAuthor;
                    }
                    return true;
                })
                .filter(a -> {
                    // Filter by category
                    if (category != null && !category.trim().isEmpty()) {
                        return a.getCategory() != null && a.getCategory().equals(category);
                    }
                    return true;
                })
                .sorted((a1, a2) -> {
                    // Sort by publishedAt DESC
                    if (a1.getPublishedAt() == null || a2.getPublishedAt() == null) {
                        return 0;
                    }
                    return a2.getPublishedAt().compareTo(a1.getPublishedAt());
                })
                .collect(java.util.stream.Collectors.toList());
            
            // Note: Author info now fetched via Feign Client when needed
            // No need to force load entity fields since we use UUID
            
            // Apply pagination after filtering
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allArticles.size());
            List<Article> pageContent = start < allArticles.size() ? 
                allArticles.subList(start, end) : java.util.Collections.emptyList();
            
            log.info("Found {} published articles after filtering, returning page {} with {} items", 
                allArticles.size(), pageable.getPageNumber(), pageContent.size());
            
            return new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, allArticles.size());
        } catch (Exception e) {
            log.error("Error getting published articles: keyword={}, category={}, error={}", 
                keyword, category, e.getMessage(), e);
            e.printStackTrace();
            throw new RuntimeException("Error loading articles: " + e.getMessage(), e);
        }
    }

    public Page<Article> getPendingArticles(Pageable pageable) {
        return articleRepository.findByStatusOrderByCreatedAtDesc(Article.ArticleStatus.PENDING, pageable);
    }

    public Page<Article> getAllArticles(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            Article.ArticleStatus articleStatus = Article.ArticleStatus.valueOf(status.toUpperCase());
            return articleRepository.findByStatusOrderByCreatedAtDesc(articleStatus, pageable);
        }
        return articleRepository.findAll(pageable);
    }

    public Article getArticleById(UUID articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        // Check if article is hidden - only allow admin or article author to see hidden articles
        if (article.getHidden() != null && article.getHidden()) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getAuthorities() != null) {
                    boolean isAdmin = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    if (isAdmin) {
                        // Admin can see hidden articles
                    } else if (article.getAuthorId() != null) {
                        // Check if current user is the article author
                        String email = auth.getName();
                        UserDTO currentUser = userServiceClient.getUserByEmail(email);
                        if (currentUser != null && article.getAuthorId().equals(currentUser.getId())) {
                            // Article author can see their hidden article
                        } else {
                            throw new RuntimeException("Article not found or has been hidden");
                        }
                    } else {
                        throw new RuntimeException("Article not found or has been hidden");
                    }
                } else {
                    throw new RuntimeException("Article not found or has been hidden");
                }
            } catch (Exception e) {
                if (e instanceof RuntimeException) {
                    throw e;
                }
                throw new RuntimeException("Article not found or has been hidden");
            }
        }
        
        // Increment views
        article.setViewsCount(article.getViewsCount() + 1);
        articleRepository.save(article);
        
        return article;
    }

    public vn.careermate.common.dto.ArticleDTO getArticleDTOById(UUID articleId) {
        Article article = getArticleById(articleId);
        return convertToDTO(article);
    }

    public vn.careermate.common.dto.ArticleDTO convertToDTO(Article article) {
        vn.careermate.common.dto.ArticleDTO dto = vn.careermate.common.dto.ArticleDTO.builder()
                .id(article.getId())
                .authorId(article.getAuthorId())
                .title(article.getTitle())
                .content(article.getContent())
                .excerpt(article.getExcerpt())
                .category(article.getCategory())
                .tags(article.getTags())
                .thumbnailUrl(article.getThumbnailUrl())
                .status(article.getStatus().name())
                .hidden(article.getHidden())
                .hiddenReason(article.getHiddenReason())
                .hiddenAt(article.getHiddenAt())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .viewsCount(Long.valueOf(article.getViewsCount()))
                .likesCount(Long.valueOf(article.getLikesCount()))
                .commentsCount(Long.valueOf(article.getCommentsCount()))
                .reactionsCount(Long.valueOf(article.getReactionsCount()))
                .build();

        if (article.getAuthorId() != null) {
            try {
                UserDTO author = userServiceClient.getUserById(article.getAuthorId());
                dto.setAuthor(author);
            } catch (Exception e) {
                log.error("Error fetching author details for article {}: {}", article.getId(), e.getMessage());
            }
        }
        return dto;
    }
    
    /**
     * Get author display name for article
     * - If recruiter: return company name or recruiter name
     * - If admin: return "Admin + admin name"
     */
    public String getAuthorDisplayName(Article article) {
        if (article.getAuthorId() == null) {
            return "Unknown";
        }
        try {
            UserDTO author = userServiceClient.getUserById(article.getAuthorId());
            if (author == null) {
                return "Unknown";
            }
            if ("ADMIN".equals(author.getRole())) {
                return "Admin " + author.getFullName();
            } else if ("RECRUITER".equals(author.getRole())) {
                try {
                    RecruiterProfileDTO profile = userServiceClient.getRecruiterProfileByUserId(author.getId());
                    if (profile != null && profile.getCompanyId() != null) {
                        CompanyDTO company = contentServiceClient.getCompanyById(profile.getCompanyId());
                        if (company != null) {
                            return company.getName();
                        }
                    }
                } catch (Exception e) {
                    log.debug("Error fetching company for author display name: {}", e.getMessage());
                }
                return author.getFullName();
            }
            return author.getFullName();
        } catch (Exception e) {
            log.error("Error fetching author for display name: {}", e.getMessage());
            return "Unknown";
        }
    }

    @Transactional
    public Article createArticle(CreateArticleRequest request) {
        UserDTO author = getCurrentUser();
        
        Article article = Article.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .excerpt(request.getExcerpt())
                .category(request.getCategory())
                .tags(request.getTags())
                .thumbnailUrl(request.getThumbnailUrl())
                .authorId(author.getId())
                .build();
        
        // Admin can publish directly, recruiter needs approval
        if ("ADMIN".equals(author.getRole())) {
            article.setStatus(Article.ArticleStatus.PUBLISHED);
            article.setPublishedAt(LocalDateTime.now());
        } else if ("RECRUITER".equals(author.getRole())) {
            article.setStatus(Article.ArticleStatus.PENDING); // Needs admin approval
        } else {
            throw new RuntimeException("Only ADMIN or RECRUITER can create articles");
        }
        
        article = articleRepository.save(article);
        articleRepository.flush(); // Force flush to database immediately
        
        // TODO: Implement notification via NotificationServiceClient
        // Nếu admin đăng bài, gửi thông báo cho tất cả STUDENT và RECRUITER
        // if ("ADMIN".equals(author.getRole()) && article.getStatus() == Article.ArticleStatus.PUBLISHED) {
        //     NotificationRequest request = NotificationRequest.builder()...
        //     notificationServiceClient.createNotification(request);
        // }
        
        // Nếu recruiter đăng bài (status PENDING), gửi thông báo cho tất cả ADMIN
        // if ("RECRUITER".equals(author.getRole()) && article.getStatus() == Article.ArticleStatus.PENDING) {
        //     NotificationRequest request = NotificationRequest.builder()...
        //     notificationServiceClient.createNotification(request);
        // }
        
        return article;
    }

    @Transactional
    public Article updateArticle(UUID articleId, Article articleData) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        article.setTitle(articleData.getTitle());
        article.setContent(articleData.getContent());
        article.setExcerpt(articleData.getExcerpt());
        article.setCategory(articleData.getCategory());
        article.setTags(articleData.getTags());
        article.setThumbnailUrl(articleData.getThumbnailUrl());
        
        return articleRepository.save(article);
    }

    @Transactional
    public Article approveArticle(UUID articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        UserDTO admin = getCurrentUser();
        article.setStatus(Article.ArticleStatus.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        article.setApprovedBy(admin.getId());
        article.setApprovedAt(LocalDateTime.now());
        
        article = articleRepository.save(article);
        articleRepository.flush(); // Force flush to database immediately
        
        // Send notification to author
        try {
            if (article.getAuthorId() != null) {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(article.getAuthorId())
                        .title("Article Approved")
                        .message("Your article \"" + article.getTitle() + "\" has been approved and published.")
                        .type("ARTICLE_APPROVED")
                        .relatedEntityId(articleId)
                        .build();
                notificationServiceClient.notifyArticleApproved(request);
            }
        } catch (Exception e) {
            // Log but don't fail the operation
            log.warn("Error sending notification for article approval: {}", e.getMessage());
        }
        
        return article;
    }

    @Transactional
    public Article rejectArticle(UUID articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        UserDTO admin = getCurrentUser();
        article.setStatus(Article.ArticleStatus.REJECTED);
        article.setApprovedBy(admin.getId());
        article.setApprovedAt(LocalDateTime.now());
        
        article = articleRepository.save(article);
        
        // Send notification to author
        try {
            if (article.getAuthorId() != null) {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(article.getAuthorId())
                        .title("Article Rejected")
                        .message("Your article \"" + article.getTitle() + "\" has been rejected.")
                        .type("ARTICLE_REJECTED")
                        .relatedEntityId(articleId)
                        .build();
                notificationServiceClient.notifyArticleRejected(request);
            }
        } catch (Exception e) {
            // Log but don't fail the operation
            log.warn("Error sending notification for article rejection: {}", e.getMessage());
        }
        
        return article;
    }

    @Transactional(readOnly = true)
    public Page<Article> getMyArticles(Pageable pageable) {
        UserDTO currentUser = getCurrentUser();
        Page<Article> articles = articleRepository.findByAuthorIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
        
        // Note: Author info now fetched via Feign Client when needed
        // No need to force load entity fields since we use UUID
        
        return articles;
    }

    @Transactional(readOnly = true)
    public long getArticleCount(String status) {
        return getArticleCount(status, null);
    }

    @Transactional(readOnly = true)
    public long getArticleCount(String status, java.time.LocalDateTime beforeDate) {
        if (beforeDate == null) {
            if (status == null || status.trim().isEmpty()) {
                return articleRepository.count();
            }
            try {
                return articleRepository.countByStatus(Article.ArticleStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status for article count: {}", status);
                return 0L;
            }
        } else {
            if (status == null || status.trim().isEmpty()) {
                return articleRepository.countByCreatedAtBefore(beforeDate);
            }
            try {
                return articleRepository.countByStatusAndCreatedAtBefore(Article.ArticleStatus.valueOf(status.toUpperCase()), beforeDate);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status for article count: {}", status);
                return 0L;
            }
        }
    }

    @Transactional
    public Article hideArticle(UUID articleId, String reason) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        article.setHidden(true);
        article.setHiddenReason(reason);
        article.setHiddenAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    @Transactional
    public Article unhideArticle(UUID articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        article.setHidden(false);
        article.setHiddenReason(null);
        article.setHiddenAt(null);
        return articleRepository.save(article);
    }

    @Transactional
    public void deleteArticle(UUID articleId, String reason) {
        if (!articleRepository.existsById(articleId)) {
            throw new RuntimeException("Article not found");
        }
        articleRepository.deleteById(articleId);
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
