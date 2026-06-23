package vn.careermate.adminservice.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.adminservice.dto.AdminAnalytics;
import vn.careermate.adminservice.dto.AdminDashboardStats;
import vn.careermate.adminservice.model.AuditLog;
import vn.careermate.adminservice.repository.AuditLogRepository;
import vn.careermate.common.client.*;
import vn.careermate.common.dto.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AuditLogRepository auditLogRepository;
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            log.info("Checking and dropping audit_logs check constraints if they exist...");
            jdbcTemplate.execute("ALTER TABLE adminservice.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_type_check");
            jdbcTemplate.execute("ALTER TABLE adminservice.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_type_check");
            log.info("Audit log constraints dropped successfully (if they existed).");
        } catch (Exception e) {
            log.warn("Could not drop audit log constraints: {}. This might be expected if they don't exist.", e.getMessage());
        }
    }
    private final UserServiceClient userServiceClient;
    private final JobServiceClient jobServiceClient;
    private final ContentServiceClient contentServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final LearningServiceClient learningServiceClient;

    public AdminDashboardStats getDashboardStats() {
        try {
            // Get user counts
            List<UserDTO> allUsers = userServiceClient.getUsersByRoles(Arrays.asList("STUDENT", "RECRUITER", "ADMIN"));
            long totalUsers = allUsers.size();
            long totalStudents = allUsers.stream().filter(u -> "STUDENT".equals(u.getRole())).count();
            long totalRecruiters = allUsers.stream().filter(u -> "RECRUITER".equals(u.getRole())).count();
            long totalAdmins = allUsers.stream().filter(u -> "ADMIN".equals(u.getRole())).count();

            // Get job counts
            Long totalJobs = jobServiceClient.getJobCount(null, null);
            Long pendingJobs = jobServiceClient.getJobCount("PENDING", null);
            Long activeJobs = jobServiceClient.getJobCount("ACTIVE", null);

            // Get application count
            Long totalApplications = jobServiceClient.getApplicationCount(null);

            // Get company count
            Long totalCompanies = contentServiceClient.getCompanyCount(null);

            // Get article counts
            Long totalArticles = contentServiceClient.getArticleCount(null, null);
            Long pendingArticles = contentServiceClient.getArticleCount("PENDING", null);
            Long publishedArticles = contentServiceClient.getArticleCount("PUBLISHED", null);

            // Growth calculation (Current vs 30 days ago)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

            // Users growth
            long users30DaysAgo = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isBefore(thirtyDaysAgo))
                .count();
            double userGrowth = calculateGrowth(totalUsers, users30DaysAgo);

            // Jobs growth
            Long totalJobs30DaysAgo = jobServiceClient.getJobCount(null, thirtyDaysAgo);
            double jobGrowth = calculateGrowth(totalJobs != null ? totalJobs : 0L, totalJobs30DaysAgo != null ? totalJobs30DaysAgo : 0L);

            // Applications growth
            Long totalApplications30DaysAgo = jobServiceClient.getApplicationCount(thirtyDaysAgo);
            double applicationGrowth = calculateGrowth(totalApplications != null ? totalApplications : 0L, totalApplications30DaysAgo != null ? totalApplications30DaysAgo : 0L);

            // Companies growth
            Long totalCompanies30DaysAgo = contentServiceClient.getCompanyCount(thirtyDaysAgo);
            double companyGrowth = calculateGrowth(totalCompanies != null ? totalCompanies : 0L, totalCompanies30DaysAgo != null ? totalCompanies30DaysAgo : 0L);

            // Articles growth
            Long totalArticles30DaysAgo = contentServiceClient.getArticleCount(null, thirtyDaysAgo);
            double articleGrowth = calculateGrowth(totalArticles != null ? totalArticles : 0L, totalArticles30DaysAgo != null ? totalArticles30DaysAgo : 0L);

            return AdminDashboardStats.builder()
                    .totalUsers(totalUsers)
                    .totalStudents(totalStudents)
                    .totalRecruiters(totalRecruiters)
                    .totalAdmins(totalAdmins)
                    .totalJobs(totalJobs != null ? totalJobs : 0L)
                    .pendingJobs(pendingJobs != null ? pendingJobs : 0L)
                    .activeJobs(activeJobs != null ? activeJobs : 0L)
                    .totalApplications(totalApplications != null ? totalApplications : 0L)
                    .totalCompanies(totalCompanies != null ? totalCompanies : 0L)
                    .totalArticles(totalArticles != null ? totalArticles : 0L)
                    .pendingArticles(pendingArticles != null ? pendingArticles : 0L)
                    .publishedArticles(publishedArticles != null ? publishedArticles : 0L)
                    .userGrowthPercentage(userGrowth)
                    .jobGrowthPercentage(jobGrowth)
                    .articleGrowthPercentage(articleGrowth)
                    .applicationGrowthPercentage(applicationGrowth)
                    .companyGrowthPercentage(companyGrowth)
                    .build();
        } catch (Throwable e) {
            log.error("Error getting dashboard stats: {}", e.getMessage(), e);
            // Return empty stats on error
        return AdminDashboardStats.builder()
                    .totalUsers(0L)
                    .totalStudents(0L)
                    .totalRecruiters(0L)
                    .totalAdmins(0L)
                    .totalJobs(0L)
                    .pendingJobs(0L)
                    .activeJobs(0L)
                    .totalApplications(0L)
                    .totalCompanies(0L)
                    .totalArticles(0L)
                    .pendingArticles(0L)
                    .publishedArticles(0L)
                .build();
        }
    }

    public Page<UserDTO> getAllUsers(Pageable pageable) {
        try {
            List<UserDTO> allUsers = userServiceClient.getUsersByRoles(Arrays.asList("STUDENT", "RECRUITER", "ADMIN"));
            // Simple pagination
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allUsers.size());
            List<UserDTO> pageContent = start < allUsers.size() ? allUsers.subList(start, end) : Collections.emptyList();
            return new PageImpl<>(pageContent, pageable, allUsers.size());
        } catch (Exception e) {
            log.error("Error getting all users: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    public Page<UserDTO> getUsersByRole(String role, Pageable pageable) {
        try {
            List<UserDTO> users = userServiceClient.getUsersByRoles(Collections.singletonList(role));
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), users.size());
            List<UserDTO> pageContent = start < users.size() ? users.subList(start, end) : Collections.emptyList();
            return new PageImpl<>(pageContent, pageable, users.size());
        } catch (Exception e) {
            log.error("Error getting users by role: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    @Transactional
    public UserDTO updateUserStatus(UUID userId, String status) {
        try {
            return userServiceClient.updateUserStatus(userId, status);
        } catch (Exception e) {
            log.error("Error updating user status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update user status: " + e.getMessage());
        }
    }

    @Transactional
    public JobDTO approveJob(UUID jobId, UUID adminId) {
        try {
            JobDTO job = jobServiceClient.approveJob(jobId, adminId);
            
            // Send notification
            try {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(job.getRecruiterId()) // TODO: Get recruiter user ID from job
                        .type("JOB_APPROVED")
                        .title("Job Approved")
                        .message("Your job '" + job.getTitle() + "' has been approved")
                        .relatedEntityId(jobId)
                        .relatedEntityType("JOB")
                        .build();
                notificationServiceClient.createNotification(request);
        } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
        }
        
        return job;
        } catch (Exception e) {
            log.error("Error approving job: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to approve job: " + e.getMessage());
        }
    }

    @Transactional
    public JobDTO rejectJob(UUID jobId, UUID adminId) {
        try {
            JobDTO job = jobServiceClient.rejectJob(jobId, adminId);
            
            // Send notification
            try {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(job.getRecruiterId()) // TODO: Get recruiter user ID from job
                        .type("JOB_REJECTED")
                        .title("Job Rejected")
                        .message("Your job '" + job.getTitle() + "' has been rejected")
                        .relatedEntityId(jobId)
                        .relatedEntityType("JOB")
                        .build();
                notificationServiceClient.createNotification(request);
        } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
        }
        
        return job;
        } catch (Exception e) {
            log.error("Error rejecting job: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to reject job: " + e.getMessage());
        }
    }

    public Page<JobDTO> getPendingJobs(Pageable pageable) {
        try {
            return jobServiceClient.getPendingJobs(pageable.getPageNumber(), pageable.getPageSize());
        } catch (Exception e) {
            log.error("Error getting pending jobs: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    public Page<JobDTO> getAllJobs(Pageable pageable) {
        try {
            return jobServiceClient.getAllJobs(null, pageable.getPageNumber(), pageable.getPageSize());
        } catch (Exception e) {
            log.error("Error getting all jobs: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    public Page<JobDTO> getJobsByStatus(String status, Pageable pageable) {
        try {
            return jobServiceClient.getAllJobs(status, pageable.getPageNumber(), pageable.getPageSize());
        } catch (Exception e) {
            log.error("Error getting jobs by status: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    public Page<ArticleDTO> getPendingArticles(Pageable pageable) {
        try {
            return contentServiceClient.getPendingArticles(pageable.getPageNumber(), pageable.getPageSize());
        } catch (Exception e) {
            log.error("Error getting pending articles: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    public Page<ArticleDTO> getAllArticles(String status, Pageable pageable) {
        try {
            return contentServiceClient.getAllArticles(status, pageable.getPageNumber(), pageable.getPageSize());
        } catch (Exception e) {
            log.error("Error getting all articles: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    @Transactional
    public ArticleDTO approveArticle(UUID articleId) {
        try {
            // No need to pass adminId, content-service will extract from token
            return contentServiceClient.approveArticle(articleId, null); 
        } catch (Exception e) {
            log.error("Error approving article: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to approve article: " + e.getMessage());
        }
    }

    @Transactional
    public ArticleDTO rejectArticle(UUID articleId) {
        try {
            return contentServiceClient.rejectArticle(articleId, null);
        } catch (Exception e) {
            log.error("Error rejecting article: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to reject article: " + e.getMessage());
        }
    }

    public AdminAnalytics getAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last30Days = now.minusDays(30);
        LocalDateTime last7Days = now.minusDays(7);

        try {
        // User analytics
            List<UserDTO> allUsers = userServiceClient.getUsersByRoles(Arrays.asList("STUDENT", "RECRUITER", "ADMIN"));
            long newUsersLast30Days = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(last30Days))
                .count();
            long newUsersLast7Days = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(last7Days))
                .count();
        
            Map<String, Long> usersByRole = allUsers.stream()
                    .collect(Collectors.groupingBy(UserDTO::getRole, Collectors.counting()));

            // Job analytics (simplified - would need more endpoints for full analytics)
            long newJobsLast30Days = 0L; // TODO: Implement when endpoint available
            long newJobsLast7Days = 0L; // TODO: Implement when endpoint available
        
            Map<String, Long> jobsByStatus = new HashMap<>();
            jobsByStatus.put("PENDING", jobServiceClient.getJobCount("PENDING", null) != null ? jobServiceClient.getJobCount("PENDING", null) : 0L);
            jobsByStatus.put("ACTIVE", jobServiceClient.getJobCount("ACTIVE", null) != null ? jobServiceClient.getJobCount("ACTIVE", null) : 0L);

            // Application analytics (TODO: Add endpoints)
            long newApplicationsLast30Days = 0L;
            long newApplicationsLast7Days = 0L;

            // Top skills (TODO: Add endpoint to get top skills)
        List<AdminAnalytics.SkillDemand> topSkills = new ArrayList<>();

        return AdminAnalytics.builder()
                .newUsersLast30Days(newUsersLast30Days)
                .newUsersLast7Days(newUsersLast7Days)
                .usersByRole(usersByRole)
                .newJobsLast30Days(newJobsLast30Days)
                .newJobsLast7Days(newJobsLast7Days)
                .jobsByStatus(jobsByStatus)
                .newApplicationsLast30Days(newApplicationsLast30Days)
                .newApplicationsLast7Days(newApplicationsLast7Days)
                .topSkillsInDemand(topSkills)
                    .applicationTrafficLast30Days(new ArrayList<>())
                    .build();
        } catch (Exception e) {
            log.error("Error getting analytics: {}", e.getMessage(), e);
            return AdminAnalytics.builder()
                    .newUsersLast30Days(0L)
                    .newUsersLast7Days(0L)
                    .usersByRole(new HashMap<>())
                    .newJobsLast30Days(0L)
                    .newJobsLast7Days(0L)
                    .jobsByStatus(new HashMap<>())
                    .newApplicationsLast30Days(0L)
                    .newApplicationsLast7Days(0L)
                    .topSkillsInDemand(new ArrayList<>())
                    .applicationTrafficLast30Days(new ArrayList<>())
                .build();
        }
    }

    @Transactional
    public JobDTO hideJob(UUID jobId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        try {
            JobDTO job = jobServiceClient.hideJob(jobId, adminId, reason);
            
            // Send notification
            try {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(job.getRecruiterId()) // TODO: Get recruiter user ID
                        .type("JOB_HIDDEN")
                        .title("Job Hidden")
                        .message("Your job '" + job.getTitle() + "' has been hidden. Reason: " + reason)
                        .relatedEntityId(jobId)
                        .relatedEntityType("JOB")
                        .build();
                notificationServiceClient.createNotification(request);
            } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
            }
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.HIDE,
                    AuditLog.EntityType.JOB, jobId, job.getTitle(),
                    "Admin hid job: " + job.getTitle() + ". Reason: " + reason, ipAddress);
            
            return job;
        } catch (Exception e) {
            log.error("Error hiding job: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to hide job: " + e.getMessage());
        }
    }

    @Transactional
    public JobDTO unhideJob(UUID jobId, UUID adminId, String adminEmail, String ipAddress) {
        try {
            JobDTO job = jobServiceClient.unhideJob(jobId, adminId);
            
            // Send notification
            try {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(job.getRecruiterId()) // TODO: Get recruiter user ID
                        .type("JOB_UNHIDDEN")
                        .title("Job Unhidden")
                        .message("Your job '" + job.getTitle() + "' has been unhidden")
                        .relatedEntityId(jobId)
                        .relatedEntityType("JOB")
                        .build();
                notificationServiceClient.createNotification(request);
            } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
            }
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.UNHIDE,
                    AuditLog.EntityType.JOB, jobId, job.getTitle(),
                    "Admin unhid job: " + job.getTitle(), ipAddress);
            
            return job;
        } catch (Exception e) {
            log.error("Error unhiding job: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to unhide job: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteJob(UUID jobId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        try {
            jobServiceClient.deleteJob(jobId, adminId, reason);
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                    AuditLog.EntityType.JOB, jobId, "Job " + jobId,
                    "Admin deleted job. Reason: " + reason, ipAddress);
        } catch (Exception e) {
            log.error("Error deleting job: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete job: " + e.getMessage());
        }
    }

    @Transactional
    public ArticleDTO hideArticle(UUID articleId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        try {
            ArticleDTO article = contentServiceClient.hideArticle(articleId, adminId, reason);
            
            // Send notification
            try {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(article.getAuthorId())
                        .type("ARTICLE_HIDDEN")
                        .title("Article Hidden")
                        .message("Your article '" + article.getTitle() + "' has been hidden. Reason: " + reason)
                        .relatedEntityId(articleId)
                        .relatedEntityType("ARTICLE")
                        .build();
                notificationServiceClient.createNotification(request);
            } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
            }
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.HIDE,
                    AuditLog.EntityType.ARTICLE, articleId, article.getTitle(),
                    "Admin hid article: " + article.getTitle() + ". Reason: " + reason, ipAddress);
            
            return article;
        } catch (Exception e) {
            log.error("Error hiding article: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to hide article: " + e.getMessage());
        }
    }

    @Transactional
    public ArticleDTO unhideArticle(UUID articleId, UUID adminId, String adminEmail, String ipAddress) {
        try {
            ArticleDTO article = contentServiceClient.unhideArticle(articleId, adminId);
            
            // Send notification
            try {
                NotificationRequest request = NotificationRequest.builder()
                        .userId(article.getAuthorId())
                        .type("ARTICLE_UNHIDDEN")
                        .title("Article Unhidden")
                        .message("Your article '" + article.getTitle() + "' has been unhidden")
                        .relatedEntityId(articleId)
                        .relatedEntityType("ARTICLE")
                        .build();
                notificationServiceClient.createNotification(request);
            } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
            }
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.UNHIDE,
                    AuditLog.EntityType.ARTICLE, articleId, article.getTitle(),
                    "Admin unhid article: " + article.getTitle(), ipAddress);
            
            return article;
        } catch (Exception e) {
            log.error("Error unhiding article: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to unhide article: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteArticle(UUID articleId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        try {
            contentServiceClient.deleteArticle(articleId, adminId, reason);
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                    AuditLog.EntityType.ARTICLE, articleId, "Article " + articleId,
                    "Admin deleted article. Reason: " + reason, ipAddress);
        } catch (Exception e) {
            log.error("Error deleting article: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete article: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteUser(UUID userId, UUID adminId, String adminEmail, String ipAddress) {
        try {
            UserDTO user = userServiceClient.getUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            String userName = user.getFullName() != null ? user.getFullName() : user.getEmail();
            
            // CASCADE DELETE: If user is a RECRUITER, delete all their content
            if ("RECRUITER".equals(user.getRole())) {
                try {
                    RecruiterProfileDTO recruiterProfile = userServiceClient.getRecruiterProfileByUserId(userId);
                    if (recruiterProfile != null) {
                        
                        // 1. Delete all JOBS by this recruiter
                        try {
                            List<JobDTO> recruiterJobs = jobServiceClient.getJobsByRecruiter(recruiterProfile.getId());
                            log.info("Deleting {} jobs for recruiter {}", recruiterJobs.size(), userId);
                            
                            for (JobDTO job : recruiterJobs) {
                                jobServiceClient.deleteJob(job.getId(), adminId, "Cascade deletion from recruiter removal");
                            }
                            
                            createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                                    AuditLog.EntityType.JOB, null, recruiterJobs.size() + " jobs",
                                    "Deleted jobs (cascade from recruiter deletion)", ipAddress);
                        } catch (Exception e) {
                            log.warn("Could not delete jobs for recruiter {}: {}", userId, e.getMessage());
                        }
                        
                        // 2. Delete all ARTICLES by this recruiter
                        try {
                            // ContentService doesn't have getArticlesByAuthor, so we skip for now
                            // TODO: Add this functionality later if needed
                            log.info("Article deletion not implemented - skipping");
                        } catch (Exception e) {
                            log.warn("Could not delete articles for recruiter {}: {}", userId, e.getMessage());
                        }
                        
                        // 3. Delete COMPANY
                        if (recruiterProfile.getCompanyId() != null) {
                            UUID companyId = recruiterProfile.getCompanyId();
                            log.info("Deleting company {} before deleting recruiter {}", companyId, userId);
                            contentServiceClient.deleteCompany(companyId);
                            
                            createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                                    AuditLog.EntityType.COMPANY, companyId, "Company of " + userName,
                                    "Deleted company (cascade from recruiter deletion)", ipAddress);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error during cascade delete for recruiter {}: {}", userId, e.getMessage());
                    // Continue with user deletion even if cascade delete fails
                }
            }
            
            // Delete the user
            userServiceClient.deleteUser(userId);

            // Create audit log for user deletion
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                    AuditLog.EntityType.USER, userId, userName,
                    "Admin deleted user: " + userName + " (Role: " + user.getRole() + ")", ipAddress);
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<AuditLog> getAuditLogsByAdmin(UUID adminId, Pageable pageable) {
        return auditLogRepository.findByAdminIdOrderByCreatedAtDesc(adminId, pageable);
    }

    public Page<AuditLog> getAuditLogsByEntity(AuditLog.EntityType entityType, UUID entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable);
    }

    public Page<CompanyDTO> getAllCompanies(String keyword, Pageable pageable) {
        try {
            return contentServiceClient.getAllCompanies(pageable.getPageNumber(), pageable.getPageSize(), keyword);
        } catch (Exception e) {
            log.error("Error getting all companies: {}", e.getMessage(), e);
            return Page.empty(pageable);
        }
    }

    @Transactional
    public void deleteCompany(UUID companyId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        try {
            contentServiceClient.deleteCompany(companyId);
            
            // Create audit log
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                    AuditLog.EntityType.COMPANY, companyId, "Company " + companyId,
                    "Admin deleted company. Reason: " + reason, ipAddress);
        } catch (Exception e) {
            log.error("Error deleting company: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete company: " + e.getMessage());
        }
    }

    @Transactional
    public CompanyDTO verifyCompany(UUID companyId, boolean verified, UUID adminId, String adminEmail, String ipAddress) {
        try {
            CompanyDTO company = contentServiceClient.verifyCompany(companyId, verified);
            
            // Create audit log
            createAuditLog(adminId, adminEmail, verified ? AuditLog.ActionType.APPROVE : AuditLog.ActionType.REJECT,
                    AuditLog.EntityType.COMPANY, companyId, company.getName(),
                    "Admin " + (verified ? "verified" : "unverified") + " company: " + company.getName(), ipAddress);
            
            return company;
        } catch (Exception e) {
            log.error("Error verifying company: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to verify company: " + e.getMessage());
        }
    }

    private void createAuditLog(UUID adminId, String adminEmail, AuditLog.ActionType actionType,
                                AuditLog.EntityType entityType, UUID entityId, String entityName,
                                String description, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .adminId(adminId)
                    .adminEmail(adminEmail)
                    .actionType(actionType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityName(entityName)
                    .description(description)
                    .ipAddress(ipAddress)
                    .createdAt(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Error creating audit log: {}", e.getMessage(), e);
        }
    }

    private double calculateGrowth(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }
}
