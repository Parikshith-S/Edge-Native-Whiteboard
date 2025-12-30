import { DurableObject } from "cloudflare:workers";

// This class represents ONE specific room
export class WhiteboardRoom extends DurableObject {
  private sessions: Set<WebSocket> = new Set();

  async fetch(request: Request): Promise<Response> {
    // Attempt to upgrade the request to a WebSocket
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Durable Object expected Upgrade: websocket", { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Accept the WebSocket connection
    server.accept();
    this.handleSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  handleSession(ws: WebSocket) {
    this.sessions.add(ws);

    ws.addEventListener("message", (event) => {
      // Broadcast the message to all OTHER sessions
      const message = event.data as string;
      this.broadcast(message, ws);
    });

    ws.addEventListener("close", () => {
      this.sessions.delete(ws);
    });
  }

  broadcast(message: string, sender: WebSocket) {
    for (const client of this.sessions) {
      if (client !== sender && client.readyState === 1) { // 1 = OPEN
        client.send(message);
      }
    }
  }
}
