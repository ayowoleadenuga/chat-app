"use client";

import { Room } from "@/types/chat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { memo, useCallback } from "react";

interface RoomItemProps {
  room: Room;
  isActive: boolean;
  isJoined: boolean;
  onSelect: (roomId: string) => void;
  onJoin: (roomId: string) => void;
  onLeave: (roomId: string) => void;
}

export const RoomItem = memo(function RoomItem({
  room,
  isActive,
  isJoined,
  onSelect,
  onJoin,
  onLeave,
}: RoomItemProps) {
  const handleSelect = useCallback(() => {
    if (isJoined) {
      onSelect(room.id);
    }
  }, [isJoined, room.id, onSelect]);

  const handleJoin = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onJoin(room.id);
    },
    [room.id, onJoin]
  );

  const handleLeave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onLeave(room.id);
    },
    [room.id, onLeave]
  );
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isActive ? "bg-primary/10" : "hover:bg-muted"
      }`}
      onClick={handleSelect}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{room.name}</CardTitle>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{room._count.users}</span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Created {new Date(room.createdAt).toLocaleDateString()}
          </span>
          {isJoined ? (
            <Button variant="destructive" size="sm" onClick={handleLeave}>
              Leave
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={handleJoin}>
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
