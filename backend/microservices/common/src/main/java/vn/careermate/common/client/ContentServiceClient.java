package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.CompanyDTO;
import vn.careermate.common.dto.ArticleDTO;
import vn.careermate.common.config.FeignClientConfiguration;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "content-service", configuration = FeignClientConfiguration.class)
public interface ContentServiceClient {
    @GetMapping("/companies/{companyId}")
    CompanyDTO getCompanyById(@PathVariable UUID companyId);
    
    @GetMapping("/companies")
    Page<CompanyDTO> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    );

    @PostMapping("/companies")
    CompanyDTO createOrUpdateCompany(@RequestBody CompanyDTO companyDTO);
    
    @DeleteMapping("/companies/{companyId}")
    void deleteCompany(@PathVariable UUID companyId);

    @PutMapping("/companies/{companyId}/verify")
    vn.careermate.common.dto.CompanyDTO verifyCompany(@PathVariable UUID companyId, @RequestParam boolean verified);
    
    // Article endpoints
    @GetMapping("/articles/{articleId}")
    ArticleDTO getArticleById(@PathVariable UUID articleId);
    
    @GetMapping("/articles/admin/all")
    Page<ArticleDTO> getAllArticles(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/articles/admin/pending")
    Page<ArticleDTO> getPendingArticles(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    // Admin endpoints (TODO: Implement in content-service)
    @PostMapping("/articles/{articleId}/approve")
    ArticleDTO approveArticle(@PathVariable UUID articleId, @RequestParam UUID adminId);
    
    @PostMapping("/articles/{articleId}/reject")
    ArticleDTO rejectArticle(@PathVariable UUID articleId, @RequestParam UUID adminId);
    
    @PostMapping("/articles/{articleId}/hide")
    ArticleDTO hideArticle(@PathVariable UUID articleId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @PostMapping("/articles/{articleId}/unhide")
    ArticleDTO unhideArticle(@PathVariable UUID articleId, @RequestParam UUID adminId);
    
    @DeleteMapping("/articles/{articleId}")
    void deleteArticle(@PathVariable UUID articleId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @GetMapping("/articles/admin/count")
    Long getArticleCount(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    );
    
    @GetMapping("/companies/admin/count")
    Long getCompanyCount(
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime beforeDate
    );
}
