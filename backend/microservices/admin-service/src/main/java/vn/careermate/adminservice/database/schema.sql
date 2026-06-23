-- Admin Service Database Schema
-- PostgreSQL Database - adminservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create adminservice schema if not exists
CREATE SCHEMA IF NOT EXISTS adminservice;
GRANT ALL PRIVILEGES ON SCHEMA adminservice TO postgres;

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS adminservice.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    admin_email VARCHAR(255),
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'HIDE', 'UNHIDE')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('USER', 'JOB', 'ARTICLE', 'PACKAGE', 'SUBSCRIPTION', 'CV_TEMPLATE')),
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON adminservice.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON adminservice.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON adminservice.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON adminservice.audit_logs(action_type);
