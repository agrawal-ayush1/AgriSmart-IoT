#include <WiFi.h>
#include <HTTPClient.h>
#include "secrets.h"

// =============================
// PIN DEFINITIONS
// =============================
#define MOISTURE_SENSOR_1 34
#define MOISTURE_SENSOR_2 35
#define PUMP_RELAY_PIN    26

// =============================
// SENSOR CALIBRATION
// Based on your actual readings
// =============================
const int DRY_VALUE = 4095;
const int WET_VALUE = 2400;

// =============================
// IRRIGATION THRESHOLDS
// =============================
const int PUMP_ON_THRESHOLD  = 35;
const int PUMP_OFF_THRESHOLD = 70;

// =============================
// TIMING
// =============================
unsigned long lastPublishTime = 0;
const unsigned long publishInterval = 15000;

unsigned long lastPumpChange = 0;
const unsigned long relayCooldown = 10000;

const unsigned long maxPumpRuntime = 30000;

// =============================
// STATE VARIABLES
// =============================
int sensor1Value = 0;
int sensor2Value = 0;

bool pumpActive = false;
bool autoMode = true;

float waterUsage = 0.0;

unsigned long pumpStartTime = 0;

// =============================
// SENSOR AVERAGING
// =============================
int readSensorAverage(int pin) {

  long total = 0;

  for (int i = 0; i < 30; i++) {
    total += analogRead(pin);
    delay(5);
  }

  return total / 30;
}

// =============================
// WIFI RECONNECT
// =============================
void reconnectWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println("WiFi disconnected!");
  Serial.println("Reconnecting...");

  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Reconnected!");
}

// =============================
// SETUP
// =============================
void setup() {

  Serial.begin(115200);

  pinMode(PUMP_RELAY_PIN, OUTPUT);

  // Pump OFF initially
  digitalWrite(PUMP_RELAY_PIN, LOW);

  // Connect WiFi
  Serial.print("Connecting to WiFi");

  WiFi.begin(SECRET_WIFI_SSID, SECRET_WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// =============================
// MAIN LOOP
// =============================
void loop() {

  unsigned long currentMillis = millis();

  // Keep WiFi connected
  reconnectWiFi();

  // =============================
  // READ SENSOR VALUES
  // =============================
  int raw1 = readSensorAverage(MOISTURE_SENSOR_1);
  int raw2 = readSensorAverage(MOISTURE_SENSOR_2);

  // Convert raw values to moisture %
  sensor1Value = map(raw1, DRY_VALUE, WET_VALUE, 0, 100);
  sensor1Value = constrain(sensor1Value, 0, 100);

  sensor2Value = map(raw2, DRY_VALUE, WET_VALUE, 0, 100);
  sensor2Value = constrain(sensor2Value, 0, 100);

  // Average moisture
  int avgMoisture = (sensor1Value + sensor2Value) / 2;

  // =============================
  // AUTOMATIC IRRIGATION
  // =============================
  if (autoMode && (currentMillis - lastPumpChange > relayCooldown)) {

    // Turn pump ON
    if (avgMoisture < PUMP_ON_THRESHOLD && !pumpActive) {

      pumpActive = true;

      digitalWrite(PUMP_RELAY_PIN, HIGH);

      pumpStartTime = currentMillis;

      lastPumpChange = currentMillis;

      Serial.println("Pump TURNED ON");
    }

    // Turn pump OFF
    else if (avgMoisture >= PUMP_OFF_THRESHOLD && pumpActive) {

      pumpActive = false;

      digitalWrite(PUMP_RELAY_PIN, LOW);

      lastPumpChange = currentMillis;

      Serial.println("Pump TURNED OFF");
    }
  }

  // =============================
  // SAFETY AUTO SHUTOFF
  // =============================
  if (pumpActive &&
    (currentMillis - pumpStartTime >= maxPumpRuntime)) {

    pumpActive = false;

    digitalWrite(PUMP_RELAY_PIN, LOW);

    Serial.println("Pump AUTO STOPPED (Safety Timeout)");
  }

  // =============================
  // SIMULATED WATER USAGE
  // =============================
  if (pumpActive) {
    waterUsage += 0.05;
  }

  // =============================
  // SERIAL DEBUG OUTPUT
  // =============================
  Serial.println("========== SENSOR DATA ==========");

  Serial.print("Raw Sensor 1: ");
  Serial.println(raw1);

  Serial.print("Raw Sensor 2: ");
  Serial.println(raw2);

  Serial.print("Moisture Sensor 1: ");
  Serial.print(sensor1Value);
  Serial.println("%");

  Serial.print("Moisture Sensor 2: ");
  Serial.print(sensor2Value);
  Serial.println("%");

  Serial.print("Average Moisture: ");
  Serial.print(avgMoisture);
  Serial.println("%");

  Serial.print("Pump Status: ");
  Serial.println(pumpActive ? "ON" : "OFF");

  Serial.print("Water Usage: ");
  Serial.print(waterUsage);
  Serial.println(" L");

  Serial.println("=================================\n");

  // =============================
  // THINGSPEAK UPDATE
  // =============================
  if (currentMillis - lastPublishTime >= publishInterval) {

    if (WiFi.status() == WL_CONNECTED) {

      HTTPClient http;

      String url = "https://api.thingspeak.com/update?api_key=";

      url += SECRET_WRITE_APIKEY;

      url += "&field1=" + String(sensor1Value);
      url += "&field2=" + String(sensor2Value);
      url += "&field3=" + String(pumpActive ? 1 : 0);
      url += "&field4=" + String(waterUsage);
      url += "&field5=" + String(avgMoisture);
      url += "&field6=" + String(autoMode ? 1 : 0);

      Serial.println("Uploading to ThingSpeak...");
      Serial.println(url);

      http.begin(url);

      int httpCode = http.GET();

      if (httpCode > 0) {

        Serial.print("ThingSpeak Response Code: ");
        Serial.println(httpCode);
      }
      else {

        Serial.print("Upload Failed: ");
        Serial.println(http.errorToString(httpCode).c_str());
      }

      http.end();
    }

    lastPublishTime = currentMillis;
  }

  delay(1000);
}