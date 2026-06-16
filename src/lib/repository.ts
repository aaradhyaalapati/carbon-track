import type { HistoryEntry } from './schemas';
import { db } from './firebase';

export interface EntryRepository {
  getEntries(deviceId: string, limit: number): Promise<HistoryEntry[]>;
  saveEntry(deviceId: string, entry: HistoryEntry): Promise<{ success: true; duplicate?: boolean }>;
}

class FirestoreEntryRepository implements EntryRepository {
  async getEntries(deviceId: string, limit: number): Promise<HistoryEntry[]> {
    const snapshot = await db.collection('entries')
      .where('deviceId', '==', deviceId)
      .orderBy('timestamp', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => doc.data() as HistoryEntry);
  }

  async saveEntry(deviceId: string, entry: HistoryEntry): Promise<{ success: true; duplicate?: boolean }> {
    const lastSnapshot = await db.collection('entries')
      .where('deviceId', '==', deviceId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (!lastSnapshot.empty) {
      const lastDoc = lastSnapshot.docs[0];
      if (lastDoc) {
        const lastEntry = lastDoc.data();
        if (lastEntry.totalKg === entry.totalKg) {
          return { success: true, duplicate: true };
        }
      }
    }

    await db.collection('entries').add({
      deviceId,
      ...entry,
      timestamp: new Date().toISOString()
    });
    return { success: true };
  }
}

class InMemoryEntryRepository implements EntryRepository {
  private entries: Array<HistoryEntry & { deviceId: string; timestamp: string }> = [];

  async getEntries(deviceId: string, limit: number): Promise<HistoryEntry[]> {
    const userEntries = this.entries
      .filter(e => e.deviceId === deviceId)
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
      .slice(0, limit);
    return userEntries;
  }

  async saveEntry(deviceId: string, entry: HistoryEntry): Promise<{ success: true; duplicate?: boolean }> {
    const userEntries = this.entries
      .filter(e => e.deviceId === deviceId)
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    
    if (userEntries.length > 0) {
      const firstEntry = userEntries[0];
      if (firstEntry && firstEntry.totalKg === entry.totalKg) {
        return { success: true, duplicate: true };
      }
    }

    this.entries.push({
      deviceId,
      ...entry,
      timestamp: new Date().toISOString()
    });
    return { success: true };
  }
}

let repositoryInstance: EntryRepository | undefined;

export function getRepository(): EntryRepository {
  if (!repositoryInstance) {
    if (process.env.USE_FIRESTORE === 'false') {
      repositoryInstance = new InMemoryEntryRepository();
    } else {
      repositoryInstance = new FirestoreEntryRepository();
    }
  }
  return repositoryInstance;
}
