-- Migration script to move User Service tables from public schema to userservice schema
-- This script moves all tables related to User Service

-- Step 1: Move User Service tables to userservice schema
ALTER TABLE IF EXISTS users SET SCHEMA userservice;
ALTER TABLE IF EXISTS student_profiles SET SCHEMA userservice;
ALTER TABLE IF EXISTS recruiter_profiles SET SCHEMA userservice;
ALTER TABLE IF EXISTS cvs SET SCHEMA userservice;
ALTER TABLE IF EXISTS conversations SET SCHEMA userservice;
ALTER TABLE IF EXISTS messages SET SCHEMA userservice;
ALTER TABLE IF EXISTS student_skills SET SCHEMA userservice;

-- Note: Foreign keys will be automatically updated by PostgreSQL
-- Tables that reference userservice tables from other schemas need to use fully qualified names
