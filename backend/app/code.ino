#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ─── Configuration réseau ────────────────────────────────────────
const char* WIFI_SSID   = "MTN HomeBox_964553";
const char* WIFI_PASS   = "25087CBF";
const char* MQTT_BROKER = "192.168.1.146";
const int   MQTT_PORT   = 1883;

// ─── Topics MQTT ─────────────────────────────────────────────────
const char* TOPIC_TEMP     = "agri/temperature";
const char* TOPIC_HUMI_AIR = "agri/humidite_air";
const char* TOPIC_HUMI_SOL = "agri/humidite_sol";
const char* TOPIC_LUMINO   = "agri/luminosite";
const char* TOPIC_GAZ      = "agri/gaz";
const char* TOPIC_LAMPE    = "agri/lampe";
const char* TOPIC_VENTILO  = "agri/ventilateur";
const char* TOPIC_POMPE    = "agri/pompe";
const char* TOPIC_NIVEAU   = "agri/niveau_eau";

const char* TOPIC_CMD_POMPE   = "agri/commande/pompe";
const char* TOPIC_CMD_VENTILO = "agri/commande/ventilateur";
const char* TOPIC_CMD_LAMPE   = "agri/commande/lampe";

// ─── Pins ────────────────────────────────────────────────────────
#define PIN_DHT22       26
#define DHT_TYPE        DHT22
#define PIN_YL69        36
#define PIN_LDR         39
#define PIN_MQ2         34
#define RELAIS_LAMPE    27
#define RELAIS_POMPE    14
#define PIN_FLOTTEUR    4

// ─── Driver L298N (ventilateur) ──────────────────────────────────
#define PIN_ENA         25    // PWM vitesse (Connecté au GPIO 25)
#define PIN_IN1         12    // sens
#define PIN_IN2         13    // sens

// Configuration PWM ESP32 (API ledc)
#define PWM_FREQ        1000  
#define PWM_RESOLUTION  8     // 0-255

// ─── Seuils & Vitesses ───────────────────────────────────────────
const int   SEUIL_GAZ_OK       = 600;   // En dessous, on coupe tout
const int   SEUIL_GAZ_DANGER   = 800;   // Début de l'accélération
const int   SEUIL_GAZ_CRITIQUE = 1600;  // Vitesse maximale (255)

const int   VITESSE_MIN_VENT   = 100;   // Vitesse de départ pour décollage moteur
const float SEUIL_SOL_MIN      = 30.0;
const float SEUIL_SOL_MAX      = 70.0;
const float SEUIL_LUMINO_BAS   = 40.0;

const int YL69_SEC    = 3500;
const int YL69_TREMPE = 800;

// ─── Objets ──────────────────────────────────────────────────────
WiFiClient   espClient;
PubSubClient mqttClient(espClient);
DHT          dht(PIN_DHT22, DHT_TYPE);

// ─── Variables d'état ────────────────────────────────────────────
float temperature  = 0.0;
float humiditeAir  = 0.0;
float humiditeSol  = 0.0;
float luminosite   = 0.0;
int   gaz          = 0;
bool  niveauEauBas = false;

bool  lampeAllumee  = false;
bool  pompeAllumee  = false;
int   vitesseVentilo = 0; 

bool  modeManuelVentilo = false;
bool  modeManuelPompe   = false;

unsigned long dernierEnvoi        = 0;
unsigned long dernierLectureLumino = 0;
#define INTERVALLE_ENVOI   5000
#define INTERVALLE_LUMINO  1000

// ─── Fonctions de pilotage ───────────────────────────────────────

void setVentilo(int vitesse) {
  vitesse = constrain(vitesse, 0, 255);
  vitesseVentilo = vitesse;

  if (vitesse <= 0) {
    digitalWrite(PIN_IN1, LOW);
    digitalWrite(PIN_IN2, LOW);
    ledcWrite(PIN_ENA, 0);
    mqttClient.publish(TOPIC_VENTILO, "OFF");
  } else {
    digitalWrite(PIN_IN1, HIGH); // Sens de rotation du ventilateur
    digitalWrite(PIN_IN2, LOW);
    ledcWrite(PIN_ENA, vitesse);
    
    char buf[10];
    snprintf(buf, sizeof(buf), "%d", vitesse);
    mqttClient.publish(TOPIC_VENTILO, buf);
  }
}

void allumerLampe() {
  if (lampeAllumee) return;
  digitalWrite(RELAIS_LAMPE, LOW);
  lampeAllumee = true;
  mqttClient.publish(TOPIC_LAMPE, "ON");
}

void eteindreLampe() {
  if (!lampeAllumee) return;
  digitalWrite(RELAIS_LAMPE, HIGH);
  lampeAllumee = false;
  mqttClient.publish(TOPIC_LAMPE, "OFF");
}

void allumerPompe() {
  if (pompeAllumee || niveauEauBas) return;
  digitalWrite(RELAIS_POMPE, LOW);
  pompeAllumee = true;
  mqttClient.publish(TOPIC_POMPE, "ON");
}

