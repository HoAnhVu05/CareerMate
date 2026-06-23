-- Job Service Database Schema
-- PostgreSQL Database - jobservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jobservice schema if not exists
CREATE SCHEMA IF NOT EXISTS jobservice;
GRANT ALL PRIVILEGES ON SCHEMA jobservice TO postgres;

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE IF NOT EXISTS jobservice.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL, -- References userservice.recruiter_profiles(id) - cross-schema reference
    company_id UUID NOT NULL, -- References contentservice.companies(id) - cross-schema reference
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE')),
    experience_level VARCHAR(50) CHECK (experience_level IN ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXPERT')),
    min_salary DECIMAL(18,2),
    max_salary DECIMAL(18,2),
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'ACTIVE', 'CLOSED', 'REJECTED', 'HIDDEN')),
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID, -- References userservice.users(id) - cross-schema reference
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobservice.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobservice.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobservice.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobservice.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobservice.jobs(created_at DESC);

-- Job Skills (many-to-many)
CREATE TABLE IF NOT EXISTS jobservice.job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobservice.jobs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job ON jobservice.job_skills(job_id);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS jobservice.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobservice.jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    cv_id UUID, -- References userservice.cvs(id) - cross-schema reference
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN')),
    match_score DECIMAL(5,2), -- AI matching score
    ai_notes TEXT, -- AI analysis notes
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP,
    interview_scheduled_at TIMESTAMP,
    UNIQUE(job_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON jobservice.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON jobservice.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON jobservice.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_match_score ON jobservice.applications(match_score DESC);

-- Application Timeline/History
CREATE TABLE IF NOT EXISTS jobservice.application_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES jobservice.applications(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID, -- References userservice.users(id) - cross-schema reference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_application_history_application ON jobservice.application_history(application_id);

-- Saved Jobs (students can save jobs they're interested in)
CREATE TABLE IF NOT EXISTS jobservice.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    job_id UUID NOT NULL REFERENCES jobservice.jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_student ON jobservice.saved_jobs(student_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON jobservice.saved_jobs(job_id);
