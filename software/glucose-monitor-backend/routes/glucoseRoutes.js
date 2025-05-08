// filepath: /routes/glucoseRoutes.js
const express = require('express');
const { getReadings, addReading } = require('../controllers/glucoseController');
const router = express.Router();

router.get('/:userId', getReadings);
router.post('/add', addReading);

module.exports = router;