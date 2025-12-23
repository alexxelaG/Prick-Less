// Load environment variables first
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'glucose_monitor'
});

const connectDB = () => {
  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err.message);
      console.error('Check your .env file configuration');
      // Don't exit, let the app continue without database for now
      console.log('Continuing without database connection...');
    } else {
      console.log('Connected to MySQL database');
    }
  });
};

module.exports = { connectDB, db };