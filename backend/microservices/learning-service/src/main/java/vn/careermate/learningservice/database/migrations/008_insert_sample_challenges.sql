-- Insert sample challenges
-- These challenges are always active (no start_date or end_date)

-- Challenge 1: CV Writing
INSERT INTO learningservice.challenges (id, title, description, category, difficulty, start_date, end_date, passing_score, instructions, expected_keywords, created_at)
VALUES (
    gen_random_uuid(),
    'Viết CV chuyên nghiệp',
    'Tạo một CV hoàn chỉnh và chuyên nghiệp với đầy đủ thông tin cá nhân, học vấn, kinh nghiệm và kỹ năng',
    'CV',
    'EASY',
    NULL, -- Always active
    NULL, -- Always active
    70,
    '1. Tạo CV mới trên hệ thống
2. Điền đầy đủ thông tin cá nhân
3. Thêm ít nhất 2 kinh nghiệm làm việc hoặc dự án
4. Liệt kê ít nhất 5 kỹ năng
5. Upload CV đã hoàn thành',
    'CV, thông tin cá nhân, kinh nghiệm, kỹ năng, học vấn',
    CURRENT_TIMESTAMP
);

-- Challenge 2: Interview Skills
INSERT INTO learningservice.challenges (id, title, description, category, difficulty, start_date, end_date, passing_score, instructions, expected_keywords, created_at)
VALUES (
    gen_random_uuid(),
    'Chuẩn bị phỏng vấn',
    'Hoàn thành bài test phỏng vấn và đạt điểm trên 80%',
    'INTERVIEW',
    'MEDIUM',
    NULL,
    NULL,
    80,
    '1. Tham gia bài test phỏng vấn
2. Trả lời ít nhất 10 câu hỏi
3. Đạt điểm tối thiểu 80%
4. Nộp kết quả',
    'phỏng vấn, câu hỏi, trả lời, điểm số',
    CURRENT_TIMESTAMP
);

-- Challenge 3: Career Planning
INSERT INTO learningservice.challenges (id, title, description, category, difficulty, start_date, end_date, passing_score, instructions, expected_keywords, created_at)
VALUES (
    gen_random_uuid(),
    'Lập kế hoạch sự nghiệp',
    'Tạo roadmap sự nghiệp 5 năm với các mục tiêu cụ thể và kế hoạch hành động',
    'CAREER',
    'MEDIUM',
    NULL,
    NULL,
    70,
    '1. Xác định mục tiêu sự nghiệp
2. Vạch ra roadmap 5 năm
3. Liệt kê các kỹ năng cần phát triển
4. Đề xuất các bước hành động cụ thể
5. Nộp bản kế hoạch',
    'kế hoạch, mục tiêu, roadmap, sự nghiệp, phát triển',
    CURRENT_TIMESTAMP
);

-- Challenge 4: Technical Skills
INSERT INTO learningservice.challenges (id, title, description, category, difficulty, start_date, end_date, passing_score, instructions, expected_keywords, created_at)
VALUES (
    gen_random_uuid(),
    'Nâng cao kỹ năng kỹ thuật',
    'Hoàn thành ít nhất 3 khóa học kỹ thuật và đạt chứng chỉ',
    'SKILL',
    'HARD',
    NULL,
    NULL,
    75,
    '1. Đăng ký ít nhất 3 khóa học kỹ thuật
2. Hoàn thành tất cả bài học
3. Đạt điểm trung bình trên 75%
4. Nhận chứng chỉ hoàn thành',
    'khóa học, kỹ năng kỹ thuật, chứng chỉ, hoàn thành',
    CURRENT_TIMESTAMP
);

-- Challenge 5: Networking
INSERT INTO learningservice.challenges (id, title, description, category, difficulty, start_date, end_date, passing_score, instructions, expected_keywords, created_at)
VALUES (
    gen_random_uuid(),
    'Xây dựng mạng lưới nghề nghiệp',
    'Kết nối với ít nhất 10 người trong ngành và tham gia 2 sự kiện networking',
    'CAREER',
    'EASY',
    NULL,
    NULL,
    70,
    '1. Kết nối với ít nhất 10 người trong ngành
2. Tham gia 2 sự kiện networking
3. Chia sẻ kinh nghiệm trên diễn đàn
4. Nộp bằng chứng kết nối',
    'networking, kết nối, mạng lưới, sự kiện',
    CURRENT_TIMESTAMP
);
