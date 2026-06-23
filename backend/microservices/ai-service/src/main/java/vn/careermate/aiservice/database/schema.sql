-- AI Service Schema
-- Run this after creating database and schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AI CHAT CONVERSATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.ai_chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    conversation_title VARCHAR(255),
    role VARCHAR(50), -- CAREER_COACH, CV_ADVISOR, INTERVIEW_PREP, etc.
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_student ON aiservice.ai_chat_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created ON aiservice.ai_chat_conversations(created_at DESC);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS aiservice.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES aiservice.ai_chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation ON aiservice.ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created ON aiservice.ai_chat_messages(created_at DESC);

-- ============================================
-- MOCK INTERVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    job_id UUID NOT NULL, -- References jobservice.jobs(id) - cross-schema reference
    cv_id UUID, -- References userservice.cvs(id) - cross-schema reference (optional)
    status VARCHAR(20) DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    overall_score DECIMAL(5,2),
    total_questions INTEGER,
    answered_questions INTEGER,
    ai_feedback JSONB,
    duration_seconds INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_student ON aiservice.mock_interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_job ON aiservice.mock_interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_status ON aiservice.mock_interviews(status);

-- Mock Interview Questions
CREATE TABLE IF NOT EXISTS aiservice.mock_interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mock_interview_id UUID NOT NULL REFERENCES aiservice.mock_interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50), -- TECHNICAL, BEHAVIORAL, SITUATIONAL, etc.
    order_index INTEGER,
    answer TEXT,
    ai_feedback JSONB,
    score DECIMAL(5,2),
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_questions_interview ON aiservice.mock_interview_questions(mock_interview_id);
CREATE INDEX IF NOT EXISTS idx_mock_interview_questions_order ON aiservice.mock_interview_questions(mock_interview_id, order_index);

-- ============================================
-- CAREER ROADMAPS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.career_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    career_goal VARCHAR(255) NOT NULL,
    current_level VARCHAR(50),
    target_level VARCHAR(50),
    roadmap_data JSONB,
    skills_gap JSONB, -- Array of skills
    recommended_courses JSONB, -- Array of course objects
    estimated_duration_months INTEGER,
    progress_percentage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_student ON aiservice.career_roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_goal ON aiservice.career_roadmaps(career_goal);

-- ============================================
-- JOB RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS aiservice.job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    job_id UUID NOT NULL, -- References jobservice.jobs(id) - cross-schema reference
    match_score DECIMAL(5,2) NOT NULL,
    match_reasons JSONB, -- Array of reasons why this job matches
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed BOOLEAN DEFAULT FALSE,
    applied BOOLEAN DEFAULT FALSE,
    UNIQUE(student_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_recommendations_student ON aiservice.job_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_job ON aiservice.job_recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON aiservice.job_recommendations(student_id, match_score DESC);
