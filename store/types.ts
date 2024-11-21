import type { User, Message } from "@/types/chat";
import type { ApiMessage } from "@/types/api";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export interface ChatState {
  activeRoomId: string | null;
  joinedRooms: Set<string>;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;

  setActiveRoom: (roomId: string | null) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  addMessage: (roomId: string, message: ApiMessage) => void;
  updateMessage: (
    roomId: string,
    messageId: string,
    message: ApiMessage
  ) => void;
  setMessages: (roomId: string, messages: ApiMessage[]) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}
