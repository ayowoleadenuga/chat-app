// src/hooks/use-room-subscription.ts
import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { useStore } from "@/store/hooks";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/types/chat";

export interface RoomSubscriptionOptions {
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onNewMessage?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
}

export function useRoomSubscription(
  roomId: string | null,
  options: RoomSubscriptionOptions = {}
) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { user } = useStore();
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  useEffect(() => {
    // Clear existing subscriptions
    return () => {
      subscriptionsRef.current.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing:", error);
        }
      });
      subscriptionsRef.current = [];
    };
  }, [roomId]); // Only re-run when roomId changes

  useEffect(() => {
    if (!roomId || !user) return;

    try {
      // Subscribe to new messages
      const messageSubscription = utils.client.message.onNewMessage.subscribe(
        { roomId },
        {
          onData(message) {
            // Update local query data
            utils.message.list.setData(
              { roomId, limit: 50 }, // Match the query params
              (oldData) => {
                if (!oldData)
                  return { messages: [message], nextCursor: undefined };
                return {
                  ...oldData,
                  messages: [...oldData.messages, message],
                };
              }
            );

            // Call custom handler if provided
            options.onNewMessage?.(message);

            // Show toast for messages from others
            if (message.userId !== user.id) {
              toast({
                title: `New message from ${message.user.username}`,
                description:
                  message.content.length > 50
                    ? `${message.content.slice(0, 50)}...`
                    : message.content,
              });
            }
          },
          onError(err) {
            console.error("Message subscription error:", err);
          },
        }
      );

      subscriptionsRef.current.push(messageSubscription);

      // Subscribe to message updates
      const updateSubscription =
        utils.client.message.onMessageUpdated.subscribe(
          { roomId },
          {
            onData(updatedMessage) {
              // Update local query data
              utils.message.list.setData({ roomId, limit: 50 }, (oldData) => {
                if (!oldData)
                  return { messages: [updatedMessage], nextCursor: undefined };
                return {
                  ...oldData,
                  messages: oldData.messages.map((msg) =>
                    msg.id === updatedMessage.id ? updatedMessage : msg
                  ),
                };
              });

              options.onMessageUpdated?.(updatedMessage);
            },
            onError(err) {
              console.error("Message update subscription error:", err);
            },
          }
        );

      subscriptionsRef.current.push(updateSubscription);

      // Subscribe to user presence
      const userJoinSubscription = utils.client.room.onUserJoined.subscribe(
        { roomId },
        {
          onData(data: { userId: string }) {
            utils.room.list.invalidate();
            options.onUserJoined?.(data.userId);

            if (data.userId !== user.id) {
              toast({
                title: "User joined",
                description: "A new user has joined the room",
              });
            }
          },
          onError(err) {
            console.error("User join subscription error:", err);
          },
        }
      );

      subscriptionsRef.current.push(userJoinSubscription);

      const userLeaveSubscription = utils.client.room.onUserLeft.subscribe(
        { roomId },
        {
          onData(data: { userId: string }) {
            utils.room.list.invalidate();
            options.onUserLeft?.(data.userId);

            if (data.userId !== user.id) {
              toast({
                title: "User left",
                description: "A user has left the room",
              });
            }
          },
          onError(err) {
            console.error("User leave subscription error:", err);
          },
        }
      );

      subscriptionsRef.current.push(userLeaveSubscription);
    } catch (error) {
      console.error("Error setting up room subscriptions:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to room updates",
        variant: "destructive",
      });
    }

    // Cleanup subscriptions when roomId or user changes
    return () => {
      subscriptionsRef.current.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing:", error);
        }
      });
      subscriptionsRef.current = [];
    };
  }, [roomId, user, utils, options, toast]);

  return {
    isSubscribed: !!roomId && !!user && subscriptionsRef.current.length > 0,
  };
}
