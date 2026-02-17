package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gorilla/websocket"
)

type BatteryMessage struct {
	BatteryPercent int     `json:"batteryPercent"`
	BatteryPower   float64 `json:"batteryPower"`
	State          string  `json:"state"`
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
)

func main() {

	// Connect to MQTT
	opts := mqtt.NewClientOptions().AddBroker("tcp://localhost:1883")
	opts.SetClientID("ems-api")

	client := mqtt.NewClient(opts)

	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}

	// Subscribe
	client.Subscribe("battery/topic", 0, mqttHandler)

	// WebSocket endpoint
	http.HandleFunc("/ws", handleWebSocket)

	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", nil)
}

func mqttHandler(client mqtt.Client, msg mqtt.Message) {

	var data BatteryMessage
	err := json.Unmarshal(msg.Payload(), &data)
	if err != nil {
		log.Println("Invalid MQTT message")
		return
	}

	// Determine state
	if data.BatteryPower > 0 {
		data.State = "Charging"
	} else if data.BatteryPower < 0 {
		data.State = "Discharging"
	} else {
		data.State = "Idle"
	}

	broadcast(data)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()

	log.Println("Client connected")
}

func broadcast(data BatteryMessage) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		err := client.WriteJSON(data)
		if err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}
