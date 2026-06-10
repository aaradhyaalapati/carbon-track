import type { JSX } from 'react';
import { Card } from '@/components/ui';
import { HistoryTrendChart } from '@/components/charts/lazy';
import type { HistoryEntry } from '@/lib';

export interface DashboardHistoryProps {
  history: HistoryEntry[];
}

export function DashboardHistory({ history }: DashboardHistoryProps): JSX.Element {
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
