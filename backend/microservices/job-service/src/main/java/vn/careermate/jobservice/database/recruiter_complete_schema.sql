-- ============================================
-- HOÀN THIỆN DATABASE CHO CHỨC NĂNG NHÀ TUYỂN DỤNG
-- ============================================
-- Script này bổ sung các bảng và cột còn thiếu cho đầy đủ chức năng nhà tuyển dụng

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CẬP NHẬT BẢNG ARTICLES (nếu chưa có reactions_count và comments_count)
-- ============================================

-- Kiểm tra và thêm cột reactions_count nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'reactions_count'
    ) THEN
        ALTER TABLE articles ADD COLUMN reactions_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Kiểm tra và thêm cột comments_count nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE articles ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- 2. INTERVIEW SCHEDULING & MANAGEMENT
-- ============================================

-- Bảng lưu lịch phỏng vấn chi tiết
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    interview_type VARCHAR(50) CHECK (interview_type IN ('PHONE', 'VIDEO', 'ONSITE', 'PANEL', 'TECHNICAL', 'HR', 'FINAL')),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT, -- For onsite interviews
    meeting_link TEXT, -- For video interviews
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW')),
    notes TEXT,
    feedback TEXT, -- Recruiter feedback after interview
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Candidate rating
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter ON interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- ============================================
-- 3. RECRUITER NOTES & COMMENTS ON APPLICATIONS
-- ============================================

-- Bảng ghi chú của recruiter về ứng viên
CREATE TABLE IF NOT EXISTS recruiter_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'NOTE' CHECK (note_type IN ('NOTE', 'FEEDBACK', 'EVALUATION', 'REMINDER')),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE, -- Private notes only visible to creator
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_recruiter_notes_application ON recruiter_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_recruiter ON recruiter_notes(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_created ON recruiter_notes(created_at DESC);

-- ============================================
-- 4. SAVED CANDIDATES / BOOKMARKS
-- ============================================

-- Bảng lưu ứng viên yêu thích của recruiter
CREATE TABLE IF NOT EXISTS saved_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    folder_name VARCHAR(100), -- Organize candidates into folders
    notes TEXT,
    tags TEXT[], -- Custom tags for organization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recruiter_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_candidates_recruiter ON saved_candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_student ON saved_candidates(student_id);

-- ============================================
-- 5. JOB VIEWS TRACKING
-- ============================================

-- Bảng theo dõi lượt xem chi tiết của job
CREATE TABLE IF NOT EXISTS job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id), -- NULL if anonymous
    viewer_type VARCHAR(20) CHECK (viewer_type IN ('STUDENT', 'RECRUITER', 'ADMIN', 'ANONYMOUS')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_views_job ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewer ON job_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_job_views_date ON job_views(viewed_at DESC);

-- ============================================
-- 6. COMPANY FOLLOWERS / SUBSCRIBERS
-- ============================================

-- Bảng theo dõi công ty (students follow companies)
CREATE TABLE IF NOT EXISTS company_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT TRUE, -- Receive notifications for new jobs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_company_followers_company ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_student ON company_followers(student_id);

-- ============================================
-- 7. RECRUITER DASHBOARD STATISTICS CACHE
-- ============================================

-- Bảng cache thống kê cho dashboard (optional, for performance)
CREATE TABLE IF NOT EXISTS recruiter_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    period_type VARCHAR(20) DEFAULT 'DAILY' CHECK (period_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    period_date DATE NOT NULL,
    active_jobs_count INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    new_applications INTEGER DEFAULT 0,
    interviews_scheduled INTEGER DEFAULT 0,
    offers_sent INTEGER DEFAULT 0,
    hires_made INTEGER DEFAULT 0,
    job_views INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recruiter_id, period_type, period_date)
);

