-- Prick-Less Database Schema - SIMPLIFIED for ESP32 MQTT
-- Ultra-simple schema for easy PPG data collection

USE glucose_monitor;

-- Minimal users table (just for demo user)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL DEFAULT 'Demo User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main readings table (PPG sensor data)
CREATE TABLE IF NOT EXISTS readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    timestamp TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    -- Simple sensor data
    ppg_value DECIMAL(8,3) NOT NULL,  -- Raw PPG sensor reading (required)
    glucose_mgdl DECIMAL(5,2) NULL,   -- Optional glucose reading
    features JSON NULL,               -- Optional additional data
    
    -- Indexes for time-series queries
    INDEX idx_user_time (user_id, timestamp DESC),
    INDEX idx_glucose_time (user_id, glucose_mgdl, timestamp DESC)
);

-- Create demo user
INSERT IGNORE INTO users (id, username) VALUES (1, 'Demo User');