-- ============================================================================
-- USER SERVICE DATABASE SETUP
-- Tables: users, student_profile, recruiter_profile, cv, messages, conversations
-- ============================================================================

-- Sample Users (Students & Recruiters)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'student' || generate_series || '@example.com',
  '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu',
  'Sinh viên ' || generate_series,
  '090000' || LPAD(generate_series::text, 4, '0'),
  'STUDENT',
  'ACTIVE',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM generate_series(1, 10)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'recruiter' || generate_series || '@company.com',
  '$2a$10$rN7aLbLWlH6/y1qQJqJ7OuGq6F/HJdGS1KQqZp7VFhXqaVD3H5emu',
  'Nhà tuyển dụng ' || generate_series,
  '091000' || LPAD(generate_series::text, 4, '0'),
  'RECRUITER',
  'ACTIVE',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM generate_series(1, 5)
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT 'Users created' as message, COUNT(*) as count FROM users WHERE role IN ('STUDENT', 'RECRUITER');
