import React, { useEffect, useState, useCallback } from 'react';
import './Dashboard.css';

function Dashboard({ userId, user, token }) {
  const [glucoseData, setGlucoseData] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch glucose readings from the backend with authentication
  const fetchData = useCallback(async () => {
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

      // Use user-based endpoints only
      const readingsUrl = `http://localhost:3001/api/glucose/readings/${userId}?limit=10`;
      const latestUrl = `http://localhost:3001/api/glucose/latest/${userId}`;
      const statsUrl = `http://localhost:3001/api/glucose/stats/${userId}`;
      console.log('Fetching data for user:', userId);

      // Fetch recent readings
      const readingsResponse = await fetch(readingsUrl, { headers });
      
      if (!readingsResponse.ok) {
        throw new Error('Failed to fetch readings');
      }
      
      const readings = await readingsResponse.json();
      
      // Fetch latest reading
      const latestResponse = await fetch(latestUrl, { headers });
      
      if (!latestResponse.ok) {
        // If no readings found for this user, handle gracefully
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
      
      const statsData = await statsResponse.json();
      
      setGlucoseData(readings);
      setStats(statsData);
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
  }, [userId, token]);

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
              <p>Time: {new Date(latestReading.timestamp).toLocaleTimeString()}</p>
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
          <p>{stats ? parseFloat(stats.avg_glucose).toFixed(1) : 'N/A'} mg/dL</p>
          <small>{stats?.total_readings || 0} readings</small>
        </div>
      </div>

      {/* Real-Time Glucose Readings Table */}
      <div className="table-container">
        <h3>Recent Glucose Readings</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Glucose Level</th>
            </tr>
          </thead>
          <tbody>
            {glucoseData.map((data, index) => (
              <tr key={data.id || index}>
                <td>{new Date(data.timestamp).toLocaleString()}</td>
                <td>{parseFloat(data.glucose_mgdl).toFixed(1)} mg/dL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;