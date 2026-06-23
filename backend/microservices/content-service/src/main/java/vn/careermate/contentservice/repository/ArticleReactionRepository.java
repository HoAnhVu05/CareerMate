package vn.careermate.contentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.contentservice.model.ArticleReaction;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArticleReactionRepository extends JpaRepository<ArticleReaction, UUID> {
    Optional<ArticleReaction> findByArticleIdAndUserId(UUID articleId, UUID userId);
    
    long countByArticleId(UUID articleId);
    
    // Note: ArticleReaction has Article entity relationship, not articleId UUID
    @Query("SELECT COUNT(r) FROM ArticleReaction r WHERE r.article.id = :articleId AND r.reactionType = :reactionType")
    long countByArticleIdAndReactionType(@Param("articleId") UUID articleId, 
                                          @Param("reactionType") ArticleReaction.ReactionType reactionType);
    
    void deleteByArticleIdAndUserId(UUID articleId, UUID userId);
}
