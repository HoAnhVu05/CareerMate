package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.CVTemplateDTO;
import vn.careermate.common.dto.PackageDTO;
import vn.careermate.common.dto.SubscriptionDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "learning-service")
public interface LearningServiceClient {
    // CV Templates
    @GetMapping("/cv-templates/{templateId}")
    CVTemplateDTO getCVTemplateById(@PathVariable UUID templateId);
    
    @GetMapping("/cv-templates")
    List<CVTemplateDTO> getAllCVTemplates();
    
    @PostMapping("/cv-templates")
    CVTemplateDTO createCVTemplate(@RequestBody CVTemplateDTO template);
    
    @PutMapping("/cv-templates/{templateId}")
    CVTemplateDTO updateCVTemplate(@PathVariable UUID templateId, @RequestBody CVTemplateDTO template);
    
    @DeleteMapping("/cv-templates/{templateId}")
    void deleteCVTemplate(@PathVariable UUID templateId);
    
    // Packages
    @GetMapping("/packages")
    List<PackageDTO> getAllPackages();
    
    @GetMapping("/packages/{packageId}")
    PackageDTO getPackageById(@PathVariable UUID packageId);
    
    @PostMapping("/packages")
    PackageDTO createPackage(@RequestBody PackageDTO packageDTO);
    
    @PutMapping("/packages/{packageId}")
    PackageDTO updatePackage(@PathVariable UUID packageId, @RequestBody PackageDTO packageDTO);
    
    @DeleteMapping("/packages/{packageId}")
    void deletePackage(@PathVariable UUID packageId);
    
    // Subscriptions
    @GetMapping("/subscriptions")
    Page<SubscriptionDTO> getAllSubscriptions(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/subscriptions/pending")
    Page<SubscriptionDTO> getPendingSubscriptions(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/subscriptions/approved")
    Page<SubscriptionDTO> getApprovedSubscriptions(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @PostMapping("/subscriptions/{subscriptionId}/approve")
    SubscriptionDTO approveSubscription(@PathVariable UUID subscriptionId);
    
    @PostMapping("/subscriptions/{subscriptionId}/reject")
    SubscriptionDTO rejectSubscription(@PathVariable UUID subscriptionId);
}
