# mqtt-websocket-example

## Purpose of This Demo

This repository demonstrates a simplified real-time data pipeline architecture for an Energy Management System (EMS).

The goal of this demo is to show how we can:

- Subscribe to real-time data from MQTT
- Process the data in a Go backend
- Push updates instantly to the frontend using WebSocket
- Avoid storing real-time data in a database
- Avoid frontend polling via REST APIs

This architecture replaces:

Influx → MQTT → DB → API → UI (polling)

With a cleaner real-time approach:

MQTT → Go Backend → WebSocket → UI

This is more efficient, scalable, and suitable for real-time dashboards.

---

# Project Structure

```
├── realtime-demo/ # Go backend (MQTT subscriber + WebSocket server)
|
├── realtime-ui/ # React Router frontend (WebSocket client + UI)
|
└── README.md
```

---

# Architecture Overview

```
MQTT Publisher
↓
Mosquitto Broker (localhost:1883)
↓
Go Backend (realtime-demo)
↓
WebSocket (ws://localhost:8080/ws)
↓
React UI (realtime-ui)
```

- MQTT carries battery metrics.
- Go backend subscribes to MQTT.
- Backend enriches data (calculates charging/discharging state).
- Backend broadcasts data to connected WebSocket clients.
- React UI updates instantly without refresh.

---

# Prerequisites

Make sure the following are installed:

### 1. Go

```bash
go version
```

### 2. Node.js (v18+ recommended)

```bash
node -v
```

### 3. Mosquitto (MQTT Broker)

Install on Ubuntu:

```bash
sudo apt install mosquitto mosquitto-clients
```

Check if running:

```bash
sudo systemctl status mosquitto
```

If not running:

```bash
sudo systemctl start mosquitto
```

---

# How to Run the Backend (realtime-demo)

Navigate to backend folder:

```bash
cd realtime-demo
```

Install dependencies (first time only):

```bash
go mod tidy
```

Run server:

```bash
go run main.go
```

You should see:

```
Server running on :8080
```

The backend will:

- Connect to MQTT at `tcp://localhost:1883`
- Subscribe to topic: `battery/topic`
- Open WebSocket server at: `ws://localhost:8080/ws`

---

# How to Run the Frontend (realtime-ui)

Open a new terminal.

Navigate to frontend:

```bash
cd realtime-ui
```

Install dependencies (first time only):

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open browser: http://localhost:5173

You should see the Realtime Battery UI.

---

# How to Send Test MQTT Messages

Open another terminal.

## Send Charging Data

Battery Power > 0 means Charging.

```bash
mosquitto_pub -h localhost -t battery/topic -m '{"userId": "user-1","batteryPercent": 80, "batteryPower": 1200}'
```

UI should show:

- 80%
- Charging

---

## Send Discharging Data

Battery Power < 0 means Discharging.

```bash
mosquitto_pub -h localhost -t battery/topic -m '{"userId": "user-1","batteryPercent": 40, "batteryPower": -900}'
```

UI should show:

- 40%
- Discharging

---

## Verify MQTT Messages Being Published

To confirm messages on the topic:

```bash
mosquitto_sub -h localhost -t battery/topic
```

Then publish again:

```bash
mosquitto_pub -h localhost -t battery/topic -m '{"userId": "user-1","batteryPercent": 55, "batteryPower": -700}'
```

You should see the JSON appear in the subscriber terminal.

---

# What the Backend Does

When a message is received:

1. JSON is unmarshalled into a Go struct.
2. Backend calculates:
   - Charging (batteryPower > 0)
   - Discharging (batteryPower < 0)
   - Idle (batteryPower == 0)
3. Message is broadcast to all connected WebSocket clients.
4. React UI updates immediately.

No database writes.
No API polling.
Pure event-driven streaming.

---

# Why This Demo Is Important

This small demo proves:

- Real-time UI does NOT require database inserts.
- WebSockets are ideal for live dashboards.
- MQTT integrates cleanly with Go services.
- Backend should enrich data before sending to UI.
- This pattern scales better than polling APIs.

This architecture can now be applied to:

- EMS real-time site dashboards
- Battery monitoring
- IoT systems
- Smart grid simulations
- Energy flow visualization

---

# Next Possible Improvements

- Add multi-site support
- Add authentication to WebSocket
- Add reconnect handling improvements
- Add real-time charts

---

# Summary

This repository demonstrates a clean, modern real-time architecture:

MQTT → Go → WebSocket → React

It serves as a foundation for replacing database-driven real-time polling with a true streaming approach.
