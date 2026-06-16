import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  STORAGE_KEYS,
  clearGoal,
  isStorageAvailable,
  loadGoal,
  loadInput,
  saveGoal,
  saveInput,
  getDeviceId,
} from '@/lib/storage';
import { defaultFootprintInput, type Goal } from '@/lib/schemas';

function createMockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  };
}

const globalRef = globalThis as { localStorage?: Storage };
let original: Storage | undefined;

beforeEach(() => {
  original = globalRef.localStorage;
  globalRef.localStorage = createMockStorage();

  // Also mock crypto.randomUUID for getDeviceId
  if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    Object.defineProperty(crypto, 'randomUUID', {
      value: () => 'test-uuid-1234',
      configurable: true,
    });
  } else if (typeof crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: () => 'test-uuid-1234' },
      configurable: true,
    });
  }
});

afterEach(() => {
  if (original === undefined) {
    delete globalRef.localStorage;
  } else {
    globalRef.localStorage = original;
  }
});

describe('storage availability', () => {
  it('reports available when localStorage exists', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('fails closed when storage is unavailable', () => {
    delete globalRef.localStorage;
    expect(isStorageAvailable()).toBe(false);
    expect(loadInput()).toBeNull();
    expect(saveInput(defaultFootprintInput)).toBe(false);
    expect(getDeviceId()).toBeNull();
  });
});

describe('input persistence', () => {
  it('returns null when nothing is stored', () => {
    expect(loadInput()).toBeNull();
  });

  it('round-trips a valid input', () => {
    expect(saveInput(defaultFootprintInput)).toBe(true);
    expect(loadInput()).toEqual(defaultFootprintInput);
  });

  it('returns null for tampered (invalid JSON) data', () => {
    globalRef.localStorage?.setItem(STORAGE_KEYS.input, '{not valid json');
    expect(loadInput()).toBeNull();
  });

  it('returns null for well-formed JSON with the wrong shape', () => {
    globalRef.localStorage?.setItem(STORAGE_KEYS.input, JSON.stringify({ foo: 'bar' }));
    expect(loadInput()).toBeNull();
  });
});

describe('goal persistence', () => {
  it('saves, loads, and clears a goal', () => {
    const goal: Goal = { targetTonnes: 2, baselineTonnes: 5, createdAt: '2026-01-01' };
    expect(saveGoal(goal)).toBe(true);
    expect(loadGoal()).toEqual(goal);
    clearGoal();
    expect(loadGoal()).toBeNull();
  });
});

describe('device id generation', () => {
  it('generates and saves a device id if none exists', () => {
    const id = getDeviceId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(globalRef.localStorage?.getItem(STORAGE_KEYS.deviceId)).toBe(id);
  });

  it('loads an existing device id', () => {
    globalRef.localStorage?.setItem(STORAGE_KEYS.deviceId, 'existing-uuid-5678');
    const id = getDeviceId();
    expect(id).toBe('existing-uuid-5678');
  });
});

describe('hostile environments', () => {
  it('fails closed when accessing localStorage itself throws', () => {
    // Strict privacy modes / sandboxed iframes throw on property access.
    delete globalRef.localStorage;
    Object.defineProperty(globalRef, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('denied');
      },
    });
    try {
      expect(isStorageAvailable()).toBe(false);
      expect(loadInput()).toBeNull();
      expect(saveInput(defaultFootprintInput)).toBe(false);
    } finally {
      delete globalRef.localStorage;
    }
  });

  it('returns false when writes throw (e.g. quota exceeded)', () => {
    const storage = createMockStorage();
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    globalRef.localStorage = storage;
    expect(saveInput(defaultFootprintInput)).toBe(false);
  });

  it('returns null when reads throw', () => {
    const storage = createMockStorage();
    storage.getItem = () => {
      throw new Error('SecurityError');
    };
    globalRef.localStorage = storage;
    expect(loadGoal()).toBeNull();
  });

  it('swallows errors when removal throws', () => {
    const storage = createMockStorage();
    storage.removeItem = () => {
      throw new Error('SecurityError');
    };
    globalRef.localStorage = storage;
    expect(() => clearGoal()).not.toThrow();
  });
});

describe('removal without storage', () => {
  it('is a safe no-op when storage is unavailable', () => {
    delete globalRef.localStorage;
    expect(() => {
      clearGoal();
    }).not.toThrow();
  });
});
