import { useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "../stores/chatStore";
import { wsClient } from "../services/websocket";
import { getMessages, saveMessage, saveRoom, getRooms, deleteRoom as deleteRoomDb, updateRoomName as updateRoomNameDb } from "../lib/db";
import type { Message, WSMessage } from "../types";

export function useChat() {
  const store = useChatStore();

  useEffect(() => {
    const unsubMsg = wsClient.onMessage(handleMessage);
    const unsubStatus = wsClient.onStatus(handleStatus);
    loadLocalRooms();
    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);

  const handleMessage = useCallback(async (msg: WSMessage) => {
    switch (msg.type) {
      case "new_message":
        if (msg.room_id && msg.sender && msg.content && msg.client_id && msg.timestamp) {
          const m: Message = {
            room_id: msg.room_id,
            sender: msg.sender,
            content: msg.content,
            client_id: msg.client_id,
            timestamp: msg.timestamp,
          };
          useChatStore.getState().addMessage(m);
          await saveMessage(m);
        }
        break;

      case "online_users":
        if (msg.room_id && msg.users) {
          useChatStore.getState().setOnlineUsers(msg.room_id, msg.users);
        }
        break;

      case "typing":
        if (msg.room_id && msg.username) {
          if (msg.is_typing) {
            useChatStore.getState().addTypingUser(msg.room_id, msg.username);
          } else {
            useChatStore.getState().removeTypingUser(msg.room_id, msg.username);
          }
        }
        break;
    }
  }, []);

  const handleStatus = useCallback((connected: boolean) => {
    useChatStore.getState().setConnected(connected);
  }, []);

  const loadLocalRooms = useCallback(async () => {
    const rooms = await getRooms();
    useChatStore.getState().setRooms(rooms);
  }, []);

  const loadLocalMessages = useCallback(async (roomId: string) => {
    const msgs = await getMessages(roomId);
    useChatStore.getState().setMessages(roomId, msgs);
  }, []);

  const createRoom = useCallback((roomId: string, name: string) => {
    const room = {
      room_id: roomId,
      name,
      created_by: useChatStore.getState().identity,
      created_at: new Date().toISOString(),
      online_users: [],
    };
    useChatStore.getState().addRoom(room);
    saveRoom(room);
    wsClient.subscribeRoom(roomId);
    useChatStore.getState().setCurrentRoom(roomId);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    const state = useChatStore.getState();
    const exists = state.rooms.find((r) => r.room_id === roomId);
    if (!exists) {
      const room = {
        room_id: roomId,
        name: `Room-${roomId.slice(0, 8)}`,
        created_by: "",
        created_at: new Date().toISOString(),
        online_users: [],
      };
      state.addRoom(room);
      saveRoom(room);
    }
    wsClient.subscribeRoom(roomId);
    state.setCurrentRoom(roomId);
    loadLocalMessages(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    wsClient.unsubscribeRoom(roomId);
    const state = useChatStore.getState();
    if (state.currentRoomId === roomId) {
      state.setCurrentRoom(null);
    }
  }, []);

  const renameRoom = useCallback((roomId: string, name: string) => {
    useChatStore.getState().updateRoomName(roomId, name);
    updateRoomNameDb(roomId, name);
  }, []);

  const deleteRoom = useCallback(async (roomId: string) => {
    wsClient.unsubscribeRoom(roomId);
    await deleteRoomDb(roomId);
    useChatStore.getState().removeRoom(roomId);
  }, []);

  const sendMessage = useCallback((roomId: string, content: string) => {
    if (!content.trim()) return;
    const clientId = uuidv4();
    const timestamp = new Date().toISOString();
    const msg: Message = {
      room_id: roomId,
      sender: useChatStore.getState().identity,
      content,
      client_id: clientId,
      timestamp,
    };
    useChatStore.getState().addMessage(msg);
    saveMessage(msg);
    wsClient.send({
      type: "message",
      room_id: roomId,
      content,
      client_id: clientId,
      timestamp,
    });
  }, []);

  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    wsClient.send({ type: "typing", room_id: roomId, is_typing: isTyping });
  }, []);

  return {
    ...store,
    createRoom,
    joinRoom,
    leaveRoom,
    renameRoom,
    deleteRoom,
    sendMessage,
    sendTyping,
    loadLocalMessages,
  };
}
