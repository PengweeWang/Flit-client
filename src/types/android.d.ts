interface AndroidBridge {
  dbGetSetting(key: string): string | null;
  dbSetSetting(key: string, value: string): void;
  dbDeleteSettingsLike(prefix: string): void;
  dbGetSettingsLike(pattern: string): string;
  dbGetRooms(): string;
  dbSaveRoom(roomJson: string): void;
  dbDeleteRoom(roomId: string): void;
  dbUpdateRoomName(roomId: string, name: string): void;
  dbGetMessages(roomId: string): string;
  dbSaveMessage(msgJson: string): void;
}

interface Window {
  AndroidBridge?: AndroidBridge;
}
