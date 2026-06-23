-- Create database for notification-service
CREATE DATABASE notification_service_db;

-- Connect to notification_service_db and create schema
\c notification_service_db;

CREATE SCHEMA IF NOT EXISTS notificationservice;

GRANT ALL ON SCHEMA notificationservice TO postgres;
