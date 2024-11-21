import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { appRouter } from "./routers";
import { createContext } from "./context";

export function createWSServer(port: number) {
  const wss = new WebSocketServer({ port });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    // @ts-expect-error
    createContext,
  });

  wss.on("connection", (ws) => {
    // eslint-disable-next-line no-console
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once("close", () => {
      // eslint-disable-next-line no-console
      console.log(`➖➖ Connection (${wss.clients.size})`);
    });
  });

  process.on("SIGTERM", () => {
    // eslint-disable-next-line no-console
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
    wss.close();
  });
  // eslint-disable-next-line no-console
  console.log(`WebSocket Server started on port ${port}`);
  return wss;
}
