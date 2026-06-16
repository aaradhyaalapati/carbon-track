import type { JSX } from 'react';
import {
  calculateFootprint,
  categoryBreakdown,
  compareToAverage,
  compareToTarget,
  type FootprintInput,
} from '@/lib';
import { ButtonLink, Icon } from '@/components/ui';
import { GoalTracker } from './GoalTracker';
import { DashboardOverview } from './DashboardOverview';
import { DashboardBreakdown } from './DashboardBreakdown';
import { DashboardTips } from './DashboardTips';
import { DashboardHistory } from './DashboardHistory';

export interface DashboardViewProps {
  input: FootprintInput;
}

/**
 * The full results view, pure in its props. All numbers come from `@/lib`; this
 * component only arranges and delegates to smaller section components.
 * Splitting it out from the localStorage loading shell keeps it deterministic
 * and straightforward to unit test.
 */
export function DashboardView({ input }: DashboardViewProps): JSX.Element {
  const result = calculateFootprint(input);
  const breakdown = categoryBreakdown(result);
  const target = compareToTarget(result.totalTonnes);
  const average = compareToAverage(result.totalTonnes, input.region);
  const currentEntry = {
    date: new Date().toISOString(),
    totalKg: result.totalKg,
    totalTonnes: result.totalTonnes,
  };

  return (
    <div className="flex flex-col gap-10">
      <DashboardOverview result={result} region={input.region} target={target} average={average} />

      <DashboardBreakdown breakdown={breakdown} />

      <section aria-labelledby="goal-heading" className="flex flex-col gap-4">
        <h2 id="goal-heading" className="font-display text-2xl font-bold text-ink">
          Track a goal
        </h2>
        <GoalTracker currentTonnes={result.totalTonnes} />
      </section>

      <DashboardTips input={input} result={result} />

      <DashboardHistory currentEntry={currentEntry} />

      <div className="flex justify-center">
        <ButtonLink href="/calculator" variant="secondary" size="lg">
          <Icon name="arrow-left" size={18} />
          Update my answers
        </ButtonLink>
      </div>
    </div>
  );
}
