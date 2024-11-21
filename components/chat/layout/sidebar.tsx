"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RoomList } from "../room/room-list";
import { useChat } from "@/hooks/use-chat";
import { useAuthContext } from "@/providers/auth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthContext();
  const {
    rooms,
    activeRoomId,
    joinedRooms,
    isLoading,
    joinRoom,
    leaveRoom,
    setActiveRoom,
  } = useChat();

  return (
    <div className={`border-r ${className}`}>
      <Card className="border-0 rounded-none">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Signed in as{" "}
              <span className="font-semibold">{user?.username}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoomId}
            joinedRooms={new Set(joinedRooms)}
            isLoading={isLoading}
            onRoomSelect={setActiveRoom}
            onJoinRoom={joinRoom}
            onLeaveRoom={leaveRoom}
          />
        </CardContent>
      </Card>
    </div>
  );
}
