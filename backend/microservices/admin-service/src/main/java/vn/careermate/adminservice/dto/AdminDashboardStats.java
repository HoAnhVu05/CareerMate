package vn.careermate.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalUsers;
    private long totalStudents;
    private long totalRecruiters;
    private long totalAdmins;
    private long totalJobs;
    private long pendingJobs;
    private long activeJobs;
    private long totalApplications;
    private long totalCompanies;
    private long totalArticles;
    private long pendingArticles;
    private long publishedArticles;
    
    // Growth percentages (Last 30 days vs 30-60 days ago)
    private double userGrowthPercentage;
    private double jobGrowthPercentage;
    private double articleGrowthPercentage;
    private double applicationGrowthPercentage;
    private double companyGrowthPercentage;
}
