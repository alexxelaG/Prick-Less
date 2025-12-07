const express = require('express');
const { 
  getReadings, 
  getLatestReading, 
  getTrendData, 
  addReading, 
  getUserStats 
} = require('../controllers/glucoseController');

const router = express.Router();

// NO AUTHENTICATION - All routes are open
router.get('/readings/:userId', getReadings);
router.get('/latest/:userId', getLatestReading);  
router.get('/trends/:userId', getTrendData);
router.post('/readings', addReading);
router.get('/stats/:userId', getUserStats);

module.exports = router;