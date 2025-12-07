-- Remove unused columns from the readings table
-- This will clean up the table structure and improve performance

USE glucose_monitor;

-- Drop unused columns one by one
ALTER TABLE readings DROP COLUMN segment_id;
ALTER TABLE readings DROP COLUMN prediction_quality;
ALTER TABLE readings DROP COLUMN anomalies;
ALTER TABLE readings DROP COLUMN model_version;
ALTER TABLE readings DROP COLUMN is_validated;
ALTER TABLE readings DROP COLUMN created_at;

-- Verify the updated table structure
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

-- Show sample data with new structure
SELECT 
    id,
    user_id,
    device_id,
    timestamp,
    glucose_mgdl,
    ppg_value,
    is_predicted
FROM readings 
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 5;