export interface Room {
  room_id: string;
  name: string;
  created_by: string;
  created_at: string;
  online_users: string[];
}

export interface Message {
  id?: number;
  room_id: string;
  sender: string;
  content: string;
  client_id: string;
  timestamp: string;
}

export interface WSMessage {
  type: string;
  room_id?: string;
  sender?: string;
  content?: string;
  client_id?: string;
  timestamp?: string;
  users?: string[];
  username?: string;
  name?: string;
  created_by?: string;
  is_typing?: boolean;
  display_name?: string;
  client_ip?: string;
}
