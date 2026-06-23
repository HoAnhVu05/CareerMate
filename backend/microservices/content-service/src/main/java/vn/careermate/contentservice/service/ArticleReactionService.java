package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.model.Article;
import vn.careermate.contentservice.model.ArticleReaction;
// import vn.careermate.userservice.model.User; // Replaced with Feign Client
import vn.careermate.contentservice.repository.ArticleReactionRepository;
import vn.careermate.contentservice.repository.ArticleRepository;
// import vn.careermate.userservice.repository.UserRepository; // Replaced with Feign Client
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleReactionService {

    private final ArticleReactionRepository reactionRepository;
    private final ArticleRepository articleRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public ArticleReaction toggleReaction(UUID articleId, ArticleReaction.ReactionType reactionType) {
        UserDTO user = getCurrentUser();
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        Optional<ArticleReaction> existingReaction = reactionRepository.findByArticleIdAndUserId(articleId, user.getId());

        if (existingReaction.isPresent()) {
            ArticleReaction reaction = existingReaction.get();
            if (reaction.getReactionType() == reactionType) {
                // Remove reaction if clicking the same type
                reactionRepository.delete(reaction);
                updateArticleReactionsCount(articleId);
                return null;
            } else {
                // Update reaction type
                reaction.setReactionType(reactionType);
                return reactionRepository.save(reaction);
            }
        } else {
            // Create new reaction
            ArticleReaction reaction = ArticleReaction.builder()
                    .article(article)
                    .userId(user.getId())
                    .reactionType(reactionType)
                    .build();
            ArticleReaction saved = reactionRepository.save(reaction);
            updateArticleReactionsCount(articleId);
            return saved;
        }
    }

    public Map<ArticleReaction.ReactionType, Long> getReactionCounts(UUID articleId) {
        return Map.of(
            ArticleReaction.ReactionType.LIKE, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.LIKE),
            ArticleReaction.ReactionType.LOVE, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.LOVE),
            ArticleReaction.ReactionType.HAHA, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.HAHA),
            ArticleReaction.ReactionType.WOW, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.WOW),
            ArticleReaction.ReactionType.SAD, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.SAD),
            ArticleReaction.ReactionType.ANGRY, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.ANGRY)
        );
    }

    public ArticleReaction getUserReaction(UUID articleId) {
        UserDTO user = getCurrentUser();
        return reactionRepository.findByArticleIdAndUserId(articleId, user.getId()).orElse(null);
    }

    @Transactional
    private void updateArticleReactionsCount(UUID articleId) {
        Article article = articleRepository.findById(articleId).orElse(null);
        if (article != null) {
            long count = reactionRepository.countByArticleId(articleId);
            article.setReactionsCount((int) count);
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
