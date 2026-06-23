-- ============================================
-- COMPREHENSIVE MIGRATION: Move all tables to service schemas
-- ============================================
-- WARNING: This will affect all existing queries. Test in development first!
-- 
-- This script moves tables from public schema to their respective service schemas
-- Userservice tables have already been migrated (see userservice/migrations/)
-- ============================================

-- ============================================
-- JOB SERVICE
-- ============================================
ALTER TABLE IF EXISTS jobs SET SCHEMA jobservice;
ALTER TABLE IF EXISTS applications SET SCHEMA jobservice;
ALTER TABLE IF EXISTS application_history SET SCHEMA jobservice;
ALTER TABLE IF EXISTS saved_jobs SET SCHEMA jobservice;
ALTER TABLE IF EXISTS job_skills SET SCHEMA jobservice;

-- ============================================
-- LEARNING SERVICE
-- ============================================
ALTER TABLE IF EXISTS cv_templates SET SCHEMA learningservice;
ALTER TABLE IF EXISTS courses SET SCHEMA learningservice;
ALTER TABLE IF EXISTS course_modules SET SCHEMA learningservice;
ALTER TABLE IF EXISTS lessons SET SCHEMA learningservice;
ALTER TABLE IF EXISTS course_enrollments SET SCHEMA learningservice;
ALTER TABLE IF EXISTS lesson_progress SET SCHEMA learningservice;
ALTER TABLE IF EXISTS quizzes SET SCHEMA learningservice;
ALTER TABLE IF EXISTS quiz_questions SET SCHEMA learningservice;
ALTER TABLE IF EXISTS quiz_attempts SET SCHEMA learningservice;
ALTER TABLE IF EXISTS quiz_answers SET SCHEMA learningservice;
ALTER TABLE IF EXISTS challenges SET SCHEMA learningservice;
ALTER TABLE IF EXISTS challenge_participations SET SCHEMA learningservice;
ALTER TABLE IF EXISTS badges SET SCHEMA learningservice;
ALTER TABLE IF EXISTS student_badges SET SCHEMA learningservice;
ALTER TABLE IF EXISTS packages SET SCHEMA learningservice;
ALTER TABLE IF EXISTS subscriptions SET SCHEMA learningservice;

-- ============================================
-- CONTENT SERVICE
-- ============================================
ALTER TABLE IF EXISTS companies SET SCHEMA contentservice;
ALTER TABLE IF EXISTS company_ratings SET SCHEMA contentservice;
ALTER TABLE IF EXISTS articles SET SCHEMA contentservice;
ALTER TABLE IF EXISTS article_reactions SET SCHEMA contentservice;
ALTER TABLE IF EXISTS article_comments SET SCHEMA contentservice;

-- ============================================
-- AI SERVICE
-- ============================================
ALTER TABLE IF EXISTS ai_chat_conversations SET SCHEMA aiservice;
ALTER TABLE IF EXISTS ai_chat_messages SET SCHEMA aiservice;
ALTER TABLE IF EXISTS job_recommendations SET SCHEMA aiservice;
ALTER TABLE IF EXISTS career_roadmaps SET SCHEMA aiservice;
ALTER TABLE IF EXISTS mock_interviews SET SCHEMA aiservice;
ALTER TABLE IF EXISTS mock_interview_questions SET SCHEMA aiservice;

-- ============================================
-- NOTIFICATION SERVICE
-- ============================================
ALTER TABLE IF EXISTS notifications SET SCHEMA notificationservice;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Foreign keys will be automatically updated by PostgreSQL
-- 2. Cross-schema foreign keys need to use fully qualified names (schema.table)
-- 3. JPA entities must have @Table(schema = "...") to match the new schema
-- 4. Test all endpoints after migration to ensure they still work
-- 5. Update any custom SQL queries to include schema names if needed
