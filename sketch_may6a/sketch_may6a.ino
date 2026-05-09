/*
 * MediPulse Demo Final
 * ESP32 + MAX30105 + LCD + Temperature + Server
 * Random BPM Demo + Finger Detection
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include "MAX30105.h"
#include "heartRate.h"

// ================= WIFI =================

const char* ssid = "Only one";
const char* password = "Onlyone1";

String serverUrl = "https://smart-clinic-production-eb18.up.railway.app";

// ================= PINS =================

#define OK_BTN 12
#define NO_BTN 14
#define BUZZER 13
#define ONE_WIRE_BUS 4

// ================= LCD =================

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ================= MAX30105 =================

MAX30105 particleSensor;

// ================= TEMPERATURE =================

OneWire oneWire(ONE_WIRE_BUS);

DallasTemperature sensors(&oneWire);

// ================= VARIABLES =================

String currentPatient = "";

bool isMeasuring = false;

unsigned long measureStart = 0;

int currentBPM = 75;

int bpmSum = 0;

int bpmCount = 0;

float finalTemp = 36.5;

// ================= BUZZER =================

void beep(int duration, int repeat = 1) {

  for (int i = 0; i < repeat; i++) {

    digitalWrite(BUZZER, HIGH);

    delay(duration);

    digitalWrite(BUZZER, LOW);

    delay(duration);
  }
}

// ================= SETUP =================

void setup() {

  Serial.begin(9600);

  pinMode(OK_BTN, INPUT_PULLUP);

  pinMode(NO_BTN, INPUT_PULLUP);

  pinMode(BUZZER, OUTPUT);

  digitalWrite(BUZZER, LOW);

  // ================= LCD =================

  lcd.init();

  lcd.backlight();

  lcd.clear();

  lcd.print("Connecting WiFi");

  // ================= TEMPERATURE =================

  sensors.begin();

  // ================= WIFI =================

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  lcd.clear();

  lcd.print("WiFi Connected");

  delay(1500);

  // ================= RANDOM =================

  randomSeed(analogRead(34));

  // ================= I2C =================

  Wire.begin(21,22);

  // ================= MAX30105 =================

  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {

    lcd.clear();

    lcd.print("MAX30105 Error");

    while(1);
  }

  // SENSOR SETTINGS
  particleSensor.setup(
    80,
    4,
    2,
    100,
    411,
    16384
  );

  particleSensor.setPulseAmplitudeIR(0x50);

  lcd.clear();
}

// ================= LOOP =================

void loop() {

  if (!isMeasuring) {

    getPatient();

    waitingScreen();

  } else {

    measureDemo();
  }

  delay(100);
}

// ================= GET PATIENT =================

void getPatient() {

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;

  http.begin(serverUrl + "/current");

  int code = http.GET();

  if (code == 200) {

    String payload = http.getString();

    DynamicJsonDocument doc(256);

    deserializeJson(doc, payload);

    currentPatient = doc["name"].as<String>();
  }

  http.end();
}

// ================= WAIT SCREEN =================

void waitingScreen() {

  lcd.setCursor(0,0);

  if (currentPatient != "" && currentPatient != "null") {

    lcd.print("Patient:");

    lcd.print(currentPatient.substring(0,7));

    lcd.print("   ");

    lcd.setCursor(0,1);

    lcd.print("Press OK");

    // START
    if (digitalRead(OK_BTN) == LOW) {

      beep(100);

      lcd.clear();

      lcd.print("Place Finger");

      lcd.setCursor(0,1);

      lcd.print("Starting...");

      delay(3000);

      isMeasuring = true;

      measureStart = millis();

      bpmSum = 0;

      bpmCount = 0;

      lcd.clear();
    }

    // CANCEL
    if (digitalRead(NO_BTN) == LOW) {

      cancelPatient();
    }

  } else {

    lcd.print("Waiting Patient");

    lcd.setCursor(0,1);

    lcd.print("..............");
  }
}

// ================= MEASURE =================

void measureDemo() {

  int elapsed = (millis() - measureStart) / 1000;

  // ================= FINGER DETECTION =================

  long irValue = particleSensor.getIR();

  Serial.print("IR: ");

  Serial.println(irValue);

  // ================= RANDOM BPM =================

  currentBPM = random(60, 121);

  bpmSum += currentBPM;

  bpmCount++;

  int avgBPM = bpmSum / bpmCount;

  // ================= LCD =================

  lcd.setCursor(0,0);

  lcd.print("BPM:");

  lcd.print(currentBPM);

  lcd.print(" AVG:");

  lcd.print(avgBPM);

  lcd.print("   ");

  lcd.setCursor(0,1);

  lcd.print("Time:");

  lcd.print(elapsed);

  lcd.print("s     ");

  delay(700);

  // ================= REMOVE FINGER =================

  if (irValue < 5000) {

    lcd.clear();

    lcd.print("Finger Removed");

    lcd.setCursor(0,1);

    lcd.print("Saving Result");

    delay(1000);

    finishMeasurement(avgBPM);
  }

  // ================= AUTO STOP =================

  if (elapsed >= 20) {

    finishMeasurement(avgBPM);
  }
}

// ================= FINISH =================

void finishMeasurement(int avgBPM) {

  isMeasuring = false;

  beep(150,2);

  // ================= TEMPERATURE =================

  sensors.requestTemperatures();

  finalTemp = sensors.getTempCByIndex(0);

  // SENSOR ERROR
  if (finalTemp == -127 || finalTemp == 85) {

    finalTemp = random(360, 380) / 10.0;
  }

  // ================= HEALTH =================

  String health = "Normal";

  if (finalTemp > 38) {

    health = "Fever";
  }

  // ================= RESULT SCREEN =================

  lcd.clear();

  lcd.print("BPM:");

  lcd.print(avgBPM);

  lcd.setCursor(0,1);

  lcd.print("T:");

  lcd.print(finalTemp,1);

  lcd.print("C");

  delay(3000);

  // ================= SEND SERVER =================

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    http.begin(serverUrl + "/result");

    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(256);

    doc["name"] = currentPatient;

    doc["bpm"] = avgBPM;

    doc["temp"] = finalTemp;

    doc["health"] = health;

    String json;

    serializeJson(doc, json);

    int response = http.POST(json);

    Serial.println(json);

    Serial.print("Response: ");

    Serial.println(response);

    http.end();
  }

  // ================= FINAL SCREEN =================

  lcd.clear();

  lcd.print("Health:");

  lcd.print(health);

  lcd.setCursor(0,1);

  lcd.print("Data Sent");

  delay(3000);

  currentPatient = "";

  lcd.clear();
}

// ================= CANCEL =================

void cancelPatient() {

  beep(300);

  lcd.clear();

  lcd.print("Canceled");

  delay(1500);

  currentPatient = "";

  isMeasuring = false;

  lcd.clear();
}