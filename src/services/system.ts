import { invoke } from "@tauri-apps/api/core";

export interface SystemInfo {
  username: string;
  hostname: string;
  identity: string;
  ip: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const [username, hostname, ip] = await Promise.all([
    getOsUsername(),
    getOsHostname(),
    getPublicIp(),
  ]);
  return { username, hostname, identity: `${username}@${hostname}`, ip };
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

async function getPublicIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return data.ip || "0.0.0.0";
  } catch {
    try {
      const res = await fetch("http://ip-api.com/json", {
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      return data.query || "0.0.0.0";
    } catch {
      return "0.0.0.0";
    }
  }
}
