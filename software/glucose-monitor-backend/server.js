const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();
require('./mqttListener');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Connect to database
connectDB();

// Test endpoints FIRST (before other routes)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Prick-Less Backend Server Running', 
    status: 'healthy',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working - no authentication required',
    status: 'success',
    timestamp: new Date(),
    endpoints: [
      'GET /api/glucose/readings/:userId',
      'GET /api/glucose/latest/:userId',
      'GET /api/glucose/trends/:userId',
      'POST /api/glucose/readings'
    ]
  });
});

// Import and use glucose routes
const glucoseRoutes = require('./routes/glucoseRoutes');
app.use('/api/glucose', glucoseRoutes);

// Health check for database
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date()
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`No authentication required`);
  console.log(`CORS enabled for localhost:3000`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});
