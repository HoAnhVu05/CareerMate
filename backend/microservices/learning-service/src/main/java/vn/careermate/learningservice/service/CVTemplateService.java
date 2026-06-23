package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.careermate.learningservice.model.CVTemplate;
import vn.careermate.learningservice.repository.CVTemplateRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CVTemplateService {

    private final CVTemplateRepository templateRepository;

    public List<CVTemplate> getAllTemplates(String category) {
        if (category != null && !category.isEmpty()) {
            return templateRepository.findByCategory(category);
        }
        return templateRepository.findAll();
    }

    public List<CVTemplate> getFreeTemplates() {
        return templateRepository.findByIsPremium(false);
    }

    public List<CVTemplate> getPremiumTemplates() {
        return templateRepository.findByIsPremium(true);
    }

    public CVTemplate getTemplateById(UUID templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public CVTemplate createTemplate(CVTemplate template) {
        return templateRepository.save(template);
    }

    public CVTemplate updateTemplate(UUID templateId, CVTemplate template) {
        CVTemplate existing = getTemplateById(templateId);
        existing.setName(template.getName());
        existing.setDescription(template.getDescription());
        existing.setTemplateHtml(template.getTemplateHtml());
        existing.setTemplateCss(template.getTemplateCss());
        existing.setCategory(template.getCategory());
        existing.setIsPremium(template.getIsPremium());
        existing.setPreviewImageUrl(template.getPreviewImageUrl());
        return templateRepository.save(existing);
    }

    public void deleteTemplate(UUID templateId) {
        templateRepository.deleteById(templateId);
    }
}
