const express = require('express');
const { 
  getReadings, 
  getLatestReading, 
  getTrendData, 
  addReading, 
  getUserStats 
} = require('../controllers/glucoseController');
const { db } = require('../config/db');

const router = express.Router();

// Get all readings for a user (public access)
router.get('/readings/:userId', getReadings);

// Get latest reading for a user (public access)
router.get('/latest/:userId', getLatestReading);

// Get trend data for charts (public access)
router.get('/trend/:userId', getTrendData);

// Get user statistics (public access)
router.get('/stats/:userId', getUserStats);

// Add new reading (public access)
router.post('/add', addReading);

module.exports = router;