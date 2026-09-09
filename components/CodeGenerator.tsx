'use client';

import { useState } from 'react';

type Props = {
  deviceId: string;
  apiKey: string;
  powerMode: 'ac' | 'battery';
  ingestUrl: string;
};

export default function CodeGenerator({ deviceId, apiKey, powerMode, ingestUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const code =
    powerMode === 'battery'
      ? generateBatteryCode(deviceId, apiKey, ingestUrl)
      : generateAcCode(deviceId, apiKey, ingestUrl);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">
          Mode: {powerMode === 'battery' ? 'battery (deep sleep)' : 'AC (loop biasa)'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
        >
          {copied ? 'Tersalin!' : 'Copy code'}
        </button>
      </div>
      <pre className="text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap max-h-96">{code}</pre>
      <p className="text-xs text-gray-500 mt-2">
        Library yang dibutuhkan (install lewat Arduino Library Manager): WiFiManager, ArduinoJson.
      </p>
    </div>
  );
}

function generateAcCode(deviceId: string, apiKey: string, ingestUrl: string) {
  return `#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

WiFiManager wm;

const char* DEVICE_ID  = "${deviceId}";
const char* API_KEY    = "${apiKey}";
const char* INGEST_URL = "${ingestUrl}";

// Interval AWAL 5 menit, tapi ini bukan final - tiap checkin, server
// balikin nilai interval yang lagi aktif di dashboard, jadi kalau lo
// ubah di web, device otomatis pakai jadwal baru TANPA upload ulang.
unsigned long intervalMs = 5UL * 60UL * 1000UL;

void sendData() {
  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["api_key"] = API_KEY;
  doc["message"] = "checkin normal";
  doc["wifi_rssi"] = WiFi.RSSI(); // kekuatan sinyal wifi dalam dBm
  // doc["data"]["suhu"] = 25.4; // isi data sensor lo di sini

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("[Ingest] Berhasil: " + response);

    StaticJsonDocument<512> respDoc;
    deserializeJson(respDoc, response);

    // Update interval sesuai yang diatur di dashboard
    if (respDoc.containsKey("checkin_interval_seconds")) {
      long newInterval = respDoc["checkin_interval_seconds"];
      intervalMs = (unsigned long)newInterval * 1000UL;
      Serial.println("[Config] Interval diupdate: " + String(newInterval) + " detik");
    }

    // Cek kalau ada command pending dari dashboard
    JsonArray commands = respDoc["commands"];
    for (JsonObject cmd : commands) {
      String command = cmd["command"];
      Serial.println("[Command] Diterima: " + command);
      if (command == "restart") {
        delay(500);
        ESP.restart();
      } else if (command == "reset_wifi") {
        wm.resetSettings();
        delay(500);
        ESP.restart();
      }
    }
  } else {
    Serial.println("[Ingest] Gagal, kode: " + String(httpCode));
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  wm.setConfigPortalTimeout(180);

  bool connected = wm.autoConnect("ESP32-Setup");
  if (!connected) {
    Serial.println("[WiFi] Gagal connect, restart...");
    delay(1000);
    ESP.restart();
  }
  Serial.println("[WiFi] Terhubung: " + WiFi.SSID());
}

unsigned long lastSend = 0;

void loop() {
  if (lastSend == 0 || millis() - lastSend >= intervalMs) {
    sendData();
    lastSend = millis();
  }
}
`;
}

function generateBatteryCode(deviceId: string, apiKey: string, ingestUrl: string) {
  return `#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

WiFiManager wm;
Preferences prefs;

const char* DEVICE_ID  = "${deviceId}";
const char* API_KEY    = "${apiKey}";
const char* INGEST_URL = "${ingestUrl}";

// Deep sleep bikin RAM kereset total tiap bangun, jadi interval disimpan
// di NVS (Preferences) biar gak balik ke default tiap kali device bangun.
uint32_t loadSavedInterval() {
  prefs.begin("cfg", true);
  uint32_t sec = prefs.getUInt("interval_sec", 300); // default 5 menit
  prefs.end();
  return sec;
}

void saveInterval(uint32_t sec) {
  prefs.begin("cfg", false);
  prefs.putUInt("interval_sec", sec);
  prefs.end();
}

float readBatteryVoltage() {
  // TODO: sesuaikan pin ADC & rumus pembagi tegangan sesuai board lo
  int raw = analogRead(34);
  return (raw / 4095.0) * 3.3 * 2;
}

void sendData() {
  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["api_key"] = API_KEY;
  doc["message"] = "checkin battery";
  doc["battery_level"] = readBatteryVoltage();
  doc["wifi_rssi"] = WiFi.RSSI(); // kekuatan sinyal wifi dalam dBm
  // doc["data"]["suhu"] = 25.4; // isi data sensor lo di sini

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  Serial.println("[Ingest] Kode respon: " + String(httpCode));

  if (httpCode == 200) {
    String response = http.getString();
    StaticJsonDocument<512> respDoc;
    deserializeJson(respDoc, response);

    // Simpan interval terbaru dari dashboard, dipakai buat sleep berikutnya
    if (respDoc.containsKey("checkin_interval_seconds")) {
      uint32_t newInterval = respDoc["checkin_interval_seconds"];
      saveInterval(newInterval);
      Serial.println("[Config] Interval diupdate: " + String(newInterval) + " detik");
    }

    JsonArray commands = respDoc["commands"];
    for (JsonObject cmd : commands) {
      String command = cmd["command"];
      if (command == "reset_wifi") {
        wm.resetSettings();
      }
      // command "restart" gak relevan di sini karena device
      // emang bakal restart total tiap bangun dari deep sleep
    }
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  wm.setConfigPortalTimeout(180);

  bool connected = wm.autoConnect("ESP32-Setup");
  if (connected) {
    Serial.println("[WiFi] Terhubung: " + WiFi.SSID());
    sendData(); // interval ke-update di sini kalau ada perubahan dari dashboard
  } else {
    Serial.println("[WiFi] Gagal connect, coba lagi siklus berikutnya");
  }

  uint32_t sleepSeconds = loadSavedInterval();
  Serial.println("[Sleep] Tidur " + String(sleepSeconds) + " detik...");
  esp_sleep_enable_timer_wakeup((uint64_t)sleepSeconds * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Gak akan pernah sampai sini karena device deep sleep di setup()
}
`;
}
