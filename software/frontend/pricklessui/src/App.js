import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import Settings from './Pages/Settings'; 
import Dashboard from './Pages/Dashboard';
import AboutUs from './Pages/AboutUs';

import './App.css';

import heroImage from './assets/images/homepage-image.jpg';

function Home() {
  const navigate = useNavigate(); // Use the useNavigate hook here

  const navigateToDashboard = () => {
    navigate('/dashboard'); // Navigate to the dashboard route
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-text">
          <h1>Non-Invasive Glucose Monitor</h1>
          <p>Track Smarter, Live Healthier.</p>
          <button className="cta-button" onClick={navigateToDashboard}>
            Start Your Journey
          </button>
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
  const [glucose, setGlucose] = useState(null);

  useEffect(() => {
    const fetchGlucose = () => {
      const simulatedGlucose = Math.floor(Math.random() * (180 - 70 + 1)) + 70;
      setGlucose(simulatedGlucose);
    };

    fetchGlucose();
    const intervalId = setInterval(fetchGlucose, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard glucose={glucose} />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;