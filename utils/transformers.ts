import type { Room, Message, Reaction } from "@/types/chat";
import type { ApiRoom, ApiMessage, ApiReaction } from "@/types/api";

export function transformRoom(apiRoom: ApiRoom): Room {
  return {
    id: apiRoom.id,
    name: apiRoom.name,
    createdAt: apiRoom.createdAt,
    _count: apiRoom._count,
    isJoined: apiRoom.isJoined,
    users: apiRoom.users.map((u) => ({
      id: `${apiRoom.id}-${u.userId}`,
      userId: u.userId,
      roomId: apiRoom.id,
      joinedAt: apiRoom.createdAt,
    })),
  };
}

export function transformReaction(apiReaction: ApiReaction): Reaction {
  if (apiReaction.type !== "like" && apiReaction.type !== "dislike") {
    throw new Error(`Invalid reaction type: ${apiReaction.type}`);
  }

  return {
    id: apiReaction.id,
    type: apiReaction.type,
    userId: apiReaction.userId,
    messageId: apiReaction.messageId,
    createdAt: new Date(apiReaction.createdAt),
    user: {
      id: apiReaction.user.id,
      username: apiReaction.user.username,
    },
  };
}

export function transformMessage(apiMessage: ApiMessage): Message {
  return {
    id: apiMessage.id,
    content: apiMessage.content,
    userId: apiMessage.userId,
    roomId: apiMessage.roomId,
    createdAt: apiMessage.createdAt,
    user: {
      id: apiMessage.user.id,
      username: apiMessage.user.username,
    },
    reactions: apiMessage.reactions.map(transformReaction),
  };
}
