/** Returns the current logged-in user's email (lowercase) */
export function currentEmail(): string {
  return (localStorage.getItem('user_email') || 'guest').toLowerCase();
}

/** Namespaced key: e.g. "purchased_listings" → "cwi:user@x.com:purchased_listings" */
function key(name: string): string {
  return `cwi:${currentEmail()}:${name}`;
}

export function getStore<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function setStore<T>(name: string, value: T): void {
  localStorage.setItem(key(name), JSON.stringify(value));
}
