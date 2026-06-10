import type { JSX } from 'react';
import { Card } from '@/components/ui';
import { CategoryBarChart, CategoryDonutChart } from '@/components/charts/lazy';
import type { CategoryShare } from '@/lib/breakdown';

export interface DashboardBreakdownProps {
  breakdown: CategoryShare[];
}

export function DashboardBreakdown({ breakdown }: DashboardBreakdownProps): JSX.Element {
  return (
    <section aria-labelledby="breakdown-heading" className="flex flex-col gap-4">
      <h2 id="breakdown-heading" className="font-display text-2xl font-bold text-ink">
        Where it comes from
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-ink">By category</h3>
          <CategoryBarChart breakdown={breakdown} />
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold text-ink">Share of total</h3>
          <CategoryDonutChart breakdown={breakdown} />
        </Card>
      </div>
    </section>
  );
}
