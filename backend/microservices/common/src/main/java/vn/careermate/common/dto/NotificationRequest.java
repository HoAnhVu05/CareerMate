package vn.careermate.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private UUID userId;
    private String type;
    private String title;
    private String message;
    private java.util.UUID relatedId;
    private UUID relatedEntityId;
    private String relatedEntityType;
}
