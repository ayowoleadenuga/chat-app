"use client";

import { Message } from "@/types/chat";
import { formatMessageDate } from "@/utils/chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuthContext } from "@/providers/auth";

interface MessageItemProps {
  message: Message;
  onReaction: (messageId: string, type: "like" | "dislike") => void;
}

export function MessageItem({ message, onReaction }: MessageItemProps) {
  const { user } = useAuthContext();
  const isOwnMessage = message.userId === user?.id;

  return (
    <Card
      className={`max-w-[80%] ${
        isOwnMessage ? "ml-auto bg-primary text-primary-foreground" : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1">
          <span className="font-semibold">{message.user.username}</span>
          <span className="text-xs opacity-70">
            {formatMessageDate(message.createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReaction(message.id, "like")}
            className={`h-8 px-2 ${
              message.reactions.some(
                (reaction) =>
                  reaction.type === "like" &&
                  reaction.userId === (user?.id || "")
              )
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {
              message.reactions.filter((reaction) => reaction.type === "like")
                .length
            }
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReaction(message.id, "dislike")}
            className={`h-8 px-2 ${
              message.reactions.some(
                (reaction) =>
                  reaction.type === "dislike" &&
                  reaction.userId === (user?.id || "")
              )
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {
              message.reactions.filter(
                (reaction) => reaction.type === "dislike"
              ).length
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
