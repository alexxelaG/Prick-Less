// Load environment variables first
require('dotenv').config();
const mysql = require('mysql2');

// Debug environment variables
console.log('DB Config Debug:');
console.log('- Host:', process.env.DB_HOST);
console.log('- User:', process.env.DB_USER);
console.log('- Database:', process.env.DB_NAME);
console.log('- Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'glucose_monitor'
});

const connectDB = () => {
  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      console.error('Connection config:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        passwordExists: !!process.env.DB_PASSWORD
      });
      // Don't exit, let the app continue without database for now
      console.log('⚠️  Continuing without database connection...');
    } else {
      console.log('✅ Connected to MySQL database');
    }
  });
};

module.exports = { connectDB, db };