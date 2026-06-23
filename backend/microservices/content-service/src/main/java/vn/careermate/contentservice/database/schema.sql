-- Content Service Database Schema
-- PostgreSQL Database - contentservice schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contentservice schema if not exists
CREATE SCHEMA IF NOT EXISTS contentservice;
GRANT ALL PRIVILEGES ON SCHEMA contentservice TO postgres;

-- ============================================
-- COMPANIES
-- ============================================

CREATE TABLE IF NOT EXISTS contentservice.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50), -- 'STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'
    founded_year INTEGER,
    headquarters VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_industry ON contentservice.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_size ON contentservice.companies(company_size);

-- Company Ratings
CREATE TABLE IF NOT EXISTS contentservice.company_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES contentservice.companies(id) ON DELETE CASCADE,
    student_id UUID NOT NULL, -- References userservice.student_profiles(id) - cross-schema reference
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_company_ratings_company ON contentservice.company_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_student ON contentservice.company_ratings(student_id);
CREATE INDEX IF NOT EXISTS idx_company_ratings_rating ON contentservice.company_ratings(company_id, rating);

-- ============================================
-- ARTICLES
-- ============================================

CREATE TABLE IF NOT EXISTS contentservice.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL, -- References userservice.users(id) - cross-schema reference
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    thumbnail_url TEXT,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN')),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID, -- References userservice.users(id) - cross-schema reference
    approved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_author ON contentservice.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON contentservice.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON contentservice.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON contentservice.articles(category);

-- Article Reactions
CREATE TABLE IF NOT EXISTS contentservice.article_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES contentservice.articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References userservice.users(id) - cross-schema reference
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id) -- Mỗi user chỉ có thể thả 1 loại cảm xúc cho 1 bài viết
);

CREATE INDEX IF NOT EXISTS idx_article_reactions_article ON contentservice.article_reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_user ON contentservice.article_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_type ON contentservice.article_reactions(reaction_type);

-- Article Comments
CREATE TABLE IF NOT EXISTS contentservice.article_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES contentservice.articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References userservice.users(id) - cross-schema reference
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES contentservice.article_comments(id) ON DELETE CASCADE, -- Để reply comment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_comments_article ON contentservice.article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user ON contentservice.article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_parent ON contentservice.article_comments(parent_comment_id);

-- Comment Reactions (thả cảm xúc cho comment)
CREATE TABLE IF NOT EXISTS contentservice.comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES contentservice.article_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References userservice.users(id) - cross-schema reference
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON contentservice.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON contentservice.comment_reactions(user_id);
