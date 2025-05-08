const { db } = require('../config/db');

const getReadings = (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM glucose_readings WHERE user_id = ? ORDER BY timestamp DESC';
  db.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};

const addReading = (req, res) => {
  const { userId, glucoseLevel } = req.body;
  const query = 'INSERT INTO glucose_readings (user_id, glucose_level) VALUES (?, ?)';
  db.query(query, [userId, glucoseLevel], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Reading added successfully', id: result.insertId });
    }
  });
};

module.exports = { getReadings, addReading };