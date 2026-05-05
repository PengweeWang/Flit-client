export interface SystemInfo {
  username: string;
  hostname: string;
  identity: string;
}

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

export async function getSystemInfo(): Promise<SystemInfo> {
  if (window.AndroidBridge) {
    const { getSetting } = await import("../lib/db");
    const name = await getSetting("identity");
    if (name) {
      return { username: name, hostname: "app", identity: name };
    }
    return { username: "", hostname: "", identity: "" };
  }

  const { invoke } = await import("@tauri-apps/api/core");

  const [username, hostname] = await Promise.all([
    getOsUsername(invoke),
    getOsHostname(invoke),
  ]);
  return { username, hostname, identity: `${username}@${hostname}` };
}

async function getOsUsername(invoke: InvokeFn): Promise<string> {
  try {
    return await invoke<string>("get_os_username");
  } catch {
    return "unknown";
  }
}

async function getOsHostname(invoke: InvokeFn): Promise<string> {
  try {
    return await invoke<string>("get_hostname");
  } catch {
    return "unknown";
  }
}

