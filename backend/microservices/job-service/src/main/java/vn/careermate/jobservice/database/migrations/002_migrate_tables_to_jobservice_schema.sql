-- Migration script to move Job Service tables from public schema to jobservice schema
-- This script moves all tables related to Job Service

-- Step 1: Move Job Service tables to jobservice schema
ALTER TABLE IF EXISTS jobs SET SCHEMA jobservice;
ALTER TABLE IF EXISTS applications SET SCHEMA jobservice;
ALTER TABLE IF EXISTS application_history SET SCHEMA jobservice;
ALTER TABLE IF EXISTS saved_jobs SET SCHEMA jobservice;
ALTER TABLE IF EXISTS job_skills SET SCHEMA jobservice;

-- Note: Foreign keys will be automatically updated by PostgreSQL
-- Tables that reference jobservice tables from other schemas need to use fully qualified names
