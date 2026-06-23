package vn.careermate.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Component để tự động chạy database migration khi ứng dụng khởi động
 * Chạy migration để thêm các cột hidden vào bảng jobs và articles
 */
/**
 * DEPRECATED: This component is disabled because we've migrated to microservices architecture.
 * Database migrations should now be handled by each microservice individually.
 * 
 * This backend (monolithic) is no longer actively used.
 */
@Slf4j
// @Component  // DISABLED - Backend cũ không còn sử dụng
@Order(1) // Chạy sớm nhất có thể
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting database migration for hidden columns...");
        
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Migration cho jobs table
            log.info("Migrating jobservice.jobs table...");
            
            // Check and add hidden column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'jobservice' 
                            AND table_name = 'jobs' 
                            AND column_name = 'hidden'
                        ) THEN
                            ALTER TABLE jobservice.jobs 
                            ADD COLUMN hidden BOOLEAN DEFAULT false;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden' column to jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not add 'hidden' column to jobs (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_reason column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'jobservice' 
                            AND table_name = 'jobs' 
                            AND column_name = 'hidden_reason'
                        ) THEN
                            ALTER TABLE jobservice.jobs 
                            ADD COLUMN hidden_reason TEXT;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_reason' column to jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_reason' column to jobs (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_at column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'jobservice' 
                            AND table_name = 'jobs' 
                            AND column_name = 'hidden_at'
                        ) THEN
                            ALTER TABLE jobservice.jobs 
                            ADD COLUMN hidden_at TIMESTAMP;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_at' column to jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_at' column to jobs (may already exist): {}", e.getMessage());
            }
            
            // Create index for jobs
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_indexes 
                            WHERE schemaname = 'jobservice' 
                            AND tablename = 'jobs' 
                            AND indexname = 'idx_jobs_hidden'
                        ) THEN
                            CREATE INDEX idx_jobs_hidden ON jobservice.jobs(hidden);
                        END IF;
                    END $$;
                    """);
                log.info("✓ Created index 'idx_jobs_hidden' on jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not create index for jobs (may already exist): {}", e.getMessage());
            }
            
            // Migration cho articles table
            log.info("Migrating contentservice.articles table...");
            
            // Check and add hidden column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'contentservice' 
                            AND table_name = 'articles' 
                            AND column_name = 'hidden'
                        ) THEN
                            ALTER TABLE contentservice.articles 
                            ADD COLUMN hidden BOOLEAN DEFAULT false;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden' column to contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not add 'hidden' column to articles (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_reason column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'contentservice' 
                            AND table_name = 'articles' 
                            AND column_name = 'hidden_reason'
                        ) THEN
                            ALTER TABLE contentservice.articles 
                            ADD COLUMN hidden_reason TEXT;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_reason' column to contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_reason' column to articles (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_at column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'contentservice' 
                            AND table_name = 'articles' 
                            AND column_name = 'hidden_at'
                        ) THEN
                            ALTER TABLE contentservice.articles 
                            ADD COLUMN hidden_at TIMESTAMP;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_at' column to contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_at' column to articles (may already exist): {}", e.getMessage());
            }
            
            // Create index for articles
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_indexes 
                            WHERE schemaname = 'contentservice' 
                            AND tablename = 'articles' 
                            AND indexname = 'idx_articles_hidden'
                        ) THEN
                            CREATE INDEX idx_articles_hidden ON contentservice.articles(hidden);
                        END IF;
                    END $$;
                    """);
                log.info("✓ Created index 'idx_articles_hidden' on contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not create index for articles (may already exist): {}", e.getMessage());
            }
            
            // Migration cho audit_logs table
            log.info("Migrating adminservice.audit_logs table...");
            
            // Create schema if not exists
            try {
                statement.execute("CREATE SCHEMA IF NOT EXISTS adminservice");
                log.info("✓ Created adminservice schema");
            } catch (Exception e) {
                log.warn("Could not create adminservice schema (may already exist): {}", e.getMessage());
            }
            
            // Create audit_logs table
            try {
                statement.execute("""
                    CREATE TABLE IF NOT EXISTS adminservice.audit_logs (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        admin_id UUID NOT NULL,
                        admin_email VARCHAR(255),
                        action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'HIDE', 'UNHIDE')),
                        entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('USER', 'JOB', 'ARTICLE', 'PACKAGE', 'SUBSCRIPTION', 'CV_TEMPLATE')),
                        entity_id UUID NOT NULL,
                        entity_name VARCHAR(255),
                        description TEXT,
                        ip_address VARCHAR(45),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
                log.info("✓ Created adminservice.audit_logs table");
            } catch (Exception e) {
                log.warn("Could not create audit_logs table (may already exist): {}", e.getMessage());
            }
            
            // Create indexes for audit_logs
            try {
                statement.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON adminservice.audit_logs(admin_id)");
                log.info("✓ Created index 'idx_audit_logs_admin'");
            } catch (Exception e) {
                log.warn("Could not create index for audit_logs (may already exist): {}", e.getMessage());
            }
            
            try {
                statement.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON adminservice.audit_logs(entity_type, entity_id)");
                log.info("✓ Created index 'idx_audit_logs_entity'");
            } catch (Exception e) {
                log.warn("Could not create index for audit_logs (may already exist): {}", e.getMessage());
            }
            
            try {
                statement.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON adminservice.audit_logs(created_at DESC)");
                log.info("✓ Created index 'idx_audit_logs_created'");
            } catch (Exception e) {
                log.warn("Could not create index for audit_logs (may already exist): {}", e.getMessage());
            }
            
            try {
                statement.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON adminservice.audit_logs(action_type)");
                log.info("✓ Created index 'idx_audit_logs_action'");
            } catch (Exception e) {
                log.warn("Could not create index for audit_logs (may already exist): {}", e.getMessage());
            }
            
            log.info("✅ Database migration completed successfully!");
            
        } catch (Exception e) {
            log.error("❌ Error running database migration: {}", e.getMessage(), e);
            // Không throw exception để app vẫn có thể chạy được
            // Nếu migration fail, user có thể chạy manual script
        }
    }
}
