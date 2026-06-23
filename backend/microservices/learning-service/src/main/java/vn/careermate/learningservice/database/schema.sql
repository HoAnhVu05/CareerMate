-- Learning Service Database Schema
-- PostgreSQL Database - learningservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create learningservice schema if not exists
CREATE SCHEMA IF NOT EXISTS learningservice;
GRANT ALL PRIVILEGES ON SCHEMA learningservice TO postgres;

-- ============================================
-- COURSES
-- ============================================

CREATE TABLE IF NOT EXISTS learningservice.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    category VARCHAR(100),
    level VARCHAR(50), -- 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
    duration_hours INTEGER,
    price DECIMAL(10,2) DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON learningservice.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON learningservice.courses(level);

-- Course Modules
CREATE TABLE IF NOT EXISTS learningservice.course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES learningservice.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course ON learningservice.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON learningservice.course_modules(course_id, order_index);

-- Lessons
CREATE TABLE IF NOT EXISTS learningservice.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES learningservice.course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON learningservice.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON learningservice.lessons(module_id, order_index);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS learningservice.course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    course_id UUID NOT NULL REFERENCES learningservice.courses(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON learningservice.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON learningservice.course_enrollments(course_id);

-- Lesson Progress
CREATE TABLE IF NOT EXISTS learningservice.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES learningservice.course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES learningservice.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watched_duration_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON learningservice.lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON learningservice.lesson_progress(lesson_id);

-- ============================================
-- QUIZZES
-- ============================================

CREATE TABLE IF NOT EXISTS learningservice.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CAREER_ORIENTATION', 'SKILLS_ASSESSMENT', 'PERSONALITY_TEST', 'TECHNICAL_TEST')),
    time_limit_minutes INTEGER,
    total_questions INTEGER,
    passing_score INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quizzes_category ON learningservice.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON learningservice.quizzes(is_active);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS learningservice.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES learningservice.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) CHECK (question_type IN ('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TEXT', 'RATING')),
    options JSONB, -- Array of options for multiple/single choice
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON learningservice.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON learningservice.quiz_questions(quiz_id, order_index);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS learningservice.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES learningservice.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    score INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    time_taken_seconds INTEGER,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON learningservice.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON learningservice.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON learningservice.quiz_attempts(status);

-- Quiz Answers
CREATE TABLE IF NOT EXISTS learningservice.quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES learningservice.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES learningservice.quiz_questions(id) ON DELETE CASCADE,
    answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON learningservice.quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON learningservice.quiz_answers(question_id);

-- ============================================
-- CV TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS learningservice.cv_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_html TEXT NOT NULL,
    template_css TEXT,
    category VARCHAR(100),
    is_premium BOOLEAN DEFAULT FALSE,
    preview_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cv_templates_category ON learningservice.cv_templates(category);

-- ============================================
-- CHALLENGES & GAMIFICATION
-- ============================================

-- Challenges
CREATE TABLE IF NOT EXISTS learningservice.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    badge_id UUID, -- Reference to badges
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    passing_score INTEGER DEFAULT 70,
    instructions TEXT,
    expected_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_challenges_category ON learningservice.challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON learningservice.challenges(difficulty);

-- Challenge Participations
CREATE TABLE IF NOT EXISTS learningservice.challenge_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    challenge_id UUID NOT NULL REFERENCES learningservice.challenges(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
    completed_at TIMESTAMP,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer TEXT,
    attachment_url VARCHAR(500),
    submitted_at TIMESTAMP,
    score INTEGER,
    UNIQUE(student_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participations_student ON learningservice.challenge_participations(student_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participations_challenge ON learningservice.challenge_participations(challenge_id);

-- Badges
CREATE TABLE IF NOT EXISTS learningservice.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(100),
    rarity VARCHAR(50) DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_badges_category ON learningservice.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON learningservice.badges(rarity);

-- Student Badges
CREATE TABLE IF NOT EXISTS learningservice.student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    badge_id UUID NOT NULL REFERENCES learningservice.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_student_badges_student ON learningservice.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_badge ON learningservice.student_badges(badge_id);

-- Leaderboard
CREATE TABLE IF NOT EXISTS learningservice.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    total_points INTEGER DEFAULT 0,
    rank INTEGER,
    period VARCHAR(20) DEFAULT 'ALL_TIME' CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, period)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_student ON learningservice.leaderboard(student_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON learningservice.leaderboard(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON learningservice.leaderboard(period, total_points DESC);

-- ============================================
-- PACKAGES & SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS learningservice.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB, -- Array of features
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packages_active ON learningservice.packages(is_active);

CREATE TABLE IF NOT EXISTS learningservice.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References userservice.users(id) - cross-schema reference
    package_id UUID NOT NULL REFERENCES learningservice.packages(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON learningservice.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON learningservice.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package ON learningservice.subscriptions(package_id);
