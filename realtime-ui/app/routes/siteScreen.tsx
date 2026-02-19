import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

type BatteryData = {
  batteryPercent?: number;
  batteryPower?: number;
  state?: string;
};

type SolarData = {
  solarPower?: number;
};

export default function SiteScreen() {
  const { siteId, screen } = useParams();
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!siteId || !screen) return;

    let ws: WebSocket;

    function connect() {
      ws = new WebSocket("ws://localhost:8080/ws");

      ws.onopen = () => {
        setConnected(true);

        ws.send(
          JSON.stringify({
            action: "subscribe",
            siteId,
            screen,
          })
        );

        console.log(`Subscribed to ${siteId}:${screen}`);
      };

      ws.onmessage = (event) => {
        const incoming = JSON.parse(event.data);
        setData(incoming);
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 2000);
      };
    }

    connect();

    return () => ws?.close();
  }, [siteId, screen]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[420px] text-center">
        <h1 className="text-2xl font-bold mb-4">
          {siteId} - {screen}
        </h1>

        {screen === "battery" && (
          <>
            <div className="text-6xl font-bold mb-4">
              {data?.batteryPercent
                ? `${data.batteryPercent}%`
                : "--"}
            </div>

            <div className="text-lg font-semibold">
              {data?.state ?? "Waiting for data..."}
            </div>
          </>
        )}

        {screen === "solar" && (
          <>
            <div className="text-6xl font-bold mb-4 text-yellow-500">
              {data?.solarPower
                ? `${data.solarPower} W`
                : "--"}
            </div>

            <div className="text-lg">
              Solar Production
            </div>
          </>
        )}

        <div className="mt-6 text-sm">
          WS Status:{" "}
          <span
            className={
              connected ? "text-green-600" : "text-red-600"
            }
          >
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to={`/site/${siteId}/battery`}
            className="text-blue-600 underline"
          >
            Battery
          </Link>

          <Link
            to={`/site/${siteId}/solar`}
            className="text-yellow-600 underline"
          >
            Solar
          </Link>
        </div>

        <div className="mt-4">
          <Link to="/" className="text-gray-500 underline">
            Back to Sites
          </Link>
        </div>
      </div>
    </div>
  );
}
