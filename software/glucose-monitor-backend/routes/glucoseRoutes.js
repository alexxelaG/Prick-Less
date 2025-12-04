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

module.exports = router;