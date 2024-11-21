import { createWSServer } from "./ws";
import dotenv from "dotenv";

dotenv.config();

// Only start WebSocket server in development
if (process.env.NODE_ENV !== "production") {
  const WS_PORT = parseInt(process.env.WS_PORT || "3001", 10);

  try {
    const wss = createWSServer(WS_PORT);
    console.log(`🚀 WebSocket Server started on port ${WS_PORT}`);

    // Handle server shutdown
    const shutdown = () => {
      console.log("Shutting down WebSocket server...");
      wss.close(() => {
        console.log("WebSocket server closed");
        process.exit(0);
      });
    };

    // Handle process termination
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start WebSocket server:", error);
    process.exit(1);
  }
}

export * from "./trpc";
export * from "./context";
export type { AppRouter } from "./routers";