-- Migration script to move AI Service tables from public schema to aiservice schema
-- This script moves all tables related to AI Service

-- Step 1: Move AI Service tables to aiservice schema
ALTER TABLE IF EXISTS ai_chat_conversations SET SCHEMA aiservice;
ALTER TABLE IF EXISTS ai_chat_messages SET SCHEMA aiservice;
ALTER TABLE IF EXISTS job_recommendations SET SCHEMA aiservice;
ALTER TABLE IF EXISTS career_roadmaps SET SCHEMA aiservice;
ALTER TABLE IF EXISTS mock_interviews SET SCHEMA aiservice;
ALTER TABLE IF EXISTS mock_interview_questions SET SCHEMA aiservice;

-- Note: Foreign keys will be automatically updated by PostgreSQL
-- Tables that reference aiservice tables from other schemas need to use fully qualified names
