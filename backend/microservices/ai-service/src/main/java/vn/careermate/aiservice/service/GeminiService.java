package vn.careermate.aiservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;
import java.util.Base64;

/**
 * Gemini AI Service for direct Google Gemini API integration
 */
@Slf4j
@Service
public class GeminiService {

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${ai.gemini.timeout:120000}")
    private int timeout;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .defaultHeader("Content-Type", "application/json")
            .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Call Gemini API with a prompt
     */
    public String callGeminiAPI(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("Gemini API key not configured");
        }

        try {
            log.debug("Calling Gemini API with model: {} and timeout: {}ms", geminiModel, timeout);

            // Gemini API request format
            Map<String, Object> request = new HashMap<>();
            
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            
            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            parts.add(part);
            
            content.put("parts", parts);
            contents.add(content);
            request.put("contents", contents);

            // Optional: Add generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topP", 0.95);
            generationConfig.put("topK", 40);
            generationConfig.put("maxOutputTokens", 8192);
            if (prompt != null && prompt.toUpperCase().contains("JSON")) {
                generationConfig.put("response_mime_type", "application/json");
            }
            request.put("generationConfig", generationConfig);

            String requestBody = objectMapper.writeValueAsString(request);
            log.debug("Gemini API request body: {}", requestBody);

            // Call Gemini API
            String url = String.format("%s/models/%s:generateContent?key=%s", 
                geminiBaseUrl, geminiModel, geminiApiKey);
            log.info("Calling Gemini API URL: {}", url.replace(geminiApiKey, "REDACTED"));

            String response = webClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    clientResponse -> clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Gemini API error response: {}", errorBody);
                            return Mono.error(new RuntimeException(
                                String.format("Gemini API returned error %d: %s", 
                                    clientResponse.statusCode().value(), errorBody)
                            ));
                        })
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(timeout))
                .block();

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Empty response from Gemini API");
            }

            log.debug("Gemini API raw response: {}", response);

            // Parse Gemini response
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            
            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException("No candidates in Gemini response");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = candidates.get(0);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> partsResponse = (List<Map<String, Object>>) contentResponse.get("parts");
            
            if (partsResponse == null || partsResponse.isEmpty()) {
                throw new RuntimeException("No parts in Gemini response");
            }

            String text = (String) partsResponse.get(0).get("text");
            log.debug("Gemini API extracted text: {}", text);
            
            return text;

        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Call Gemini API with a prompt and file content (multimodal)
     */
    public String callGeminiAPI(String prompt, String mimeType, byte[] fileData) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("Gemini API key not configured");
        }

        try {
            log.debug("Calling Gemini API with model: {}, mimeType: {}, and timeout: {}ms", geminiModel, mimeType, timeout);

            // Gemini API request format
            Map<String, Object> request = new HashMap<>();
            
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            
            List<Map<String, Object>> parts = new ArrayList<>();
            
            // Text part
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            
            // File part
            if (fileData != null && fileData.length > 0) {
                Map<String, Object> filePart = new HashMap<>();
                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mimeType", mimeType);
                inlineData.put("data", Base64.getEncoder().encodeToString(fileData));
                filePart.put("inlineData", inlineData);
                parts.add(filePart);
            }
            
            content.put("parts", parts);
            contents.add(content);
            request.put("contents", contents);

            // Optional: Add generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", 8192);
            if (prompt != null && prompt.toUpperCase().contains("JSON")) {
                generationConfig.put("response_mime_type", "application/json");
            }
            request.put("generationConfig", generationConfig);

            String requestBody = objectMapper.writeValueAsString(request);
            log.debug("Gemini API request body length: {}", requestBody.length());

            // Call Gemini API
            String url = String.format("%s/models/%s:generateContent?key=%s", 
                geminiBaseUrl, geminiModel, geminiApiKey);

            String response = webClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    clientResponse -> clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Gemini API error response: {}", errorBody);
                            return Mono.error(new RuntimeException(
                                String.format("Gemini API returned error %d: %s", 
                                    clientResponse.statusCode().value(), errorBody)
                            ));
                        })
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(timeout))
                .block();

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Empty response from Gemini API");
            }

            // Parse Gemini response
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            
            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException("No candidates in Gemini response");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = candidates.get(0);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> partsResponse = (List<Map<String, Object>>) contentResponse.get("parts");
            
            if (partsResponse == null || partsResponse.isEmpty()) {
                throw new RuntimeException("No parts in Gemini response");
            }

            String text = (String) partsResponse.get(0).get("text");
            log.debug("Gemini API extracted text: {}", text);
            
            return text;

        } catch (Exception e) {
            log.error("Error calling Gemini API with file", e);
            throw new RuntimeException("Failed to call Gemini API with file: " + e.getMessage(), e);
        }
    }

    /**
     * Call Gemini API with chat history
     */
    public String callGeminiAPIWithHistory(List<Map<String, String>> messageHistory) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("Gemini API key not configured");
        }

        try {
            log.debug("Calling Gemini API with message history, model: {}", geminiModel);

            // Convert message history to Gemini format
            List<Map<String, Object>> contents = new ArrayList<>();
            for (Map<String, String> msg : messageHistory) {
                Map<String, Object> content = new HashMap<>();
                String role = msg.get("role");
                // Gemini uses "user" and "model" roles
                content.put("role", role.equals("assistant") ? "model" : "user");
                
                List<Map<String, String>> parts = new ArrayList<>();
                Map<String, String> part = new HashMap<>();
                part.put("text", msg.get("content"));
                parts.add(part);
                
                content.put("parts", parts);
                contents.add(content);
            }

            Map<String, Object> request = new HashMap<>();
            request.put("contents", contents);

            //Generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", 8192);
            request.put("generationConfig", generationConfig);

            String requestBody = objectMapper.writeValueAsString(request);

            // Call Gemini API
            String url = String.format("%s/models/%s:generateContent?key=%s", 
                geminiBaseUrl, geminiModel, geminiApiKey);

            String response = webClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    clientResponse -> clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> {
                            log.error("Gemini API error response: {}", errorBody);
                            return Mono.error(new RuntimeException(
                                String.format("Gemini API returned error %d: %s", 
                                    clientResponse.statusCode().value(), errorBody)
                            ));
                        })
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(timeout))
                .block();

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Empty response from Gemini API");
            }

            // Parse response
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            
            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException("No candidates in Gemini response");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = candidates.get(0);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> partsResponse = (List<Map<String, Object>>) contentResponse.get("parts");
            
            if (partsResponse == null || partsResponse.isEmpty()) {
                throw new RuntimeException("No parts in Gemini response");
            }

            return (String) partsResponse.get(0).get("text");

        } catch (Exception e) {
            log.error("Error calling Gemini API with history", e);
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }
}
