const express = require('express');
const { 
  getReadings, 
  getLatestReading, 
  getTrendData, 
  addReading, 
  getUserStats 
} = require('../controllers/glucoseController');
const { authenticateToken } = require('./authRoutes');
const { db } = require('../config/db');

const router = express.Router();

// Get all readings for a user (protected)
router.get('/readings/:userId', authenticateToken, getReadings);

// Get latest reading for a user (protected)
router.get('/latest/:userId', authenticateToken, getLatestReading);

// Get trend data for charts (protected)
router.get('/trend/:userId', authenticateToken, getTrendData);

// Get user statistics (protected)
router.get('/stats/:userId', authenticateToken, getUserStats);

// Add new reading (protected)
router.post('/add', authenticateToken, addReading);

// Get readings for a specific device (protected)
router.get('/device/:deviceId/readings', authenticateToken, (req, res) => {
  const { deviceId } = req.params;
  const limit = req.query.limit || 50;
  
  console.log('=== DEVICE READINGS ENDPOINT CALLED ===');
  console.log('Device ID:', deviceId);
  console.log('Limit:', limit);
  
  const query = `
    SELECT r.*, u.name as user_name 
    FROM readings r 
    LEFT JOIN users u ON r.user_id = u.id 
    WHERE r.device_id = ? 
    ORDER BY r.timestamp DESC 
    LIMIT ?
  `;
  
  db.query(query, [deviceId, parseInt(limit)], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching device readings:', err);
      return res.status(500).json({ error: 'Failed to fetch device readings' });
    }
    
    console.log('✅ Device readings query successful, found', results.length, 'readings');
    res.json(results);
  });
});

// Get latest reading for a specific device (protected)
router.get('/device/:deviceId/latest', authenticateToken, (req, res) => {
  const { deviceId } = req.params;
  
  console.log('=== DEVICE LATEST READING ENDPOINT CALLED ===');
  console.log('Device ID:', deviceId);
  
  const query = `
    SELECT r.*, u.name as user_name 
    FROM readings r 
    LEFT JOIN users u ON r.user_id = u.id 
    WHERE r.device_id = ? 
    ORDER BY r.timestamp DESC 
    LIMIT 1
  `;
  
  db.query(query, [deviceId], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching latest device reading:', err);
      return res.status(500).json({ error: 'Failed to fetch latest device reading' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'No readings found for this device' });
    }
    
    console.log('✅ Latest device reading query successful');
    res.json(results[0]);
  });
});

// Get statistics for a specific device (protected)
router.get('/device/:deviceId/stats', authenticateToken, (req, res) => {
  const { deviceId } = req.params;
  
  console.log('=== DEVICE STATS ENDPOINT CALLED ===');
  console.log('Device ID:', deviceId);
  
  const query = `
    SELECT 
      COUNT(*) as total_readings,
      AVG(glucose_mgdl) as avg_glucose,
      MIN(glucose_mgdl) as min_glucose,
      MAX(glucose_mgdl) as max_glucose,
      AVG(prediction_quality) as avg_quality
    FROM readings 
    WHERE device_id = ?
  `;
  
  db.query(query, [deviceId], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching device stats:', err);
      return res.status(500).json({ error: 'Failed to fetch device statistics' });
    }
    
    console.log('✅ Device stats query successful');
    res.json(results[0]);
  });
});

// Get all available devices (protected)
router.get('/devices', authenticateToken, (req, res) => {
  console.log('=== DEVICES ENDPOINT CALLED ===');
  console.log('User from token:', req.user);
  console.log('Database connection status:', db ? 'Available' : 'Not available');
  
  const query = `
    SELECT d.id, d.device_name, d.status, u.name as assigned_user, u.id as user_id
    FROM devices d 
    LEFT JOIN users u ON d.user_id = u.id 
    ORDER BY d.device_name
  `;
  
  console.log('Executing query:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Database error fetching devices:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      return res.status(500).json({ error: 'Failed to fetch devices', details: err.message });
    }
    
    console.log('✅ Devices query successful, found', results.length, 'devices');
    console.log('Results:', results);
    res.json(results);
  });
});

// Switch device assignment (protected)
router.post('/devices/:deviceId/assign', authenticateToken, (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user.userId;
  
  const query = 'UPDATE devices SET user_id = ? WHERE id = ?';
  
  db.query(query, [userId, deviceId], (err, result) => {
    if (err) {
      console.error('Database error assigning device:', err);
      return res.status(500).json({ error: 'Failed to assign device' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    console.log('Device', deviceId, 'assigned to user', userId);
    res.json({ message: 'Device assigned successfully', deviceId, userId });
  });
});

module.exports = router;