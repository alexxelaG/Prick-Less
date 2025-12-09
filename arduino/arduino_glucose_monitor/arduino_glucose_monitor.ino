#include <LiquidCrystal.h>

// LCD connected to pins: RS=12, E=11, D4=5, D5=4, D6=3, D7=2
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Pins
const int buttonPin = 8;
const int ledPin = 7;
const int ANALOG_IN = A0;

// States
bool ledState = false;
bool lastButtonState = HIGH;

// ---- Smoothing buffer ----
const int NUM_SAMPLES = 20;
int samples[NUM_SAMPLES];
int sampleIndex = 0;
long total = 0;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);

  lcd.begin(16, 2);
  lcd.print("Initializing...");

  Serial.begin(9600);
  delay(1000);
  lcd.clear();

  for (int i = 0; i < NUM_SAMPLES; i++) samples[i] = 0;
}

void loop() {

  // ---- BUTTON LOGIC ----
  bool currentButtonState = digitalRead(buttonPin);

  if (lastButtonState == HIGH && currentButtonState == LOW) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    delay(200); // debounce
  }
  lastButtonState = currentButtonState;


  // ---- ANALOG READ ----
  int raw = analogRead(ANALOG_IN);

  // ---- MOVING AVERAGE ----
  total -= samples[sampleIndex];
  samples[sampleIndex] = raw;
  total += raw;

  sampleIndex++;
  if (sampleIndex >= NUM_SAMPLES) sampleIndex = 0;

  int smoothed = total / NUM_SAMPLES;


  // ---- GLUCOSE DEMO VALUE ----
  int display_glucose = smoothed - 250;  
  if (display_glucose < 0) display_glucose = 0;


  // ---- SERIAL DEBUG ----
  Serial.print("Raw: ");
  Serial.print(smoothed);
  Serial.print("   Demo Glucose: ");
  Serial.println(display_glucose);


  // ---- LCD DISPLAY ----
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Glucose: ");

  lcd.setCursor(10, 0);
  lcd.print(display_glucose);
  lcd.print("mg/dL");

  lcd.setCursor(0, 1);
  lcd.print("Reading...");


  delay(500);
}
