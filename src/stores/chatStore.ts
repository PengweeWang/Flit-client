import { create } from "zustand";
import type { Message, Room } from "../types";

interface ChatState {
  identity: string;
  serverUrl: string;
  connected: boolean;
  rooms: Room[];
  currentRoomId: string | null;
  messages: Record<string, Message[]>;
  onlineUsers: Record<string, string[]>;
  typingUsers: Record<string, string[]>;

  setIdentity: (id: string) => void;
  setServerUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  updateRoomName: (roomId: string, name: string) => void;
  setCurrentRoom: (roomId: string | null) => void;
  addMessage: (msg: Message) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  setOnlineUsers: (roomId: string, users: string[]) => void;
  addTypingUser: (roomId: string, username: string) => void;
  removeTypingUser: (roomId: string, username: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  identity: "",
  serverUrl: "http://localhost:8000",
  connected: false,
  rooms: [],
  currentRoomId: null,
  messages: {},
  onlineUsers: {},
  typingUsers: {},

  setIdentity: (id) => set({ identity: id }),
  setServerUrl: (url) => set({ serverUrl: url }),

  setConnected: (connected) => set({ connected }),

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
    set((state) => {
      const exists = state.rooms.find((r) => r.room_id === room.room_id);
      if (exists) return state;
      return { rooms: [room, ...state.rooms] };
    }),

  updateRoomName: (roomId, name) =>
    set((state) => ({
      rooms: state.rooms.map((r) => r.room_id === roomId ? { ...r, name } : r),
    })),

  removeRoom: (roomId) =>
    set((state) => {
      const rooms = state.rooms.filter((r) => r.room_id !== roomId);
      const messages = { ...state.messages };
      delete messages[roomId];
      const onlineUsers = { ...state.onlineUsers };
      delete onlineUsers[roomId];
      const typingUsers = { ...state.typingUsers };
      delete typingUsers[roomId];
      return {
        rooms, messages, onlineUsers, typingUsers,
        currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
      };
    }),

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  addMessage: (msg) =>
    set((state) => {
      const existing = state.messages[msg.room_id] || [];
      const dup = existing.find((m) => m.client_id === msg.client_id);
      if (dup) return state;
      return {
        messages: { ...state.messages, [msg.room_id]: [...existing, msg] },
      };
    }),

  setMessages: (roomId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [roomId]: msgs } })),

  setOnlineUsers: (roomId, users) =>
    set((state) => ({ onlineUsers: { ...state.onlineUsers, [roomId]: users } })),

  addTypingUser: (roomId, username) =>
    set((state) => {
      const current = state.typingUsers[roomId] || [];
      if (current.includes(username)) return state;
      return { typingUsers: { ...state.typingUsers, [roomId]: [...current, username] } };
    }),

  removeTypingUser: (roomId, username) =>
    set((state) => {
      const current = state.typingUsers[roomId] || [];
      return { typingUsers: { ...state.typingUsers, [roomId]: current.filter((u) => u !== username) } };
    }),
}));
