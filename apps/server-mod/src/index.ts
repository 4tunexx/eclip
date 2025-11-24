import WebSocket from "ws"

const ws = new WebSocket(process.env.ECLIP_WS_URL || "ws://localhost:3001/realtime")

ws.on("open", () => {
  const payload = {
    type: "match.update",
    payload: { matchId: "demo", stats: [] },
    timestamp: new Date().toISOString()
  }
  ws.send(JSON.stringify(payload))
})