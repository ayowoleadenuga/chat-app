import { useCallback, useState } from "react";
import { trpc } from "@/utils/trpc";
import { useStore } from "@/store/hooks";
import { useRoomSubscription } from "./use-room-subscription";
import { useToast } from "@/hooks/use-toast";
import { transformRoom, transformMessage } from "@/utils/transformers";
import type { ApiMessage } from "@/types/api";
import { Message } from "@/types/chat";

export function useRoom(roomId: string | null) {
  const { user } = useStore();
  const { toast } = useToast();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch room data with transformation
  const { data: apiRooms, isLoading: isRoomLoading } = trpc.room.list.useQuery(
    undefined,
    {
      enabled: !!roomId,
    }
  );

  // Transform the room if found
  const expectedRoom = apiRooms?.find((r) => r.id === roomId);
  const room =
    apiRooms && expectedRoom ? transformRoom(expectedRoom) : undefined;

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isLoading: isMessagesLoading,
  } = trpc.message.list.useInfiniteQuery(
    { roomId: roomId!, limit: 50 },
    {
      enabled: !!roomId,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      select: (data) => ({
        pages: data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) =>
            transformMessage(msg as ApiMessage)
          ),
        })),
        pageParams: data.pageParams,
      }),
    }
  );

  // Setup mutations
  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    },
  });

  const toggleReaction = trpc.message.addReaction.useMutation();

  // Setup subscriptions
  const { isSubscribed } = useRoomSubscription(roomId);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await fetchNextPage();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load more messages",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, fetchNextPage, toast]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!roomId || !user) return;

      try {
        await sendMessage.mutateAsync({
          content,
          roomId,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    },
    [roomId, user, sendMessage, toast]
  );

  const handleToggleReaction = useCallback(
    async (messageId: string, type: "like" | "dislike") => {
      if (!user) return;

      try {
        await toggleReaction.mutateAsync({
          messageId,
          type,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update reaction",
          variant: "destructive",
        });
      }
    },
    [user, toggleReaction, toast]
  );

  return {
    room,
    messages:
      (messagesData?.pages.flatMap(
        (page) => page.messages
      ) as unknown as Message[]) ?? [],
    isLoading: isRoomLoading || isMessagesLoading,
    isLoadingMore,
    hasMore: !!hasNextPage,
    isSubscribed,
    sendMessage: handleSendMessage,
    toggleReaction: handleToggleReaction,
    loadMoreMessages,
  };
}
