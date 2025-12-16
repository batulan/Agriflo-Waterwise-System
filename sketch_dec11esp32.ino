#include <WiFi.h>
#include <WebServer.h>
#include "DHT.h"

// -------- WIFI --------
const char* ssid = "SFT-FE38";
const char* password = "12345678";

// -------- WEB SERVER --------
WebServer server(80);

// -------- SENSORS ----------
#define DHTPIN 19
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const int waterPin = 34;
#define RELAY_PIN 21

// -------- WATER SENSOR CALIBRATION (ADJUSTED FOR 0-2 RANGE) --------
int dryValue = 0;
int wetValue = 25-100;
int detectThreshold = 25-100;

// -------- PUMP CONTROL --------
bool pumpArmed = true;
bool pumpStatus = false;

// -------- REAL-TIME DATA STORAGE --------
float temperature = 0.0;
float humidity = 0.0;
float waterLevel = 0.0;
int waterRaw = 0;
bool waterDetected = false;

// -------- TIMING --------
unsigned long lastRead = 0;
const unsigned long readInterval = 2000; // 2 seconds (DHT11 safe)

// -------- SENSOR UPDATE (SIMULTANEOUS) --------
void updateSensors() {
  waterRaw = analogRead(waterPin);

  static float smooth = waterRaw;
  smooth = smooth * 0.7 + waterRaw * 0.3;

  waterDetected = (smooth >= detectThreshold);

  if (!waterDetected) {
    waterLevel = map(smooth, 0, detectThreshold, 0, 25);
    waterLevel = constrain(waterLevel, 0, 25);
  } else {
    waterLevel = map(smooth, detectThreshold, wetValue, 26, 100);
    waterLevel = constrain(waterLevel, 26, 100);
  }

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  if (isnan(temperature)) temperature = 0.0;
  if (isnan(humidity)) humidity = 0.0;

  // -------- PUMP LOGIC --------
  if (pumpArmed && waterLevel <= 30) {
    pumpStatus = true;
    digitalWrite(RELAY_PIN, HIGH);
  } else {
    pumpStatus = false;
    digitalWrite(RELAY_PIN, LOW);
  }

  // -------- DEBUG SERIAL PRINTS --------
  Serial.print("Raw: ");
  Serial.print(waterRaw);
  Serial.print(" Smooth: ");
  Serial.print(smooth);
  Serial.print(" Detected: ");
  Serial.print(waterDetected ? "Yes" : "No");
  Serial.print(" Level: ");
  Serial.print(waterLevel);
  Serial.print(" Temp: ");
  Serial.print(temperature);
  Serial.print(" Hum: ");
  Serial.println(humidity);
}

// -------- API RESPONSE --------
void handleSensorData() {
  String json = "{";
  json += "\"water_raw\":" + String(waterRaw) + ",";
  json += "\"water_detected\":" + String(waterDetected ? "true" : "false") + ",";
  json += "\"water_level\":" + String(waterLevel, 1) + ",";
  json += "\"temperature\":" + String(temperature, 1) + ",";
  json += "\"humidity\":" + String(humidity, 1) + ",";
  json += "\"pump_armed\":" + String(pumpArmed ? "true" : "false") + ",";
  json += "\"pump_status\":\"" + String(pumpStatus ? "ON" : "OFF") + "\"";
  json += "}";

  server.send(200, "application/json", json);
}

void handleArmPump() {
  pumpArmed = true;
  server.send(200, "text/plain", "Pump armed");
}

void handleDisarmPump() {
  pumpArmed = false;
  digitalWrite(RELAY_PIN, LOW);
  server.send(200, "text/plain", "Pump disarmed");
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  // -------- ADC SETUP FOR FULL RANGE --------
  analogSetAttenuation(ADC_11db); // 0-3.3V range

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.disconnect(true);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n==============================");
  Serial.println("ESP32 CONNECTED");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("==============================");

  server.on("/sensor", handleSensorData);
  server.on("/pump/arm", HTTP_POST, handleArmPump);
  server.on("/pump/disarm", HTTP_POST, handleDisarmPump);
  server.begin();
}

void loop() {
  server.handleClient();

  // -------- REAL-TIME SENSOR UPDATE --------
  if (millis() - lastRead >= readInterval) {
    lastRead = millis();
    updateSensors();
  }
}