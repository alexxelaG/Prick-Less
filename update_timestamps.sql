-- Update existing readings to have current timestamps
-- This will spread the readings over the last 24 hours from now

USE glucose_monitor;

-- Get the current readings for user 1 and update their timestamps
-- We'll update them in reverse order so the most recent reading is truly current

-- Update the most recent reading to NOW
UPDATE readings 
SET timestamp = NOW(), created_at = NOW()
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 1;

-- Update the remaining readings to be spread over the last 24 hours
-- Using a variable to create staggered timestamps

SET @row_number = 0;

UPDATE readings 
SET timestamp = DATE_SUB(NOW(), INTERVAL (@row_number := @row_number + 1) * 30 MINUTE),
    created_at = DATE_SUB(NOW(), INTERVAL @row_number * 30 MINUTE)
WHERE user_id = 1 
  AND timestamp < DATE_SUB(NOW(), INTERVAL 1 MINUTE)
ORDER BY timestamp DESC;

-- Reset the row number for next operations
SET @row_number = 0;

-- Verify the updated timestamps
SELECT 
    timestamp, 
    glucose_mgdl, 
    ppg_value,
    TIMESTAMPDIFF(MINUTE, timestamp, NOW()) as minutes_ago
FROM readings 
WHERE user_id = 1 
ORDER BY timestamp DESC 
LIMIT 10;

-- Show the time range of all readings
SELECT 
    COUNT(*) as total_readings,
    MIN(timestamp) as oldest_reading,
    MAX(timestamp) as newest_reading,
    TIMESTAMPDIFF(HOUR, MIN(timestamp), MAX(timestamp)) as hours_span
FROM readings 
WHERE user_id = 1;