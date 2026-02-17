import { useEffect, useState } from "react";
import { useParams } from "react-router";

type BatteryData = {
  batteryPercent: number;
  batteryPower: number;
  state: string;
};

export default function Home() {
  const [battery, setBattery] = useState<BatteryData | null>(null);
  const [connected, setConnected] = useState(false);
  const { userId } = useParams();


useEffect(() => {
  if (!userId) return;

  let ws: WebSocket;

  function connect() {
    ws = new WebSocket(
      `ws://localhost:8080/ws?userId=${userId}`
    );

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket Connected for", userId);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBattery(data);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("Reconnecting...");
      setTimeout(connect, 2000);
    };
  }

  connect();

  return () => ws?.close();
}, [userId]);


  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[400px] text-center">
        <h1 className="text-2xl font-bold mb-6">Realtime Battery</h1>

        <div
          className={`text-7xl font-bold transition-all ${
            battery?.batteryPercent && battery.batteryPercent > 20
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {battery ? `${battery.batteryPercent}%` : "--"}
        </div>

        <div className="mt-4 text-xl">
          {battery ? (
            <span
              className={`font-semibold ${
                battery.state === "Charging"
                  ? "text-green-600"
                  : battery.state === "Discharging"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {battery.state}
            </span>
          ) : (
            "Waiting for data..."
          )}
        </div>

        <div className="mt-6 text-sm">
          WS Status:{" "}
          <span
            className={connected ? "text-green-600" : "text-red-600"}
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}

export async function loader({ params }: { params: { userId?: string } }) {
  const id = params.userId ?? "";
  if (!["user-1", "user-2", "user-3"].includes(id)) {
    throw new Response("Not Found", { status: 404 });
  }
}
