import type { JSX } from 'react';
import { formatCo2, formatNumber, formatPercent, formatTonnes, type FootprintResult, type TargetComparison, type AverageComparison } from '@/lib';
import { REGION_LABELS } from '@/components/labels';
import { StatCard } from './StatCard';
import { ComparisonCard } from './ComparisonCard';

export interface DashboardOverviewProps {
  result: FootprintResult;
  region: keyof typeof REGION_LABELS;
  target: TargetComparison;
  average: AverageComparison;
}

export function DashboardOverview({
  result,
  region,
  target,
  average,
}: DashboardOverviewProps): JSX.Element {
  const targetHeadline =
    target.ratio <= 1 ? 'Within the target' : `${formatNumber(target.ratio, 2)}× the target`;
  const averageHeadline = `${formatPercent(average.percentOfAverage)} of average`;

  return (
    <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
      <h2 id="overview-heading" className="sr-only">
        Footprint overview
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Annual footprint" value={formatCo2(result.totalKg)} icon="leaf">
          <p className="text-sm text-ink/80">
            Across transport, home energy, food, and shopping in {REGION_LABELS[region]}.
          </p>
        </StatCard>
        <ComparisonCard
          title="Vs. 1.5°C target"
          status={target.status}
          headline={targetHeadline}
          detail={`Your ${formatTonnes(result.totalTonnes)} compared with a ${formatTonnes(
            target.target,
          )} science-based personal target.`}
        />
        <ComparisonCard
          title={`Vs. ${REGION_LABELS[region]}`}
          status={average.status}
          headline={averageHeadline}
          detail={`The average person there emits about ${formatTonnes(average.average)} per year.`}
        />
      </div>
    </section>
  );
}
