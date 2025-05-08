// filepath: /Users/natashaprabhoo/git/NonInvasiveGlucoseMonitor/Prick-Less/software/glucose-monitor-backend/mqtt/mqttClient.js
const mqtt = require('mqtt');
const { db } = require('../config/db');

const mqttClient = () => {
  const client = mqtt.connect(process.env.MQTT_BROKER_URL);

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('glucose/readings', (err) => {
      if (err) {
        console.error('Failed to subscribe to topic:', err);
      } else {
        console.log('Subscribed to topic: glucose/readings');
      }
    });
  });

  client.on('message', (topic, message) => {
    if (topic === 'glucose/readings') {
      const data = JSON.parse(message.toString());
      const { userId, glucoseLevel } = data;

      const query = 'INSERT INTO glucose_readings (user_id, glucose_level) VALUES (?, ?)';
      db.query(query, [userId, glucoseLevel], (err, result) => {
        if (err) {
          console.error('Failed to insert glucose reading:', err);
        } else {
          console.log('Glucose reading saved:', result);
        }
      });
    }
  });
};

module.exports = mqttClient;