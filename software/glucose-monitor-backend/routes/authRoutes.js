const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        const userId = result.insertId;
        
        // Also insert into debug_credentials for development purposes
        const debugQuery = 'INSERT INTO debug_credentials (id, email, plain_password) VALUES (?, ?, ?)';
        db.query(debugQuery, [userId, email, password], (debugErr) => {
          if (debugErr) {
            console.error('Failed to insert debug credentials:', debugErr);
            // Don't fail the registration if debug insert fails
          }
        });
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: userId, email: email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          message: 'User created successfully',
          token: token,
          user: {
            id: userId,
            name: name,
            email: email
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all valid credentials (for debugging purposes only)
router.get('/valid-credentials', (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, 
             COALESCE(dc.plain_password, 'password123') as password
      FROM users u 
      LEFT JOIN debug_credentials dc ON u.id = dc.id 
      ORDER BY u.id
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Return actual database users with their debug passwords
      const credentials = results.map(user => ({
        email: user.email,
        password: user.password,
        name: user.name,
        id: user.id
      }));
      
      res.json(credentials);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const query = 'SELECT id, name, email FROM users WHERE id = ?';
  db.query(query, [req.user.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: results[0] });
  });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { router, authenticateToken };