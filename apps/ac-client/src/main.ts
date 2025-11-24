import { app, BrowserWindow } from "electron"
import WebSocket from "ws"

let ws: WebSocket | null = null

function createWindow() {
  const win = new BrowserWindow({ width: 400, height: 300, show: false })
  win.loadURL("data:text/html,<html><body>AC Client</body></html>")
}

function startWs() {
  ws = new WebSocket(process.env.ECLIP_WS_URL || "ws://localhost:3001/realtime")
  ws.on("open", () => {})
  ws.on("message", () => {})
}

function integrityTick() {
  const payload = { type: "ac.alert", payload: { processes: [], overlays: [], flags: [] }, timestamp: new Date().toISOString() }
  ws?.send(JSON.stringify(payload))
}

app.whenReady().then(() => {
  createWindow()
  startWs()
  setInterval(integrityTick, 5000)
})