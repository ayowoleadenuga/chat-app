"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Message } from "@/types/chat";
import { MessageItem } from "./message-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/shared/icons";
import { ApiMessage } from "@/types/api";

interface MessageListProps {
  messages: Message[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onReaction: (messageId: string, type: "like" | "dislike") => void;
}

export function MessageList({
  messages,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onReaction,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && !isLoadingMore && hasMore) {
      onLoadMore();
    }
  }, [inView, isLoadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <ScrollArea className="flex-1 p-4">
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-2">
          <Button variant="ghost" disabled={isLoadingMore} onClick={onLoadMore}>
            {isLoadingMore ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onReaction={onReaction}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </ScrollArea>
  );
}
