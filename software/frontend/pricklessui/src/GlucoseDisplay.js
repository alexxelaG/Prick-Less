import React from 'react';
import './GlucoseDisplay.css';

function GlucoseDisplay({ glucose }) {
  return (
    <div className="glucose-display">
      <h2>Current Glucose Level</h2>
      {glucose !== null ? (
        <div className="glucose-value">{glucose} mg/dL</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default GlucoseDisplay;
