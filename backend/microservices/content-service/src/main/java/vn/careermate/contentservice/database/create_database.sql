-- Create database for Job-Service
-- Run this script as PostgreSQL superuser

-- Drop database if exists (for clean setup)
DROP DATABASE IF EXISTS content_service_db;

-- Create database
CREATE DATABASE content_service_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c content_service_db

-- Create schema
CREATE SCHEMA IF NOT EXISTS contentservice;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA contentservice TO postgres;
GRANT ALL PRIVILEGES ON DATABASE content_service_db TO postgres;

-- Set default schema
ALTER DATABASE content_service_db SET search_path TO contentservice, public;
