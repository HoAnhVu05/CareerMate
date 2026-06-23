package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.CVAnalysisDTO;
import vn.careermate.common.dto.JobRecommendationDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "ai-service")
public interface AIServiceClient {
    @PostMapping("/ai/analyze-cv")
    CVAnalysisDTO analyzeCV(@RequestParam UUID cvId, @RequestParam String cvContent);
    
    @GetMapping("/ai/job-recommendations/{studentId}")
    List<JobRecommendationDTO> getJobRecommendations(@PathVariable UUID studentId);
    
    @GetMapping("/ai/chat/conversations/{userId}")
    List<Object> getChatConversations(@PathVariable UUID userId);
    
    @GetMapping("/ai/chat/messages/{conversationId}")
    List<Object> getChatMessages(@PathVariable UUID conversationId);
    
    @GetMapping("/ai/mock-interviews/{studentId}")
    List<Object> getMockInterviews(@PathVariable UUID studentId);
}
