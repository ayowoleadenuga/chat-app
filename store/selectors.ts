import type { ChatState, AuthState } from "./types";

export const selectActiveRoom = (state: ChatState) => state.activeRoomId;
export const selectJoinedRooms = (state: ChatState) =>
  Array.from(state.joinedRooms);
export const selectRoomMessages = (roomId: string) => (state: ChatState) =>
  state.messages[roomId] || [];
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectCurrentUser = (state: AuthState) => state.user;
