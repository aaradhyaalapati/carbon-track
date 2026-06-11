/* eslint-disable @typescript-eslint/consistent-type-imports */
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';

// We need to isolate modules to mock properly, but simple mocks work too
vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({ collection: vi.fn() })),
}));

describe('firebase', () => {
  let app: typeof import('firebase-admin/app');
  let firestore: typeof import('firebase-admin/firestore');

  beforeEach(async () => {
    app = await import('firebase-admin/app');
    firestore = await import('firebase-admin/firestore');
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('exports db instance', async () => {
    vi.mocked(app.getApps).mockReturnValue([]);
    const { db } = await import('@/lib/firebase');
    expect(db).toBeDefined();
    expect(firestore.getFirestore).toHaveBeenCalled();
  });
});
