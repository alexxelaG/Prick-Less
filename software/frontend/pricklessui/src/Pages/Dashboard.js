import React, { useEffect, useState, useCallback } from 'react';
import './Dashboard.css';
import DeviceSelector from '../Components/DeviceSelector';

function Dashboard({ userId, user, token }) {
  const [glucoseData, setGlucoseData] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Fetch glucose readings from the backend with authentication
  const fetchGlucoseData = useCallback(async () => {
    if (!userId || !token) {
      setError('Please log in to view your dashboard');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let readingsUrl, latestUrl, statsUrl;

      if (selectedDevice) {
        // Use device-specific endpoints when a device is selected
        readingsUrl = `http://localhost:3001/api/glucose/device/${selectedDevice}/readings?limit=10`;
        latestUrl = `http://localhost:3001/api/glucose/device/${selectedDevice}/latest`;
        statsUrl = `http://localhost:3001/api/glucose/device/${selectedDevice}/stats`;
        console.log('Fetching data for device:', selectedDevice);
      } else {
        // Use user-based endpoints as fallback
        readingsUrl = `http://localhost:3001/api/glucose/readings/${userId}?limit=10`;
        latestUrl = `http://localhost:3001/api/glucose/latest/${userId}`;
        statsUrl = `http://localhost:3001/api/glucose/stats/${userId}`;
        console.log('Fetching data for user:', userId);
      }

      // Fetch recent readings
      const readingsResponse = await fetch(readingsUrl, { headers });
      
      if (!readingsResponse.ok) {
        throw new Error('Failed to fetch readings');
      }
      
      const readings = await readingsResponse.json();
      
      // Fetch latest reading
      const latestResponse = await fetch(latestUrl, { headers });
      
      if (!latestResponse.ok) {
        // If no readings found for this device, handle gracefully
        if (latestResponse.status === 404) {
          setLatestReading(null);
        } else {
          throw new Error('Failed to fetch latest reading');
        }
      } else {
        const latest = await latestResponse.json();
        setLatestReading(latest);
      }
      
      // Fetch statistics
      const statsResponse = await fetch(statsUrl, { headers });
      
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const stats = await statsResponse.json();
      
      setGlucoseData(readings);
      setUserStats(stats);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching glucose data:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('Failed to load glucose data. Please try again.');
      }
      setLoading(false);
    }
  }, [userId, token, selectedDevice]);

  useEffect(() => {
    fetchGlucoseData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchGlucoseData, 30000);
    return () => clearInterval(interval);
  }, [fetchGlucoseData]);

  // Add effect to refetch data when device changes
  useEffect(() => {
    if (selectedDevice) {
      fetchGlucoseData();
    }
  }, [selectedDevice, fetchGlucoseData]);

  const handleDeviceChange = (deviceId) => {
    setSelectedDevice(deviceId);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <h2>Loading your glucose data...</h2>
          <p>Connecting to Prick-Less monitor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Handle case where no data is available
  if (!glucoseData || glucoseData.length === 0) {
    return (
      <div className="dashboard">
        <h2>Welcome to Your Glucose Dashboard, {user?.name}!</h2>
        <div className="no-data">
          <h3>🔗 Getting Started</h3>
          <p>No glucose readings found for your account yet.</p>
          <p>To see your glucose data:</p>
          <ul>
            <li>✅ Connect your Prick-Less device</li>
            <li>✅ Ensure your device is paired and transmitting</li>
            <li>✅ Wait for initial readings to populate</li>
          </ul>
          <p><strong>Test Account:</strong> Try logging in with <code>john.doe@example.com</code> (password: <code>password123</code>) to see sample data.</p>
        </div>
      </div>
    );
  }

  const highestBloodLevel = Math.max(...glucoseData.map((data) => parseFloat(data.glucose_mgdl)));
  const lowestBloodLevel = Math.min(...glucoseData.map((data) => parseFloat(data.glucose_mgdl)));
  const timeOfHighestSpike = glucoseData.find((data) => parseFloat(data.glucose_mgdl) === highestBloodLevel)?.timestamp || 'N/A';

  const chartData = {
    labels: glucoseData.map((data) => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Glucose Level (mg/dL)',
        data: glucoseData.map((data) => parseFloat(data.glucose_mgdl)),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { title: { display: true, text: 'Glucose Level (mg/dL)' } },
    },
  };

  return (
    <div className="dashboard">
      <h2>Glucose Dashboard - {user?.name || latestReading?.user_name || 'User'}</h2>

      {/* Device Selector */}
      <DeviceSelector 
        token={token} 
        onDeviceChange={handleDeviceChange} 
        currentUserId={userId}
      />

      {/* Current Reading Display */}
      {latestReading && (
        <div className="current-reading">
          <div className="current-glucose">
            <h3>Current Glucose Level</h3>
            <div className="glucose-value">
              <span className="value">{parseFloat(latestReading.glucose_mgdl).toFixed(1)}</span>
              <span className="unit">mg/dL</span>
            </div>
            <div className="reading-info">
              <p>Quality: {(parseFloat(latestReading.prediction_quality) * 100).toFixed(0)}%</p>
              <p>Device: {latestReading.device_id}</p>
              <p>Last Update: {new Date(latestReading.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Boxes */}
      <div className="summary-boxes">
        <div className="summary-box">
          <h3>Highest Reading</h3>
          <p>{highestBloodLevel.toFixed(1)} mg/dL</p>
          <small>{new Date(timeOfHighestSpike).toLocaleTimeString()}</small>
        </div>
        <div className="summary-box">
          <h3>Lowest Reading</h3>
          <p>{lowestBloodLevel.toFixed(1)} mg/dL</p>
        </div>
        <div className="summary-box">
          <h3>Average</h3>
          <p>{userStats ? parseFloat(userStats.avg_glucose).toFixed(1) : 'N/A'} mg/dL</p>
          <small>{userStats?.total_readings || 0} readings</small>
        </div>
        <div className="summary-box">
          <h3>Confidence Score</h3>
          <p>{userStats ? (parseFloat(userStats.avg_quality) * 100).toFixed(0) : 'N/A'}%</p>
        </div>
      </div>

      {/* PPG Features Display 
      {latestReading?.features && (
        <div className="ppg-features">
          <h3>Latest PPG Analysis</h3>
          <div className="features-grid">
            <div className="feature">
              <span>Heart Rate:</span>
              <span>{latestReading.features.hr} BPM</span>
            </div>
            <div className="feature">
              <span>PPG Mean:</span>
              <span>{latestReading.features.mean?.toFixed(1)}</span>
            </div>
            <div className="feature">
              <span>AC Component:</span>
              <span>{latestReading.features.ac?.toFixed(1)}</span>
            </div>
            <div className="feature">
              <span>Signal Quality:</span>
              <span>{latestReading.features.snr?.toFixed(1)} dB</span>
            </div>
          </div>
        </div>
      )}
      */}


      {/* Real-Time Glucose Readings Table */}
      <div className="table-container">
        <h3>Recent Glucose Readings</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Glucose Level</th>
              <th>Heart Rate</th>
              <th>Quality</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {glucoseData.map((data, index) => (
              <tr key={data.id || index}>
                <td>{new Date(data.timestamp).toLocaleString()}</td>
                <td>{parseFloat(data.glucose_mgdl).toFixed(1)} mg/dL</td>
                <td>{data.features?.hr || 'N/A'} BPM</td>
                <td>{(parseFloat(data.prediction_quality) * 100).toFixed(0)}%</td>
                <td>{data.device_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;