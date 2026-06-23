package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.repository.CompanyRatingRepository;
import vn.careermate.contentservice.repository.CompanyRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyRatingRepository ratingRepository;
    private final RestTemplate restTemplate;
    private final vn.careermate.common.client.UserServiceClient userServiceClient;

    @Transactional(readOnly = true)
    public Page<Company> getAllCompanies(Pageable pageable, String keyword) {
        List<Company> allCompanies = companyRepository.findAll();
        
        // Filter by keyword if provided
        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowerKeyword = keyword.toLowerCase();
            allCompanies = allCompanies.stream()
                    .filter(company -> 
                        (company.getName() != null && company.getName().toLowerCase().contains(lowerKeyword)) ||
                        (company.getIndustry() != null && company.getIndustry().toLowerCase().contains(lowerKeyword)) ||
                        (company.getDescription() != null && company.getDescription().toLowerCase().contains(lowerKeyword))
                    )
                    .collect(Collectors.toList());
        }
        
        // Calculate average rating for each company and sort by rating DESC
        List<CompanyWithRating> companiesWithRatings = allCompanies.stream()
                .map(company -> {
                    Double avgRating = ratingRepository.getAverageRatingByCompanyId(company.getId());
                    avgRating = avgRating != null ? avgRating : 0.0;
                    Long ratingsCount = ratingRepository.countByCompanyId(company.getId());
                    return new CompanyWithRating(company, avgRating, ratingsCount != null ? ratingsCount : 0L);
                })
                .sorted((a, b) -> Double.compare(b.averageRating, a.averageRating)) // DESC order
                .collect(Collectors.toList());
        
        // Manually paginate
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), companiesWithRatings.size());
        List<CompanyWithRating> pageContent = companiesWithRatings.subList(start, end);
        
        // Convert back to Company list and set rating info if needed
        List<Company> result = pageContent.stream()
                .map(cwr -> {
                    // Note: We can't add fields to Company entity directly
                    // The rating will be calculated in the controller/DTO
                    return cwr.company;
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(result, pageable, companiesWithRatings.size());
    }
    
    // Helper class to hold company with its rating
    private static class CompanyWithRating {
        Company company;
        Double averageRating;
        Long ratingsCount;
        
        CompanyWithRating(Company company, Double averageRating, Long ratingsCount) {
            this.company = company;
            this.averageRating = averageRating;
            this.ratingsCount = ratingsCount;
        }
    }

    public List<Company> getTopCompanies(int limit) {
        // Get companies sorted by average rating
        List<Company> allCompanies = companyRepository.findAll();
        return allCompanies.stream()
                .sorted((a, b) -> {
                    Double ratingA = ratingRepository.getAverageRatingByCompanyId(a.getId());
                    Double ratingB = ratingRepository.getAverageRatingByCompanyId(b.getId());
                    ratingA = ratingA != null ? ratingA : 0.0;
                    ratingB = ratingB != null ? ratingB : 0.0;
                    return Double.compare(ratingB, ratingA); // Descending
                })
                .limit(limit)
                .toList();
    }

    public Company getCompanyById(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));
        
        // Set default logo if logoUrl is null or empty
        if (company.getLogoUrl() == null || company.getLogoUrl().trim().isEmpty()) {
            // Use a placeholder icon - Building icon from a free icon service
            company.setLogoUrl("https://api.dicebear.com/7.x/identicon/svg?seed=" + company.getId());
        }
        
        return company;
    }
    
    public Double getAverageRating(UUID companyId) {
        try {
            Double avg = ratingRepository.getAverageRatingByCompanyId(companyId);
            log.debug("Average rating for company {}: {}", companyId, avg);
            return avg != null ? avg : 0.0;
        } catch (Exception e) {
            log.error("Error getting average rating for company {}: {}", companyId, e.getMessage(), e);
            return 0.0;
        }
    }
    
    public Long getRatingsCount(UUID companyId) {
        try {
            Long count = ratingRepository.countByCompanyId(companyId);
            log.debug("Ratings count for company {}: {}", companyId, count);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.error("Error getting ratings count for company {}: {}", companyId, e.getMessage(), e);
            return 0L;
        }
    }
    
    @Transactional
    public void deleteCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));
        
        log.info("Deleting company: {} (ID: {})", company.getName(), companyId);
        
        // Delete the company
        companyRepository.delete(company);
        
        log.info("Successfully deleted company: {}", companyId);
    }

    @Transactional
    public Company createOrUpdateCompany(Company company) {
        log.info("Processing createOrUpdateCompany request. ID: {}, Name: {}", company.getId(), company.getName());
        
        if (company.getId() != null) {
            // Update existing
            return companyRepository.findById(company.getId())
                    .map(existing -> {
                        log.info("Found existing company {}. Updating fields.", existing.getId());
                        if (company.getName() != null) existing.setName(company.getName());
                        if (company.getDescription() != null) existing.setDescription(company.getDescription());
                        if (company.getWebsiteUrl() != null) existing.setWebsiteUrl(company.getWebsiteUrl());
                        if (company.getLogoUrl() != null) existing.setLogoUrl(company.getLogoUrl());
                        if (company.getIndustry() != null) existing.setIndustry(company.getIndustry());
                        if (company.getCompanySize() != null) existing.setCompanySize(company.getCompanySize());
                        if (company.getFoundedYear() != null) existing.setFoundedYear(company.getFoundedYear());
                        if (company.getHeadquarters() != null) existing.setHeadquarters(company.getHeadquarters());
                        existing.setVerified(company.isVerified());
                        
                        Company saved = companyRepository.save(existing);
                        log.info("Company {} updated successfully.", saved.getId());
                        return saved;
                    })
                    .orElseGet(() -> {
                        log.warn("Company ID {} provided but not found. Creating new company.", company.getId());
                        Company saved = companyRepository.save(company);
                        log.info("New company created with ID: {}", saved.getId());
                        return saved;
                    });
        } else {
            // Create new
            log.info("No ID provided. Creating new company.");
            Company saved = companyRepository.save(company);
            log.info("New company created with ID: {}", saved.getId());
            return saved;
        }
    }
    @Transactional(readOnly = true)
    public long getCompanyCount() {
        return companyRepository.count();
    }

    @Transactional(readOnly = true)
    public long getCompanyCount(java.time.LocalDateTime beforeDate) {
        if (beforeDate == null) {
            return companyRepository.count();
        }
        return companyRepository.countByCreatedAtBefore(beforeDate);
    }

    /**
     * Get recruiter ID for a company
     */
    @Transactional(readOnly = true)
    public UUID getCompanyRecruiterId(UUID companyId) {
        try {
            // 1. Try to get recruiter directly from recruiter profile in user-service
            try {
                vn.careermate.common.dto.RecruiterProfileDTO recruiter = userServiceClient.getRecruiterByCompanyId(companyId);
                if (recruiter != null && recruiter.getUserId() != null) {
                    log.info("Found recruiter {} for company {} via user-service", recruiter.getUserId(), companyId);
                    return recruiter.getUserId();
                }
            } catch (Exception e) {
                log.warn("Failed to fetch recruiter via user-service for company {}: {}", companyId, e.getMessage());
            }

            // 2. Fallback: Query job-service to get jobs for this company
            log.info("Falling back to job-service for company {}", companyId);
            String jobServiceUrl = "http://job-service/jobs?companyId=" + companyId + "&size=1&status=ACTIVE";
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(jobServiceUrl, Map.class);
            
            if (response != null && response.get("content") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> jobs = (List<Map<String, Object>>) response.get("content");
                
                if (!jobs.isEmpty()) {
                    Map<String, Object> firstJob = jobs.get(0);
                    String recruiterIdStr = (String) firstJob.get("recruiterId");
                    if (recruiterIdStr != null) {
                        return UUID.fromString(recruiterIdStr);
                    }
                }
            }
            
            log.warn("No active jobs or recruiter profile found for company {}", companyId);
            return null;
        } catch (Exception e) {
            log.error("Error fetching recruiter ID for company {}: {}", companyId, e.getMessage(), e);
            return null;
        }
    }

    @Transactional
    public void deleteAllCompanies() {
        log.warn("DELETING ALL COMPANIES (Cleanup Action)");
        companyRepository.deleteAll();
    }
}
