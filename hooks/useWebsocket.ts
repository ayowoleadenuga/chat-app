import { useEffect, useCallback } from "react";
import { WebSocketClient } from "@/utils/websocket";

export function useWebSocket() {
  const ws = WebSocketClient.getInstance();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL!;
    const authToken = localStorage.getItem("authToken");

    ws.connect(wsUrl, {
      authorization: authToken || "",
    });

    return () => {
      ws.disconnect();
    };
  }, []);

  const subscribe = useCallback(
    (event: string, callback: (data: any) => void) => {
      return ws.subscribe(event, callback);
    },
    []
  );

  const send = useCallback((data: any) => {
    ws.send(data);
  }, []);

  return {
    subscribe,
    send,
  };
}
