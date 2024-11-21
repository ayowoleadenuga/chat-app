import { prisma } from "./db";
import type { MessageWithUserAndReactions, RoomWithUsers } from "../types/db";

export async function validateUserInRoom(userId: string, roomId: string) {
  const userRoom = await prisma.userRoom.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  return !!userRoom;
}

export async function getRoomDetails(
  roomId: string
): Promise<RoomWithUsers | null> {
  return prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      users: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });
}

export async function getLatestMessages(
  roomId: string,
  limit = 50
): Promise<MessageWithUserAndReactions[]> {
  return prisma.message.findMany({
    where: { roomId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      reactions: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function createMessage(
  userId: string,
  roomId: string,
  content: string
): Promise<MessageWithUserAndReactions> {
  return prisma.message.create({
    data: {
      content,
      userId,
      roomId,
    },
    include: {
      user: true,
      reactions: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function toggleReaction(
  userId: string,
  messageId: string,
  type: "like" | "dislike"
) {
  const existingReaction = await prisma.reaction.findUnique({
    where: {
      userId_messageId: {
        userId,
        messageId,
      },
    },
  });

  if (existingReaction) {
    if (existingReaction.type === type) {
      // Remove reaction if same type
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      // Update reaction type if different
      await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type },
      });
    }
  } else {
    // Create new reaction
    await prisma.reaction.create({
      data: {
        type,
        userId,
        messageId,
      },
    });
  }

  return prisma.message.findUnique({
    where: { id: messageId },
    include: {
      user: true,
      reactions: {
        include: {
          user: true,
        },
      },
    },
  });
}
