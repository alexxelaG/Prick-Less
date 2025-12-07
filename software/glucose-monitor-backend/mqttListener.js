const client = require('./mqtt/mqttClient');
const readingProcessor = require('./mqtt/readingProcessor');
const mysql = require('mysql2/promise');

// MySQL pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'glucose_monitor'
});

// Subscribe to topic on connect
client.on('connect', () => {
  console.log("MQTT Connected");

  client.subscribe("prickless/glucose", (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log("Subscribed to prickless/glucose");
    }
  });
});

// When message arrives → parse → store in DB
client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // Process data using your existing logic
    const reading = readingProcessor(data);

    const sql = `
      INSERT INTO readings (user_id, glucose_mgdl, ppg_value, timestamp)
      VALUES (?, ?, ?, ?)
    `;

    await db.execute(sql, [
      reading.userId,
      reading.glucose_mgdl,
      reading.ppg_value,
      reading.timestamp
    ]);

    console.log("Stored reading in DB:", reading);

  } catch (error) {
    console.error("Error handling MQTT message:", error);
  }
});
