import { Prisma } from "@prisma/client";

const userWithRoomsInclude = {
  rooms: {
    include: {
      room: true,
    },
  },
} satisfies Prisma.UserInclude;

const roomWithUsersInclude = {
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
} satisfies Prisma.ChatRoomInclude;

const messageWithDetailsInclude = {
  user: true,
  reactions: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.MessageInclude;

export type UserWithRooms = Prisma.UserGetPayload<{
  include: typeof userWithRoomsInclude;
}>;

export type RoomWithUsers = Prisma.ChatRoomGetPayload<{
  include: typeof roomWithUsersInclude;
}>;

export type MessageWithUserAndReactions = Prisma.MessageGetPayload<{
  include: typeof messageWithDetailsInclude;
}>;

export type UserBasic = {
  id: string;
  username: string;
};

export type ReactionWithUser = Prisma.ReactionGetPayload<{
  include: { user: true };
}>;

export type RoomSummary = {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
  joined: boolean;
};

export type MessageWithReactions = {
  id: string;
  content: string;
  createdAt: Date;
  user: UserBasic;
  reactions: {
    likes: string[];
    dislikes: string[];
  };
};
