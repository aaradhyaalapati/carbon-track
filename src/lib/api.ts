import type { FootprintInput, FootprintResult, HistoryEntry } from './schemas';
import type { Tip } from './tips-engine';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(res.status, `Request to ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export function getInsights(input: FootprintInput, result: FootprintResult): Promise<{ recommendations: Tip[]; source: 'gemini' | 'rules' }> {
  return postJson('/api/insights', { input, result });
}

export function saveEntry(deviceId: string, entry: HistoryEntry): Promise<{ success: boolean; duplicate?: boolean }> {
  return postJson('/api/entries', { deviceId, entry });
}

export async function listEntries(deviceId: string): Promise<{ entries: HistoryEntry[] }> {
  const res = await fetch(`/api/entries?deviceId=${encodeURIComponent(deviceId)}`);
  if (!res.ok) {
    throw new ApiError(res.status, `Failed to load history (${res.status})`);
  }
  return (await res.json()) as { entries: HistoryEntry[] };
}
