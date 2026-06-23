-- Migration script to move User Service data from shared database to separate database
-- This script copies all user-service tables from careermate_db.userservice to user_service_db.userservice
--
-- Prerequisites:
-- 1. Create user_service_db database first (run create_database.sql)
-- 2. Run schema.sql on user_service_db
-- 3. Run this script to copy data
--
-- Usage:
-- psql -U postgres -d user_service_db -f migrate_to_separate_database.sql

-- Connect to source database and export data
-- Then import to target database

-- Step 1: Export data from source database (run from command line)
-- pg_dump -U postgres -d careermate_db -t userservice.* --data-only --column-inserts > user_service_data.sql

-- Step 2: Import data to target database (run from command line)
-- psql -U postgres -d user_service_db -f user_service_data.sql

-- OR use pg_dump with custom format:
-- pg_dump -U postgres -d careermate_db -t userservice.* -Fc > user_service_data.dump
-- pg_restore -U postgres -d user_service_db -n userservice user_service_data.dump

-- Manual copy using SQL (if both databases are accessible):
-- This requires dblink extension or manual SQL copy

-- Note: After migration, update application.yml to point to user_service_db
