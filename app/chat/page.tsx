"use client";

import { ChatLayout } from "@/components/chat/layout/chat-layout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth";

export default function ChatPage() {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <ChatLayout />;
}
