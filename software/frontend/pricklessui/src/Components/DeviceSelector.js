import React, { useState, useEffect } from 'react';
import './DeviceSelector.css';

function DeviceSelector({ token, onDeviceChange, currentUserId }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDevices();
    // Refresh devices every 30 seconds to see real-time assignments
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/glucose/devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const devicesData = await response.json();
      setDevices(devicesData);
      
      // Find the device currently assigned to this user
      const userDevice = devicesData.find(device => device.user_id === currentUserId);
      if (userDevice) {
        setSelectedDevice(userDevice.id);
        onDeviceChange(userDevice.id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
      setLoading(false);
    }
  };

  const handleDeviceSelect = async (deviceId) => {
    if (!deviceId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/glucose/devices/${deviceId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to assign device');
      }

      setSelectedDevice(deviceId);
      onDeviceChange(deviceId);
      
      // Refresh devices to show updated assignments
      fetchDevices();
      
    } catch (err) {
      console.error('Error assigning device:', err);
      setError('Failed to assign device');
    }
  };

  if (loading) {
    return (
      <div className="device-selector">
        <div className="loading">Loading devices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="device-selector">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="device-selector">
      <div className="device-selector-header">
        <h3> Device Assignment</h3>
        <p>Select which physical device to use for glucose monitoring</p>
      </div>
      
      <div className="device-dropdown">
        <label htmlFor="device-select">Current Device:</label>
        <select 
          id="device-select"
          value={selectedDevice} 
          onChange={(e) => handleDeviceSelect(e.target.value)}
          className="device-select"
        >
          <option value="">Select a device...</option>
          {devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.device_name} ({device.id}) - 
              {device.assigned_user ? ` Assigned to ${device.assigned_user}` : ' Available'} - 
              {device.status}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}

export default DeviceSelector;