package vn.careermate.aiservice.service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.JobDTO;

import java.util.*;

import vn.careermate.aiservice.model.MockInterview;
import vn.careermate.aiservice.model.MockInterviewQuestion;
import vn.careermate.aiservice.repository.MockInterviewRepository;

import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;

@Service
public class MockInterviewService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MockInterviewService.class);

    private final WebClient.Builder webClientBuilder;
    private final JobServiceClient jobServiceClient;
    private final UserServiceClient userServiceClient; // Added
    private final AIService aiService;
    private final MockInterviewRepository mockInterviewRepository;

    public MockInterviewService(WebClient.Builder webClientBuilder, 
                                JobServiceClient jobServiceClient, 
                                UserServiceClient userServiceClient, // Added
                                AIService aiService, 
                                MockInterviewRepository mockInterviewRepository) {
        this.webClientBuilder = webClientBuilder;
        this.jobServiceClient = jobServiceClient;
        this.userServiceClient = userServiceClient; // Added
        this.aiService = aiService;
        this.mockInterviewRepository = mockInterviewRepository;
    }

    public Map<String, Object> startMockInterview(UUID jobId, String studentProfile) {
        // Get job via Feign Client
        JobDTO job;
        try {
            job = jobServiceClient.getJobById(jobId);
            if (job == null) {
                throw new RuntimeException("Job not found");
            }
        } catch (Exception e) {
            log.error("Error fetching job: {}", e.getMessage());
            throw new RuntimeException("Job not found");
        }
        
        // Generate interview questions based on job
        String prompt = String.format(
            "Bạn là một người phỏng vấn chuyên nghiệp. Dựa trên công việc sau đây, hãy tạo 5 câu hỏi phỏng vấn phù hợp.\n" +
            "Trả lời dưới dạng JSON:\n" +
            "{\n" +
            "  \"questions\": [\n" +
            "    {\"question\": \"Câu hỏi 1\", \"type\": \"technical\"},\n" +
            "    {\"question\": \"Câu hỏi 2\", \"type\": \"behavioral\"}\n" +
            "  ]\n" +
            "}\n\n" +
            "Công việc: %s\n" +
            "Mô tả: %s\n" +
            "Yêu cầu: %s",
            job.getTitle(), job.getDescription(), job.getDescription() != null ? job.getDescription() : ""
        );

        String response = aiService.callAIAPI(prompt);
        Map<String, Object> aiResult = parseResponse(response);

        Map<String, Object> result = new HashMap<>(aiResult);
        result.put("jobId", job.getId());
        result.put("jobTitle", job.getTitle());
        result.put("startedAt", new Date());
        result.put("currentQuestionIndex", 0);

        return result;
    }

    public Map<String, Object> startCustomMockInterview(String jobTitle, String jobDescription) {
        // Generate interview questions based on custom role
        String prompt = String.format(
            "Bạn là một người phỏng vấn chuyên nghiệp. Dựa trên vị trí công việc sau đây, hãy tạo 5 câu hỏi phỏng vấn phù hợp.\n" +
            "Trả lời dưới dạng JSON:\n" +
            "{\n" +
            "  \"questions\": [\n" +
            "    {\"question\": \"Câu hỏi 1\", \"type\": \"technical\"},\n" +
            "    {\"question\": \"Câu hỏi 2\", \"type\": \"behavioral\"}\n" +
            "  ]\n" +
            "}\n\n" +
            "Vị trí: %s\n" +
            "Mô tả: %s",
            jobTitle, jobDescription != null ? jobDescription : "N/A"
        );

        String response = aiService.callAIAPI(prompt);
        Map<String, Object> aiResult = parseResponse(response);

        Map<String, Object> result = new HashMap<>(aiResult);
        result.put("jobId", null);
        result.put("jobTitle", jobTitle);
        result.put("startedAt", new Date());
        result.put("currentQuestionIndex", 0);

        return result;
    }

    public List<MockInterview> getHistory(UUID studentId) {
        return mockInterviewRepository.findByStudentIdOrderByStartedAtDesc(studentId);
    }
    
    public List<Map<String, Object>> getAllHistory() {
        List<MockInterview> interviews = mockInterviewRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "startedAt"));
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (MockInterview iv : interviews) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", iv.getId());
            item.put("studentId", iv.getStudentId());
            item.put("jobTitle", iv.getJobTitle());
            item.put("startedAt", iv.getStartedAt());
            item.put("completedAt", iv.getCompletedAt());
            item.put("overallScore", iv.getOverallScore());
            item.put("status", iv.getStatus());
            item.put("transcript", iv.getTranscript());
            
            // Fetch student info
            try {
                UserDTO user = null;
                try {
                    user = userServiceClient.getUserById(iv.getStudentId());
                } catch (Exception e) {
                    // Fallback: maybe the stored ID is studentProfileId instead of userId
                    try {
                        vn.careermate.common.dto.StudentProfileDTO profile = userServiceClient.getStudentProfileById(iv.getStudentId());
                        if (profile != null && profile.getUser() != null) {
                            user = profile.getUser();
                        }
                    } catch (Exception ex) {
                        // Both failed
                        log.debug("Fallback profile fetch also failed for ID {}: {}", iv.getStudentId(), ex.getMessage());
                    }
                }

                if (user != null) {
                    item.put("studentName", user.getFullName());
                    item.put("studentAvatar", user.getAvatarUrl());
                    item.put("studentEmail", user.getEmail());
                } else {
                    item.put("studentName", "Unknown Student");
                }
            } catch (Exception e) {
                log.warn("Failed to fetch student info for ID {}: {}", iv.getStudentId(), e.getMessage());
                item.put("studentName", "Error fetching name");
            }
            
            result.add(item);
        }
        return result;
    }
    
    public MockInterview saveInterview(MockInterview interview) {
        log.info("Saving mock interview for student: {}, job: {}, score: {}", 
                interview.getStudentId(), interview.getJobTitle(), interview.getOverallScore());
        try {
            MockInterview saved = mockInterviewRepository.save(interview);
            log.info("Successfully saved mock interview with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error saving mock interview: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String jobContext) {
        String prompt = String.format(
            "Bạn là một chuyên gia đánh giá phỏng vấn. Hãy đánh giá câu trả lời sau đây.\n" +
            "Trả lời dưới dạng JSON:\n" +
            "{\n" +
            "  \"score\": <số từ 0-100>,\n" +
            "  \"feedback\": \"Nhận xét chi tiết\",\n" +
            "  \"strengths\": [\"điểm mạnh 1\", \"điểm mạnh 2\"],\n" +
            "  \"improvements\": [\"cần cải thiện 1\", \"cần cải thiện 2\"]\n" +
            "}\n\n" +
            "Câu hỏi: %s\n" +
            "Câu trả lời: %s\n" +
            "Ngữ cảnh công việc: %s",
            question, answer, jobContext
        );

        String response = aiService.callAIAPI(prompt);
        return parseResponse(response);
    }

    private Map<String, Object> parseResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        if (response == null || response.equals("{}") || response.trim().isEmpty()) {
            return result;
        }
        
        // Handle 402 error messages from AIService
        if (response.contains("402") || response.contains("Payment Required")) {
            result.put("error", "AI Quota Exhausted (402)");
            result.put("message", "Hết hạn mức sử dụng AI. Vui lòng thử lại sau.");
            return result;
        }

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            
            // Clean text (remove markdown code blocks if present)
            String text = response.trim();
            if (text.startsWith("```json")) text = text.substring(7);
            if (text.startsWith("```")) text = text.substring(3);
            if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
            text = text.trim();
            
            // Try to parse as JSON
            com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(text);
            result = mapper.convertValue(jsonNode, Map.class);
        } catch (Exception e) {
            log.error("Error parsing response", e);
            // Return empty result if parsing fails
        }
        return result;
    }
}
