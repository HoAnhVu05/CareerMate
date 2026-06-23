package vn.careermate.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.notificationservice.model.Notification;
import vn.careermate.notificationservice.repository.NotificationRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserServiceClient userServiceClient; // Replaced UserRepository with Feign Client

    @Transactional
    public Notification createNotification(UUID userId, String title, String message, 
                                          Notification.NotificationType type, 
                                          String linkUrl, String relatedEntityType, UUID relatedEntityId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .status(Notification.NotificationStatus.UNREAD)
                .linkUrl(linkUrl)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build();
        
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndStatus(userId, Notification.NotificationStatus.UNREAD);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.markAsRead(notificationId, Notification.NotificationStatus.READ);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(
            userId, 
            Notification.NotificationStatus.READ, 
            Notification.NotificationStatus.UNREAD
        );
    }

    // Helper methods for creating specific notification types
    @Transactional
    public Notification notifyArticleApproved(UUID userId, UUID articleId, String articleTitle) {
        return createNotification(
            userId,
            "Bài viết đã được duyệt",
            String.format("Bài viết '%s' của bạn đã được admin duyệt và đã được xuất bản.", articleTitle),
            Notification.NotificationType.ARTICLE_APPROVED,
            "/recruiter/articles",
            "ARTICLE",
            articleId
        );
    }

    @Transactional
    public Notification notifyArticleRejected(UUID userId, UUID articleId, String articleTitle) {
        return createNotification(
            userId,
            "Bài viết bị từ chối",
            String.format("Bài viết '%s' của bạn đã bị admin từ chối.", articleTitle),
            Notification.NotificationType.ARTICLE_REJECTED,
            "/recruiter/articles",
            "ARTICLE",
            articleId
        );
    }

    @Transactional
    public Notification notifyJobApproved(UUID userId, UUID jobId, String jobTitle) {
        return createNotification(
            userId,
            "Tin tuyển dụng đã được duyệt",
            String.format("Tin tuyển dụng '%s' của bạn đã được admin duyệt và đã được xuất bản.", jobTitle),
            Notification.NotificationType.JOB_APPROVED,
            "/recruiter/jobs",
            "JOB",
            jobId
        );
    }

    @Transactional
    public Notification notifyJobRejected(UUID userId, UUID jobId, String jobTitle) {
        return createNotification(
            userId,
            "Tin tuyển dụng bị từ chối",
            String.format("Tin tuyển dụng '%s' của bạn đã bị admin từ chối.", jobTitle),
            Notification.NotificationType.JOB_REJECTED,
            "/recruiter/jobs",
            "JOB",
            jobId
        );
    }

    @Transactional
    public Notification notifyNewApplication(UUID userId, UUID applicationId, String jobTitle, String studentName) {
        return createNotification(
            userId,
            "Có ứng viên mới",
            String.format("%s đã ứng tuyển vào vị trí '%s'.", studentName, jobTitle),
            Notification.NotificationType.NEW_APPLICATION,
            "/recruiter/applicants",
            "APPLICATION",
            applicationId
        );
    }

    @Transactional
    public Notification notifyApplicationStatusChanged(UUID userId, UUID applicationId, String jobTitle, String status) {
        return createNotification(
            userId,
            "Trạng thái ứng tuyển đã thay đổi",
            String.format("Trạng thái ứng tuyển của bạn cho vị trí '%s' đã được cập nhật thành '%s'.", jobTitle, status),
            Notification.NotificationType.APPLICATION_STATUS_CHANGED,
            "/student/applications",
            "APPLICATION",
            applicationId
        );
    }

    @Transactional
    public Notification notifyInterviewScheduled(UUID userId, UUID applicationId, String jobTitle, String interviewTime) {
        return createNotification(
            userId,
            "Đã lên lịch phỏng vấn",
            String.format("Bạn đã được lên lịch phỏng vấn cho vị trí '%s' vào lúc %s.", jobTitle, interviewTime),
            Notification.NotificationType.INTERVIEW_SCHEDULED,
            "/student/applications",
            "APPLICATION",
            applicationId
        );
    }

    @Transactional
    public Notification notifyNewComment(UUID userId, UUID articleId, String articleTitle, String commenterName) {
        return createNotification(
            userId,
            "Có bình luận mới",
            String.format("%s đã bình luận trên bài viết '%s' của bạn.", commenterName, articleTitle),
            Notification.NotificationType.NEW_COMMENT,
            String.format("/articles/%s", articleId),
            "ARTICLE",
            articleId
        );
    }

    /**
     * Gửi thông báo cho tất cả STUDENT và RECRUITER khi admin đăng bài viết mới
     */
    @Transactional
    public void notifyAllUsersAboutNewArticle(UUID articleId, String articleTitle) {
        try {
            // Fetch users via Feign Client
            List<UserDTO> users = userServiceClient.getUsersByRoles(List.of("STUDENT", "RECRUITER"));
            
            log.info("Sending new article notification to {} users", users.size());
            
            for (UserDTO user : users) {
                createNotification(
                    user.getId(),
                    "Bài viết mới",
                    String.format("Admin đã đăng bài viết mới: '%s'. Hãy xem ngay!", articleTitle),
                    Notification.NotificationType.ARTICLE_APPROVED,
                    String.format("/articles/%s", articleId),
                    "ARTICLE",
                    articleId
                );
            }
            
            log.info("Successfully sent new article notifications to {} users", users.size());
        } catch (Exception e) {
            log.error("Error sending new article notifications: {}", e.getMessage(), e);
            // Không throw exception để không làm fail việc tạo article
        }
    }

    /**
     * Gửi thông báo cho tất cả ADMIN khi có bài viết mới cần duyệt
     */
    @Transactional
    public void notifyAdminsAboutPendingArticle(UUID articleId, String articleTitle, String authorName) {
        try {
            // Fetch admins via Feign Client
            List<UserDTO> admins = userServiceClient.getUsersByRoles(List.of("ADMIN"));
            
            log.info("Sending pending article notification to {} admins", admins.size());
            
            for (UserDTO admin : admins) {
                createNotification(
                    admin.getId(),
                    "Bài viết mới cần duyệt",
                    String.format("Bài viết '%s' của %s đang chờ duyệt.", articleTitle, authorName),
                    Notification.NotificationType.ARTICLE_PENDING,
                    "/admin/articles?status=PENDING",
                    "ARTICLE",
                    articleId
                );
            }
            
            log.info("Successfully sent pending article notifications to {} admins", admins.size());
        } catch (Exception e) {
            log.error("Error sending pending article notifications: {}", e.getMessage(), e);
        }
    }

    /**
     * Gửi thông báo cho tất cả ADMIN khi có job mới cần duyệt
     */
    @Transactional
    public void notifyAdminsAboutPendingJob(UUID jobId, String jobTitle, String recruiterName) {
        try {
            // Fetch admins via Feign Client
            List<UserDTO> admins = userServiceClient.getUsersByRoles(List.of("ADMIN"));
            
            log.info("Sending pending job notification to {} admins", admins.size());
            
            for (UserDTO admin : admins) {
                createNotification(
                    admin.getId(),
                    "Tin tuyển dụng mới cần duyệt",
                    String.format("Tin tuyển dụng '%s' của %s đang chờ duyệt.", jobTitle, recruiterName),
                    Notification.NotificationType.JOB_PENDING,
                    "/admin/jobs?status=PENDING",
                    "JOB",
                    jobId
                );
            }
            
            log.info("Successfully sent pending job notifications to {} admins", admins.size());
        } catch (Exception e) {
            log.error("Error sending pending job notifications: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public Notification notifyNewMessage(UUID userId, UUID conversationId, String senderName, String messagePreview) {
        return createNotification(
            userId,
            "Tin nhắn mới từ " + senderName,
            messagePreview.length() > 100 ? messagePreview.substring(0, 100) + "..." : messagePreview,
            Notification.NotificationType.NEW_MESSAGE,
            "/messages?conversationId=" + conversationId,
            "conversation",
            conversationId
        );
    }

    @Transactional
    public Notification notifyJobHidden(UUID userId, UUID jobId, String jobTitle, String reason) {
        return createNotification(
            userId,
            "Tin tuyển dụng đã bị ẩn",
            String.format("Tin tuyển dụng '%s' của bạn đã bị admin ẩn. Lý do: %s", jobTitle, reason),
            Notification.NotificationType.JOB_HIDDEN,
            "/recruiter/jobs",
            "JOB",
            jobId
        );
    }

    @Transactional
    public Notification notifyJobUnhidden(UUID userId, UUID jobId, String jobTitle) {
        return createNotification(
            userId,
            "Tin tuyển dụng đã được hiện lại",
            String.format("Tin tuyển dụng '%s' của bạn đã được admin hiện lại.", jobTitle),
            Notification.NotificationType.JOB_UNHIDDEN,
            "/recruiter/jobs",
            "JOB",
            jobId
        );
    }

    @Transactional
    public Notification notifyJobDeleted(UUID userId, UUID jobId, String jobTitle, String reason) {
        return createNotification(
            userId,
            "Tin tuyển dụng đã bị xóa",
            String.format("Tin tuyển dụng '%s' của bạn đã bị admin xóa vĩnh viễn. Lý do: %s", jobTitle, reason),
            Notification.NotificationType.JOB_DELETED,
            "/recruiter/jobs",
            "JOB",
            jobId
        );
    }

    @Transactional
    public Notification notifyArticleHidden(UUID userId, UUID articleId, String articleTitle, String reason) {
        return createNotification(
            userId,
            "Bài viết đã bị ẩn",
            String.format("Bài viết '%s' của bạn đã bị admin ẩn. Lý do: %s", articleTitle, reason),
            Notification.NotificationType.ARTICLE_HIDDEN,
            "/recruiter/articles",
            "ARTICLE",
            articleId
        );
    }

    @Transactional
    public Notification notifyArticleUnhidden(UUID userId, UUID articleId, String articleTitle) {
        return createNotification(
            userId,
            "Bài viết đã được hiện lại",
            String.format("Bài viết '%s' của bạn đã được admin hiện lại.", articleTitle),
            Notification.NotificationType.ARTICLE_UNHIDDEN,
            "/recruiter/articles",
            "ARTICLE",
            articleId
        );
    }

    @Transactional
    public Notification notifyArticleDeleted(UUID userId, UUID articleId, String articleTitle, String reason) {
        return createNotification(
            userId,
            "Bài viết đã bị xóa",
            String.format("Bài viết '%s' của bạn đã bị admin xóa vĩnh viễn. Lý do: %s", articleTitle, reason),
            Notification.NotificationType.ARTICLE_DELETED,
            "/recruiter/articles",
            "ARTICLE",
            articleId
        );
    }
}
