/*
 * ESP32 PPG Data Transmission - ULTRA SIMPLE VERSION
 * Minimal code to send PPG sensor data to Prick-Less dashboard
 * 
 * This is the simplest possible implementation for ESP32 to dashboard communication.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials - CHANGE THESE
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Settings - CHANGE THE IP TO YOUR COMPUTER'S IP
const char* mqtt_broker = "192.168.1.100";  // Your computer's IP address
const int mqtt_port = 1883;
const char* topic = "prickless/ppg";

// PPG sensor pin
const int PPG_PIN = A0;  // Change to your sensor pin

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  Serial.println("🚀 Starting ESP32 PPG Monitor...");
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("📍 IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Setup MQTT
  client.setServer(mqtt_broker, mqtt_port);
  connectMQTT();
  
  Serial.println("🎯 Ready to send PPG data!");
}

void loop() {
  // Keep MQTT connection alive
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();
  
  // Read PPG sensor (simple analog read)
  int ppgValue = analogRead(PPG_PIN);
  
  // Send data to dashboard
  sendPPGData(ppgValue);
  
  // Wait 3 seconds (adjust as needed)
  delay(3000);
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("🔌 Connecting to MQTT...");
    
    String clientId = "ESP32-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println(" ✅ Connected!");
    } else {
      Serial.print(" ❌ Failed, error: ");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void sendPPGData(int ppgValue) {
  // Create super simple JSON
  StaticJsonDocument<100> doc;
  doc["ppg_value"] = ppgValue;
  
  // Convert to string
  String message;
  serializeJson(doc, message);
  
  // Send to dashboard
  if (client.publish(topic, message.c_str())) {
    Serial.println("📤 Sent: " + message);
  } else {
    Serial.println("❌ Send failed!");
  }
}

/*
 * WIRING EXAMPLE (adjust to your sensor):
 * 
 * PPG Sensor -> ESP32
 * VCC        -> 3.3V
 * GND        -> GND
 * Signal     -> A0 (or any analog pin)
 * 
 * LIBRARIES REQUIRED:
 * - WiFi (ESP32 built-in)
 * - PubSubClient by Nick O'Leary
 * - ArduinoJson by Benoit Blanchon
 * 
 * INSTALLATION:
 * 1. Install Arduino IDE
 * 2. Add ESP32 board: File -> Preferences -> Additional Board Manager URLs:
 *    https://dl.espressif.com/dl/package_esp32_index.json
 * 3. Install ESP32 boards: Tools -> Board -> Boards Manager -> Search "ESP32"
 * 4. Install libraries: Sketch -> Include Library -> Manage Libraries
 *    Search and install: PubSubClient, ArduinoJson
 */