-- Remove device_id completely from the database
-- This simplifies the system to single device per user

USE glucose_monitor;

-- First, drop the foreign key constraint if it exists
ALTER TABLE readings DROP FOREIGN KEY readings_ibfk_2;

-- Drop the device_id column from readings table
ALTER TABLE readings DROP COLUMN device_id;

-- Drop the device index that included device_id
DROP INDEX idx_device_time ON readings;

-- Drop the entire devices table since we no longer need it
DROP TABLE IF EXISTS devices;

-- Verify the updated readings table structure
DESCRIBE readings;

-- Show the simplified table structure
SHOW CREATE TABLE readings;

-- Verify existing data is still intact
SELECT 
    COUNT(*) as total_readings,
    MIN(timestamp) as oldest_reading,
    MAX(timestamp) as newest_reading,
    COUNT(DISTINCT user_id) as unique_users
FROM readings;

-- Show sample data with new simplified structure
SELECT 
    id,
    user_id,
    timestamp,
    glucose_mgdl,
    ppg_value,
    is_predicted
FROM readings 
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 5;