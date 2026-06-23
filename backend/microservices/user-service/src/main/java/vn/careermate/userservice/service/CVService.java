package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.common.client.AIServiceClient;
import vn.careermate.common.client.LearningServiceClient;
import vn.careermate.common.dto.CVTemplateDTO;
import vn.careermate.userservice.service.FileStorageService;
import vn.careermate.userservice.model.CV;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.CVRepository;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CVService {

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private final CVRepository cvRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AIServiceClient aiServiceClient;
    private final LearningServiceClient learningServiceClient;
    private final TextExtractionService textExtractionService;

    @Transactional(readOnly = true)
    private StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Authentication required");
        }
        
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    @Transactional
    public CV uploadCV(MultipartFile file) throws IOException {
        log.info("CVService.uploadCV - Start processing file: {}", file.getOriginalFilename());
        StudentProfile student = getCurrentStudentProfile();
        
        // Validate file type
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.toLowerCase().endsWith(".pdf") && 
            !fileName.toLowerCase().endsWith(".docx") && 
            !fileName.toLowerCase().endsWith(".doc") &&
            !fileName.toLowerCase().endsWith(".txt"))) {
            throw new RuntimeException("Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed.");
        }

        // Save file using FileStorageService
        String filePath = fileStorageService.storeFile(file, "cvs");

        // Extract text from uploaded file
        String extractedText = "";
        try {
            log.info("CVService - Starting text extraction for file: {}", filePath);
            // Get the actual file path using the helper method
            String actualPath = fileStorageService.resolveFilePath(filePath);
            java.io.File uploadedFile = new java.io.File(actualPath);
            
            log.info("CVService - Resolved path: {}. Exists: {}", actualPath, uploadedFile.exists());
            
            if (uploadedFile.exists()) {
                extractedText = textExtractionService.extractTextFromFile(uploadedFile, contentType);
                log.info("CVService - Successfully extracted {} characters", extractedText.length());
            } else {
                log.warn("CVService - Uploaded file not found at path: {}", actualPath);
            }
        } catch (Exception e) {
            log.error("CVService - Error extracting text from CV: {}", fileName, e);
            // Continue without extracted text
        }

        // Create CV record with extracted content
        CV cv = CV.builder()
                .student(student)
                .fileUrl(filePath)
                .fileName(fileName)
                .fileSize(file.getSize())
                .fileType(contentType)
                .isDefault(false)
                .extractedContent(extractedText)
                .build();

        cv = cvRepository.save(cv);

        // Analyze CV with AI (async) - via Feign Client
        try {
            // Use extracted content for analysis
            aiServiceClient.analyzeCV(cv.getId(), extractedText);
        } catch (Exception e) {
            log.warn("Failed to analyze CV with AI service: {}", e.getMessage());
            // Continue without AI analysis
        }

        return cv;
    }

    @Transactional
    public void deleteCV(UUID cvId) {
        StudentProfile student = getCurrentStudentProfile();
        
        // Find CV and verify ownership
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        if (!cv.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("You don't have permission to delete this CV");
        }
        
        // Delete file from storage
        if (cv.getFileUrl() != null && !cv.getFileUrl().isEmpty()) {
            try {
                log.info("Attempting to delete CV file: {}", cv.getFileUrl());
                fileStorageService.deleteFile(cv.getFileUrl());
                log.info("CV file deleted successfully: {}", cv.getFileUrl());
            } catch (Exception e) {
                log.error("Could not delete CV file: {} - {}", cv.getFileUrl(), e.getMessage(), e);
                // Continue with database deletion even if file deletion fails
            }
        } else {
            log.warn("CV has no file URL to delete: {}", cvId);
        }
        
        // Delete CV record from database
        cvRepository.delete(cv);
        
        log.info("CV deleted successfully: {}", cvId);
    }

    @Transactional(readOnly = true)
    public List<CV> getCVs() {
        try {
            StudentProfile student = getCurrentStudentProfile();
            
            // Get CVs
            List<CV> cvs = cvRepository.findByStudentId(student.getId());
            
            // Detach lazy-loaded relations to prevent serialization issues
            if (cvs != null) {
                cvs.forEach(cv -> {
                    if (cv != null && cv.getStudent() != null) {
                        cv.setStudent(null);
                    }
                });
            }
            
            return cvs != null ? cvs : List.of();
        } catch (RuntimeException e) {
            log.error("Runtime error getting CVs: {}", e.getMessage(), e);
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error getting CVs", e);
            return List.of();
        }
    }

    @Transactional(readOnly = true)
    public List<CV> getAllCVs() {
        try {
            List<CV> cvs = cvRepository.findAll();
            if (cvs != null) {
                cvs.forEach(cv -> {
                    if (cv != null && cv.getStudent() != null) {
                        cv.setStudent(null);
                    }
                });
            }
            return cvs != null ? cvs : List.of();
        } catch (Exception e) {
            log.error("Error getting all CVs", e);
            return List.of();
        }
    }

    @Transactional(readOnly = true)
    public CV getCV(UUID cvId) {
        // Find CV
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        // Check permission - Allow both Student owner and Recruiter (if application exists)
        // For simplicity allow authenticated users for now
        // TODO: Implement stricter permission check
        
        return cv;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> downloadCV(UUID cvId) {
        // Find CV
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found"));
        
        // Check permission - Allow both Student owner and Recruiter (who should have application link)
        // For simplicity, we might allow any authenticated user to download if they have the ID, 
        // OR we should ideally check if the user is a recruiter who has a job application from this student.
        // Given complexity of checking job applications here (circular dependency with job-service),
        // we will allow download for now if authenticated. 
        // Security improvement: Check if user is owner OR is a Recruiter.
        
        // Check permission: Owner OR (Recruiter/Admin)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isRecruiterOrAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECRUITER") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isRecruiterOrAdmin) {
            // If not recruiter/admin, must be the student owner
            StudentProfile currentStudent;
            try {
                 currentStudent = getCurrentStudentProfile();
            } catch (Exception e) {
                // If can't get student profile and not recruiter -> Unauthorized
                throw new RuntimeException("Unauthorized");
            }

            if (!cv.getStudent().getId().equals(currentStudent.getId())) {
                 throw new RuntimeException("You don't have permission to download this CV");
            }
        }
        // If isRecruiterOrAdmin, proceed.

        if (cv.getFileUrl() == null) {
            throw new RuntimeException("CV file URL not found");
        }
        
        org.springframework.core.io.Resource resource = fileStorageService.loadFileAsResource(cv.getFileUrl());
        
        return Map.of(
            "resource", resource,
            "fileName", cv.getFileName() != null ? cv.getFileName() : "cv_" + cvId + ".pdf",
            "contentType", cv.getFileType() != null ? cv.getFileType() : "application/octet-stream"
        );
    }

    @Transactional
    public CV createCVFromTemplate(UUID templateId, Map<String, Object> cvData, MultipartFile photoFile) throws IOException {
        StudentProfile student = getCurrentStudentProfile();
        
        // Get template via Feign Client
        CVTemplateDTO templateDTO = learningServiceClient.getCVTemplateById(templateId);
        if (templateDTO == null) {
            throw new RuntimeException("CV template not found");
        }
        
        // Convert DTO to template-like object for rendering
        // Note: We'll need to fetch template HTML/CSS separately or include in DTO
        // For now, using a simplified approach
        // Use HTML/CSS from template DTO
        String templateHtml = templateDTO.getTemplateHtml();
        String templateCss = templateDTO.getTemplateCss();
        
        if (templateHtml == null) templateHtml = "";
        if (templateCss == null) templateCss = "";
        
        // Upload photo if provided
        String photoUrl = null;
        if (photoFile != null && !photoFile.isEmpty()) {
            String contentType = photoFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("Invalid file type. Only image files are allowed for CV photo.");
            }
            if (photoFile.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("Photo file size too large. Maximum size is 5MB.");
            }
            photoUrl = fileStorageService.storeFile(photoFile, "cv-photos");
        }
        
        // Get initials from fullName
        String fullName = (String) ((Map<String, Object>) cvData.getOrDefault("personalInfo", new HashMap<>())).getOrDefault("fullName", "");
        String initials = fullName.isEmpty() ? "CV" : 
            Arrays.stream(fullName.trim().split("\\s+"))
                .map(s -> s.substring(0, 1).toUpperCase())
                .reduce("", (a, b) -> a + b);
        
        // Render HTML from template
        // Note: Template HTML/CSS should be fetched from learning-service
        // For now, using a basic template structure
        String html = renderTemplate(templateHtml, cvData, photoUrl, initials);
        
        // Combine HTML and CSS
        String fullHtml = "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>" + 
            templateCss + 
            "</style></head><body>" + html + "</body></html>";
        
        // Save HTML file
        String fileName = "CV_" + fullName.replaceAll("[^a-zA-Z0-9]", "_") + "_" + UUID.randomUUID().toString().substring(0, 8) + ".html";
        byte[] htmlBytes = fullHtml.getBytes("UTF-8");
        
        Path uploadDir = Paths.get("./uploads", "cvs");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        Path filePath = uploadDir.resolve(fileName);
        Files.write(filePath, htmlBytes);
        
        String fileUrl = "/uploads/cvs/" + fileName;
        
        // Create CV record
        CV cv = CV.builder()
                .student(student)
                .fileUrl(fileUrl)
                .fileName(fileName)
                .fileSize((long) htmlBytes.length)
                .fileType("text/html")
                .isDefault(false)
                .build();
        
        cv = cvRepository.save(cv);
        
        log.info("CV created from template: {} (template: {})", cv.getId(), templateId);
        
        return cv;
    }
    
    private String renderTemplate(String templateHtml, Map<String, Object> cvData, String photoUrl, String initials) {
        String result = templateHtml;
        Map<String, Object> personalInfo = (Map<String, Object>) cvData.getOrDefault("personalInfo", new HashMap<>());
        
        // Replace simple placeholders
        result = result.replace("{{fullName}}", escapeHtml((String) personalInfo.getOrDefault("fullName", "")));
        result = result.replace("{{email}}", escapeHtml((String) personalInfo.getOrDefault("email", "")));
        result = result.replace("{{phone}}", escapeHtml((String) personalInfo.getOrDefault("phone", "")));
        result = result.replace("{{address}}", escapeHtml((String) personalInfo.getOrDefault("address", "")));
        result = result.replace("{{linkedin}}", escapeHtml((String) personalInfo.getOrDefault("linkedin", "")));
        result = result.replace("{{github}}", escapeHtml((String) personalInfo.getOrDefault("github", "")));
        // Build full photo URL with base URL for proper display
        String fullPhotoUrl = "";
        if (photoUrl != null && !photoUrl.isEmpty()) {
            if (photoUrl.startsWith("http")) {
                fullPhotoUrl = photoUrl;
            } else if (photoUrl.startsWith("/api")) {
                fullPhotoUrl = baseUrl + photoUrl;
            } else {
                fullPhotoUrl = baseUrl + "/api" + photoUrl;
            }
        }
        result = result.replace("{{photoUrl}}", fullPhotoUrl);
        result = result.replace("{{initials}}", initials);
        result = result.replace("{{summary}}", escapeHtml((String) cvData.getOrDefault("summary", "")));
        
        // Handle arrays (experience, education, skills) - simple approach
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> experience = (List<Map<String, Object>>) cvData.getOrDefault("experience", new ArrayList<>());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> education = (List<Map<String, Object>>) cvData.getOrDefault("education", new ArrayList<>());
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) cvData.getOrDefault("skills", new ArrayList<>());
        
        // Replace experience section
        Pattern expPattern = Pattern.compile("\\{\\{#each experience\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}");
        Matcher expMatcher = expPattern.matcher(result);
        StringBuffer expSb = new StringBuffer();
        while (expMatcher.find()) {
            String expTemplate = expMatcher.group(1);
            StringBuilder expHtml = new StringBuilder();
            for (Map<String, Object> exp : experience) {
                String expItem = expTemplate;
                expItem = expItem.replace("{{position}}", escapeHtml((String) exp.getOrDefault("position", "")));
                expItem = expItem.replace("{{company}}", escapeHtml((String) exp.getOrDefault("company", "")));
                expItem = expItem.replace("{{description}}", escapeHtml((String) exp.getOrDefault("description", "")));
                expHtml.append(expItem);
            }
            expMatcher.appendReplacement(expSb, Matcher.quoteReplacement(expHtml.toString()));
        }
        expMatcher.appendTail(expSb);
        result = expSb.toString();
        
        // Replace education section
        Pattern eduPattern = Pattern.compile("\\{\\{#each education\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}");
        Matcher eduMatcher = eduPattern.matcher(result);
        StringBuffer eduSb = new StringBuffer();
        while (eduMatcher.find()) {
            String eduTemplate = eduMatcher.group(1);
            StringBuilder eduHtml = new StringBuilder();
            for (Map<String, Object> edu : education) {
                String eduItem = eduTemplate;
                eduItem = eduItem.replace("{{school}}", escapeHtml((String) edu.getOrDefault("school", "")));
                eduItem = eduItem.replace("{{major}}", escapeHtml((String) edu.getOrDefault("major", "")));
                eduHtml.append(eduItem);
            }
            eduMatcher.appendReplacement(eduSb, Matcher.quoteReplacement(eduHtml.toString()));
        }
        eduMatcher.appendTail(eduSb);
        result = eduSb.toString();
        
        // Replace skills section
        Pattern skillsPattern = Pattern.compile("\\{\\{#each skills\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}");
        Matcher skillsMatcher = skillsPattern.matcher(result);
        StringBuffer skillsSb = new StringBuffer();
        while (skillsMatcher.find()) {
            String skillTemplate = skillsMatcher.group(1);
            StringBuilder skillsHtml = new StringBuilder();
            for (String skill : skills) {
                skillsHtml.append(skillTemplate.replace("{{this}}", escapeHtml(skill)));
            }
            skillsMatcher.appendReplacement(skillsSb, Matcher.quoteReplacement(skillsHtml.toString()));
        }
        skillsMatcher.appendTail(skillsSb);
        result = skillsSb.toString();
        
        // Remove conditional blocks for empty fields
        result = result.replaceAll("\\{\\{#if [^}]+\\}\\}", "");
        result = result.replaceAll("\\{\\{/if\\}\\}", "");
        
        return result;
    }
    
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
