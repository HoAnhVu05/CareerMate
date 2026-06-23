package vn.careermate.contentservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.service.CompanyService;
// import vn.careermate.userservice.model.RecruiterProfile; // Replaced with Feign Client
// import vn.careermate.userservice.repository.RecruiterProfileRepository; // Replaced with Feign Client
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.RecruiterProfileDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final UserServiceClient userServiceClient;

    @GetMapping
    public ResponseEntity<Page<vn.careermate.common.dto.CompanyDTO>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Company> companiesPage = companyService.getAllCompanies(pageable, keyword);
        
        List<vn.careermate.common.dto.CompanyDTO> companyDTOs = companiesPage.getContent().stream()
                .map(company -> {
                    Double avgRating = companyService.getAverageRating(company.getId());
                    Long ratingsCount = companyService.getRatingsCount(company.getId());
                    UUID recruiterId = companyService.getCompanyRecruiterId(company.getId());
                    
                    return vn.careermate.common.dto.CompanyDTO.builder()
                            .id(company.getId())
                            .name(company.getName())
                            .description(company.getDescription())
                            .websiteUrl(company.getWebsiteUrl())
                            .logoUrl(company.getLogoUrl())
                            .industry(company.getIndustry())
                            .companySize(company.getCompanySize())
                            .foundedYear(company.getFoundedYear())
                            .headquarters(company.getHeadquarters())
                            .averageRating(avgRating)
                            .ratingsCount(ratingsCount)
                            .recruiterId(recruiterId)
                            .verified(company.isVerified())
                            .build();
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(new PageImpl<>(companyDTOs, pageable, companiesPage.getTotalElements()));
    }

    @GetMapping("/top")
    public ResponseEntity<List<Company>> getTopCompanies(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(companyService.getTopCompanies(limit));
    }

    @PutMapping("/{companyId}/verify")
    public ResponseEntity<vn.careermate.common.dto.CompanyDTO> verifyCompany(
            @PathVariable UUID companyId,
            @RequestParam boolean verified
    ) {
        Company company = companyService.getCompanyById(companyId);
        company.setVerified(verified);
        company = companyService.createOrUpdateCompany(company);
        
        return ResponseEntity.ok(vn.careermate.common.dto.CompanyDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .websiteUrl(company.getWebsiteUrl())
                .logoUrl(company.getLogoUrl())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .foundedYear(company.getFoundedYear())
                .headquarters(company.getHeadquarters())
                .verified(company.isVerified())
                .build());
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID companyId) {
        companyService.deleteCompany(companyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<Map<String, Object>> getCompany(@PathVariable UUID companyId) {
        Company company = companyService.getCompanyById(companyId);
        Double avgRating = companyService.getAverageRating(companyId);
        Long ratingsCount = companyService.getRatingsCount(companyId);
        
        // Get recruiter ID from first job posting of this company
        UUID recruiterId = companyService.getCompanyRecruiterId(companyId);
        
        Map<String, Object> companyMap = new HashMap<>();
        companyMap.put("id", company.getId());
        companyMap.put("name", company.getName());
        companyMap.put("description", company.getDescription());
        companyMap.put("websiteUrl", company.getWebsiteUrl());
        companyMap.put("logoUrl", company.getLogoUrl());
        companyMap.put("industry", company.getIndustry());
        companyMap.put("companySize", company.getCompanySize());
        companyMap.put("foundedYear", company.getFoundedYear());
        companyMap.put("headquarters", company.getHeadquarters());
        companyMap.put("createdAt", company.getCreatedAt());
        companyMap.put("updatedAt", company.getUpdatedAt());
        companyMap.put("averageRating", avgRating);
        companyMap.put("ratingsCount", ratingsCount);
        companyMap.put("recruiterId", recruiterId); // Add recruiter ID
        
        return ResponseEntity.ok(companyMap);
    }

    @PostMapping
    public ResponseEntity<Company> createOrUpdateCompany(@RequestBody Company company) {
        return ResponseEntity.ok(companyService.createOrUpdateCompany(company));
    }
    
    // TODO: Implement getRecruiterByCompany using UserServiceClient
    // Need to add endpoint in user-service to get recruiter by companyId
    @GetMapping("/{companyId}/recruiter")
    public ResponseEntity<Map<String, Object>> getRecruiterByCompany(@PathVariable UUID companyId) {
        // TODO: Use UserServiceClient to fetch recruiter by companyId
        // For now, return not found
        return ResponseEntity.notFound().build();
        
        // Future implementation:
        // RecruiterProfileDTO recruiter = userServiceClient.getRecruiterProfileByCompanyId(companyId);
        // if (recruiter == null) {
        //     return ResponseEntity.notFound().build();
        // }
        // ... build response map
    }
    @DeleteMapping("/cleanup")
    public ResponseEntity<Void> cleanupAllCompanies() {
        companyService.deleteAllCompanies();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/count")
    public ResponseEntity<Long> getCompanyCount(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    ) {
        return ResponseEntity.ok(companyService.getCompanyCount(beforeDate));
    }
}
