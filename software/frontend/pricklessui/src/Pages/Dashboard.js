import React, { useEffect, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard({ userId = 1 }) {
  const [glucoseData, setGlucoseData] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch glucose readings from the backend without authentication
  const fetchData = useCallback(async () => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Use simple endpoints for user 1
      const readingsUrl = `http://localhost:3001/api/glucose/readings/1?limit=20`;
      const latestUrl = `http://localhost:3001/api/glucose/latest/1`;
      const statsUrl = `http://localhost:3001/api/glucose/stats/1`;
      console.log('Fetching data for user 1');

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
      
      // Check if it's a connection error
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('Failed to load glucose data. Please try again.');
      }
      setLoading(false);
    }
  }, []);

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
        <h2>Welcome to Your Glucose Dashboard!</h2>
        <div className="no-data">
          <h3>🔗 Getting Started</h3>
          <p>No glucose readings found for your account yet.</p>
          <p>To see your glucose data:</p>
          <ul>
            <li>Connect your Prick-Less device</li>
            <li>Ensure your device is paired and transmitting</li>
            <li>Wait for initial readings to populate</li>
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
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Glucose Trend',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      }
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Time',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: { 
        title: { 
          display: true, 
          text: 'mg/dL',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        min: Math.max(0, Math.min(...glucoseData.map(d => parseFloat(d.glucose_mgdl))) - 20),
        max: Math.max(...glucoseData.map(d => parseFloat(d.glucose_mgdl))) + 20
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Glucose Dashboard</h1>
        <div className="date-info">
          {new Date().toLocaleDateString()} | Last updated: {latestReading ? new Date(latestReading.timestamp).toLocaleTimeString() : 'N/A'}
        </div>
      </div>

      {/* Top Summary Boxes */}
      <div className="summary-grid">
        <div className="summary-card current">
          <div className="card-header">Current</div>
          <div className="card-value">{latestReading ? parseFloat(latestReading.glucose_mgdl).toFixed(1) : '--'}</div>
          <div className="card-unit">mg/dL</div>
        </div>
        <div className="summary-card highest">
          <div className="card-header">Highest</div>
          <div className="card-value">{highestBloodLevel.toFixed(1)}</div>
          <div className="card-unit">mg/dL</div>
        </div>
        <div className="summary-card lowest">
          <div className="card-header">Lowest</div>
          <div className="card-value">{lowestBloodLevel.toFixed(1)}</div>
          <div className="card-unit">mg/dL</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Readings Section */}
        <div className="readings-section">
          <h3>Recent Readings</h3>
          <div className="readings-list">
            {glucoseData
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 8)
              .map((data, index) => (
              <div key={data.id || index} className="reading-item">
                <div className="reading-info">
                  <div className="reading-time">
                    {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="reading-ppg">
                    PPG: {data.ppg_value ? parseFloat(data.ppg_value).toFixed(2) : 'N/A'}
                  </div>
                </div>
                <div className="reading-value">
                  {parseFloat(data.glucose_mgdl).toFixed(1)} mg/dL
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;