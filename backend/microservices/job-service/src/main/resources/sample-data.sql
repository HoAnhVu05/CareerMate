-- ============================================================================
-- JOB SERVICE DATABASE SETUP
-- Tables: jobs, applications, saved_jobs
-- ============================================================================

-- JOBS (requires companies from content-service)
DO $$
DECLARE
  company_id1 UUID;
  company_id2 UUID;
BEGIN
  SELECT id INTO company_id1 FROM companies WHERE name = 'FPT Software' LIMIT 1;
  SELECT id INTO company_id2 FROM companies WHERE name = 'VNG Corporation' LIMIT 1;
  
  IF company_id1 IS NOT NULL THEN
    INSERT INTO jobs (id, company_id, title, description, requirements, benefits, location, job_type, experience_level, salary_min, salary_max, status, created_at, updated_at, expires_at)
    VALUES
      (gen_random_uuid(), company_id1, 'Java Backend Developer', 
       'Phát triển hệ thống backend với Spring Boot', 
       'Java, Spring Boot, Microservices, PostgreSQL', 
       'Lương cạnh tranh, Bảo hiểm đầy đủ, Du lịch hàng năm', 
       'Hà Nội', 'FULL_TIME', 'MID_LEVEL', 15000000, 25000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
       
      (gen_random_uuid(), company_id1, 'Frontend Developer (React)', 
       'Phát triển giao diện người dùng với React', 
       'React.js, TypeScript, TailwindCSS, RESTful API', 
       'Flexible working hours, Laptop provided, Learning budget', 
       'Hà Nội', 'FULL_TIME', 'JUNIOR', 10000000, 18000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days');
  END IF;
  
  IF company_id2 IS NOT NULL THEN
    INSERT INTO jobs (id, company_id, title, description, requirements, benefits, location, job_type, experience_level, salary_min, salary_max, status, created_at, updated_at, expires_at)
    VALUES
      (gen_random_uuid(), company_id2, 'Mobile Developer (Flutter)', 
       'Phát triển ứng dụng mobile đa nền tảng', 
       'Flutter, Dart, Firebase, RESTful API', 
       'Competitive salary, 13th month salary, Annual bonus', 
       'TP.HCM', 'FULL_TIME', 'MID_LEVEL', 18000000, 30000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '45 days'),
       
      (gen_random_uuid(), company_id2, 'DevOps Engineer', 
       'Xây dựng và vận hành hệ thống CI/CD', 
       'Docker, Kubernetes, AWS, Jenkins, Linux', 
       'Remote working option, Top salary, Stock options', 
       'TP.HCM', 'FULL_TIME', 'SENIOR', 25000000, 40000000, 'ACTIVE', 
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days');
  END IF;
END $$;

-- Verify
SELECT 'Jobs created' as message, COUNT(*) as count FROM jobs;
