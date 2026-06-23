-- Update subscriptions table to support new status values
-- Add PENDING, APPROVED, REJECTED to the CHECK constraint

ALTER TABLE learningservice.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE learningservice.subscriptions
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'EXPIRED', 'CANCELLED'));
