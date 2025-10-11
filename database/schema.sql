-- Prick-Less Database Schema
-- Updated to support the new workflow architecture

USE glucose_monitor;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    threshold_low INT DEFAULT 70,
    threshold_high INT DEFAULT 180,
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(255) PRIMARY KEY,  -- ESP32 device ID
    user_id INT NOT NULL,
    device_name VARCHAR(255),
    status ENUM('online', 'offline', 'error') DEFAULT 'offline',
    last_seen TIMESTAMP NULL,
    firmware_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_device (user_id, id)
);

-- Main readings table (timeseries data)
CREATE TABLE IF NOT EXISTS readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP(3) NOT NULL,  -- Millisecond precision
    segment_id VARCHAR(255),
    
    -- Raw features from PPG signal processing
    features JSON NOT NULL,  -- {mean, ac, hr, peak_count, snr, etc.}
    
    -- ML inference results
    glucose_mgdl DECIMAL(5,2) NULL,  -- Predicted glucose level
    prediction_quality DECIMAL(3,2) NULL,  -- Quality score 0-1
    anomalies JSON NULL,  -- Any detected anomalies
    model_version VARCHAR(50) NULL,
    
    -- Status flags
    is_predicted BOOLEAN DEFAULT FALSE,
    is_validated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    
    -- Indexes for time-series queries
    INDEX idx_user_time (user_id, timestamp DESC),
    INDEX idx_device_time (device_id, timestamp DESC),
    INDEX idx_glucose_time (user_id, glucose_mgdl, timestamp DESC)
);

-- Alerts/notifications table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reading_id BIGINT NULL,
    alert_type ENUM('low_glucose', 'high_glucose', 'device_offline', 'anomaly') NOT NULL,
    severity ENUM('info', 'warning', 'critical') NOT NULL,
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE SET NULL,
    INDEX idx_user_alerts (user_id, created_at DESC)
);

-- Model training feedback (for continuous improvement)
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reading_id BIGINT NOT NULL,
    actual_glucose DECIMAL(5,2),  -- Ground truth value
    feedback_source ENUM('manual', 'traditional_meter', 'lab_test') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE,
    INDEX idx_reading_feedback (reading_id)
);

-- Sample data for testing
INSERT INTO users (username, email, password_hash) VALUES 
('demo_user', 'demo@prickless.com', '$2b$10$dummy.hash.for.testing'),
('test_patient', 'patient@example.com', '$2b$10$dummy.hash.for.testing');

INSERT INTO devices (id, user_id, device_name, status) VALUES 
('ESP32_001', 1, 'Demo Device', 'offline'),
('ESP32_002', 2, 'Patient Monitor', 'offline');