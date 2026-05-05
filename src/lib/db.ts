import type { Message, Room } from "../types";

// ── Android bridge path ──
function useBridge() {
  return !!window.AndroidBridge;
}

// ── Tauri path: lazy import to avoid top-level side effects ──
async function getTauriDb() {
  const mod = await import("@tauri-apps/plugin-sql");
  const db = await mod.default.load("sqlite:chatapp.db");
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await db.execute(`
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
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  return db;
}

let tauriDb: Awaited<ReturnType<typeof getTauriDb>> | null = null;

// ── Shared helpers ──
function parseRooms(json: string): Room[] {
  return JSON.parse(json);
}

function parseMessages(json: string): Message[] {
  return JSON.parse(json);
}

// ── Exported API ──
export async function getSetting(key: string): Promise<string | null> {
  if (useBridge()) {
    return window.AndroidBridge!.dbGetSetting(key);
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  const rows = await tauriDb.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = $1", [key]
  );
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string) {
  if (useBridge()) {
    window.AndroidBridge!.dbSetSetting(key, value);
    return;
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  await tauriDb.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)", [key, value]
  );
}

export async function getRecentServers(): Promise<string[]> {
  if (useBridge()) {
    const raw = window.AndroidBridge!.dbGetSettingsLike("recent_server_%");
    const rows = JSON.parse(raw);
    return rows.map((r: { value: string }) => r.value).filter(Boolean);
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  const rows = await tauriDb.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key LIKE 'recent_server_%' ORDER BY key DESC"
  );
  return rows.map((r) => r.value).filter(Boolean);
}

export async function addRecentServer(url: string) {
  const current = await getRecentServers();
  const filtered = current.filter((s) => s !== url);
  filtered.unshift(url);
  const keep = filtered.slice(0, 5);

  if (useBridge()) {
    window.AndroidBridge!.dbDeleteSettingsLike("recent_server_%");
    for (let i = 0; i < keep.length; i++) {
      window.AndroidBridge!.dbSetSetting(
        `recent_server_${String(i).padStart(2, "0")}`, keep[i]
      );
    }
    return;
  }

  if (!tauriDb) tauriDb = await getTauriDb();
  await tauriDb.execute("DELETE FROM settings WHERE key LIKE 'recent_server_%'");
  for (let i = 0; i < keep.length; i++) {
    await tauriDb.execute(
      "INSERT INTO settings (key, value) VALUES ($1, $2)",
      [`recent_server_${String(i).padStart(2, "0")}`, keep[i]]
    );
  }
}

export async function saveRoom(room: Room) {
  if (useBridge()) {
    window.AndroidBridge!.dbSaveRoom(JSON.stringify(room));
    return;
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  await tauriDb.execute(
    "INSERT OR REPLACE INTO rooms (id, name, created_by, created_at) VALUES ($1, $2, $3, $4)",
    [room.room_id, room.name, room.created_by, room.created_at]
  );
}

export async function getRooms(): Promise<Room[]> {
  if (useBridge()) {
    return parseRooms(window.AndroidBridge!.dbGetRooms());
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  return tauriDb.select<Room[]>(
    "SELECT id as room_id, name, created_by, created_at FROM rooms ORDER BY created_at DESC"
  );
}

export async function saveMessage(msg: Message) {
  if (useBridge()) {
    window.AndroidBridge!.dbSaveMessage(JSON.stringify(msg));
    return;
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  try {
    await tauriDb.execute(
      "INSERT OR IGNORE INTO messages (room_id, sender, content, client_id, timestamp) VALUES ($1, $2, $3, $4, $5)",
      [msg.room_id, msg.sender, msg.content, msg.client_id, msg.timestamp]
    );
  } catch {
    // ignore duplicates
  }
}

export async function getMessages(roomId: string): Promise<Message[]> {
  if (useBridge()) {
    return parseMessages(window.AndroidBridge!.dbGetMessages(roomId));
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  return tauriDb.select<Message[]>(
    "SELECT * FROM messages WHERE room_id = $1 ORDER BY id ASC",
    [roomId]
  );
}

export async function updateRoomName(roomId: string, name: string) {
  if (useBridge()) {
    window.AndroidBridge!.dbUpdateRoomName(roomId, name);
    return;
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  await tauriDb.execute("UPDATE rooms SET name = $1 WHERE id = $2", [name, roomId]);
}

export async function deleteRoom(roomId: string) {
  if (useBridge()) {
    window.AndroidBridge!.dbDeleteRoom(roomId);
    return;
  }
  if (!tauriDb) tauriDb = await getTauriDb();
  await tauriDb.execute("DELETE FROM messages WHERE room_id = $1", [roomId]);
  await tauriDb.execute("DELETE FROM rooms WHERE id = $1", [roomId]);
}
