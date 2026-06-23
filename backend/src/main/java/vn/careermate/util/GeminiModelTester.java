package vn.careermate.util;

import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

/**
 * Utility class to test Gemini API with different models
 * Usage: Run this as a standalone Java application or Spring Boot test
 */
public class GeminiModelTester {
    
    private static final String[] MODELS_TO_TEST = {
        "gemini-pro",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest",
        "gemini-pro-latest"
    };
    
    private static final String BASE_URL = "https://generativelanguage.googleapis.com";
    private static final String TEST_PROMPT = "Hello, this is a test. Please respond with 'OK'.";
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        try {
            System.out.println("=== GEMINI API MODEL TESTER ===");
            System.out.println("Enter your Gemini API key:");
            String apiKey = scanner.nextLine().trim();
        
        if (apiKey.isEmpty()) {
            System.out.println("Error: API key cannot be empty!");
            return;
        }
        
        System.out.println("\nTesting API key with different models...");
        System.out.println("API Key: " + apiKey.substring(0, Math.min(20, apiKey.length())) + "...");
        System.out.println("=" .repeat(60));
        
        WebClient webClient = WebClient.builder()
            .baseUrl(BASE_URL)
            .defaultHeader("Content-Type", "application/json")
            .build();
        
        Map<String, TestResult> results = new LinkedHashMap<>();
        
        for (String model : MODELS_TO_TEST) {
            TestResult result = testModel(webClient, model, apiKey);
            results.put(model, result);
            
            // Print result immediately
            System.out.printf("\n[%s] %s\n", 
                result.isSuccess() ? "✓" : "✗", 
                model);
            if (result.isSuccess()) {
                System.out.println("  Status: SUCCESS");
                System.out.println("  Response: " + result.getResponse().substring(0, Math.min(100, result.getResponse().length())) + "...");
            } else {
                System.out.println("  Status: FAILED");
                System.out.println("  Error: " + result.getError());
            }
            System.out.println();
        }
        
        // Summary
        System.out.println("=" .repeat(60));
        System.out.println("SUMMARY:");
        System.out.println("=" .repeat(60));
        
        List<String> workingModels = new ArrayList<>();
        List<String> failedModels = new ArrayList<>();
        
        for (Map.Entry<String, TestResult> entry : results.entrySet()) {
            if (entry.getValue().isSuccess()) {
                workingModels.add(entry.getKey());
            } else {
                failedModels.add(entry.getKey());
            }
        }
        
        if (!workingModels.isEmpty()) {
            System.out.println("\n✓ WORKING MODELS:");
            for (String model : workingModels) {
                System.out.println("  - " + model);
            }
        }
        
        if (!failedModels.isEmpty()) {
            System.out.println("\n✗ FAILED MODELS:");
            for (String model : failedModels) {
                System.out.println("  - " + model + " (" + results.get(model).getError() + ")");
            }
        }
        
        System.out.println("\n" + "=" .repeat(60));
        System.out.println("RECOMMENDED MODEL: " + (workingModels.isEmpty() ? "NONE" : workingModels.get(0)));
        System.out.println("=" .repeat(60));
        } finally {
            scanner.close();
        }
    }
    
    private static TestResult testModel(WebClient webClient, String model, String apiKey) {
        String url = String.format("/v1beta/models/%s:generateContent?key=%s", model, apiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", TEST_PROMPT);
        parts.add(part);
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        try {
            Map<String, Object> response = webClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .block();
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    if (candidate.containsKey("content")) {
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap.containsKey("parts")) {
                            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                            if (partsList != null && !partsList.isEmpty()) {
                                Object textObj = partsList.get(0).get("text");
                                if (textObj != null) {
                                    return new TestResult(true, textObj.toString(), null);
                                }
                            }
                        }
                    }
                }
            }
            
            return new TestResult(false, null, "Invalid response structure");
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            String errorMsg = String.format("%d %s", e.getStatusCode().value(), e.getStatusCode());
            if (e.getResponseBodyAsString() != null && !e.getResponseBodyAsString().isEmpty()) {
                errorMsg += " - " + e.getResponseBodyAsString().substring(0, Math.min(200, e.getResponseBodyAsString().length()));
            }
            return new TestResult(false, null, errorMsg);
        } catch (Exception e) {
            return new TestResult(false, null, e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }
    
    private static class TestResult {
        private final boolean success;
        private final String response;
        private final String error;
        
        public TestResult(boolean success, String response, String error) {
            this.success = success;
            this.response = response;
            this.error = error;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public String getResponse() {
            return response;
        }
        
        public String getError() {
            return error;
        }
    }
}

