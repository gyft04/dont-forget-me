/*
  Don't Forget Me - ESP32

  Hardware:
  - ESP32
  - TM1637-Display: CLK an GPIO32, DIO an GPIO33
  - Türschalter an GPIO27
  - REST-Backend auf Port 12345

  Ablauf:
  - Der ESP32 fragt regelmäßig den aktuellen Session-Status beim Backend ab.
  - Das Display zeigt die Anzahl der noch fehlenden Gegenstände (0004 bis 0001).
  - Sind alle Gegenstände bestätigt, erscheint DONE.
  - Wird die Tür vorher geöffnet, meldet der ESP32 das Ereignis an das Backend.
    Der Backend-Status MISS wird auf dem vierstelligen Display als FAIL dargestellt.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <TM1637Display.h>

#define CLK 32
#define DIO 33
#define DOOR_PIN 27

TM1637Display display(CLK, DIO);

// Vor dem Hochladen auf den ESP32 müssen WLAN und IP-Adresse des Backend-PCs angepasst werden.
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
String apiBase = "http://YOUR_BACKEND_IP:12345/api";

bool previousDoorState = LOW;
unsigned long lastPoll = 0;
const unsigned long POLL_MS = 700;

// Segmentmuster für die Texte DONE und FAIL auf dem TM1637-Display.
const uint8_t SEG_DONE[] = {
  SEG_B | SEG_C | SEG_D | SEG_E | SEG_G,
  SEG_A | SEG_B | SEG_C | SEG_D | SEG_E | SEG_F,
  SEG_C | SEG_E | SEG_G,
  SEG_A | SEG_D | SEG_E | SEG_F | SEG_G
};

const uint8_t SEG_FAIL[] = {
  SEG_A | SEG_E | SEG_F | SEG_G,
  SEG_A | SEG_B | SEG_C | SEG_E | SEG_F | SEG_G,
  SEG_B | SEG_C,
  SEG_D | SEG_E | SEG_F
};

void showNumber(int number) {
  display.showNumberDec(number, true, 4, 0);
}

void showDone() {
  display.setSegments(SEG_DONE);
}

void showFail() {
  display.setSegments(SEG_FAIL);
}

// Führt eine einfache GET-Anfrage an das Backend aus und gibt den Antworttext zurück.
String httpGet(String url) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, url);
  int code = http.GET();
  String body = code > 0 ? http.getString() : "";
  http.end();
  return body;
}

// Informiert das Backend über das Öffnen der Tür.
void notifyDoorOpened() {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, apiBase + "/sessions/current/door-opened");
  http.addHeader("Content-Type", "application/json");
  http.POST("{}");
  http.end();
}

// Für den Prototyp reicht es, den Wert des Feldes "display" aus der JSON-Antwort zu lesen.
String extractDisplay(String payload) {
  int key = payload.indexOf("\"display\"");
  if (key < 0) return "";

  int colon = payload.indexOf(':', key);
  int firstQuote = payload.indexOf('"', colon + 1);
  int secondQuote = payload.indexOf('"', firstQuote + 1);
  if (firstQuote < 0 || secondQuote < 0) return "";

  return payload.substring(firstQuote + 1, secondQuote);
}

void refreshDisplay() {
  String payload = httpGet(apiBase + "/sessions/current");
  String value = extractDisplay(payload);

  if (value == "DONE") {
    showDone();
  } else if (value == "MISS") {
    showFail();
  } else if (value.length() == 4) {
    showNumber(value.toInt());
  }
}

void setupWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print('.');
  }

  Serial.println();
  Serial.print("Connected. ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  pinMode(DOOR_PIN, INPUT_PULLUP);
  display.setBrightness(7);
  showNumber(4);
  setupWifi();
  previousDoorState = digitalRead(DOOR_PIN);
}

void loop() {
  bool doorState = digitalRead(DOOR_PIN);

  // Der Türschalter wird nur bei einer Zustandsänderung ausgewertet,
  // damit ein Öffnen nicht mehrfach an das Backend gesendet wird.
  if (doorState != previousDoorState) {
    Serial.printf("Door switch GPIO27 changed: %s\n", doorState ? "HIGH" : "LOW");

    if (doorState == HIGH) {
      notifyDoorOpened();
    }

    previousDoorState = doorState;
    delay(80);
  }

  // Der Session-Status wird in festen Abständen aktualisiert.
  if (millis() - lastPoll >= POLL_MS) {
    lastPoll = millis();

    if (WiFi.status() == WL_CONNECTED) {
      refreshDisplay();
    }
  }
}
