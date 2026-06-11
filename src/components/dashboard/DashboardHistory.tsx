import { type JSX, useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { HistoryTrendChart } from '@/components/charts/lazy';
import type { HistoryEntry } from '@/lib';
import { getDeviceId } from '@/lib/storage';

export interface DashboardHistoryProps {
  // history is now fetched internally, but we can accept a footprint result to save the current entry
  currentEntry?: HistoryEntry;
}

export function DashboardHistory({ currentEntry }: DashboardHistoryProps): JSX.Element {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncHistory() {
      const deviceId = getDeviceId();
      if (!deviceId) {
        setLoading(false);
        return;
      }

      try {
        // Save the current entry if provided
        if (currentEntry) {
          await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, entry: currentEntry })
          });
        }

        // Fetch the full history
        const response = await fetch(`/api/entries?deviceId=${deviceId}`);
        const data = await response.json();
        if (data.entries) {
          setHistory(data.entries);
        }
      } catch (err) {
        console.error('Failed to sync history', err);
      } finally {
        setLoading(false);
      }
    }
    syncHistory();
  }, [currentEntry]);

  if (loading) {
    return (
      <section aria-labelledby="history-heading" className="flex flex-col gap-4">
        <h2 id="history-heading" className="font-display text-2xl font-bold text-ink">
          Your progress over time
        </h2>
        <Card className="h-48 animate-pulse bg-primary/5" />
      </section>
    );
  }

  return (
    <section aria-labelledby="history-heading" className="flex flex-col gap-4">
      <h2 id="history-heading" className="font-display text-2xl font-bold text-ink">
        Your progress over time
      </h2>
      <Card>
        {history.length > 0 ? (
          <HistoryTrendChart history={history} />
        ) : (
          <p className="text-ink/80">
            Recalculate periodically to build a trend line and watch your footprint change.
          </p>
        )}
      </Card>
    </section>
  );
}
