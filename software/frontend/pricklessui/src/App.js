import React, { useState, useEffect } from 'react';
import GlucoseDisplay from './GlucoseDisplay';
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

    fetchGlucose(); // initial fetch
    const intervalId = setInterval(fetchGlucose, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Prickless Glucose Monitor</h1>
      </header>
      <main>
        <GlucoseDisplay glucose={glucose} />
      </main>
    </div>
  );
}

export default App;
