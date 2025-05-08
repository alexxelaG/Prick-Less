import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard({ userId }) {
  const [glucoseData, setGlucoseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch glucose readings from the backend
    const fetchGlucoseData = async () => {
      try {
        const response = await fetch(`/api/glucose/${userId}`);
        const data = await response.json();
        setGlucoseData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching glucose data:', error);
        setLoading(false);
      }
    };

    fetchGlucoseData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const highestBloodLevel = Math.max(...glucoseData.map((data) => data.glucose_level));
  const lowestBloodLevel = Math.min(...glucoseData.map((data) => data.glucose_level));
  const timeOfHighestSpike = glucoseData.find((data) => data.glucose_level === highestBloodLevel)?.timestamp || 'N/A';

  const chartData = {
    labels: glucoseData.map((data) => new Date(data.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Glucose Trends',
        data: glucoseData.map((data) => data.glucose_level),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
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
      <h2>Glucose Dashboard</h2>

      {/* Summary Boxes */}
      <div className="summary-boxes">
        <div className="summary-box">
          <h3>Highest Blood Level</h3>
          <p>{highestBloodLevel} mg/dL</p>
        </div>
        <div className="summary-box">
          <h3>Lowest Blood Level</h3>
          <p>{lowestBloodLevel} mg/dL</p>
        </div>
        <div className="summary-box">
          <h3>Time of Highest Spike</h3>
          <p>{new Date(timeOfHighestSpike).toLocaleTimeString()}</p>
        </div>
      </div>



      {/* Real-Time Glucose Readings Table */}
      <div className="table-container">
        <h3>Real-Time Glucose Readings</h3>
        <table>
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Glucose Reading</th>
            </tr>
          </thead>
          <tbody>
            {glucoseData.map((data, index) => (
              <tr key={index}>
                <td>{new Date(data.timestamp).toLocaleString()}</td>
                <td>{data.glucose_level} mg/dL</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;