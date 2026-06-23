-- Create separate database for User Service
-- This script creates a dedicated database for user-service microservice

-- Connect to PostgreSQL as superuser
-- Run this script: psql -U postgres -f create_database.sql

-- Create database
CREATE DATABASE user_service_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the new database
\c user_service_db

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create userservice schema
CREATE SCHEMA IF NOT EXISTS userservice;
GRANT ALL PRIVILEGES ON SCHEMA userservice TO postgres;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_service_db TO postgres;
