package vn.careermate.userservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting database initialization...");
        
        try {
            // Read init-db.sql from classpath
            ClassPathResource resource = new ClassPathResource("init-db.sql");
            String sql = FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
            
            // Execute SQL
            jdbcTemplate.execute(sql);
            
            log.info("Database initialization completed successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize database: {}", e.getMessage());
            // Don't throw exception to allow app to start even if it fails (e.g., if tables already exist)
        }
    }
}
