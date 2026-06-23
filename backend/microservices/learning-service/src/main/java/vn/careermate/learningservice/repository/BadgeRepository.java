package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.Badge;

import java.util.List;
import java.util.UUID;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, UUID> {
    List<Badge> findByCategory(String category);
    List<Badge> findByRarity(Badge.BadgeRarity rarity);
}
