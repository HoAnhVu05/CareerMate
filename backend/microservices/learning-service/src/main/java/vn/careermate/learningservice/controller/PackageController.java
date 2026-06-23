package vn.careermate.learningservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.learningservice.model.Package;
import vn.careermate.learningservice.model.Subscription;
import vn.careermate.learningservice.service.PackageService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;
    private final UserServiceClient userServiceClient;

    @GetMapping
    public ResponseEntity<List<Package>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/my-subscription")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER')")
    public ResponseEntity<Subscription> getMySubscription() {
        Optional<Subscription> subscription = packageService.getMyCurrentSubscription();
        return subscription.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-subscriptions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Subscription>> getMySubscriptions() {
        return ResponseEntity.ok(packageService.getMySubscriptions());
    }

    @PostMapping("/{packageId}/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Subscription> requestSubscription(@PathVariable UUID packageId) {
        try {
            return ResponseEntity.ok(packageService.requestSubscription(packageId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> cancelSubscription(@PathVariable UUID subscriptionId) {
        try {
            packageService.cancelSubscription(subscriptionId);
            return ResponseEntity.ok("Subscription cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Legacy endpoint - kept for backward compatibility
    @PostMapping("/{packageId}/subscribe")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER')")
    public ResponseEntity<Subscription> subscribeToPackage(@PathVariable UUID packageId) {
        try {
            return ResponseEntity.ok(packageService.requestSubscription(packageId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Admin endpoints for managing subscriptions
    @GetMapping("/subscriptions/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Subscription>> getPendingSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(packageService.getPendingSubscriptions(pageable));
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> approveSubscription(@PathVariable UUID subscriptionId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("Admin not found");
            }
            UUID adminId = user.getId();
            
            return ResponseEntity.ok(packageService.approveSubscription(subscriptionId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/subscriptions/{subscriptionId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> rejectSubscription(@PathVariable UUID subscriptionId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("Admin not found");
            }
            UUID adminId = user.getId();
            
            return ResponseEntity.ok(packageService.rejectSubscription(subscriptionId, adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/subscriptions/approved")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Subscription>> getApprovedSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(packageService.getApprovedSubscriptions(pageable));
    }
    
    @GetMapping("/subscriptions/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Subscription>> getAllSubscriptionsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(packageService.getAllSubscriptionsHistory(pageable));
    }
    
    // Admin endpoint to fix package encoding
    @PostMapping("/fix-encoding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> fixPackageEncoding() {
        try {
            packageService.fixPackageEncoding();
            return ResponseEntity.ok("Packages encoding fixed successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fixing encoding: " + e.getMessage());
        }
    }
}
