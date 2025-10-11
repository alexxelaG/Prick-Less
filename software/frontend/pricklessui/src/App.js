import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import Login from './Components/Login';
import Settings from './Pages/Settings'; 
import Dashboard from './Pages/Dashboard';
import AboutUs from './Pages/AboutUs';

import './App.css';

import heroImage from './assets/images/homepage-image.jpg';

function Home({ user }) {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-text">
          <h1>Non-Invasive Glucose Monitor</h1>
          <p>Track Smarter, Live Healthier.</p>
          <button className="cta-button" onClick={navigateToDashboard}>
            {user ? 'Go to Dashboard' : 'Start Your Journey'}
          </button>
          {user && (
            <p className="welcome-message">
              Welcome back, {user.name}!
            </p>
          )}
        </div>
        <div className="hero-image">
          <img
            src={heroImage}
            alt="Non-Invasive Glucose Monitoring"
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading Prick-Less...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route 
          path="/login" 
          element={
            user ? 
              <Dashboard userId={user.id} user={user} token={token} /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? 
              <Dashboard userId={user.id} user={user} token={token} /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;