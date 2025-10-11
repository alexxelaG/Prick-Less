const mqtt = require('mqtt');
const { db } = require('../config/db');
const { processReading } = require('./readingProcessor');

const mqttClient = () => {
  const options = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: `prickless-backend-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  const client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Subscribe to device readings with wildcard for all devices
    client.subscribe('device/+/readings', { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to subscribe to device readings:', err);
      } else {
        console.log('Subscribed to topic: device/+/readings');
      }
    });

    // Subscribe to device status updates
    client.subscribe('device/+/status', { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to subscribe to device status:', err);
      } else {
        console.log('Subscribed to topic: device/+/status');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      
      if (topicParts[0] === 'device' && topicParts[2] === 'readings') {
        // Handle device readings: device/{deviceId}/readings
        const deviceId = topicParts[1];
        await processReading(deviceId, data);
        
      } else if (topicParts[0] === 'device' && topicParts[2] === 'status') {
        // Handle device status updates: device/{deviceId}/status
        const deviceId = topicParts[1];
        await updateDeviceStatus(deviceId, data);
      }
      
    } catch (error) {
      console.error('Error processing MQTT message:', error);
      console.error('Topic:', topic);
      console.error('Message:', message.toString());
    }
  });

  client.on('error', (error) => {
    console.error('MQTT Client Error:', error);
  });

  client.on('offline', () => {
    console.log('MQTT Client offline');
  });

  client.on('reconnect', () => {
    console.log('MQTT Client reconnecting...');
  });

  return client;
};

// Update device status in database
const updateDeviceStatus = async (deviceId, statusData) => {
  const { status, firmware_version } = statusData;
  const query = `
    UPDATE devices 
    SET status = ?, last_seen = NOW(), firmware_version = ?
    WHERE id = ?
  `;
  
  try {
    await db.promise().query(query, [status, firmware_version, deviceId]);
    console.log(`Device ${deviceId} status updated: ${status}`);
  } catch (error) {
    console.error('Failed to update device status:', error);
  }
};

module.exports = mqttClient;