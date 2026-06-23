package vn.careermate.contentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.contentservice.model.ArticleComment;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArticleCommentRepository extends JpaRepository<ArticleComment, UUID> {
    List<ArticleComment> findByArticleIdOrderByCreatedAtAsc(UUID articleId);
    
    List<ArticleComment> findByArticleIdAndParentCommentIsNullOrderByCreatedAtAsc(UUID articleId);
    
    List<ArticleComment> findByParentCommentIdOrderByCreatedAtAsc(UUID parentCommentId);
    
    long countByArticleId(UUID articleId);
}
