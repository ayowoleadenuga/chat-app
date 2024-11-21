"use client";

import { Room } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Menu, Users, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface RoomHeaderProps {
  room?: Room;
  onOpenSidebar: () => void;
  onSignOut: () => void;
}

export function RoomHeader({
  room,
  onOpenSidebar,
  onSignOut,
}: RoomHeaderProps) {
  return (
    <header className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="w-full h-full" onClick={onOpenSidebar} />
          </SheetContent>
        </Sheet>
        <div className="flex flex-col">
          <h1 className="font-semibold">{room?.name || "Select a room"}</h1>
          {room && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{room._count.users} users</span>
            </div>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onSignOut}>
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}
