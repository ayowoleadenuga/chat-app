"use client";

import { Room } from "@/types/chat";
import { RoomItem } from "./room-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/shared/icons";
import { memo } from "react";

interface RoomListProps {
  rooms: Room[];
  activeRoomId: string | null;
  joinedRooms: Set<string>;
  isLoading?: boolean;
  onRoomSelect: (roomId: string) => void;
  onJoinRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string) => void;
}

export const RoomList = memo(function RoomList({
  rooms,
  activeRoomId,
  joinedRooms,
  isLoading,
  onRoomSelect,
  onJoinRoom,
  onLeaveRoom,
}: RoomListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {rooms.map((room) => (
          <RoomItem
            key={room.id}
            room={room}
            isActive={room.id === activeRoomId}
            isJoined={joinedRooms.has(room.id)}
            onSelect={onRoomSelect}
            onJoin={onJoinRoom}
            onLeave={onLeaveRoom}
          />
        ))}
      </div>
    </ScrollArea>
  );
});
