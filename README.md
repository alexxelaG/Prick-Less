# Prick-Less 🩸➡️📱

> **Because nobody likes PRICKS**

A non-invasive glucose monitoring system using ESP32, optical sensors, and real-time data visualization.

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL Server
- MQTT Broker (Mosquitto)
- ESP32 development board

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Prick-Less.git
   cd Prick-Less
   ```

2. **Set up the database**
   ```bash
   ./setup-database.sh
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Install and start backend**
   ```bash
   cd software/glucose-monitor-backend
   npm install
   npm start
   ```

5. **Install and start frontend**
   ```bash
   cd software/frontend/pricklessui
   npm install
   npm start
   ```

6. **Test the system**
   ```bash
   ./test_backend.sh
   ./test_mqtt.sh
   ```

## 🏗️ System Architecture

```
ESP32 Sensor → WiFi → MQTT Broker → Backend API → MySQL → Frontend Dashboard
```

### Key Components

- **Hardware**: ESP32 with LED/photoresistor for optical glucose sensing
- **Backend**: Node.js/Express API with MQTT integration
- **Frontend**: React dashboard for real-time monitoring
- **Database**: MySQL for data persistence
- **Communication**: MQTT for device-to-server messaging

## API Endpoints

- `GET /` - Health check
- `GET /api/test` - API test endpoint
- `GET /api/health` - Database health check
- `GET /api/glucose/readings/:userId` - Get user readings
- `GET /api/glucose/latest/:userId` - Get latest reading
- `GET /api/glucose/trends/:userId` - Get glucose trends

## Hardware Setup

### ESP32 Configuration

1. Connect LED and photoresistor to ESP32
2. Update WiFi credentials in `arduino/ESP32_glucose_monitor/ESP32_glucose_monitor.ino`
3. Set MQTT broker IP address
4. Upload code to ESP32

### MQTT Topics

- `prickless/glucose` - Glucose readings from ESP32

### Message Format

```json
{
  "ppg_value": 512,
  "timestamp": "2024-01-01T12:00:00Z",
  "user_id": 1
}
```

## 📊 Features

- **Real-time Monitoring**: Live glucose level tracking
- **Data Visualization**: Interactive charts and trends
- **Device Integration**: Seamless ESP32 connectivity
- **No Authentication**: Simplified for development/demo
- **Historical Data**: Store and analyze past readings

## 📁 Project Structure

```
Prick-Less/
├── arduino/                    # ESP32 firmware
├── database/                   # Database schema
├── software/
│   ├── glucose-monitor-backend/ # Node.js API server
│   ├── frontend/pricklessui/   # React dashboard
│   ├── data-collection/        # Data analysis notebooks
│   └── models/                 # ML models
├── test_backend.sh            # Backend testing script
├── test_mqtt.sh              # MQTT testing script
└── setup-database.sh         # Database initialization
```

## Development

### Backend Development
```bash
cd software/glucose-monitor-backend
npm run dev  # Start with nodemon
```

### Frontend Development
```bash
cd software/frontend/pricklessui
npm start    # Start React dev server
```

### Testing
```bash
# Test backend API
./test_backend.sh

# Test MQTT connectivity
./test_mqtt.sh
```

## 🚨 Troubleshooting

**Database Connection Issues:**
- Verify MySQL is running: `brew services start mysql`
- Check credentials in `.env` file
- Run database setup: `./setup-database.sh`

**MQTT Connection Issues:**
- Start Mosquitto: `brew services start mosquitto`
- Check broker IP in ESP32 code
- Verify port 1883 is accessible

**ESP32 Issues:**
- Check WiFi credentials
- Verify MQTT broker IP address
- Monitor serial output for debug info

## 📚 Documentation

