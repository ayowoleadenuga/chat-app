"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    onSend(content);
    setContent("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </form>
  );
}
