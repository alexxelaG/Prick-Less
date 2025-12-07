# ESP32 to Dashboard Setup Guide

## Quick Setup for PPG Data Transmission

This guide shows the **easiest way** to send PPG sensor data from an ESP32 to your Prick-Less glucose monitoring dashboard.

## 1. Install MQTT Broker (Mosquitto)

### On macOS:

```bash
brew install mosquitto
brew services start mosquitto
```

### On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

### On Windows:

1. Download from: https://mosquitto.org/download/
2. Install and start the service

## 2. Test MQTT Broker

Open two terminals and test:

**Terminal 1 (Subscribe):**

```bash
mosquitto_sub -h localhost -t "prickless/ppg"
```

**Terminal 2 (Publish test):**

```bash
mosquitto_pub -h localhost -t "prickless/ppg" -m '{"ppg_value": 512, "user_id": 1}'
```

You should see the message appear in Terminal 1.

## 3. ESP32 Setup

### Required Libraries:

1. **PubSubClient** by Nick O'Leary
2. **ArduinoJson** by Benoit Blanchon

### Installation Steps:

1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Search and install both libraries above
4. Copy the code from `ESP32_PPG_Example.ino`

### Configuration:

1. **WiFi Settings**: Update `ssid` and `password`
2. **MQTT Broker IP**: Find your computer's IP address:

   ```bash
   # On macOS/Linux:
   ifconfig | grep inet

   # On Windows:
   ipconfig
   ```

3. **Sensor Pin**: Connect your PPG sensor and update `PPG_PIN`

## 4. Simple JSON Message Format

Your ESP32 should send JSON messages like this:

```json
{
  "ppg_value": 512,
  "user_id": 1,
  "timestamp": "2025-12-06T10:30:00Z"
}
```

**Required Fields:**

- `ppg_value`: Raw PPG sensor reading (number)

**Optional Fields:**

- `user_id`: User ID (defaults to 1)
- `timestamp`: ISO timestamp (defaults to current time)
- `glucose_mgdl`: Direct glucose reading if available

## 5. MQTT Topics

- **PPG Data**: `prickless/ppg`
- **Glucose Data**: `prickless/glucose`

## 6. Testing the Complete Flow

1. **Start Backend**: Make sure your backend server is running
2. **Start Frontend**: Your React dashboard should be running
3. **Send Test Data**:
   ```bash
   mosquitto_pub -h localhost -t "prickless/ppg" -m '{"ppg_value": 485, "user_id": 1}'
   ```
4. **Check Dashboard**: Refresh your dashboard to see the new data

## 7. Troubleshooting

### MQTT Connection Issues:

- Check if Mosquitto is running: `brew services list | grep mosquitto`
- Test with command line tools first
- Verify IP address is correct

### ESP32 Issues:

- Check WiFi connection
- Verify MQTT broker IP
- Monitor Serial output for errors
- Ensure libraries are installed

### Dashboard Not Updating:

- Check backend logs for MQTT messages
- Verify database connection
- Refresh the dashboard page

## 8. Advanced Features (Optional)

### Multiple Sensors:

```json
{
  "ppg_value": 512,
  "heart_rate": 75,
  "temperature": 36.5,
  "user_id": 1
}
```

### Error Handling in ESP32:

```cpp
if (!client.connected()) {
  Serial.println("MQTT disconnected, attempting reconnect...");
  connectToMQTT();
}
```

### Custom User ID:

```cpp
doc["user_id"] = 2;  // Different user
```

## 9. Production Considerations

- **Security**: Add MQTT authentication for production
- **TLS**: Enable secure MQTT connection
- **Error Recovery**: Implement robust reconnection logic
- **Data Validation**: Add sensor data validation
- **Batch Transmission**: Send multiple readings at once

---

**That's it!** Your ESP32 should now be sending PPG data directly to your dashboard with minimal setup required.
