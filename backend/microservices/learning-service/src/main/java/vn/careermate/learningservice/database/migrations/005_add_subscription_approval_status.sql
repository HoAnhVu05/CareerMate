-- Migration: Add PENDING, APPROVED, REJECTED status to subscriptions table
-- Update subscriptions table to support admin approval workflow

-- First, update existing subscriptions: ACTIVE -> APPROVED for consistency
UPDATE learningservice.subscriptions 
SET status = 'APPROVED' 
WHERE status = 'ACTIVE';

-- Drop old constraint and add new one with new statuses
ALTER TABLE learningservice.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE learningservice.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'EXPIRED', 'CANCELLED'));

COMMENT ON COLUMN learningservice.subscriptions.status IS 'Subscription status: PENDING (waiting for admin approval), APPROVED (active subscription), REJECTED (rejected by admin), ACTIVE/EXPIRED/CANCELLED (legacy statuses)';
