export function getWsUrl(baseUrl: string, identity: string): string {
  const host = baseUrl.replace(/^http/, "ws");
  return `${host}/api/chat/ws?identity=${encodeURIComponent(identity)}`;
}
