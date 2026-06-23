-- User Service Database Schema
-- PostgreSQL Database - userservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create userservice schema if not exists
CREATE SCHEMA IF NOT EXISTS userservice;
GRANT ALL PRIVILEGES ON SCHEMA userservice TO postgres;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS userservice.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'RECRUITER', 'ADMIN', 'MENTOR')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON userservice.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON userservice.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON userservice.users(status);

-- OAuth providers (Google, etc.)
CREATE TABLE IF NOT EXISTS userservice.oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES userservice.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'GOOGLE', 'FACEBOOK', etc.
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- ============================================
-- STUDENT PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS userservice.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES userservice.users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    university VARCHAR(255),
    major VARCHAR(255),
    graduation_year INTEGER,
    gpa DECIMAL(3,2),
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    avatar_url TEXT,
    current_status VARCHAR(50), -- 'STUDYING', 'GRADUATED', 'LOOKING_FOR_JOB'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Skills
CREATE TABLE IF NOT EXISTS userservice.student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES userservice.student_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(20) CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    years_of_experience DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_skills_student ON userservice.student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_name ON userservice.student_skills(skill_name);

-- CVs
CREATE TABLE IF NOT EXISTS userservice.cvs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES userservice.student_profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    ai_analysis JSONB, -- Store AI analysis results
    ai_score DECIMAL(5,2), -- Overall CV score from AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cvs_student ON userservice.cvs(student_id);
CREATE INDEX IF NOT EXISTS idx_cvs_default ON userservice.cvs(student_id, is_default);

-- ============================================
-- RECRUITER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS userservice.recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES userservice.users(id) ON DELETE CASCADE,
    company_id UUID, -- References companies table in contentservice schema
    position VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MESSAGING
-- ============================================

-- Conversations
CREATE TABLE IF NOT EXISTS userservice.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES userservice.users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES userservice.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON userservice.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON userservice.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON userservice.conversations(last_message_at DESC);

-- Messages
CREATE TABLE IF NOT EXISTS userservice.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES userservice.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES userservice.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON userservice.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON userservice.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON userservice.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON userservice.messages(is_read, conversation_id);
