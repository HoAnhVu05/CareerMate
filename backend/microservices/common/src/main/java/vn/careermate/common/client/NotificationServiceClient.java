package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import vn.careermate.common.dto.NotificationRequest;

@FeignClient(name = "notification-service", path = "/notifications")
public interface NotificationServiceClient {
    @PostMapping("/create")
    void createNotification(@RequestBody NotificationRequest request);
    
    @PostMapping("/job-approved")
    void notifyJobApproved(@RequestBody NotificationRequest request);
    
    @PostMapping("/job-rejected")
    void notifyJobRejected(@RequestBody NotificationRequest request);
    
    @PostMapping("/job-hidden")
    void notifyJobHidden(@RequestBody NotificationRequest request);
    
    @PostMapping("/job-unhidden")
    void notifyJobUnhidden(@RequestBody NotificationRequest request);
    
    @PostMapping("/job-deleted")
    void notifyJobDeleted(@RequestBody NotificationRequest request);
    
    @PostMapping("/article-approved")
    void notifyArticleApproved(@RequestBody NotificationRequest request);
    
    @PostMapping("/article-rejected")
    void notifyArticleRejected(@RequestBody NotificationRequest request);
    
    @PostMapping("/article-hidden")
    void notifyArticleHidden(@RequestBody NotificationRequest request);
    
    @PostMapping("/article-unhidden")
    void notifyArticleUnhidden(@RequestBody NotificationRequest request);
    
    @PostMapping("/article-deleted")
    void notifyArticleDeleted(@RequestBody NotificationRequest request);
    
    @PostMapping("/challenge-completed")
    void notifyChallengeCompleted(@RequestBody NotificationRequest request);
}
