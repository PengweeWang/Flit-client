import Database from "@tauri-apps/plugin-sql";
import type { Message, Room } from "../types";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;
  db = await Database.load("sqlite:chatapp.db");
  await initTables();
  return db;
}

async function initTables() {
  await db!.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await db!.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      client_id TEXT UNIQUE,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);
  await db!.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

export async function getSetting(key: string): Promise<string | null> {
  const d = await getDb();
  const rows = await d.select<{ value: string }[]>("SELECT value FROM settings WHERE key = $1", [key]);
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string) {
  const d = await getDb();
  await d.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)", [key, value]);
}

export async function getRecentServers(): Promise<string[]> {
  const d = await getDb();
  const rows = await d.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key LIKE 'recent_server_%' ORDER BY key DESC"
  );
  return rows.map((r) => r.value).filter(Boolean);
}

export async function addRecentServer(url: string) {
  const current = await getRecentServers();
  const filtered = current.filter((s) => s !== url);
  filtered.unshift(url);
  const keep = filtered.slice(0, 5);
  const d = await getDb();
  await d.execute("DELETE FROM settings WHERE key LIKE 'recent_server_%'");
  for (let i = 0; i < keep.length; i++) {
    await d.execute(
      "INSERT INTO settings (key, value) VALUES ($1, $2)",
      [`recent_server_${String(i).padStart(2, "0")}`, keep[i]]
    );
  }
}

export async function saveRoom(room: Room) {
  const d = await getDb();
  await d.execute(
    "INSERT OR REPLACE INTO rooms (id, name, created_by, created_at) VALUES ($1, $2, $3, $4)",
    [room.room_id, room.name, room.created_by, room.created_at]
  );
}

export async function getRooms(): Promise<Room[]> {
  const d = await getDb();
  return d.select<Room[]>("SELECT id as room_id, name, created_by, created_at FROM rooms ORDER BY created_at DESC");
}

export async function saveMessage(msg: Message) {
  const d = await getDb();
  try {
    await d.execute(
      "INSERT OR IGNORE INTO messages (room_id, sender, content, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)",
      [msg.room_id, msg.sender, msg.content, msg.client_id, msg.timestamp]
    );
  } catch {
    // ignore duplicates
  }
}

export async function getMessages(roomId: string): Promise<Message[]> {
  const d = await getDb();
  return d.select<Message[]>(
    "SELECT * FROM messages WHERE room_id = $1 ORDER BY id ASC",
    [roomId]
  );
}

export async function updateRoomName(roomId: string, name: string) {
  const d = await getDb();
  await d.execute("UPDATE rooms SET name = $1 WHERE id = $2", [name, roomId]);
}

export async function deleteRoom(roomId: string) {
  const d = await getDb();
  await d.execute("DELETE FROM messages WHERE room_id = $1", [roomId]);
  await d.execute("DELETE FROM rooms WHERE id = $1", [roomId]);
}
