import type {
  Reaction,
  Message,
  Room,
  User,
  ChatEvent,
  MessageResponse,
  RoomResponse,
} from "@/types/chat";

// Type guards
export function isUserJoinedEvent(
  event: ChatEvent
): event is ChatEvent & { type: "USER_JOINED" } {
  return event.type === "USER_JOINED";
}

export function isUserLeftEvent(
  event: ChatEvent
): event is ChatEvent & { type: "USER_LEFT" } {
  return event.type === "USER_LEFT";
}

export function isNewMessageEvent(
  event: ChatEvent
): event is ChatEvent & { type: "NEW_MESSAGE" } {
  return event.type === "NEW_MESSAGE";
}

export function isMessageUpdatedEvent(
  event: ChatEvent
): event is ChatEvent & { type: "MESSAGE_UPDATED" } {
  return event.type === "MESSAGE_UPDATED";
}

// Transformers
export function transformMessageResponse(response: MessageResponse): Message {
  return {
    id: response.id,
    content: response.content,
    userId: response.userId,
    roomId: response.roomId,
    createdAt: response.createdAt,
    user: {
      id: response.user.id,
      username: response.user.username,
    },
    reactions: Object.entries(response.reactions).flatMap(([type, userIds]) =>
      userIds.map((userId) => ({
        id: `${response.id}-${userId}-${type}`,
        type: type as "like" | "dislike",
        userId,
        messageId: response.id,
        createdAt: new Date(),
        user: {
          id: userId,
          username: response.user.id === userId ? response.user.username : "",
        },
      }))
    ),
  };
}

export function formatReactionsForResponse(
  reactions: Reaction[]
): MessageResponse["reactions"] {
  return {
    likes: reactions.filter((r) => r.type === "like").map((r) => r.userId),
    dislikes: reactions
      .filter((r) => r.type === "dislike")
      .map((r) => r.userId),
  };
}

export function transformMessageToResponse(message: Message): MessageResponse {
  return {
    id: message.id,
    content: message.content,
    roomId: message.roomId,
    userId: message.userId,
    createdAt: message.createdAt,
    user: {
      id: message.user.id,
      username: message.user.username,
    },
    reactions: formatReactionsForResponse(message.reactions),
  };
}

// Helper to create a new message
export function createMessage(
  content: string,
  roomId: string,
  user: User
): Message {
  return {
    id: crypto.randomUUID(),
    content,
    userId: user.id,
    roomId,
    createdAt: new Date(),
    user,
    reactions: [],
  };
}

// Type guard to check if an object is a valid Message
export function isMessage(obj: any): obj is Message {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.content === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.roomId === "string" &&
    obj.createdAt instanceof Date &&
    typeof obj.user === "object" &&
    Array.isArray(obj.reactions)
  );
}

export function transformRoomResponse(response: RoomResponse): Room {
  return {
    id: response.id,
    name: response.name,
    isJoined: response.isJoined,
    createdAt: response.createdAt,
    _count: response._count,
  };
}

// Helpers
export function groupMessagesByDate(
  messages: Message[]
): Record<string, Message[]> {
  return messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    return {
      ...groups,
      [date]: [...(groups[date] || []), message],
    };
  }, {} as Record<string, Message[]>);
}

export function formatMessageDate(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInDays = Math.floor(
    (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString();
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return messageDate.toLocaleDateString(undefined, { weekday: "long" });
  } else {
    return messageDate.toLocaleDateString();
  }
}

export function getReactionCount(
  message: Message,
  type: "like" | "dislike"
): number {
  return message.reactions.filter((reaction) => reaction.type === type).length;
}

export function hasUserReacted(
  message: Message,
  userId: string,
  type: "like" | "dislike"
): boolean {
  return message.reactions.some(
    (reaction) => reaction.userId === userId && reaction.type === type
  );
}

// Constants
export const MESSAGE_PAGE_SIZE = 50;
export const MAX_MESSAGE_LENGTH = 1000;
export const TYPING_INDICATOR_TIMEOUT = 3000;
