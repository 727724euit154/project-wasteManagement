/** Returns the current tab's logged-in user email (sessionStorage first, then localStorage fallback) */
export function currentEmail(): string {
  const e = sessionStorage.getItem('cwi_email') || localStorage.getItem('user_email') || 'guest';
  return e.toLowerCase();
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
