import { useCallback } from "react";
import { useAuthStore } from "./auth-store";
import { useChatStore } from "./chat-store";

export function useStore() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    setUser,
    setLoading: setAuthLoading,
    setError: setAuthError,
    clearAuth,
  } = useAuthStore();

  const {
    activeRoomId,
    joinedRooms,
    messages,
    isLoading: chatLoading,
    error: chatError,
    setActiveRoom,
    joinRoom,
    leaveRoom,
    addMessage,
    updateMessage,
    setMessages,
    setError: setChatError,
    clearStore: clearChat,
  } = useChatStore();

  const clearStore = useCallback(() => {
    clearAuth();
    clearChat();
  }, [clearAuth, clearChat]);

  return {
    // Auth state
    user,
    isAuthenticated,
    isLoading: authLoading || chatLoading,
    error: authError || chatError,

    // Room state
    activeRoomId,
    joinedRooms: Array.from(joinedRooms),
    messages,

    // Actions
    setUser,
    setAuthLoading,
    setAuthError,
    setActiveRoom,
    joinRoom,
    leaveRoom,
    addMessage,
    updateMessage,
    setMessages,
    setChatError,
    clearStore,
  };
}
