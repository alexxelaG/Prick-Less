const { db } = require('../config/db');
const axios = require('axios');

/**
 * Process incoming PPG reading from ESP32 device
 * Expected payload format:
 * {
 *   userId: number,
 *   timestamp: ISO string,
 *   features: {
 *     mean: number,
 *     ac: number,
 *     hr: number,
 *     peak_count: number,
 *     snr: number,
 *     // ... other PPG features
 *   },
 *   segmentId: string
 * }
 */
const processReading = async (deviceId, payload) => {
  try {
    // Validate payload structure
    if (!validatePayload(payload)) {
      console.error('Invalid payload structure:', payload);
      return;
    }

    const { userId, timestamp, features, segmentId } = payload;
    
    // First, store raw reading
    const readingId = await storeRawReading(deviceId, userId, timestamp, features, segmentId);
    
    // Then, attempt ML inference if enabled
    let glucoseLevel = null;
    let predictionQuality = null;
    let anomalies = null;
    let isMLPredicted = false;

    if (process.env.ENABLE_ML_INFERENCE === 'true') {
      try {
        const mlResult = await callMLInference(features);
        glucoseLevel = mlResult.glucose_mgdl;
        predictionQuality = mlResult.quality;
        anomalies = mlResult.anomalies;
        isMLPredicted = true;
        
        // Update reading with ML results
        await updateReadingWithML(readingId, glucoseLevel, predictionQuality, anomalies);
        
      } catch (mlError) {
        console.error('ML inference failed:', mlError);
        // Continue without ML prediction
      }
    }

    // Check for alerts if we have a glucose prediction
    if (glucoseLevel && process.env.ENABLE_ALERTS === 'true') {
      await checkAndCreateAlerts(userId, readingId, glucoseLevel);
    }

    console.log(`Processed reading for device ${deviceId}, user ${userId}: ${glucoseLevel ? glucoseLevel + ' mg/dL' : 'no prediction'}`);
    
  } catch (error) {
    console.error('Error processing reading:', error);
  }
};

/**
 * Validate incoming payload structure
 */
const validatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (!payload.userId || !payload.timestamp || !payload.features) return false;
  if (typeof payload.features !== 'object') return false;
  
  // Check for required features
  const requiredFeatures = ['mean', 'ac', 'hr'];
  for (const feature of requiredFeatures) {
    if (typeof payload.features[feature] !== 'number') return false;
  }
  
  return true;
};

/**
 * Store raw reading in database
 */
const storeRawReading = async (deviceId, userId, timestamp, features, segmentId) => {
  const query = `
    INSERT INTO readings (
      user_id, device_id, timestamp, segment_id, features, is_predicted
    ) VALUES (?, ?, ?, ?, ?, FALSE)
  `;
  
  const [result] = await db.promise().query(query, [
    userId,
    deviceId,
    new Date(timestamp),
    segmentId,
    JSON.stringify(features)
  ]);
  
  return result.insertId;
};

/**
 * Call ML inference endpoint
 */
const callMLInference = async (features) => {
  const response = await axios.post(process.env.MODEL_ENDPOINT, {
    features: features,
    model_version: process.env.MODEL_VERSION
  }, {
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
};

/**
 * Update reading with ML inference results
 */
const updateReadingWithML = async (readingId, glucoseLevel, quality, anomalies) => {
  const query = `
    UPDATE readings 
    SET glucose_mgdl = ?, prediction_quality = ?, anomalies = ?, 
        is_predicted = TRUE, model_version = ?
    WHERE id = ?
  `;
  
  await db.promise().query(query, [
    glucoseLevel,
    quality,
    anomalies ? JSON.stringify(anomalies) : null,
    process.env.MODEL_VERSION,
    readingId
  ]);
};

/**
 * Check glucose levels against thresholds and create alerts
 */
const checkAndCreateAlerts = async (userId, readingId, glucoseLevel) => {
  // Get user thresholds
  const [users] = await db.promise().query(
    'SELECT threshold_low, threshold_high, notification_enabled FROM users WHERE id = ?',
    [userId]
  );
  
  if (users.length === 0 || !users[0].notification_enabled) return;
  
  const { threshold_low, threshold_high } = users[0];
  let alertType = null;
  let severity = 'info';
  let message = '';
  
  if (glucoseLevel < threshold_low) {
    alertType = 'low_glucose';
    severity = glucoseLevel < 50 ? 'critical' : 'warning';
    message = `Low glucose alert: ${glucoseLevel} mg/dL (threshold: ${threshold_low})`;
  } else if (glucoseLevel > threshold_high) {
    alertType = 'high_glucose';
    severity = glucoseLevel > 300 ? 'critical' : 'warning';
    message = `High glucose alert: ${glucoseLevel} mg/dL (threshold: ${threshold_high})`;
  }
  
  if (alertType) {
    const alertQuery = `
      INSERT INTO alerts (user_id, reading_id, alert_type, severity, message)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.promise().query(alertQuery, [
      userId, readingId, alertType, severity, message
    ]);
    
    console.log(`Alert created for user ${userId}: ${message}`);
  }
};

module.exports = { processReading };