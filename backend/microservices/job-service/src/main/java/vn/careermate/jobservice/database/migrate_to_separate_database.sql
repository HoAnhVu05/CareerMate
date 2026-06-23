-- Migrate data from careermate_db to job_service_db
-- This script exports data from the old database and imports it to the new database
-- Run this after creating job_service_db and running schema.sql

-- Note: This script should be run using pg_dump and psql commands
-- See setup_database.ps1 for automated migration

-- The migration process:
-- 1. Export data from careermate_db.jobservice schema
-- 2. Import data to job_service_db.jobservice schema

-- Tables to migrate:
-- - jobs
-- - applications
-- - saved_jobs
-- - job_skills
-- - application_history
