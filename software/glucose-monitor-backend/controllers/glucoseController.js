const { db } = require('../config/db');

// Get latest readings for a user
const getReadings = (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit || 10;
  
  const query = `
    SELECT 
      r.id,
      r.timestamp,
      r.glucose_mgdl,
      r.prediction_quality,
      r.features,
      r.device_id,
      r.is_predicted,
      u.name as user_name
    FROM readings r 
    JOIN users u ON r.user_id = u.id 
    WHERE r.user_id = ? 
    ORDER BY r.timestamp DESC 
    LIMIT ?
  `;
  
  db.query(query, [userId, parseInt(limit)], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Parse JSON features for each reading
      const processedResults = results.map(reading => ({
        ...reading,
        features: typeof reading.features === 'string' 
          ? JSON.parse(reading.features) 
          : reading.features
      }));
      res.status(200).json(processedResults);
    }
  });
};

// Get latest single reading for a user
const getLatestReading = (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      r.id,
      r.timestamp,
      r.glucose_mgdl,
      r.prediction_quality,
      r.features,
      r.device_id,
      r.is_predicted,
      u.name as user_name,
      d.status as device_status,
      d.last_seen as device_last_seen
    FROM readings r 
    JOIN users u ON r.user_id = u.id 
    LEFT JOIN devices d ON r.device_id = d.id
    WHERE r.user_id = ? 
    ORDER BY r.timestamp DESC 
    LIMIT 1
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'No readings found for user' });
    } else {
      const reading = results[0];
      reading.features = typeof reading.features === 'string' 
        ? JSON.parse(reading.features) 
        : reading.features;
      res.status(200).json(reading);
    }
  });
};

// Get glucose trend data for charts
const getTrendData = (req, res) => {
  const { userId } = req.params;
  const hours = req.query.hours || 24; // Default to last 24 hours
  
  const query = `
    SELECT 
      timestamp,
      glucose_mgdl,
      prediction_quality,
      JSON_EXTRACT(features, '$.hr') as heart_rate
    FROM readings 
    WHERE user_id = ? 
      AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      AND glucose_mgdl IS NOT NULL
    ORDER BY timestamp ASC
  `;
  
  db.query(query, [userId, parseInt(hours)], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};

// Add new reading (for testing)
const addReading = (req, res) => {
  const { userId, deviceId, features, glucoseLevel, segmentId } = req.body;
  
  const query = `
    INSERT INTO readings 
    (user_id, device_id, timestamp, segment_id, features, glucose_mgdl, is_predicted) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?)
  `;
  
  db.query(query, [
    userId, 
    deviceId || 'ESP32_TEST', 
    segmentId || `test_${Date.now()}`,
    JSON.stringify(features),
    glucoseLevel,
    !!glucoseLevel
  ], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ 
        message: 'Reading added successfully', 
        id: result.insertId 
      });
    }
  });
};

// Get user statistics
const getUserStats = (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      COUNT(*) as total_readings,
      AVG(glucose_mgdl) as avg_glucose,
      MIN(glucose_mgdl) as min_glucose,
      MAX(glucose_mgdl) as max_glucose,
      AVG(prediction_quality) as avg_quality
    FROM readings 
    WHERE user_id = ? AND glucose_mgdl IS NOT NULL
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

module.exports = { 
  getReadings, 
  getLatestReading, 
  getTrendData, 
  addReading, 
  getUserStats 
};