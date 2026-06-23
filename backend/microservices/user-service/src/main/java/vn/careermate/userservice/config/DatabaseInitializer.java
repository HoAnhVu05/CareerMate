package vn.careermate.userservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting database initialization...");
        
        try {
            // Read init-db.sql
            String sqlPath = "src/main/resources/init-db.sql";
            String sql = new String(Files.readAllBytes(Paths.get(sqlPath)));
            
            // Execute SQL
            // Split by semicolon to execute one by one if needed, 
            // but for simple scripts jdbcTemplate.execute(sql) works.
            jdbcTemplate.execute(sql);
            
            log.info("Database initialization completed successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize database: {}", e.getMessage());
            // Don't throw exception to allow app to start even if it fails (e.g., if tables already exist)
        }
    }
}
