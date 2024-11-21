"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, getLinks } from "@/utils/trpc";
import superjson from "superjson";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            retryDelay: 1000,
            staleTime: 5000,
          },
        },
      })
  );

  const [trpcClient, setTrpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: getLinks(),
    })
  );

  // Listen for auth token changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken") {
        // Create new client with updated auth token
        setTrpcClient(
          trpc.createClient({
            transformer: superjson,
            links: getLinks(),
          })
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
