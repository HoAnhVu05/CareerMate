package vn.careermate.contentservice.dto;

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
    private String website;
    private String address;
    private String city;
    private String country;
    private String description;
    private String size;
    private String industry;
    private Integer foundedYear;
    private String contactEmail;
    private String contactPhone;
    private String logoUrl;
    private String facebook;
    private String linkedin;
}