CREATE INDEX IF NOT EXISTS idx_recruiter_stats_recruiter ON recruiter_statistics(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_stats_period ON recruiter_statistics(period_type, period_date);

-- ============================================
-- 8. JOB ALERTS / NOTIFICATIONS FOR RECRUITERS
-- ============================================

-- Bảng thông báo cho recruiter
CREATE TABLE IF NOT EXISTS recruiter_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'NEW_APPLICATION', 'APPLICATION_STATUS_CHANGE', 'INTERVIEW_REMINDER', 
        'JOB_APPROVED', 'JOB_REJECTED', 'JOB_EXPIRING', 'SYSTEM_ALERT'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    related_application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recruiter_notifications_recruiter ON recruiter_notifications(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notifications_read ON recruiter_notifications(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_notifications_type ON recruiter_notifications(notification_type);

-- ============================================
-- 9. RECRUITER ACTIVITY LOG
-- ============================================

-- Bảng log hoạt động của recruiter (for audit trail)
CREATE TABLE IF NOT EXISTS recruiter_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'JOB_CREATED', 'APPLICATION_VIEWED', 'STATUS_CHANGED', etc.
    resource_type VARCHAR(50), -- 'JOB', 'APPLICATION', 'CANDIDATE', etc.
    resource_id UUID,
    details JSONB, -- Additional details about the action
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recruiter_activity_recruiter ON recruiter_activity_logs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_activity_action ON recruiter_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_recruiter_activity_created ON recruiter_activity_logs(created_at DESC);

-- ============================================
-- 10. CANDIDATE SEARCH HISTORY (for AI matching)
-- ============================================

-- Bảng lưu lịch sử tìm kiếm ứng viên của recruiter
CREATE TABLE IF NOT EXISTS candidate_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    search_criteria JSONB, -- Search filters and criteria
    results_count INTEGER,
    search_method VARCHAR(50) CHECK (search_method IN ('MANUAL', 'AI_MATCHING', 'VECTOR_SEARCH', 'KEYWORD')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_search_recruiter ON candidate_search_history(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_search_job ON candidate_search_history(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_search_created ON candidate_search_history(created_at DESC);

-- ============================================
-- 11. TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Tạo function update_updated_at_column nếu chưa có
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger để tự động cập nhật updated_at cho các bảng mới
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_notes_updated_at BEFORE UPDATE ON recruiter_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_statistics_updated_at BEFORE UPDATE ON recruiter_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger để tự động tăng views_count khi có view mới
CREATE OR REPLACE FUNCTION increment_job_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs
    SET views_count = views_count + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_job_views
AFTER INSERT ON job_views
FOR EACH ROW EXECUTE FUNCTION increment_job_views_count();

-- ============================================
-- 12. VIEWS FOR EASY QUERYING
-- ============================================

-- View tổng hợp thông tin ứng viên cho recruiter
CREATE OR REPLACE VIEW recruiter_candidate_summary AS
SELECT 
    a.id AS application_id,
    a.job_id,
    j.title AS job_title,
    sp.id AS student_id,
    u.full_name AS student_name,
    u.email AS student_email,
    a.status AS application_status,
    a.match_score,
    a.applied_at,
    a.viewed_at,
    a.interview_scheduled_at,
    COUNT(DISTINCT i.id) AS interviews_count,
    (SELECT COUNT(*) FROM recruiter_notes rn WHERE rn.application_id = a.id) AS notes_count,
    MAX(i.scheduled_at) AS last_interview_date
FROM applications a
JOIN jobs j ON a.job_id = j.id
JOIN student_profiles sp ON a.student_id = sp.id
JOIN users u ON sp.user_id = u.id
LEFT JOIN interviews i ON a.id = i.application_id
GROUP BY a.id, a.job_id, j.title, sp.id, u.full_name, u.email, a.status, a.match_score, a.applied_at, a.viewed_at, a.interview_scheduled_at;

-- View thống kê job cho recruiter
CREATE OR REPLACE VIEW recruiter_job_statistics AS
SELECT 
    j.id AS job_id,
    j.title,
    j.status,
    j.created_at,
    j.views_count,
    j.applications_count,
    COUNT(DISTINCT a.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'PENDING' THEN a.id END) AS pending_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'SHORTLISTED' THEN a.id END) AS shortlisted_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'INTERVIEW' THEN a.id END) AS interview_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'OFFERED' THEN a.id END) AS offered_applications,
    AVG(a.match_score) AS avg_match_score,
    MAX(a.applied_at) AS last_application_date
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.title, j.status, j.created_at, j.views_count, j.applications_count;

-- ============================================
-- 13. COMMENTS
-- ============================================

COMMENT ON TABLE interviews IS 'Lưu trữ lịch phỏng vấn chi tiết giữa recruiter và ứng viên';
COMMENT ON TABLE recruiter_notes IS 'Ghi chú của recruiter về ứng viên trong quá trình tuyển dụng';
COMMENT ON TABLE saved_candidates IS 'Danh sách ứng viên được recruiter đánh dấu yêu thích';
COMMENT ON TABLE job_views IS 'Theo dõi lượt xem chi tiết của job posting';
COMMENT ON TABLE company_followers IS 'Danh sách sinh viên theo dõi công ty';
COMMENT ON TABLE recruiter_statistics IS 'Cache thống kê cho dashboard của recruiter';
COMMENT ON TABLE recruiter_notifications IS 'Thông báo cho recruiter về các sự kiện quan trọng';
COMMENT ON TABLE recruiter_activity_logs IS 'Log hoạt động của recruiter để audit';
COMMENT ON TABLE candidate_search_history IS 'Lịch sử tìm kiếm ứng viên của recruiter';
