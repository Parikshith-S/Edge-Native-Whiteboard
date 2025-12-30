import { WebSocket } from "@cloudflare/workers-types";

type RoomState = {
  clients: Set<WebSocket>;
};

export class RoomManager {
  private rooms = new Map<string, RoomState>();

  joinRoom(roomId: string, ws: WebSocket) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { clients: new Set() });
    }
    const room = this.rooms.get(roomId);
    room?.clients.add(ws);
  }

  leaveRoom(roomId: string, ws: WebSocket) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.clients.delete(ws);
      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  broadcast(roomId: string, message: string, senderWs: WebSocket) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const clients = Array.from(room.clients);

    let sentCount = 0;
    for (const client of clients) {
      // Check strict equality and readyState
      const isSender = client === senderWs;
      const isOpen = client.readyState === 1; // 1 = OPEN

      if (!isSender && isOpen) {
        client.send(message);
        sentCount++;
      }
    }
  }
}