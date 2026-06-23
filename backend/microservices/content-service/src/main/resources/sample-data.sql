-- ============================================================================
-- CONTENT SERVICE DATABASE SETUP
-- Tables: articles, companies, company_ratings
-- ============================================================================

-- 1. COMPANIES
INSERT INTO companies (id, name, description, industry, location, logo_url, website, employee_count, is_verified, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'FPT Software', 'Công ty phần mềm hàng đầu Việt Nam', 'Công nghệ thông tin', 'Hà Nội, Việt Nam', 
   NULL, 'https://fptsoftware.com', '20000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Viettel Solutions', 'Giải pháp CNTT của Tập đoàn Viettel', 'Viễn thông', 'Hà Nội, Việt Nam', 
   NULL, 'https://www.viettelsolutions.vn', '5000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'VNG Corporation', 'Tập đoàn công nghệ hàng đầu VN', 'Game & Social Media', 'TP.HCM, Việt Nam', 
   NULL, 'https://www.vng.com.vn', '3000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Shopee Vietnam', 'Sàn thương mại điện tử số 1', 'E-commerce', 'TP.HCM, Việt Nam', 
   NULL, 'https://shopee.vn', '2000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Tiki Corporation', 'Sàn TMĐT phát triển nhanh nhất VN', 'E-commerce', 'TP.HCM, Việt Nam', 
   NULL, 'https://tiki.vn', '1000+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 2. ARTICLES
DO $$
DECLARE
  author_id UUID;
BEGIN
  SELECT id INTO author_id FROM users WHERE email = 'admin@careermate.vn' LIMIT 1;
  
  IF author_id IS NOT NULL THEN
    INSERT INTO articles (id, title, content, summary, author_id, thumbnail_url, category, tags, status, is_published, created_at, updated_at)
    VALUES
      (gen_random_uuid(), '10 Kỹ năng mềm quan trọng khi đi làm', 
       '<p>Kỹ năng mềm đóng vai trò rất quan trọng trong công việc...</p>',
       'Tìm hiểu 10 kỹ năng mềm thiết yếu mà mọi sinh viên cần có',
       author_id, NULL, 'CAREER_TIPS', 
       ARRAY['soft skills', 'career', 'tips'], 
       'PUBLISHED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       
      (gen_random_uuid(), 'Cách viết CV thu hút nhà tuyển dụng', 
       '<p>Một CV tốt có thể giúp bạn nổi bật giữa hàng trăm ứng viên...</p>',
       'Hướng dẫn chi tiết cách viết CV chuyên nghiệp',
       author_id, NULL, 'CV_TIPS', 
       ARRAY['CV', 'resume', 'job application'], 
       'PUBLISHED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       
      (gen_random_uuid(), 'Xu hướng ngành công nghệ 2026', 
       '<p>Năm 2026 sẽ chứng kiến sự bùng nổ của AI và Machine Learning...</p>',
       'Phân tích xu hướng công nghệ mới nhất năm 2026',
       author_id, NULL, 'INDUSTRY_NEWS', 
       ARRAY['technology', 'trends', 'AI'], 
       'PUBLISHED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  END IF;
END $$;

-- Verify
SELECT 'Companies created' as message, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Articles created', COUNT(*) FROM articles;
