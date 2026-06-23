package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.CVTemplate;

import java.util.List;
import java.util.UUID;

@Repository
public interface CVTemplateRepository extends JpaRepository<CVTemplate, UUID> {
    List<CVTemplate> findByCategory(String category);
    List<CVTemplate> findByIsPremium(Boolean isPremium);
}
