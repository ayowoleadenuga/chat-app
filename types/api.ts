export interface ApiRoom {
  id: string;
  name: string;
  createdAt: Date;
  _count: {
    users: number;
  };
  users: {
    userId: string;
  }[];
  isJoined: boolean;
}

export interface ApiReaction {
  id: string;
  type: "like" | "dislike";
  userId: string;
  messageId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
  };
}

export interface ApiMessage {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
  };
  reactions: ApiReaction[];
}
