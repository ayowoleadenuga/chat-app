import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export async function getRoomWithUsers(roomId: string) {
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

export async function getRoomMessages(roomId: string) {
  return prisma.message.findMany({
    where: { roomId },
    include: {
      user: true,
      reactions: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getUserRooms(userId: string) {
  return prisma.chatRoom.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });
}
