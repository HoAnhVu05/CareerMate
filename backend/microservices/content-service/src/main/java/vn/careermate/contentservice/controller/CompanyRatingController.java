package vn.careermate.contentservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.contentservice.model.CompanyRating;
import vn.careermate.contentservice.service.CompanyRatingService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyRatingController {

    private final CompanyRatingService ratingService;

    @GetMapping("/{companyId}/ratings")
    public ResponseEntity<List<Map<String, Object>>> getCompanyRatings(@PathVariable UUID companyId) {
        List<CompanyRating> ratings = ratingService.getCompanyRatings(companyId);
        
        // Convert to DTO with user info
        List<Map<String, Object>> ratingDTOs = ratings.stream().map(rating -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", rating.getId());
            dto.put("rating", rating.getRating());
            dto.put("reviewText", rating.getReviewText());
            dto.put("createdAt", rating.getCreatedAt());
            
            // Student info - use studentId (UUID)
            // TODO: Fetch student details via UserServiceClient if needed
            if (rating.getStudentId() != null) {
                Map<String, Object> studentMap = new HashMap<>();
                studentMap.put("id", rating.getStudentId());
                // Note: Student details should be fetched from user-service via Feign Client
                dto.put("student", studentMap);
            }
            
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ratingDTOs);
    }

    @GetMapping("/{companyId}/rating/average")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable UUID companyId) {
        Double average = ratingService.getAverageRating(companyId);
        return ResponseEntity.ok(Map.of("averageRating", average));
    }

    @GetMapping("/{companyId}/ratings/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMyRating(@PathVariable UUID companyId) {
        CompanyRating rating = ratingService.getMyRating(companyId);
        if (rating == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Convert to DTO
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", rating.getId());
        dto.put("rating", rating.getRating());
        dto.put("reviewText", rating.getReviewText());
        dto.put("createdAt", rating.getCreatedAt());
        
        // Student info - use studentId (UUID)
        // TODO: Fetch student details via UserServiceClient if needed
        if (rating.getStudentId() != null) {
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", rating.getStudentId());
            dto.put("student", studentMap);
        }
        
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{companyId}/ratings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CompanyRating> createOrUpdateRating(
            @PathVariable UUID companyId,
            @RequestBody Map<String, Object> payload
    ) {
        Integer rating = (Integer) payload.get("rating");
        String reviewText = (String) payload.get("comment"); // Frontend sends 'comment'
        
        // Handle case where frontend might send 'reviewText' instead
        if (reviewText == null && payload.containsKey("reviewText")) {
            reviewText = (String) payload.get("reviewText");
        }
        
        return ResponseEntity.ok(ratingService.createOrUpdateRating(companyId, rating, reviewText));
    }
    
    @DeleteMapping("/{companyId}/ratings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteMyRating(@PathVariable UUID companyId) {
        ratingService.deleteMyRating(companyId);
        return ResponseEntity.ok(Map.of("message", "Rating deleted successfully"));
    }
}
