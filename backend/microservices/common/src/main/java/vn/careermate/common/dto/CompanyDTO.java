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
public class CompanyDTO {
    private UUID id;
    private String name;
    private String description;
    private String websiteUrl;
    private String logoUrl;
    private String industry;
    private String companySize;
    private Integer foundedYear;
    private String headquarters;
    private Double averageRating;
    private Long ratingsCount;
    private UUID recruiterId;
    private Boolean verified;
}
