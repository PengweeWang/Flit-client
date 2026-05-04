import type { WSMessage } from "../types";

export type MessageHandler = (msg: WSMessage) => void;
export type StatusHandler = (connected: boolean) => void;

export class WsClient {
  private ws: WebSocket | null = null;
  private url: string = "";
  private handlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;
  private roomSubscriptions: Set<string> = new Set();

  connect(url: string) {
    this.url = url;
    this.shouldReconnect = true;
    this.doConnect();
  }

  private doConnect() {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.notifyStatus(true);
      for (const roomId of this.roomSubscriptions) {
        this.send({ type: "join_room", room_id: roomId });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        this.handlers.forEach((h) => h(msg));
      } catch {
        // ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.notifyStatus(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.doConnect(), 3000);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }

  send(msg: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  subscribeRoom(roomId: string) {
    this.roomSubscriptions.add(roomId);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: "join_room", room_id: roomId });
    }
  }

  unsubscribeRoom(roomId: string) {
    this.roomSubscriptions.delete(roomId);
    this.send({ type: "leave_room", room_id: roomId });
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== handler);
    };
  }

  private notifyStatus(connected: boolean) {
    this.statusHandlers.forEach((h) => h(connected));
  }
}

export const wsClient = new WsClient();
