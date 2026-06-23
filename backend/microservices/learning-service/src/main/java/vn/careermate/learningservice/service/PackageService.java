package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.Package;
import vn.careermate.learningservice.model.Subscription;
import vn.careermate.learningservice.repository.PackageRepository;
import vn.careermate.learningservice.repository.SubscriptionRepository;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.NotificationServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.NotificationRequest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    public Optional<Subscription> getCurrentSubscription(UUID userId) {
        // Use JOIN FETCH to avoid LazyInitializationException
        List<Subscription> allSubs = subscriptionRepository.findByUserIdWithPackage(userId);
        
        // Check for APPROVED subscriptions first
        Optional<Subscription> approvedActive = allSubs.stream()
                .filter(sub -> sub.getStatus() == Subscription.SubscriptionStatus.APPROVED)
                .filter(sub -> sub.getEndDate().isAfter(java.time.LocalDateTime.now()))
                .findFirst();
        
        if (approvedActive.isPresent()) {
            return approvedActive;
        }
        
        // Fallback to ACTIVE status
        return allSubs.stream()
                .filter(sub -> sub.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
                .filter(sub -> sub.getEndDate().isAfter(java.time.LocalDateTime.now()))
                .findFirst();
    }

    public Optional<Subscription> getMyCurrentSubscription() {
        try {
            UUID userId = getCurrentUserId();
            return getCurrentSubscription(userId);
        } catch (RuntimeException e) {
            // If user not found or not authenticated, return empty
            return Optional.empty();
        }
    }

    @Transactional
    public Subscription requestSubscription(UUID packageId) {
        Package packageEntity = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        UUID userId = getCurrentUserId();
        
        // Check if user already has a pending subscription for this package
        List<Subscription> pendingSubs = subscriptionRepository.findByUserIdAndStatus(
            userId, 
            Subscription.SubscriptionStatus.PENDING
        );
        for (Subscription sub : pendingSubs) {
            if (sub.getPackageEntity().getId().equals(packageId)) {
                throw new RuntimeException("Bạn đã có yêu cầu đăng ký gói này đang chờ duyệt");
            }
        }

        // Create new subscription with PENDING status (waiting for admin approval)
        LocalDateTime now = LocalDateTime.now();
        Subscription subscription = Subscription.builder()
                .userId(userId) // Use UUID instead of entity
                .packageEntity(packageEntity)
                .status(Subscription.SubscriptionStatus.PENDING)
                .startDate(now) // Will be updated when approved
                .endDate(now.plusDays(packageEntity.getDurationDays())) // Will be updated when approved
                .build();

        subscription = subscriptionRepository.save(subscription);
        
        // Notify all admins about new subscription request
        notifyAdminsAboutSubscriptionRequest(subscription, userId, packageEntity);
        
        log.info("Subscription request created: {} for user: {} and package: {}", 
            subscription.getId(), userId, packageId);
        
        return subscription;
    }
    
    @Transactional
    public Subscription approveSubscription(UUID subscriptionId, UUID adminId) {
        // Use query with JOIN FETCH to eagerly load user and package
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        
        if (subscription.getStatus() != Subscription.SubscriptionStatus.PENDING) {
            throw new RuntimeException("Subscription is not in PENDING status");
        }
        
        // Get user info via Feign Client
        UUID userId = subscription.getUserId();
        UserDTO user;
        try {
            user = userServiceClient.getUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found in subscription");
            }
        } catch (Exception e) {
            log.error("Error fetching user: {}", e.getMessage());
            throw new RuntimeException("User not found in subscription");
        }
        
        Package packageEntity = subscription.getPackageEntity();
        if (packageEntity != null) {
            packageEntity.getId();
            packageEntity.getName();
            packageEntity.getDurationDays();
        } else {
            throw new RuntimeException("Package not found in subscription");
        }
        
        // Cancel existing active/approved subscriptions for this user
        subscriptionRepository.findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.APPROVED)
                .forEach(sub -> {
                    sub.setStatus(Subscription.SubscriptionStatus.CANCELLED);
                    subscriptionRepository.save(sub);
                });
        
        // Update subscription to APPROVED and set proper dates
        LocalDateTime now = LocalDateTime.now();
        subscription.setStatus(Subscription.SubscriptionStatus.APPROVED);
        subscription.setStartDate(now);
        subscription.setEndDate(now.plusDays(packageEntity.getDurationDays()));
        
        subscription = subscriptionRepository.save(subscription);
        
        // Flush to ensure changes are persisted before notification
        subscriptionRepository.flush();
        
        // Notify user about approval
        try {
            notificationServiceClient.createNotification(NotificationRequest.builder()
                .userId(userId)
                .type("SUBSCRIPTION_APPROVED")
                .title("Đăng ký gói dịch vụ thành công")
                .message(String.format("Yêu cầu đăng ký gói '%s' của bạn đã được duyệt. Gói dịch vụ sẽ có hiệu lực từ %s đến %s.",
                    packageEntity.getName(),
                    now.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    subscription.getEndDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))))
                .relatedEntityId(subscriptionId)
                .relatedEntityType("SUBSCRIPTION")
                .build());
        } catch (Exception e) {
            log.error("Error creating notification for subscription approval: {}", e.getMessage(), e);
            // Don't fail the approval if notification fails
        }
        
        // Package entity is already loaded
        subscription.getPackageEntity().getId();
        subscription.getPackageEntity().getName();
        
        log.info("Subscription approved: {} by admin: {}", subscriptionId, adminId);
        
        return subscription;
    }
    
    @Transactional
    public Subscription rejectSubscription(UUID subscriptionId, UUID adminId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        
        if (subscription.getStatus() != Subscription.SubscriptionStatus.PENDING) {
            throw new RuntimeException("Subscription is not in PENDING status");
        }
        
        // Get user info via Feign Client
        UUID userId = subscription.getUserId();
        UserDTO user;
        try {
            user = userServiceClient.getUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found in subscription");
            }
        } catch (Exception e) {
            log.error("Error fetching user: {}", e.getMessage());
            throw new RuntimeException("User not found in subscription");
        }
        
        Package packageEntity = subscription.getPackageEntity();
        if (packageEntity != null) {
            packageEntity.getId();
            packageEntity.getName();
        } else {
            throw new RuntimeException("Package not found in subscription");
        }
        
        // Update subscription to REJECTED
        subscription.setStatus(Subscription.SubscriptionStatus.REJECTED);
        subscription = subscriptionRepository.save(subscription);
        
        // Flush to ensure changes are persisted before notification
        subscriptionRepository.flush();
        
        // Notify user about rejection
        try {
            notificationServiceClient.createNotification(NotificationRequest.builder()
                .userId(userId)
                .type("SUBSCRIPTION_REJECTED")
                .title("Yêu cầu đăng ký gói dịch vụ bị từ chối")
                .message(String.format("Yêu cầu đăng ký gói '%s' của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.",
                    packageEntity.getName()))
                .relatedEntityId(subscriptionId)
                .relatedEntityType("SUBSCRIPTION")
                .build());
        } catch (Exception e) {
            log.error("Error creating notification for subscription rejection: {}", e.getMessage(), e);
            // Don't fail the rejection if notification fails
        }
        
        // Package entity is already loaded
        subscription.getPackageEntity().getId();
        subscription.getPackageEntity().getName();
        
        log.info("Subscription rejected: {} by admin: {}", subscriptionId, adminId);
        
        return subscription;
    }
    
    @Transactional
    public void cancelSubscription(UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        
        UUID currentUserId = getCurrentUserId();
        if (!subscription.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to cancel this subscription");
        }
        
        if (subscription.getStatus() == Subscription.SubscriptionStatus.CANCELLED ||
            subscription.getStatus() == Subscription.SubscriptionStatus.REJECTED ||
            subscription.getStatus() == Subscription.SubscriptionStatus.EXPIRED) {
            throw new RuntimeException("Subscription is already inactive");
        }
        
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
        // If it was active, maybe set end date to now? Or keep it until the paid period ends?
        // For simplicity/requirement "tu huy", likely immediate cancellation.
        // Let's set end date to now to effective immediately.
        subscription.setEndDate(LocalDateTime.now());
        
        subscriptionRepository.save(subscription);
        
        // Notify user
        try {
            notificationServiceClient.createNotification(NotificationRequest.builder()
                .userId(currentUserId)
                .type("SUBSCRIPTION_CANCELLED")
                .title("Hủy đăng ký thành công")
                .message(String.format("Bạn đã hủy gói dịch vụ '%s' thành công.",
                    subscription.getPackageEntity() != null ? subscription.getPackageEntity().getName() : "Unknown"))
                .relatedEntityId(subscriptionId)
                .relatedEntityType("SUBSCRIPTION")
                .build());
        } catch (Exception e) {
            log.error("Error sending cancellation notification: {}", e.getMessage());
        }
        
        log.info("Subscription {} cancelled by user {}", subscriptionId, currentUserId);
    }
    
    private void notifyAdminsAboutSubscriptionRequest(Subscription subscription, UUID userId, Package packageEntity) {
        try {
            // Get user info via Feign Client
            UserDTO user = userServiceClient.getUserById(userId);
            if (user == null) {
                log.warn("User not found for subscription notification: {}", userId);
                return;
            }
            
            // Get admins via Feign Client
            List<UserDTO> admins = userServiceClient.getUsersByRoles(List.of("ADMIN"));
            
            log.info("Sending subscription request notification to {} admins", admins.size());
            
            for (UserDTO admin : admins) {
                notificationServiceClient.createNotification(NotificationRequest.builder()
                    .userId(admin.getId())
                    .type("SUBSCRIPTION_REQUEST")
                    .title("Yêu cầu đăng ký gói dịch vụ mới")
                    .message(String.format("Sinh viên %s (%s) đã yêu cầu đăng ký gói '%s'. Vui lòng duyệt hoặc từ chối.",
                        user.getFullName(),
                        user.getEmail(),
                        packageEntity.getName()))
                    .relatedEntityId(subscription.getId())
                    .relatedEntityType("SUBSCRIPTION")
                    .build());
            }
            
            log.info("Successfully sent subscription request notifications to {} admins", admins.size());
        } catch (Exception e) {
            log.error("Error sending subscription request notifications: {}", e.getMessage(), e);
            // Don't throw exception to avoid failing subscription creation
        }
    }

    // Legacy method - kept for backward compatibility
    @Transactional
    public Subscription subscribeToPackage(UUID packageId) {
        // Use requestSubscription instead - requires admin approval
        return requestSubscription(packageId);
    }

    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        try {
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            return user.getId();
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage());
            throw new RuntimeException("User not found");
        }
    }

    public Package createPackage(Package packageEntity) {
        return packageRepository.save(packageEntity);
    }

    public Package updatePackage(UUID packageId, Package packageEntity) {
        Package existing = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        existing.setName(packageEntity.getName());
        existing.setDescription(packageEntity.getDescription());
        existing.setPrice(packageEntity.getPrice());
        existing.setDurationDays(packageEntity.getDurationDays());
        existing.setFeatures(packageEntity.getFeatures());
        existing.setIsActive(packageEntity.getIsActive());
        return packageRepository.save(existing);
    }

    public void deletePackage(UUID packageId) {
        packageRepository.deleteById(packageId);
    }

    @Transactional
    public void fixPackageEncoding() {
        log.info("Fixing package encoding with UTF-8 Vietnamese text...");
        List<Package> packages = packageRepository.findAll();
        for (Package pkg : packages) {
            switch (pkg.getDurationDays()) {
                case 30:
                    pkg.setName("Gói Cơ bản");
                    pkg.setDescription("Gói dịch vụ cơ bản, phù hợp cho sinh viên mới bắt đầu tìm kiếm việc làm");
                    pkg.setFeatures(Arrays.asList(
                        "Xem tất cả tin tuyển dụng",
                        "Tạo CV từ mẫu",
                        "Ứng tuyển 10 vị trí/tháng",
                        "Xem bài viết hướng nghiệp"
                    ));
                    break;
                case 90:
                    pkg.setName("Gói Premium");
                    pkg.setDescription("Gói dịch vụ cao cấp với nhiều tính năng ưu đãi, hỗ trợ tốt hơn cho công việc tìm kiếm");
                    pkg.setFeatures(Arrays.asList(
                        "Xem tất cả tin tuyển dụng",
                        "Ứng tuyển không giới hạn",
                        "Tạo CV không giới hạn",
                        "Ưu tiên trong kết quả tìm kiếm",
                        "Truy cập khóa học premium",
                        "Tư vấn nghề nghiệp từ chuyên gia"
                    ));
                    break;
                case 180:
                    pkg.setName("Gói Sinh viên Pro");
                    pkg.setDescription("Gói dành riêng cho sinh viên, hỗ trợ tối đa quá trình tìm việc và phát triển sự nghiệp");
                    pkg.setFeatures(Arrays.asList(
                        "Tất cả tính năng Premium",
                        "Mock Interview không giới hạn",
                        "Phân tích CV bằng AI",
                        "Job recommendations cá nhân hóa",
                        "Tham gia thử thách và nhận badge",
                        "Truy cập toàn bộ khóa học"
                    ));
                    break;
                case 365:
                    pkg.setName("Gói Thăng tiến Sự nghiệp");
                    pkg.setDescription("Gói dịch vụ cao cấp nhất, hỗ trợ toàn diện cho sự nghiệp của bạn");
                    pkg.setFeatures(Arrays.asList(
                        "Tất cả tính năng Student Pro",
                        "Career roadmap cá nhân hóa",
                        "Mentoring 1-1 từ chuyên gia",
                        "Workshop và sự kiện độc quyền",
                        "Hỗ trợ viết cover letter chuyên nghiệp",
                        "Theo dõi tiến độ ứng tuyển chi tiết",
                        "Nhận thông báo việc làm phù hợp đầu tiên"
                    ));
                    break;
            }
        }
        packageRepository.saveAll(packages);
        log.info("Fixed encoding for {} packages", packages.size());
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Page<Subscription> getPendingSubscriptions(Pageable pageable) {
        // First get all with eager loading
        List<Subscription> allPending = subscriptionRepository.findByStatusWithDetails(
            Subscription.SubscriptionStatus.PENDING
        );
        
        // Manually paginate
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allPending.size());
        List<Subscription> pageContent = allPending.subList(start, end);
        
        // Package entity is already loaded, user info can be fetched via Feign Client when needed
        for (Subscription sub : pageContent) {
            // Force load package
            if (sub.getPackageEntity() != null) {
                sub.getPackageEntity().getId();
                sub.getPackageEntity().getName();
            }
        }
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent,
            pageable,
            allPending.size()
        );
    }
    
    @Transactional(readOnly = true)
    public List<Subscription> getMySubscriptions() {
        UUID userId = getCurrentUserId();
        // Use fetch join to avoid lazy loading issues
        return subscriptionRepository.findByUserIdWithPackage(userId);
    }
    
    @Transactional(readOnly = true)
    public Page<Subscription> getApprovedSubscriptions(Pageable pageable) {
        // Get all with eager loading
        List<Subscription> allApproved = subscriptionRepository.findByStatusWithDetails(
            Subscription.SubscriptionStatus.APPROVED
        );
        
        // Manually paginate
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allApproved.size());
        List<Subscription> pageContent = allApproved.subList(start, end);
        
        // Force initialization of lazy-loaded fields before returning
        for (Subscription sub : pageContent) {
            // User is now UUID (userId), no need to force load
            if (sub.getPackageEntity() != null) {
                sub.getPackageEntity().getId();
                sub.getPackageEntity().getName();
            }
        }
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent,
            pageable,
            allApproved.size()
        );
    }
    
    @Transactional(readOnly = true)
    public Page<Subscription> getAllSubscriptionsHistory(Pageable pageable) {
        // Get all subscriptions with eager loading
        List<Subscription> allSubs = subscriptionRepository.findAllWithDetails();
        
        // Sort by createdAt DESC (already sorted by query, but ensure it)
        allSubs.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        
        // Manually paginate
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allSubs.size());
        List<Subscription> pageContent = allSubs.subList(start, end);
        
        // Force initialization of lazy-loaded fields before returning
        for (Subscription sub : pageContent) {
            // User is now UUID (userId), no need to force load
            if (sub.getPackageEntity() != null) {
                sub.getPackageEntity().getId();
                sub.getPackageEntity().getName();
            }
        }
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent,
            pageable,
            allSubs.size()
        );
    }
}
