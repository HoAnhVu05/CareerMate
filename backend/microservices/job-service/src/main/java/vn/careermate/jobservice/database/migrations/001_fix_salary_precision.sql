-- ============================================
-- MIGRATION: Fix salary precision overflow
-- ============================================
-- This script increases the precision of min_salary and max_salary columns
-- from DECIMAL(12,2) to DECIMAL(18,2) to support larger salary values
-- ============================================

-- Alter min_salary column
ALTER TABLE jobs 
ALTER COLUMN min_salary TYPE DECIMAL(18,2);

-- Alter max_salary column
ALTER TABLE jobs 
ALTER COLUMN max_salary TYPE DECIMAL(18,2);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name IN ('min_salary', 'max_salary');
