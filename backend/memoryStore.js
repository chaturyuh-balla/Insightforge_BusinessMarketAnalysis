export const memory = {
  users: [],
  sessions: [],
  reports: []
};

export function createId() {
  return globalThis.crypto.randomUUID();
}
