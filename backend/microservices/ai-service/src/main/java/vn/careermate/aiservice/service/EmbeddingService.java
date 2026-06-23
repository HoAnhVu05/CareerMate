package vn.careermate.aiservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for generating embeddings using OpenRouter API
 * Used for Vector DB storage
 * Note: Embedding functionality is currently disabled - can be enabled when needed
 */
@Slf4j
@Service
public class EmbeddingService {

    @Value("${ai.openrouter.api-key:}")
    private String openRouterApiKey;

    @Value("${ai.openrouter.base-url:https://openrouter.ai/api/v1}")
    private String openRouterBaseUrl;

    @Value("${ai.openrouter.embedding-model:text-embedding-ada-002}")
    private String embeddingModel;

    private final WebClient.Builder webClientBuilder;

    public EmbeddingService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
        // WebClient will be built per request with current API key
    }
    
    private WebClient getWebClient() {
        return webClientBuilder
            .baseUrl("https://openrouter.ai/api/v1")
            .defaultHeader("Content-Type", "application/json")
            .build();
    }

    /**
     * Generate embedding for text content
     * @param text Text to embed
     * @return List of floats representing the embedding vector
     */
    public List<Float> generateEmbedding(String text) {
        if (openRouterApiKey == null || openRouterApiKey.isEmpty() || openRouterApiKey.equals("YOUR_OPENROUTER_API_KEY_HERE")) {
            log.warn("OpenRouter API key not configured for embeddings");
            return new ArrayList<>();
        }

        try {
            // OpenRouter uses OpenAI-compatible embedding format
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", embeddingModel);
            requestBody.put("input", text);

            Map<String, Object> response = getWebClient().post()
                .uri("/embeddings")
                .header("Authorization", "Bearer " + openRouterApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .block();

            if (response != null && response.containsKey("data")) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
                if (data != null && !data.isEmpty()) {
                    Map<String, Object> embeddingData = data.get(0);
                    if (embeddingData.containsKey("embedding")) {
                        List<Double> values = (List<Double>) embeddingData.get("embedding");
                        List<Float> floatValues = new ArrayList<>();
                        for (Double value : values) {
                            floatValues.add(value.floatValue());
                        }
                        return floatValues;
                    }
                }
            }

            log.warn("Could not extract embedding from response");
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error generating embedding", e);
            return new ArrayList<>();
        }
    }

    /**
     * Generate embedding for CV content
     */
    public List<Float> generateCVEmbedding(String cvContent) {
        // Truncate if too long (embedding models have token limits)
        if (cvContent.length() > 8000) {
            cvContent = cvContent.substring(0, 8000);
        }
        return generateEmbedding(cvContent);
    }

    /**
     * Generate embedding for Job description
     */
    public List<Float> generateJobEmbedding(String jobTitle, String jobDescription, String requirements) {
        String combined = String.format("%s. %s. %s", 
            jobTitle, 
            jobDescription != null ? jobDescription : "",
            requirements != null ? requirements : "");
        
        if (combined.length() > 8000) {
            combined = combined.substring(0, 8000);
        }
        return generateEmbedding(combined);
    }
}
