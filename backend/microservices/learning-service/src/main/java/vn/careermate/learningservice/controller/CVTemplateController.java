package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.CVTemplate;
import vn.careermate.learningservice.service.CVTemplateService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cv-templates")
@RequiredArgsConstructor
public class CVTemplateController {

    private final CVTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<CVTemplate>> getTemplates(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(templateService.getAllTemplates(category));
    }

    @GetMapping("/free")
    public ResponseEntity<List<CVTemplate>> getFreeTemplates() {
        return ResponseEntity.ok(templateService.getFreeTemplates());
    }

    @GetMapping("/premium")
    public ResponseEntity<List<CVTemplate>> getPremiumTemplates() {
        return ResponseEntity.ok(templateService.getPremiumTemplates());
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<CVTemplate> getTemplate(@PathVariable UUID templateId) {
        return ResponseEntity.ok(templateService.getTemplateById(templateId));
    }
}
