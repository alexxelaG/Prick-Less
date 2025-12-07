# Prick-Less Glucose Monitor - Complete Setup Guide

A simplified, non-invasive glucose monitoring system with ESP32 integration and real-time dashboard display.

## 🚀 Quick Start Overview

1. **Backend Setup** (5 minutes)
2. **Frontend Setup** (3 minutes)
3. **Database Setup** (2 minutes)
4. **ESP32 Setup** (10 minutes)
5. **Start Sending Data** (Instant!)

---

## 📋 Prerequisites

### Required Software:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### For ESP32 Development:

- **Arduino IDE**
- **ESP32 board** with WiFi
- **PPG sensor** (any analog sensor for testing)

---

## 🗄️ 1. Database Setup

### Install MySQL (if not installed):

```bash
# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### Create Database:

```bash
# Login to MySQL (no password by default on macOS with Homebrew)
mysql -u root

# Create database and tables
CREATE DATABASE glucose_monitor;
USE glucose_monitor;

# Run the schema file
source database/schema.sql;

# Exit MySQL
EXIT;
```

---

## 🔧 2. Backend Setup

### Navigate to backend directory:

```bash
cd software/glucose-monitor-backend
```

### Install dependencies:

```bash
npm install
```

### Configure environment:

1. Copy the `.env` file and update if needed:

```bash
# Check current configuration
cat .env
```

2. Default configuration should work for local development:
   - Database: `localhost` with user `root` (no password)
   - Port: `3001`
   - MQTT: `localhost:1883`

### Start the backend:

```bash
npm start
```

✅ **You should see:**

```
Server running on port 3001
✅ Connected to MySQL database
```

---

## 🎨 3. Frontend Setup

### Open new terminal and navigate to frontend:

```bash
cd software/frontend/pricklessui
```

### Install dependencies:

```bash
npm install
```

### Start the frontend:

```bash
npm start
```

✅ **Frontend will open at:** `http://localhost:3000`

---

## 📡 4. MQTT Broker Setup

### Install Mosquitto:

```bash
# macOS
brew install mosquitto
brew services start mosquitto

# Ubuntu/Debian
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

### Test MQTT (Optional):

```bash
# Terminal 1 - Subscribe to messages
mosquitto_sub -h localhost -t "prickless/ppg"

# Terminal 2 - Send test message
mosquitto_pub -h localhost -t "prickless/ppg" -m '{"ppg_value": 512}'
```

---

## 🔌 5. ESP32 Setup

### Install Arduino IDE Libraries:

1. Open Arduino IDE
2. Go to **Sketch → Include Library → Manage Libraries**
3. Install these libraries:
   - `PubSubClient` by Nick O'Leary
   - `ArduinoJson` by Benoit Blanchon

### Configure ESP32 Code:

1. Open `ESP32_PPG_Example.ino` in Arduino IDE
2. Update these values:

```cpp
const char* ssid = "YOUR_WIFI_NAME";           // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* mqtt_broker = "192.168.1.100";     // Your computer's IP address
```

### Find Your Computer's IP Address:

```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig

# Look for something like: 192.168.1.xxx or 10.0.0.xxx
```

### Upload to ESP32:

1. Connect ESP32 to computer via USB
2. Select correct board and port in Arduino IDE
3. Upload the code
4. Open Serial Monitor to see connection status

---

## 🧪 6. Testing the Complete System

### Test Without ESP32 Hardware:

```bash
# From project root directory
./test_mqtt.sh
```

This will send 5 test PPG readings to your dashboard.

### Test With ESP32:

1. Power on your ESP32
2. Check Serial Monitor for connection messages:
   ```
   ✅ WiFi Connected!
   ✅ MQTT Connected!
   📤 Sent: {"ppg_value": 423}
   ```
3. Refresh your dashboard to see new data

---

## 🎯 7. Accessing the Dashboard

### Open your browser to:

```
http://localhost:3000
```

### Navigation:

- **Home**: Welcome page with "View Dashboard" button
- **Dashboard**: Real-time glucose monitoring with:
  - Summary cards (Latest, Average, Min, Max)
  - Interactive chart showing trends
  - Recent readings list
- **Settings**: Configuration options
- **About Us**: Project information

---

## 🔧 8. Troubleshooting

### Backend Issues:

```bash
# Check if MySQL is running
brew services list | grep mysql

# Check backend logs
cd software/glucose-monitor-backend
npm start
```

### Frontend Issues:

```bash
# Clear node modules and reinstall
cd software/frontend/pricklessui
rm -rf node_modules package-lock.json
npm install
npm start
```

### MQTT Issues:

```bash
# Check if Mosquitto is running
brew services list | grep mosquitto

# Test MQTT manually
mosquitto_pub -h localhost -t "prickless/ppg" -m '{"ppg_value": 500}'
```

### ESP32 Issues:

- Verify WiFi credentials
- Check computer's IP address hasn't changed
- Ensure ESP32 and computer are on same network
- Check Serial Monitor for error messages

### Database Issues:

```bash
# Check database connection
mysql -u root
SHOW DATABASES;
USE glucose_monitor;
SHOW TABLES;
```

---

## 📊 9. Understanding the Data Flow

```
ESP32 Sensor → WiFi → MQTT Broker → Backend Server → MySQL Database → Frontend Dashboard
```

### Data Format:

The ESP32 sends simple JSON messages:

```json
{
  "ppg_value": 512
}
```

The backend automatically adds:

- Timestamp
- User ID (defaults to 1)
- Database storage

---

## 🎉 10. Success Indicators

### ✅ Everything Working When You See:

1. **Backend Terminal:**

   ```
   ✅ Connected to MQTT broker
   📨 Received MQTT message on topic: prickless/ppg
   ✅ Stored reading for user 1: PPG=512
   ```

2. **ESP32 Serial Monitor:**

   ```
   ✅ WiFi Connected!
   ✅ MQTT Connected!
   📤 Sent: {"ppg_value": 423}
   ```

3. **Dashboard:**
   - Data appears in summary cards
   - Chart shows new data points
   - Recent readings list updates

---

## 🚀 11. For Your Teammate

### Quick Setup for New Developer:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/alexxelaG/Prick-Less.git
   cd Prick-Less
   ```

2. **Follow steps 1-7 above**

3. **ESP32 Configuration:**

   - Update WiFi credentials in `ESP32_PPG_Example.ino`
   - Update `mqtt_broker` IP to their computer's IP
   - Upload and run

4. **Test data transmission:**
   ```bash
   ./test_mqtt.sh
   ```

That's it! The system is designed to be as simple as possible for multiple developers to get running quickly.

---

## 📝 Notes

- **No authentication required** - Dashboard is directly accessible
- **Single user system** - All data goes to User ID 1
- **Real-time updates** - Refresh dashboard to see new data
- **Minimal configuration** - Only WiFi and IP address needed
- **Hardware agnostic** - Any analog sensor can provide PPG data

**Total setup time: ~20 minutes**
**ESP32 coding time: ~5 minutes**
**Time to first data: Immediate!**
