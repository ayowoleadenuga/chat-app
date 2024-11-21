export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: Date;
  _count: {
    users: number;
  };
  users?: UserRoom[];
  isJoined: boolean;
}

export interface UserRoom {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: Date;
  user: User;
  reactions: Reaction[];
}

export interface Reaction {
  id: string;
  type: "like" | "dislike";
  userId: string;
  messageId: string;
  createdAt: Date;
  user: User;
}

// DTOs (Data Transfer Objects) for API responses
export interface RoomResponse {
  id: string;
  name: string;
  createdAt: Date;
  _count: {
    users: number;
  };
  isJoined: boolean;
}

export interface MessageResponse {
  id: string;
  content: string;
  createdAt: Date;
  roomId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
  reactions: {
    likes: string[];
    dislikes: string[];
  };
}

// Request types
export interface SendMessageRequest {
  roomId: string;
  content: string;
}

export interface ToggleReactionRequest {
  messageId: string;
  type: "like" | "dislike";
}

// State types
export interface RoomState {
  activeRoomId: string | null;
  joinedRooms: Set<string>;
}

export interface MessageState {
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}

// Event types for WebSocket messages
export interface UserJoinedEvent {
  type: "USER_JOINED";
  payload: {
    roomId: string;
    userId: string;
    username: string;
  };
}

export interface UserLeftEvent {
  type: "USER_LEFT";
  payload: {
    roomId: string;
    userId: string;
    username: string;
  };
}

export interface NewMessageEvent {
  type: "NEW_MESSAGE";
  payload: Message;
}

export interface MessageUpdatedEvent {
  type: "MESSAGE_UPDATED";
  payload: Message;
}

export type ChatEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | NewMessageEvent
  | MessageUpdatedEvent;

// Helper types
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface QueryOptions {
  limit?: number;
  cursor?: string;
}

// Error types
export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// UI State types
export interface ChatUIState {
  isSending: boolean;
  isLoadingMore: boolean;
  selectedMessageId: string | null;
  replyToMessageId: string | null;
}
