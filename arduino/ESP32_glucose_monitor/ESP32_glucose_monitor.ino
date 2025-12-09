#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ---- Pins ----
#define BUTTON_PIN 4     // Button → GPIO4 (INPUT_PULLUP)
#define LED_PIN 2        // LED (through resistor) → GPIO2

void setup() {
  Serial.begin(115200);

  Wire.begin(21, 22);

  pinMode(BUTTON_PIN, INPUT_PULLUP);   // Button
  pinMode(LED_PIN, OUTPUT);            // LED
  digitalWrite(LED_PIN, LOW);          // LED OFF at startup

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (1);
  }

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Ready");
  display.display();
}

void loop() {
  bool pressed = (digitalRead(BUTTON_PIN) == LOW); // LOW = pressed

  // ---- LED control ----
  if (pressed) {
    digitalWrite(LED_PIN, HIGH); // Turn LED ON
  } else {
    digitalWrite(LED_PIN, LOW);  // Turn LED OFF
  }

  // ---- OLED display ----
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);

  if (pressed) {
    display.println("Pressed");
  } else {
    display.println("Released");
  }

  display.display();

  delay(50);
}
