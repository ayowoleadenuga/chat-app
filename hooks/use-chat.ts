import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/hooks";
import { trpc } from "@/utils/trpc";
import { useToast } from "@/hooks/use-toast";
import { ApiMessage, ApiRoom } from "@/types/api";
import { transformRoom } from "@/utils/transformers";

// src/hooks/use-chat.ts
export function useChat() {
  const {
    user,
    messages,
    joinedRooms,
    activeRoomId,
    addMessage,
    updateMessage,
    setMessages,
    joinRoom,
    leaveRoom,
    setChatError,
    setActiveRoom,
  } = useStore();

  const utils = trpc.useUtils();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch rooms and sync joined status
  const {
    data: apiRooms = [],
    isLoading: isRoomsLoading,
    error: roomsError,
  } = trpc.room.list.useQuery(undefined, {
    enabled: !!user,
    staleTime: 5000,
    retry: 1,
    select: (data) => data.map((room: ApiRoom) => transformRoom(room)),
    onSuccess: (rooms) => {
      // Sync joined rooms with API data
      rooms.forEach((room) => {
        if (room.isJoined) {
          joinRoom(room.id);
        }
      });
    },
    onError: (error) => {
      console.error("Failed to fetch rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      });
      if (error.message === "UNAUTHORIZED") {
        setChatError("Authentication failed. Please sign in again.");
      }
    },
  });

  // Join room mutation with proper success handling
  const joinRoomMutation = trpc.room.join.useMutation({
    onMutate: async ({ roomId }) => {
      await utils.room.list.cancel();
      const previousRooms = utils.room.list.getData();

      // Optimistically update the room list
      utils.room.list.setData(undefined, (old) => {
        if (!old) return previousRooms || [];
        return old.map((room) =>
          room.id === roomId ? { ...room, isJoined: true } : room
        );
      });

      return { previousRooms };
    },
    onSuccess: (_, { roomId }) => {
      // Update store on successful join
      joinRoom(roomId);
      toast({
        title: "Joined room",
        description: "Successfully joined the room",
      });
    },
    onError: (error, { roomId }, context) => {
      // Revert optimistic update
      if (context?.previousRooms) {
        utils.room.list.setData(undefined, context.previousRooms);
      }

      if (error.data?.code === "CONFLICT") {
        toast({
          title: "Already Joined",
          description: "You are already a member of this room",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join room. Please try again.",
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      utils.room.list.invalidate();
    },
  });

  // Leave room mutation with proper store updates
  const leaveRoomMutation = trpc.room.leave.useMutation({
    onMutate: async ({ roomId }) => {
      await utils.room.list.cancel();
      const previousRooms = utils.room.list.getData();

      // Optimistically update the room list
      utils.room.list.setData(undefined, (old) => {
        if (!old) return previousRooms || [];
        return old.map((room) =>
          room.id === roomId ? { ...room, isJoined: false } : room
        );
      });

      return { previousRooms };
    },
    onSuccess: (_, { roomId }) => {
      // Update store on successful leave
      leaveRoom(roomId);
      if (activeRoomId === roomId) {
        setActiveRoom(null);
      }
      toast({
        title: "Left room",
        description: "Successfully left the room",
      });
    },
    onError: (error, { roomId }, context) => {
      // Revert optimistic update
      if (context?.previousRooms) {
        utils.room.list.setData(undefined, context.previousRooms);
      }
      toast({
        title: "Error",
        description: "Failed to leave room. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      utils.room.list.invalidate();
    },
  });

  const handleJoinRoom = useCallback(
    async (roomId: string) => {
      if (!user) return;

      // Check if already joined using the API data
      const isAlreadyJoined = apiRooms.some(
        (room) => room.id === roomId && room.isJoined
      );

      if (isAlreadyJoined) {
        toast({
          title: "Already Joined",
          description: "You are already a member of this room",
          variant: "default",
        });
        return;
      }

      setIsLoading(true);
      try {
        await joinRoomMutation.mutateAsync({ roomId });
        // Store is updated in mutation callbacks
      } catch (error) {
        console.error("Join room error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, apiRooms, joinRoomMutation, toast]
  );

  const handleLeaveRoom = useCallback(
    async (roomId: string) => {
      if (!user) return;

      // Check if actually joined using the API data
      const isJoined = apiRooms.some(
        (room) => room.id === roomId && room.isJoined
      );

      if (!isJoined) return;

      setIsLoading(true);
      try {
        await leaveRoomMutation.mutateAsync({ roomId });
        // Store is updated in mutation callbacks
      } catch (error) {
        console.error("Leave room error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, apiRooms, leaveRoomMutation]
  );

  return {
    rooms: apiRooms,
    activeRoomId,
    joinedRooms,
    messages,
    isLoading: isLoading || isRoomsLoading,
    error: roomsError,
    setActiveRoom,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    addMessage,
    updateMessage,
  };
}
