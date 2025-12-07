import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Dashboard from './Pages/Dashboard';
import AboutUs from './Pages/AboutUs';
import heroImage from './assets/images/homepage-image.jpg';
import './App.css';

function Home() {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-text">
          <center>
          <h1>Non-Invasive Glucose Monitor</h1>
          <p>Track Smarter, Live Healthier.</p>
          <button className="cta-button" onClick={navigateToDashboard}>
            View Dashboard
          </button>
          </center>
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
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/dashboard" 
          element={<Dashboard userId={1} />} 
        />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;