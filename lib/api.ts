// Thin fetch wrapper over the markcmo.com Netlify functions.
// On iOS, React Native's fetch uses NSURLSession's shared cookie storage, so the
// HttpOnly `mcadmin_session` cookie set by admin-auth.js is stored and replayed
// automatically (same as a native URLSession). We just pass credentials: include.

export const BASE = 'https://markcmo.com';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j.error || j.reason || j.message || `Request failed (${res.status})`;
  } catch {
    if (res.status === 401) return 'Not authorized. Please sign in again.';
    return `Request failed (${res.status})`;
  }
}

export async function apiGet<T>(path: string, query?: Record<string, string>): Promise<T> {
  const qs = query
    ? '?' + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : '';
  const res = await fetch(BASE + path + qs, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return (await res.json()) as T;
}

export function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
