import { WebSocket } from "ws";

export class WebSocketClient {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect(url: string, headers: Record<string, string> = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(url, {
      headers,
    });

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.scheduleReconnect(url, headers);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.scheduleReconnect(url, headers);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        this.notifyListeners(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  private scheduleReconnect(url: string, headers: Record<string, string>) {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect...");
      this.connect(url, headers);
    }, 5000);
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private notifyListeners(message: any) {
    if (message.type && this.listeners.has(message.type)) {
      this.listeners.get(message.type)!.forEach((callback) => {
        callback(message.data);
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.listeners.clear();
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }
}
