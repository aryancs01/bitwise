import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import app from "../app";

const server = http.createServer(app);

let ws: WebSocketServer | null = null;

export function connectWebSocket() {
  ws = new WebSocketServer({ server });

  ws.on("connection", (socket) => {
    console.log("Connected to WebSocket server");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  ws.on("close", () => {
    console.log("WebSocket disconnected");
    ws = null;
  });
}

export function sendWebSocketMessage(data: any) {
  if (!ws || ws.clients.size === 0) {
    console.error("WebSocket not connected");
    return;
  }

  ws.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}