const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectDB = () => {
  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err.stack);
      process.exit(1); // Exit process with failure
    }
    console.log('Connected to MySQL database');
  });
};

module.exports = { connectDB, db };