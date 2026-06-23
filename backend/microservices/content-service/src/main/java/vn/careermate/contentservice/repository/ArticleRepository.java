package vn.careermate.contentservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.contentservice.model.Article;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {
    Page<Article> findByStatus(Article.ArticleStatus status, Pageable pageable);
    
    Page<Article> findByStatusOrderByCreatedAtDesc(Article.ArticleStatus status, Pageable pageable);
    
    long countByStatus(Article.ArticleStatus status);
    
    long countByStatusAndCreatedAtBefore(Article.ArticleStatus status, java.time.LocalDateTime createdAt);
    
    long countByCreatedAtBefore(java.time.LocalDateTime createdAt);
    
    @Query("SELECT a FROM Article a WHERE a.status = :status AND a.publishedAt IS NOT NULL ORDER BY a.publishedAt DESC")
    Page<Article> findByStatusAndPublishedAtIsNotNullOrderByPublishedAtDesc(
        @Param("status") Article.ArticleStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.status = :status AND a.publishedAt IS NOT NULL " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT(CONCAT('%', :keyword), '%'))) " +
           "AND (:category IS NULL OR :category = '' OR a.category = :category) " +
           "ORDER BY a.publishedAt DESC")
    List<Article> findPublishedArticlesWithFilters(
        @Param("status") Article.ArticleStatus status,
        @Param("keyword") String keyword,
        @Param("category") String category);
    
    List<Article> findByAuthorId(UUID authorId);
    
    Page<Article> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);
}
