-- Migration script to move Learning Service tables from public schema to learningservice schema
-- This script moves all tables related to Learning Service

-- Step 1: Move Learning Service tables to learningservice schema
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

-- Note: Foreign keys will be automatically updated by PostgreSQL
-- Tables that reference learningservice tables from other schemas need to use fully qualified names
