const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/db'); // Database connection
const glucoseRoutes = require('./routes/glucoseRoutes'); // Glucose API routes
const mqttClient = require('./mqtt/mqttClient'); // MQTT client for ESP32 readings

// Load environment variables
dotenv.config();


console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);


// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// API Routes
app.use('/api/glucose', glucoseRoutes);

// Start the MQTT client (if enabled)
if (process.env.ENABLE_MQTT === 'true') {
  mqttClient();
} else {
  console.log('MQTT client disabled');
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});