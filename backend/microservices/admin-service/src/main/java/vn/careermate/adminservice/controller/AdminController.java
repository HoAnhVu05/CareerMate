package vn.careermate.adminservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.adminservice.dto.AdminAnalytics;
import vn.careermate.adminservice.dto.AdminDashboardStats;
import vn.careermate.adminservice.model.AuditLog;
import vn.careermate.adminservice.service.AdminService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.LearningServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.common.dto.ArticleDTO;
import vn.careermate.common.dto.CVTemplateDTO;
import vn.careermate.common.dto.PackageDTO;
import vn.careermate.common.dto.SubscriptionDTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;

// Note: Subscription and Package classes are in learning-service
// These endpoints need LearningServiceClient methods to be implemented

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserServiceClient userServiceClient;
    private final LearningServiceClient learningServiceClient;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        log.info("GET /admin/dashboard/stats - Returning stats: {}", stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        if (role != null && !role.isEmpty()) {
            try {
                return ResponseEntity.ok(adminService.getUsersByRole(role.toUpperCase(), pageable));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.ok(adminService.getAllUsers(pageable));
            }
        }
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, status));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobDTO>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isEmpty()) {
            try {
                return ResponseEntity.ok(adminService.getJobsByStatus(status.toUpperCase(), pageable));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.ok(adminService.getAllJobs(pageable));
            }
        }
        return ResponseEntity.ok(adminService.getAllJobs(pageable));
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<Page<JobDTO>> getPendingJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getPendingJobs(pageable));
    }

    @PostMapping("/jobs/{jobId}/approve")
    public ResponseEntity<JobDTO> approveJob(@PathVariable UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        return ResponseEntity.ok(adminService.approveJob(jobId, admin.getId()));
    }

    @PostMapping("/jobs/{jobId}/reject")
    public ResponseEntity<JobDTO> rejectJob(@PathVariable UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        return ResponseEntity.ok(adminService.rejectJob(jobId, admin.getId()));
    }

    @GetMapping("/articles")
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getAllArticles(status, pageable));
    }

    @GetMapping("/articles/pending")
    public ResponseEntity<Page<ArticleDTO>> getPendingArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getPendingArticles(pageable));
    }

    // Article Approval and Rejection
    @PostMapping("/articles/{articleId}/approve")
    public ResponseEntity<ArticleDTO> approveArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(adminService.approveArticle(articleId));
    }

    @PostMapping("/articles/{articleId}/reject")
    public ResponseEntity<ArticleDTO> rejectArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(adminService.rejectArticle(articleId));
    }

    // CV Templates Management
    @GetMapping("/cv-templates")
    public ResponseEntity<List<CVTemplateDTO>> getAllCVTemplates() {
        return ResponseEntity.ok(learningServiceClient.getAllCVTemplates());
    }

    @PostMapping("/cv-templates")
    public ResponseEntity<CVTemplateDTO> createCVTemplate(@RequestBody CVTemplateDTO template) {
        return ResponseEntity.ok(learningServiceClient.createCVTemplate(template));
    }

    @PutMapping("/cv-templates/{templateId}")
    public ResponseEntity<CVTemplateDTO> updateCVTemplate(
            @PathVariable UUID templateId,
            @RequestBody CVTemplateDTO template
    ) {
        return ResponseEntity.ok(learningServiceClient.updateCVTemplate(templateId, template));
    }

    @DeleteMapping("/cv-templates/{templateId}")
    public ResponseEntity<Void> deleteCVTemplate(@PathVariable UUID templateId) {
        learningServiceClient.deleteCVTemplate(templateId);
        return ResponseEntity.ok().build();
    }

    // Packages Management
    @GetMapping("/packages")
    public ResponseEntity<List<PackageDTO>> getAllPackages() {
        return ResponseEntity.ok(learningServiceClient.getAllPackages());
    }

    @PostMapping("/packages")
    public ResponseEntity<PackageDTO> createPackage(@RequestBody PackageDTO packageDTO) {
        return ResponseEntity.ok(learningServiceClient.createPackage(packageDTO));
    }

    @PutMapping("/packages/{packageId}")
    public ResponseEntity<PackageDTO> updatePackage(
            @PathVariable UUID packageId,
            @RequestBody PackageDTO packageDTO
    ) {
        return ResponseEntity.ok(learningServiceClient.updatePackage(packageId, packageDTO));
    }

    @DeleteMapping("/packages/{packageId}")
    public ResponseEntity<Void> deletePackage(@PathVariable UUID packageId) {
        learningServiceClient.deletePackage(packageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<Page<SubscriptionDTO>> getAllSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(learningServiceClient.getAllSubscriptions(page, size));
    }
    
    @GetMapping("/subscriptions/pending")
    public ResponseEntity<Page<SubscriptionDTO>> getPendingSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(learningServiceClient.getPendingSubscriptions(page, size));
    }
    
    @GetMapping("/subscriptions/approved")
    public ResponseEntity<Page<SubscriptionDTO>> getApprovedSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(learningServiceClient.getApprovedSubscriptions(page, size));
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/approve")
    public ResponseEntity<SubscriptionDTO> approveSubscription(@PathVariable UUID subscriptionId) {
        return ResponseEntity.ok(learningServiceClient.approveSubscription(subscriptionId));
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/reject")
    public ResponseEntity<SubscriptionDTO> rejectSubscription(@PathVariable UUID subscriptionId) {
        return ResponseEntity.ok(learningServiceClient.rejectSubscription(subscriptionId));
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalytics> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    // Hide Job
    @PostMapping("/jobs/{jobId}/hide")
    public ResponseEntity<JobDTO> hideJob(
            @PathVariable UUID jobId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }
        
        try {
            JobDTO job = adminService.hideJob(jobId, admin.getId(), email, reason, ipAddress != null ? ipAddress : "unknown");
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            log.error("Error in hideJob controller: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Unhide Job
    @PostMapping("/jobs/{jobId}/unhide")
    public ResponseEntity<JobDTO> unhideJob(
            @PathVariable UUID jobId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        return ResponseEntity.ok(adminService.unhideJob(jobId, admin.getId(), email, ipAddress != null ? ipAddress : "unknown"));
    }

    // Delete Job (hard delete)
    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable UUID jobId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }
        
        try {
            adminService.deleteJob(jobId, admin.getId(), email, reason, ipAddress != null ? ipAddress : "unknown");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error in deleteJob controller: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Hide Article
    @PostMapping("/articles/{articleId}/hide")
    public ResponseEntity<ArticleDTO> hideArticle(
            @PathVariable UUID articleId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }
        
        return ResponseEntity.ok(adminService.hideArticle(articleId, admin.getId(), email, reason, ipAddress != null ? ipAddress : "unknown"));
    }

    // Unhide Article
    @PostMapping("/articles/{articleId}/unhide")
    public ResponseEntity<ArticleDTO> unhideArticle(
            @PathVariable UUID articleId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        return ResponseEntity.ok(adminService.unhideArticle(articleId, admin.getId(), email, ipAddress != null ? ipAddress : "unknown"));
    }

    // Delete Article (hard delete)
    @DeleteMapping("/articles/{articleId}")
    public ResponseEntity<Void> deleteArticle(
            @PathVariable UUID articleId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }
        
        adminService.deleteArticle(articleId, admin.getId(), email, reason, ipAddress != null ? ipAddress : "unknown");
        return ResponseEntity.ok().build();
    }

    // Delete User (hard delete)
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        adminService.deleteUser(userId, admin.getId(), email, ipAddress != null ? ipAddress : "unknown");
        return ResponseEntity.ok().build();
    }

    // Get Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getAuditLogs(pageable));
    }

    // Company Management
    @GetMapping("/companies")
    public ResponseEntity<Page<vn.careermate.common.dto.CompanyDTO>> getAllCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getAllCompanies(keyword, pageable));
    }

    @PutMapping("/companies/{companyId}/verify")
    public ResponseEntity<vn.careermate.common.dto.CompanyDTO> verifyCompany(
            @PathVariable UUID companyId,
            @RequestParam boolean verified,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        return ResponseEntity.ok(adminService.verifyCompany(companyId, verified, admin.getId(), email, ipAddress != null ? ipAddress : "unknown"));
    }

    @DeleteMapping("/companies/{companyId}")
    public ResponseEntity<Void> deleteCompany(
            @PathVariable UUID companyId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO admin = userServiceClient.getUserByEmail(email);
        if (admin == null) {
            throw new RuntimeException("Admin not found");
        }
        
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }
        
        adminService.deleteCompany(companyId, admin.getId(), email, reason, ipAddress != null ? ipAddress : "unknown");
        return ResponseEntity.ok().build();
    }
}