- [Complete Setup Guide](README_SETUP.md)
- [MQTT Setup Guide](MQTT_SETUP_GUIDE.md)
- [Simplifications Made](SIMPLIFICATIONS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🎯 Future Enhancements

- Machine learning for glucose prediction
- User authentication system  
- Mobile app development
- Cloud deployment
- Data export functionality

---

**Built with ❤️ for painless health monitoring**
  - Handles data acquisition, controls the LED, and interfaces with the machine learning software.
- **Ergonomic Finger Clip:**
  - A custom-designed housing ensuring consistent sensor placement and reliable measurements.

## Software Components

- **Data Acquisition Module:**
  - Interfaces with hardware to collect and preprocess sensor data.
- **Signal Processing Algorithms:**
  - Noise reduction and baseline correction techniques to improve data quality.
- **Machine Learning Pipeline:**
  - Feature extraction from optical data.
  - Model training using regression techniques and neural networks to predict glucose levels.
  - Real-time inference integrated into the embedded system.
- **User Interface:**
  - Displays real-time glucose levels, historical trends, and alerts for hypo- or hyperglycemia.
- **Data Logging & Analytics:**
  - Stores historical data for trend analysis and further model refinement.

## Design & Methodology

The system design is based on a non-invasive optical measurement technique:

1. **Optical Sensing:**
   An LED light shines through the finger while the photoresistor on the opposite side measures light attenuation. Variations in light absorption are influenced by glucose concentration in the interstitial fluid.
2. **Data Processing:**
   The raw sensor output is conditioned and digitized. Signal processing algorithms filter noise and account for variables such as ambient light.
3. **Machine Learning Integration:**
   A trained model correlates the processed optical data with actual blood glucose levels. Continuous learning allows the system to adapt to individual user characteristics.
4. **User Feedback:**
   A user-friendly interface presents the measured glucose levels, trends, and personalized health recommendations, aiming to support effective diabetes management.

## Setup & Installation

1. **Dependencies:**

- Setup Node.js/Express Server Dependencies

```
npm install express cors body-parser dotenv
npm install --save-dev nodemon
```

- MQTT client for real-time readings from ESP-32

```
npm install mqtt
```

- MySQL dependencies

```
npm install mysql2
```

1. **Setup Backend**

- MySQL database setup

```
create database glucose_monitor;
use glucose_monitor;
```

### Hardware Setup

1. **Assemble the Device:**
   - Mount the LED and photoresistor on opposite sides of the custom finger clip.
   - Connect the signal conditioning circuit and ADC to the microcontroller.
2. **Power Supply:**
   - Ensure a stable power source is provided, either through batteries or a direct power supply.

### Software Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/Prick-Less.git
   cd Prick-Less

   ```
   
### Acknowledgements

We would like to extend our deepest gratitude to Dr. Mark Ammar Rayes, our project advisor, for his invaluable guidance and mentorship throughout this project. We also wish to thank Dr. Wencen Wu, our professor, for providing us with the knowledge and framework necessary to successfully complete this work. Additionally, we are grateful to Dr. Gregory Courand, the GE coordinator, for his support and coordination. Finally, we acknowledge San Jose State University for providing us the opportunity and resources to carry out this project.

### Research

Research that is helping drive this project:

Saputra, Dika Ari, and J. Rajes Khana. "Design and Development of Esp32-Based Non-Invasive Blood Sugar Level Measurement Equipment." Proceedings of the 3rd International Seminar and Call for Paper (ISCP) UTA'45 Jakarta, 2022, pp. 381-385.

Wu, Juncen, et al. "A New Generation of Sensors for Non-Invasive Blood Glucose Monitoring." American Journal of Translational Research, vol. 15, no. 6, 15 June 2023, pp. 3825–3837.

Alam, Iftekar, et al. "Design and Development of a Non-invasive Opto-Electronic Sensor for Blood Glucose Monitoring Using a Visible Light Source." Cureus, vol. 16, no. 5, 21 May 2024, e60745, doi:10.7759/cureus.60745.

Hina, Aminah, and Wala Saadeh. “Noninvasive Blood Glucose Monitoring Systems Using Near‑Infrared Technology—A Review.” Sensors, vol. 22, no. 13, 27 June 2022, p. 4855, https://doi.org/10.3390/s22134855.

Saleem, Muhammad Yasir, and Muhammad Ammar. Dataset of Photoplethysmography Signals Collected from a Pulse Sensor to Measure Blood Glucose Level. Mendeley Data, vol. 1, 2022, https://data.mendeley.com/datasets/37pm7jk7jn/1.

Mosaddequr, Kazi, and Tanzilur Rahman. "A Novel Multipurpose Device for Dataset Creation and On-Device Immediate Estimation of Blood Glucose Level from Reflection PPG." Heliyon, vol. 9, no. 9, 2023, e19553.

Satter, Shama, et al. "EMD-Based Noninvasive Blood Glucose Estimation from PPG Signals Using Machine Learning Algorithms." Applied Sciences, vol. 14, no. 4, 2024, p. 1406.
