import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import React, { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import GlucoseDisplay from './Components/GlucoseDisplay';
import Settings from './Pages/Settings';  
import './App.css';

function App() {
  const [glucose, setGlucose] = useState(null);
  
  // Simulate fetching glucose data every 5 seconds.
  useEffect(() => {
    const fetchGlucose = () => {
      // Replace this with an API call to your glucose monitor backend.
      const simulatedGlucose = Math.floor(Math.random() * (180 - 70 + 1)) + 70;
      setGlucose(simulatedGlucose);
    };

    fetchGlucose(); // Initial fetch
    const intervalId = setInterval(fetchGlucose, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>  
      <Navbar />
      <Routes>  {/* React Router v6+ uses Routes instead of Switch */}
        <Route path="/" element={
          <div className="App">
            <header className="App-header">
              <h1>Prickless Glucose Monitor</h1>
            </header>
            <main>
              <GlucoseDisplay glucose={glucose} />
            </main>
          </div>
        } />
        <Route path="/settings" element={<Settings />} />  
      </Routes>
    </Router>
  );
}

export default App;
