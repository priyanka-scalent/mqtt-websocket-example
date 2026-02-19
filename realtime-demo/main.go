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
	SiteID         string  `json:"siteId"`
	BatteryPercent int     `json:"batteryPercent"`
	BatteryPower   float64 `json:"batteryPower"`
	State          string  `json:"state"`
}

type SubscribeMessage struct {
	Action string `json:"action"`
	SiteID string `json:"siteId"`
	Screen string `json:"screen"`
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	clients   = make(map[string]map[*websocket.Conn]bool)
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

	sendToTopic(data)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	log.Println("Client connected")

	go func() {
		defer func() {
			removeConnection(conn)
			conn.Close()
		}()

		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				break
			}

			var subMsg SubscribeMessage
			err = json.Unmarshal(message, &subMsg)
			if err != nil {
				continue
			}

			if subMsg.Action == "subscribe" {
				topic := buildTopic(subMsg.SiteID, subMsg.Screen)

				clientsMu.Lock()

				// Since we allow only ONE subscription per connection,
				// first remove it from any previous topics
				removeConnection(conn)

				if clients[topic] == nil {
					clients[topic] = make(map[*websocket.Conn]bool)
				}

				clients[topic][conn] = true
				clientsMu.Unlock()

				log.Println("Subscribed to", topic)
			}
		}
	}()
}

func sendToTopic(data BatteryMessage) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	topic := buildTopic(data.SiteID, "battery")

	userClients := clients[topic]

	for client := range userClients {
		err := client.WriteJSON(data)
		if err != nil {
			client.Close()
			delete(userClients, client)
		}
	}
}

func buildTopic(siteID, screen string) string {
	return siteID + ":" + screen
}
func removeConnection(conn *websocket.Conn) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	for topic, conns := range clients {
		if conns[conn] {
			delete(conns, conn)

			if len(conns) == 0 {
				delete(clients, topic)
			}
		}
	}
}
