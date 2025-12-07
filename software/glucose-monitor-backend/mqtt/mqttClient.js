// mqtt/mqttClient.js

const mqtt = require('mqtt');
require('dotenv').config();
const { processReading } = require('./readingProcessor');

// Create and return a real MQTT client instance
function createMqttClient() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

  const options = {
    clientId: `prickless-backend-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  // If username/password is set in .env, include it
  if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
  if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

  console.log(`🔌 Connecting to MQTT broker at: ${brokerUrl}`);
  const client = mqtt.connect(brokerUrl, options);

  // When connected
  client.on('connect', () => {
    console.log('✅ Connected to Mosquitto MQTT broker');

    // Subscribe to glucose topic
    client.subscribe('prickless/glucose', { qos: 1 }, (err) => {
      if (err) console.error('❌ Failed to subscribe to prickless/glucose', err);
      else console.log('📡 Subscribed to topic: prickless/glucose');
    });

    // Subscribe to PPG topic
    client.subscribe('prickless/ppg', { qos: 1 }, (err) => {
      if (err) console.error('❌ Failed to subscribe to prickless/ppg', err);
      else console.log('📡 Subscribed to topic: prickless/ppg');
    });
  });

  // Handle incoming messages
  client.on('message', async (topic, message) => {
    try {
      console.log(`📨 MQTT message on [${topic}]: ${message}`);

      const data = JSON.parse(message.toString());

      // Forward data into your processing pipeline → DB insert
      await processReading(data);

    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
    }
  });

  // MQTT lifecycle events
  client.on('error', (err) => console.error('❌ MQTT Error:', err));
  client.on('reconnect', () => console.log('🔄 Reconnecting to MQTT...'));
  client.on('offline', () => console.log('⚠️ MQTT client offline'));

  return client;
}

// Export the actual instance so require() returns a usable client
module.exports = createMqttClient();
