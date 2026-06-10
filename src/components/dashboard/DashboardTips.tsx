import type { JSX } from 'react';
import type { Tip } from '@/lib/tips-engine';
import { Card, Icon } from '@/components/ui';
import { TipCard } from './TipCard';

export interface DashboardTipsProps {
  tips: Tip[];
}

export function DashboardTips({ tips }: DashboardTipsProps): JSX.Element {
  return (
    <section aria-labelledby="tips-heading" className="flex flex-col gap-4">
      <h2 id="tips-heading" className="font-display text-2xl font-bold text-ink">
        Your highest-impact actions
      </h2>
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