void eteindrePompe() {
  if (!pompeAllumee) return;
  digitalWrite(RELAIS_POMPE, HIGH);
  pompeAllumee = false;
  mqttClient.publish(TOPIC_POMPE, "OFF");
}

// ─── MQTT Callback ───────────────────────────────────────────────
void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  msg.trim();
  String t = String(topic);

  if (t == TOPIC_CMD_POMPE) {
    if (msg == "ON")  { modeManuelPompe = true;  allumerPompe(); }
    else if (msg == "OFF") { modeManuelPompe = false; eteindrePompe(); }
  }
  else if (t == TOPIC_CMD_LAMPE) {
    if (msg == "ON")  { allumerLampe(); }
    else if (msg == "OFF") { eteindreLampe(); }
  }
  else if (t == TOPIC_CMD_VENTILO) {
    if (msg == "ON")  { modeManuelVentilo = true;  setVentilo(255); }
    else if (msg == "OFF") { modeManuelVentilo = false; setVentilo(0); }
    else {
      int v = msg.toInt();
      if (v >= 0 && v <= 255) { modeManuelVentilo = true; setVentilo(v); }
    }
  }
}

// ─── Réseau ──────────────────────────────────────────────────────
void connecterWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi OK");
}

void connecterMQTT() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect("ESP32_Agri_Client")) {
      mqttClient.subscribe(TOPIC_CMD_POMPE);
      mqttClient.subscribe(TOPIC_CMD_VENTILO);
      mqttClient.subscribe(TOPIC_CMD_LAMPE);
    } else { delay(2000); }
  }
}

// ─── Traitements principaux ──────────────────────────────────────

void lireCapteurs() {
  temperature = dht.readTemperature();
  humiditeAir = dht.readHumidity();
  
  int brutSol = analogRead(PIN_YL69);
  humiditeSol = constrain(map(brutSol, YL69_SEC, YL69_TREMPE, 0, 100), 0, 100);

  int brutLDR = analogRead(PIN_LDR);
  luminosite = constrain(map(brutLDR, 0, 4095, 100, 0), 0, 100);

  int brutMQ2 = analogRead(PIN_MQ2);
  gaz = map(brutMQ2, 0, 4095, 0, 2000); // Approximation ppm

  niveauEauBas = (digitalRead(PIN_FLOTTEUR) == LOW);
}

void gererActionneurs() {
  // Lampe
  if (luminosite < SEUIL_LUMINO_BAS) allumerLampe();
  else eteindreLampe();

  // Pompe
  if (!modeManuelPompe) {
    if (humiditeSol < SEUIL_SOL_MIN) allumerPompe();
    else if (humiditeSol >= SEUIL_SOL_MAX) eteindrePompe();
  }
  if (niveauEauBas && pompeAllumee) eteindrePompe();

  // VENTILATEUR : LOGIQUE PROPORTIONNELLE AU GAZ/CO2
  if (!modeManuelVentilo) {
    if (gaz > SEUIL_GAZ_DANGER) {
      // Calcule la vitesse entre VITESSE_MIN_VENT (100) et 255
      int v = map(gaz, SEUIL_GAZ_DANGER, SEUIL_GAZ_CRITIQUE, VITESSE_MIN_VENT, 255);
      setVentilo(v);
    } 
    else if (gaz < SEUIL_GAZ_OK) {
      setVentilo(0);
    }
  }
}

void publierMQTT() {
  if (!mqttClient.connected()) return;
  char buf[10];
  
  snprintf(buf, 10, "%.1f", temperature); mqttClient.publish(TOPIC_TEMP, buf);
  snprintf(buf, 10, "%.0f", humiditeSol); mqttClient.publish(TOPIC_HUMI_SOL, buf);
  snprintf(buf, 10, "%d", gaz);           mqttClient.publish(TOPIC_GAZ, buf);
  // ... autres publications identiques
}

void setup() {
  Serial.begin(115200);
  
  pinMode(RELAIS_LAMPE, OUTPUT); digitalWrite(RELAIS_LAMPE, HIGH);
  pinMode(RELAIS_POMPE, OUTPUT); digitalWrite(RELAIS_POMPE, HIGH);
  pinMode(PIN_FLOTTEUR, INPUT_PULLUP);
  
  pinMode(PIN_IN1, OUTPUT);
  pinMode(PIN_IN2, OUTPUT);
  
  // Initialisation PWM sur ESP32
  ledcAttach(PIN_ENA, PWM_FREQ, PWM_RESOLUTION); 
  setVentilo(0);

  dht.begin();
  connecterWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(callbackMQTT);
}

void loop() {
  if (!mqttClient.connected()) connecterMQTT();
  mqttClient.loop();

  if (millis() - dernierEnvoi >= INTERVALLE_ENVOI) {
    dernierEnvoi = millis();
    lireCapteurs();
    gererActionneurs();
    publierMQTT();
  }
}