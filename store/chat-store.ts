import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatState } from "./types";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeRoomId: null,
      joinedRooms: new Set<string>(),
      messages: {},
      isLoading: false,
      error: null,

      setActiveRoom: (roomId) => {
        const state = get();
        // Only update if the room ID is different and the user is a member
        if (
          roomId !== state.activeRoomId &&
          (roomId === null || state.joinedRooms.has(roomId))
        ) {
          set({ activeRoomId: roomId });
        }
      },

      joinRoom: (roomId) =>
        set((state) => {
          if (state.joinedRooms.has(roomId)) return state;
          const newJoinedRooms = new Set(state.joinedRooms);
          newJoinedRooms.add(roomId);
          return { joinedRooms: newJoinedRooms };
        }),

      leaveRoom: (roomId) =>
        set((state) => {
          if (!state.joinedRooms.has(roomId)) return state;
          const newJoinedRooms = new Set(state.joinedRooms);
          newJoinedRooms.delete(roomId);
          return {
            joinedRooms: newJoinedRooms,
            activeRoomId:
              state.activeRoomId === roomId ? null : state.activeRoomId,
          };
        }),

      addMessage: (roomId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: [...(state.messages[roomId] || []), message],
          },
        })),

      updateMessage: (roomId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]:
              state.messages[roomId]?.map((msg) =>
                msg.id === messageId ? { ...msg, ...updates } : msg
              ) || [],
          },
        })),

      setMessages: (roomId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [roomId]: messages,
          },
        })),

      setError: (error) => set({ error }),

      clearStore: () =>
        set({
          activeRoomId: null,
          joinedRooms: new Set(),
          messages: {},
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({
        joinedRooms: Array.from(state.joinedRooms),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert joinedRooms array back to Set after rehydration
          state.joinedRooms = new Set(state.joinedRooms);
        }
      },
    }
  )
);
