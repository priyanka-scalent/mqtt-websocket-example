import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function Solar() {
  const { siteId } = useParams();
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!siteId) return;

    let ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      setConnected(true);

      ws.send(
        JSON.stringify({
          action: "subscribe",
          siteId,
          screen: "solar",
        })
      );
    };

    ws.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => ws.close();
  }, [siteId]);

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">Solar</h2>

      <div className="text-6xl font-bold text-yellow-500 mb-4">
        {data?.solarPower ?? "--"} W
      </div>

      <div className="mt-4 text-sm">
        WS: {connected ? "Connected" : "Disconnected"}
      </div>
    </div>
  );
}
