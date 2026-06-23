package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDTO {
    private UUID id;
    private UUID userId;
    private UserDTO user; // For display purposes
    private UUID packageId;
    private PackageDTO packageEntity; // For display purposes
    private String status; // PENDING, APPROVED, REJECTED, ACTIVE, EXPIRED, CANCELLED
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
