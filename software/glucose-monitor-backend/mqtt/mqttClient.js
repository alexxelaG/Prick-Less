const mqtt = require('mqtt');
const { processReading } = require('./readingProcessor');

const mqttClient = () => {
  const options = {
    clientId: `prickless-backend-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  // Add username/password only if provided
  if (process.env.MQTT_USERNAME) {
    options.username = process.env.MQTT_USERNAME;
  }
  if (process.env.MQTT_PASSWORD) {
    options.password = process.env.MQTT_PASSWORD;
  }

  const client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

  client.on('connect', () => {
    console.log('✅ Connected to MQTT broker');
    
    // Subscribe to simple PPG data topic
    client.subscribe('prickless/ppg', { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to subscribe to PPG readings:', err);
      } else {
        console.log('✅ Subscribed to topic: prickless/ppg');
      }
    });

    // Subscribe to simple glucose readings
    client.subscribe('prickless/glucose', { qos: 1 }, (err) => {
      if (err) {
        console.error('Failed to subscribe to glucose readings:', err);
      } else {
        console.log('✅ Subscribed to topic: prickless/glucose');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      console.log(`📨 Received MQTT message on topic: ${topic}`);
      const messageStr = message.toString();
      console.log(`📄 Message content: ${messageStr}`);
      
      if (topic === 'prickless/ppg') {
        // Handle PPG sensor readings
        const data = JSON.parse(messageStr);
        await processReading(data);
        
      } else if (topic === 'prickless/glucose') {
        // Handle direct glucose readings (if available)
        const data = JSON.parse(messageStr);
        await processReading(data);
      }
      
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
      console.error('Topic:', topic);
      console.error('Message:', message.toString());
    }
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Client Error:', error);
  });

  client.on('offline', () => {
    console.log('🔌 MQTT Client offline');
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT Client reconnecting...');
  });

  return client;
};

module.exports = mqttClient;