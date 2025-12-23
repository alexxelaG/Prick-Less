const { db } = require('../config/db');

/**
 * Process incoming PPG reading from ESP32 device
 * Simple format for ESP32:
 * {
 *   ppg_value: number (raw PPG sensor reading),
 *   timestamp: ISO string (optional - will use current time if not provided),
 *   user_id: number (optional - will default to 1 for demo)
 * }
 * 
 * OR more detailed format:
 * {
 *   ppg_value: number,
 *   glucose_mgdl: number (if you have a direct glucose reading),
 *   timestamp: ISO string,
 *   user_id: number
 * }
 */
const processReading = async (payload) => {
  try {
    console.log('Processing reading:', payload);
    
    // Handle simple format from ESP32
    const userId = payload.user_id || 1; // Default to user 1 for demo
    const timestamp = payload.timestamp || new Date().toISOString();
    const ppgValue = payload.ppg_value;
    const glucoseLevel = payload.glucose_mgdl || null;
    
    // Validate required data
    if (!ppgValue || typeof ppgValue !== 'number') {
      console.error('Invalid payload: ppg_value is required and must be a number');
      return;
    }

    // Store the reading in database
    const readingId = await storeReading(userId, timestamp, ppgValue, glucoseLevel);
    
    console.log(`Stored reading for user ${userId}: PPG=${ppgValue}${glucoseLevel ? `, Glucose=${glucoseLevel} mg/dL` : ''}`);
    
  } catch (error) {
    console.error('Error processing reading:', error);
  }
};

/**
 * Store reading in database
 */
const storeReading = async (userId, timestamp, ppgValue, glucoseLevel = null) => {
  const query = `
    INSERT INTO readings (
      user_id, timestamp, ppg_value, glucose_mgdl, features
    ) VALUES (?, ?, ?, ?, ?)
  `;
  
  // Create a simple features object for consistency
  const features = {
    ppg_raw: ppgValue,
    timestamp: timestamp
  };
  
  const [result] = await db.promise().query(query, [
    userId,
    new Date(timestamp),
    ppgValue,
    glucoseLevel,
    JSON.stringify(features)
  ]);
  
  return result.insertId;
};

module.exports = { processReading };