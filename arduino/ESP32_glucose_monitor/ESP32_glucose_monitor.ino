#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---- OLED ----
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ---- Pins ----
#define BUTTON_PIN 4     // GPIO4
#define LED_PIN 2        // GPIO2 (IR LED / indicator)
#define PD_PIN 32        // GPIO32 (photodiode ADC)

// ---- WiFi ----
const char* ssid = "HOME-4829";
const char* password = "answer6189brush";

// ---- MQTT ----
const char* mqtt_server = "10.0.0.107";
const int mqtt_port = 1883;

// Topics
const char* controlTopic = "esp32/control";
const char* statusTopic  = "esp32/data";
const char* glucoseTopic = "prickless/glucose";

WiFiClient espClient;
PubSubClient client(espClient);

// ---------- MQTT Callback ----------
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("MQTT Command: ");
  Serial.println(message);

  if (message == "LED_ON")  digitalWrite(LED_PIN, HIGH);
  if (message == "LED_OFF") digitalWrite(LED_PIN, LOW);
}

// ---------- MQTT Reconnect ----------
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32_Glucose_OLED")) {
      Serial.println("connected");
      client.subscribe(controlTopic);
    } else {
      Serial.print("failed, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // ---- OLED ----
  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (1);
  }

  display.clearDisplay();
  display.setTextColor(WHITE);

  // ---- Pins ----
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // ---- WiFi ----
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("WiFi Connecting...");
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  display.clearDisplay();
  display.println("WiFi Connected!");
  display.display();
  delay(500);

  // ---- MQTT ----
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  bool pressed = (digitalRead(BUTTON_PIN) == LOW);
  static bool lastState = HIGH;

  // ---- Button → LED + MQTT ----
  if (pressed != lastState) {
    lastState = pressed;

    if (pressed) {
      digitalWrite(LED_PIN, HIGH);
      client.publish(statusTopic, "BUTTON_PRESSED");
    } else {
      digitalWrite(LED_PIN, LOW);
      client.publish(statusTopic, "BUTTON_RELEASED");
    }
  }

  // ---- SENSOR STREAM (1 Hz) ----
  static unsigned long lastSample = 0;
  if (millis() - lastSample > 1000) {
    lastSample = millis();

    // Turn LED ON for measurement
    digitalWrite(LED_PIN, HIGH);
    delayMicroseconds(300);

    int rawPD = analogRead(PD_PIN);

    digitalWrite(LED_PIN, LOW);

    float ppg_value = rawPD;
    float glucose_est = map(rawPD, 500, 3000, 80, 160);
    glucose_est = constrain(glucose_est, 70, 180);

    String payload = "{";
    payload += "\"userId\":1,";
    payload += "\"glucose_mgdl\":" + String(glucose_est, 1) + ",";
    payload += "\"ppg_value\":" + String(ppg_value, 0);
    payload += "}";

    client.publish(glucoseTopic, payload.c_str());

    Serial.print("PD: ");
    Serial.print(rawPD);
    Serial.print(" | Glucose: ");
    Serial.println(glucose_est);
  }

  // ---- OLED DISPLAY ----
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println(pressed ? "Pressed" : "Released");

  display.setTextSize(1);
  display.setCursor(0, 30);
  display.print("PD: ");
  display.println(analogRead(PD_PIN));

  display.setCursor(0, 45);
  display.print("MQTT: ");
  display.println(client.connected() ? "OK" : "DOWN");

  display.display();

  delay(50);
}
