import { type JSX, useEffect, useState } from 'react';
import type { Tip } from '@/lib/tips-engine';
import { Card, Icon } from '@/components/ui';
import type { FootprintInput, FootprintResult } from '@/lib/schemas';
import { TipCard } from './TipCard';

export interface DashboardTipsProps {
  input: FootprintInput;
  result: FootprintResult;
}

export function DashboardTips({ input, result }: DashboardTipsProps): JSX.Element {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'gemini' | 'rules'>('rules');

  useEffect(() => {
    async function fetchTips() {
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, result })
        });
        const data = await response.json();
        if (data.recommendations) {
          setTips(data.recommendations);
          setSource(data.source);
        }
      } catch (err) {
        console.error('Failed to fetch insights', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTips();
  }, [input, result]);

  if (loading) {
    return (
      <section aria-labelledby="tips-heading" className="flex flex-col gap-4">
        <h2 id="tips-heading" className="font-display text-2xl font-bold text-ink">
          Your highest-impact actions
        </h2>
        <Card className="h-32 animate-pulse bg-primary/5" />
      </section>
    );
  }

  return (
    <section aria-labelledby="tips-heading" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 id="tips-heading" className="font-display text-2xl font-bold text-ink">
          Your highest-impact actions
        </h2>
        {source === 'gemini' && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <Icon name="spark" size={14} /> AI Generated
          </span>
        )}
      </div>
      {tips.length > 0 ? (
        <ol className="grid gap-3 md:grid-cols-2">
          {tips.map((tip, i) => (
            <TipCard key={tip.id} tip={tip} rank={i + 1} />
          ))}
        </ol>
      ) : (
        <Card className="flex items-center gap-3">
          <Icon name="check" size={22} className="text-primary" />
          <p className="text-ink/80">
            Your profile is already very low-impact — there are no major reductions left to suggest.
            Nicely done.
          </p>
        </Card>
      )}
    </section>
  );
}
