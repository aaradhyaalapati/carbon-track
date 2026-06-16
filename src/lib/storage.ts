import { type z } from 'zod';
import { footprintInputSchema, goalSchema, type FootprintInput, type Goal } from './schemas';

/**
 * Safe localStorage layer.
 *
 * SECURITY: localStorage is treated as UNTRUSTED. Every value read back is parsed
 * and validated against its Zod schema; anything malformed, tampered with, or of
 * the wrong shape fails closed (returns null / empty), never throwing into the UI.
 * All access is also guarded so the module is safe to import during SSR, in private
 * browsing, or when storage is disabled or over quota.
 */

const KEYS = {
  input: 'carbontrack:input',
  goal: 'carbontrack:goal',
  deviceId: 'carbontrack:deviceId',
} as const;

function getStorage(): Storage | null {
  try {
    const g = globalThis as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    // Accessing localStorage can throw in sandboxed iframes / strict privacy modes.
    return null;
  }
}

/** True when localStorage is usable in this environment (false during SSR, private modes, etc.). */
export function isStorageAvailable(): boolean {
  return getStorage() !== null;
}

function writeRaw(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // e.g. QuotaExceededError
    return false;
  }
}

function readValidated<S extends z.ZodTypeAny>(key: string, schema: S): z.infer<S> | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    // Invalid JSON, etc.
    return null;
  }
}

function removeRaw(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/** Persist the questionnaire input; returns false if storage is unavailable or full. */
export function saveInput(input: FootprintInput): boolean {
  return writeRaw(KEYS.input, input);
}

/** Load the saved questionnaire input, or null if missing or invalid. */
export function loadInput(): FootprintInput | null {
  return readValidated(KEYS.input, footprintInputSchema);
}

/** Persist the reduction goal; returns false if storage is unavailable or full. */
export function saveGoal(goal: Goal): boolean {
  return writeRaw(KEYS.goal, goal);
}

/** Load the saved reduction goal, or null if missing or invalid. */
export function loadGoal(): Goal | null {
  return readValidated(KEYS.goal, goalSchema);
}

/** Remove any saved reduction goal. */
export function clearGoal(): void {
  removeRaw(KEYS.goal);
}

/** Get or generate a persistent device ID for anonymous tracking. */
export function getDeviceId(): string | null {
  const storage = getStorage();
  if (!storage) return null;

  let id = storage.getItem(KEYS.deviceId);
  if (!id) {
    id = crypto.randomUUID();
    storage.setItem(KEYS.deviceId, id);
  }
  return id;
}

export { KEYS as STORAGE_KEYS };
