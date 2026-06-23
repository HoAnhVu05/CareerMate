-- Notification Service Schema
-- Run this after creating database and schema

CREATE TABLE IF NOT EXISTS notificationservice.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Changed from foreign key to UUID (no FK constraint)
    title VARCHAR(500) NOT NULL,
    message VARCHAR(1000),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    link_url VARCHAR(500),
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (type IN (
        'ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'ARTICLE_PENDING',
        'JOB_APPROVED', 'JOB_REJECTED', 'JOB_PENDING',
        'NEW_APPLICATION', 'APPLICATION_STATUS_CHANGED',
        'JOB_RECOMMENDATION', 'NEW_COMMENT', 'NEW_REACTION',
        'INTERVIEW_SCHEDULED', 'SYSTEM_ANNOUNCEMENT', 'NEW_MESSAGE',
        'SUBSCRIPTION_REQUEST', 'SUBSCRIPTION_APPROVED', 'SUBSCRIPTION_REJECTED',
        'JOB_HIDDEN', 'JOB_UNHIDDEN', 'JOB_DELETED',
        'ARTICLE_HIDDEN', 'ARTICLE_UNHIDDEN', 'ARTICLE_DELETED',
        'CHALLENGE_COMPLETED'
    )),
    CONSTRAINT notifications_status_check CHECK (status IN ('UNREAD', 'READ'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notificationservice.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notificationservice.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notificationservice.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notificationservice.notifications(user_id, status);

COMMENT ON TABLE notificationservice.notifications IS 'Stores user notifications for various events';
COMMENT ON COLUMN notificationservice.notifications.type IS 'ARTICLE_APPROVED, JOB_APPROVED, NEW_APPLICATION, etc.';
COMMENT ON COLUMN notificationservice.notifications.status IS 'UNREAD or READ';
COMMENT ON COLUMN notificationservice.notifications.link_url IS 'URL to navigate to related page';
COMMENT ON COLUMN notificationservice.notifications.related_entity_type IS 'Type of related entity: ARTICLE, JOB, APPLICATION, etc.';
COMMENT ON COLUMN notificationservice.notifications.related_entity_id IS 'ID of related entity';
