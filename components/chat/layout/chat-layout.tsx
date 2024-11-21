"use client";

import { useChat } from "@/hooks/use-chat";
import { useRoom } from "@/hooks/use-room";
import { Sidebar } from "./sidebar";
import { RoomHeader } from "../room/room-header";
import { MessageList } from "../message/message-list";
import { MessageInput } from "../message/message-input";
import { useAuthContext } from "@/providers/auth";

export function ChatLayout() {
  const { signout } = useAuthContext();
  const { activeRoomId, setActiveRoom } = useChat();
  const {
    room,
    messages,
    hasMore,
    isLoadingMore,
    isLoading,
    sendMessage,
    loadMoreMessages,
    toggleReaction,
  } = useRoom(activeRoomId);

  return (
    <div className="flex h-screen">
      <Sidebar className="w-80 hidden lg:block" />
      <div className="flex-1 flex flex-col">
        <RoomHeader
          room={room}
          onOpenSidebar={() => setActiveRoom(null)}
          onSignOut={signout}
        />
        {activeRoomId ? (
          <>
            <MessageList
              messages={messages}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMoreMessages}
              onReaction={toggleReaction}
            />
            <MessageInput onSend={sendMessage} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a room to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
