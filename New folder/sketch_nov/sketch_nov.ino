#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ================= الأجهزة (Hardware) =================
LiquidCrystal_I2C lcd(0x27, 16, 2);
MAX30105 particleSensor;

#define BTN_OK 12
#define ONE_WIRE_BUS 4  

// ================= الواي فاي (WiFi) =================
const char* ssid = "Zezo1";
const char* password = "56069025";
String serverIP = "http://10.100.148.240:3000";

// ================= الحرارة (Temp) =================
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ================= المتغيرات (Variables) =================
String currentName = "None";
float beatAvg = 0;
float temperature = 0;

bool startMeasure = false;
bool fingerDetected = false;

unsigned long startTime = 0;
int seconds = 0;
unsigned long lastTempRead = 0;

// ❤️ نظام حساب النبض
#define RATE_SIZE 8 
float rates[RATE_SIZE];
byte rateSpot = 0;
float smoothedBPM = 0;
unsigned long lastBeatMicros = 0;

// ================= الوظائف (Functions) =================

String getHealth() {
  if (beatAvg == 0) return "--";
  if (temperature > 38.0) return "Fever"; 
  if (beatAvg < 55) return "Low";
  if (beatAvg > 100) return "High";
  return "Norm";
}

float readTemp() {
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  return (temp <= 0 || temp == DEVICE_DISCONNECTED_C) ? 0 : temp;
}

void processHeartBeat(long ir) {
  if (!checkForBeat(ir)) return;

  unsigned long nowMicros = micros();
  if (lastBeatMicros == 0) {
    lastBeatMicros = nowMicros;
    return;
  }

  unsigned long deltaMicros = nowMicros - lastBeatMicros;
  lastBeatMicros = nowMicros;

  if (deltaMicros < 375000 || deltaMicros > 1500000) return;

  float bpm = 60000000.0 / deltaMicros;
  smoothedBPM = (smoothedBPM == 0) ? bpm : (0.2 * bpm + 0.8 * smoothedBPM);

  rates[rateSpot++] = smoothedBPM;
  rateSpot %= RATE_SIZE;

  float sum = 0;
  for (byte i = 0; i < RATE_SIZE; i++) sum += rates[i];
  beatAvg = sum / RATE_SIZE;
}

// ================= الإعداد (Setup) =================
void setup() {
  Serial.begin(9600); // السرعة المطلوبة
  pinMode(BTN_OK, INPUT_PULLUP);

  lcd.init();
  lcd.backlight();

  lcd.print("Connecting WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  lcd.clear();
  lcd.print("WiFi Connected");
  delay(1000);

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    lcd.print("Sensor Error!");
    while (1);
  }

  // إعدادات الحساس لمنع التشبع
  particleSensor.setup(30, 4, 2, 100, 411, 4096);
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeIR(0x14);

  sensors.begin();
  lcd.clear();
}

// ================= الحلقة الأساسية (Loop) =================
void loop() {
  static unsigned long lastFetch = 0;

  if (!startMeasure && millis() - lastFetch > 1000) {
    fetchCurrent();
    lastFetch = millis();
  }

  if (!startMeasure) {
    lcd.setCursor(0, 0);
    if (currentName != "None") {
      lcd.print("Patient: " + currentName.substring(0, 7));
      lcd.setCursor(0, 1);
      lcd.print("Press OK Start ");
    } else {
      lcd.print("Waiting Scan... ");
      lcd.setCursor(0, 1);
      lcd.print("                ");
    }
    
    if (digitalRead(BTN_OK) == LOW && currentName != "None") {
      startMeasure = true;
      beatAvg = 0;
      smoothedBPM = 0;
      fingerDetected = false;
      lcd.clear();
    }
    return;
  }

  // --- وضع القياس النشط ---
  long ir = particleSensor.getIR();
  bool fingerPresent = (ir > 15000); // عتبة وجود الإصبع

  if (!fingerPresent) {
    // الشخص رفع إصبعه
    if (fingerDetected) {
        // ننهي القياس ونرسل البيانات فوراً إذا مر وقت كافٍ للقياس
        if (seconds >= 3) {
            finishMeasurement();
        } else {
            // إذا رفعه فوراً نلغي القياس
            startMeasure = false;
            lcd.clear();
            lcd.print("Canceled!");
            delay(1000);
        }
        return;
    }
    
    lcd.setCursor(0, 0);
    lcd.print("Place Finger... ");
    lcd.setCursor(0, 1);
    lcd.print("Waiting...      ");
  } else {
    // الإصبع موجود على الحساس
    if (!fingerDetected) {
      fingerDetected = true;
      startTime = millis();
      lastBeatMicros = 0;
    }
    
    seconds = (millis() - startTime) / 1000;
    processHeartBeat(ir);

    if (millis() - lastTempRead > 1000) {
      temperature = readTemp();
      lastTempRead = millis();
    }

    lcd.setCursor(0, 0);
    lcd.print("BPM:" + String((int)beatAvg) + " T:" + String(temperature, 1) + "  ");
    lcd.setCursor(0, 1);
    lcd.print("Time: " + String(seconds) + "s      ");
    
    // حد أقصى للقياس 20 ثانية حتى لو لم يرفع إصبعه
    if (seconds >= 20) finishMeasurement();
  }
}

// ================= الإنهاء والإرسال =================
void finishMeasurement() {
  lcd.clear();
  lcd.print("Sending Data...");
  
  sendResult("Done");

  lcd.setCursor(0, 0);
  lcd.print("Health: " + getHealth());
  lcd.setCursor(0, 1);
  lcd.print("BPM:" + String((int)beatAvg) + " T:" + String(temperature, 1));

  delay(5000); // عرض النتيجة النهائية لمدة 5 ثواني

  startMeasure = false;
  fingerDetected = false;
  currentName = "None";
  lcd.clear();
}

// ================= السيرفر (Server) =================
void fetchCurrent() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.setTimeout(500); 
  http.begin(serverIP + "/current");
  if (http.GET() == 200) {
    StaticJsonDocument<128> doc;
    deserializeJson(doc, http.getString());
    currentName = doc["name"] | "None";
  }
  http.end();
}

void sendResult(String status) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(serverIP + "/result");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["name"]   = currentName;
  doc["bpm"]    = (int)beatAvg;
  doc["temp"]   = temperature;
  doc["status"] = status;
  doc["health"] = getHealth();
  doc["time"]   = seconds;

  String json;
  serializeJson(doc, json);
  http.POST(json);
  http.end();
}