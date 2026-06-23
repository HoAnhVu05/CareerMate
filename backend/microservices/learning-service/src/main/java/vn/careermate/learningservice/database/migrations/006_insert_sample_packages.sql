-- Insert sample subscription packages
-- Note: These are free packages that require admin approval (no payment)

-- Package 1: Basic Package - Free
INSERT INTO learningservice.packages (id, name, description, price, duration_days, features, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Gói Cơ bản',
    'Gói dịch vụ cơ bản, phù hợp cho sinh viên mới bắt đầu tìm kiếm việc làm',
    0.00,
    30,
    '["Xem tất cả tin tuyển dụng", "Tạo CV từ mẫu", "Ứng tuyển 10 vị trí/tháng", "Xem bài viết hướng nghiệp"]'::jsonb,
    true,
    CURRENT_TIMESTAMP
);

-- Package 2: Premium Package - Free with approval
INSERT INTO learningservice.packages (id, name, description, price, duration_days, features, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Gói Premium',
    'Gói dịch vụ cao cấp với nhiều tính năng ưu đãi, hỗ trợ tốt hơn cho công việc tìm kiếm',
    0.00,
    90,
    '["Xem tất cả tin tuyển dụng", "Ứng tuyển không giới hạn", "Tạo CV không giới hạn", "Ưu tiên trong kết quả tìm kiếm", "Truy cập khóa học premium", "Tư vấn nghề nghiệp từ chuyên gia"]'::jsonb,
    true,
    CURRENT_TIMESTAMP
);

-- Package 3: Student Pro - Free with approval
INSERT INTO learningservice.packages (id, name, description, price, duration_days, features, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Gói Sinh viên Pro',
    'Gói dành riêng cho sinh viên, hỗ trợ tối đa quá trình tìm việc và phát triển sự nghiệp',
    0.00,
    180,
    '["Tất cả tính năng Premium", "Mock Interview không giới hạn", "Phân tích CV bằng AI", "Job recommendations cá nhân hóa", "Tham gia thử thách và nhận badge", "Truy cập toàn bộ khóa học"]'::jsonb,
    true,
    CURRENT_TIMESTAMP
);

-- Package 4: Career Boost - Free with approval
INSERT INTO learningservice.packages (id, name, description, price, duration_days, features, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Gói Thăng tiến Sự nghiệp',
    'Gói dịch vụ cao cấp nhất, hỗ trợ toàn diện cho sự nghiệp của bạn',
    0.00,
    365,
    '["Tất cả tính năng Student Pro", "Career roadmap cá nhân hóa", "Mentoring 1-1 từ chuyên gia", "Workshop và sự kiện độc quyền", "Hỗ trợ viết cover letter chuyên nghiệp", "Theo dõi tiến độ ứng tuyển chi tiết", "Nhận thông báo việc làm phù hợp đầu tiên"]'::jsonb,
    true,
    CURRENT_TIMESTAMP
);
