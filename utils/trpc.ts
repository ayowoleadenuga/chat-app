import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, splitLink, createWSClient, wsLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function getAuthToken() {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("authToken");
  return token ? token.replace("Bearer ", "") : "";
}

export function getWsUrl() {
  const token = getAuthToken();
  const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
  return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
}

export function getLinks() {
  const wsClient = createWSClient({
    url: getWsUrl(),
    onOpen() {
      console.log("WebSocket connection opened");
    },
    onClose() {
      console.log("WebSocket connection closed");
    },
  });

  return [
    splitLink({
      condition(op) {
        return op.type === "subscription";
      },
      true: wsLink({
        client: wsClient,
      }),
      false: httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers: () => {
          const token = localStorage.getItem("authToken");
          return token ? { authorization: token } : {};
        },
      }),
    }),
  ];
}
