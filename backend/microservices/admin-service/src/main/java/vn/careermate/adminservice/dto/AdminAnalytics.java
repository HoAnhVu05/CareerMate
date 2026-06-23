package vn.careermate.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalytics {
    // User analytics
    private long newUsersLast30Days;
    private long newUsersLast7Days;
    private Map<String, Long> usersByRole;
    
    // Job analytics
    private long newJobsLast30Days;
    private long newJobsLast7Days;
    private Map<String, Long> jobsByStatus;
    private Map<String, Long> jobsByLocation;
    
    // Application analytics
    private long newApplicationsLast30Days;
    private long newApplicationsLast7Days;
    private Map<String, Long> applicationsByStatus;
    
    // Skills in demand
    private List<SkillDemand> topSkillsInDemand;
    
    // Application traffic
    private List<DailyTraffic> applicationTrafficLast30Days;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDemand {
        private String skillName;
        private long jobCount;
        private long applicationCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTraffic {
        private String date;
        private long applications;
        private long jobs;
        private long users;
    }
}
