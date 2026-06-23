package vn.careermate.aiservice.service;

import io.weaviate.client.WeaviateClient;
import io.weaviate.client.base.Result;
import io.weaviate.client.v1.data.model.WeaviateObject;
import io.weaviate.client.v1.data.replication.model.ConsistencyLevel;
import io.weaviate.client.v1.graphql.model.GraphQLResponse;
import io.weaviate.client.v1.graphql.query.argument.NearTextArgument;
import io.weaviate.client.v1.graphql.query.fields.Field;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.careermate.aiservice.service.EmbeddingService;

import jakarta.annotation.PostConstruct;
import java.util.*;

/**
 * Service for Vector DB operations using Weaviate
 * Handles semantic search for job matching
 */
@Slf4j
@Service
public class VectorDBService {

    @Value("${ai.vector-db.weaviate.url:http://localhost:8081}")
    private String weaviateUrl;

    @Value("${ai.vector-db.weaviate.api-key:}")
    private String weaviateApiKey;

    @Value("${ai.vector-db.weaviate.enabled:false}")
    private boolean enabled;

    private final EmbeddingService embeddingService;
    private WeaviateClient client;

    public VectorDBService(EmbeddingService embeddingService) {
        this.embeddingService = embeddingService;
    }
    private static final String CV_CLASS = "CV";
    private static final String JOB_CLASS = "Job";

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Vector DB is disabled. Set ai.vector-db.weaviate.enabled=true to enable.");
            return;
        }

        try {
            // Note: Weaviate client v4.5.0 initialization
            // Vector DB will be disabled until Weaviate server is properly configured
            // To enable: Setup Weaviate server and configure proper client initialization
            this.client = null;
            log.warn("Weaviate client initialization skipped. Vector DB will be disabled until properly configured.");
            
            // Create schema if not exists
            createSchemaIfNotExists();
        } catch (Exception e) {
            log.error("Failed to initialize Weaviate client", e);
        }
    }

    private void createSchemaIfNotExists() {
        if (client == null) return;

        try {
            // Create CV class schema
            createClassIfNotExists(CV_CLASS, "CV documents for semantic search");
            // Create Job class schema
            createClassIfNotExists(JOB_CLASS, "Job descriptions for semantic search");
        } catch (Exception e) {
            log.error("Failed to create schema", e);
        }
    }

    private void createClassIfNotExists(String className, String description) {
        // Schema creation logic would go here
        // For now, we'll assume schema is created manually or via migration
        log.info("Schema check for class: {}", className);
    }

    /**
     * Store CV embedding in vector DB
     */
    public void storeCV(String cvId, String content) {
        if (!enabled || client == null) {
            log.warn("Vector DB is not enabled or client not initialized");
            return;
        }

        try {
            // Generate embedding
            List<Float> embedding = embeddingService.generateCVEmbedding(content);
            if (embedding.isEmpty()) {
                log.warn("Could not generate embedding for CV: {}", cvId);
                return;
            }

            Map<String, Object> properties = new HashMap<>();
            properties.put("cvId", cvId);
            properties.put("content", content.length() > 1000 ? content.substring(0, 1000) : content);

            // Convert List<Float> to Float[]
            Float[] embeddingArray = embedding.toArray(new Float[0]);
            
            Result<WeaviateObject> result = client.data().creator()
                .withClassName(CV_CLASS)
                .withID(cvId)
                .withProperties(properties)
                .withVector(embeddingArray)
                .withConsistencyLevel(ConsistencyLevel.ONE)
                .run();

            if (result.hasErrors()) {
                log.error("Error storing CV in vector DB: {}", result.getError());
            } else {
                log.info("CV stored successfully in vector DB: {}", cvId);
            }
        } catch (Exception e) {
            log.error("Exception storing CV in vector DB", e);
        }
    }

    /**
     * Store Job embedding in vector DB
     */
    public void storeJob(String jobId, String title, String description, String requirements) {
        if (!enabled || client == null) {
            log.warn("Vector DB is not enabled or client not initialized");
            return;
        }

        try {
            // Generate embedding
            List<Float> embedding = embeddingService.generateJobEmbedding(title, description, requirements);
            if (embedding.isEmpty()) {
                log.warn("Could not generate embedding for Job: {}", jobId);
                return;
            }

            Map<String, Object> properties = new HashMap<>();
            properties.put("jobId", jobId);
            properties.put("title", title);
            properties.put("description", description != null && description.length() > 1000 
                ? description.substring(0, 1000) : description);

            // Convert List<Float> to Float[]
            Float[] embeddingArray = embedding.toArray(new Float[0]);
            
            Result<WeaviateObject> result = client.data().creator()
                .withClassName(JOB_CLASS)
                .withID(jobId)
                .withProperties(properties)
                .withVector(embeddingArray)
                .withConsistencyLevel(ConsistencyLevel.ONE)
                .run();

            if (result.hasErrors()) {
                log.error("Error storing Job in vector DB: {}", result.getError());
            } else {
                log.info("Job stored successfully in vector DB: {}", jobId);
            }
        } catch (Exception e) {
            log.error("Exception storing Job in vector DB", e);
        }
    }

    /**
     * Semantic search for matching CVs to a job
     */
    public List<String> findMatchingCVs(String jobDescription, int limit) {
        if (!enabled || client == null) {
            log.warn("Vector DB is not enabled or client not initialized");
            return Collections.emptyList();
        }

        try {
            Result<GraphQLResponse> result = client.graphQL().get()
                .withClassName(CV_CLASS)
                .withFields(
                    Field.builder().name("cvId").build(),
                    Field.builder().name("_additional").fields(
                        Field.builder().name("certainty").build(),
                        Field.builder().name("distance").build()
                    ).build()
                )
                .withNearText(NearTextArgument.builder()
                    .concepts(new String[]{jobDescription})
                    .build())
                .withLimit(limit)
                .run();

            if (result.hasErrors()) {
                log.error("Error searching CVs: {}", result.getError());
                return Collections.emptyList();
            }

            // Parse results and extract CV IDs
            List<String> cvIds = new ArrayList<>();
            // Implementation would parse GraphQLResponse here
            return cvIds;
        } catch (Exception e) {
            log.error("Exception searching CVs", e);
            return Collections.emptyList();
        }
    }

    /**
     * Semantic search for matching Jobs to a CV
     */
    public List<String> findMatchingJobs(String cvContent, int limit) {
        if (!enabled || client == null) {
            log.warn("Vector DB is not enabled or client not initialized");
            return Collections.emptyList();
        }

        try {
            Result<GraphQLResponse> result = client.graphQL().get()
                .withClassName(JOB_CLASS)
                .withFields(
                    Field.builder().name("jobId").build(),
                    Field.builder().name("_additional").fields(
                        Field.builder().name("certainty").build(),
                        Field.builder().name("distance").build()
                    ).build()
                )
                .withNearText(NearTextArgument.builder()
                    .concepts(new String[]{cvContent})
                    .build())
                .withLimit(limit)
                .run();

            if (result.hasErrors()) {
                log.error("Error searching Jobs: {}", result.getError());
                return Collections.emptyList();
            }

            // Parse results and extract Job IDs
            List<String> jobIds = new ArrayList<>();
            // Implementation would parse GraphQLResponse here
            return jobIds;
        } catch (Exception e) {
            log.error("Exception searching Jobs", e);
            return Collections.emptyList();
        }
    }

    public boolean isEnabled() {
        return enabled && client != null;
    }
}
