import { invoke } from "@tauri-apps/api/core";

export interface SystemInfo {
  username: string;
  hostname: string;
  identity: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const [username, hostname] = await Promise.all([
    getOsUsername(),
    getOsHostname(),
  ]);
  return { username, hostname, identity: `${username}@${hostname}` };
}

async function getOsUsername(): Promise<string> {
  try {
    return await invoke<string>("get_os_username");
  } catch {
    return "unknown";
  }
}

async function getOsHostname(): Promise<string> {
  try {
    return await invoke<string>("get_hostname");
  } catch {
    return "unknown";
  }
}

