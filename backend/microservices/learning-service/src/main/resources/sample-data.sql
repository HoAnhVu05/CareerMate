-- ============================================================================
-- LEARNING SERVICE DATABASE SETUP
-- Tables: packages, cv_templates, courses, challenges, badges, subscriptions
-- ============================================================================

-- 1. PACKAGES
INSERT INTO packages (id, name, description, price, duration_days, features, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Gói Cơ Bản', 'Gói dịch vụ cơ bản cho sinh viên mới bắt đầu tìm việc', 99000, 30, 
   ARRAY['Xem 50 tin tuyển dụng/tháng', 'Ứng tuyển không giới hạn', 'Tạo 1 CV', 'Hỗ trợ email'], 
   true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Gói Tiêu Chuẩn', 'Gói phổ biến nhất với đầy đủ tính năng cơ bản', 199000, 90, 
   ARRAY['Xem tin tuyển dụng không giới hạn', 'Ứng tuyển không giới hạn', 'Tạo 5 CV', 'Phân tích CV với AI', 'Gợi ý việc làm', 'Hỗ trợ ưu tiên'], 
   true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Gói Premium', 'Gói cao cấp với tất cả tính năng và hỗ trợ VIP', 499000, 365, 
   ARRAY['Tất cả tính năng gói Tiêu Chuẩn', 'Tạo CV không giới hạn', 'Lộ trình nghề nghiệp cá nhân hóa', 'Khóa học trực tuyến miễn phí', 'Ưu tiên hiển thị hồ sơ', 'Hỗ trợ 24/7', 'Tư vấn nghề nghiệp 1-1'], 
   true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- 2. CV TEMPLATES
INSERT INTO cv_templates (id, name, description, template_data, thumbnail_url, category, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Modern Professional', 'Template hiện đại phù hợp với mọi ngành nghề', 
   '{"sections": ["header", "experience", "education", "skills"], "layout": "two-column"}', 
   NULL, 'PROFESSIONAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Creative Designer', 'Template sáng tạo cho designer và creative', 
   '{"sections": ["header", "portfolio", "experience", "skills"], "layout": "creative"}', 
   NULL, 'CREATIVE', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
   
  (gen_random_uuid(), 'Tech Resume', 'Template tối giản cho lập trình viên', 
   '{"sections": ["header", "technical_skills", "projects", "experience"], "layout": "minimal"}', 
   NULL, 'TECHNICAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'Packages created' as message, COUNT(*) as count FROM packages
UNION ALL
SELECT 'CV Templates created', COUNT(*) FROM cv_templates;
