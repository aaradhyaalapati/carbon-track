import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultFootprintInput } from '@/lib';
import type { FoodInput } from '@/components/calculator/validation';
import { FoodStep } from '@/components/calculator/steps/FoodStep';

function renderFood(overrides: Partial<FoodInput> = {}) {
  const onChange = vi.fn();
  const value: FoodInput = { ...defaultFootprintInput.food, ...overrides };
  render(<FoodStep value={value} onChange={onChange} errors={{}} />);
  return { onChange };
}

describe('FoodStep', () => {
  it('calls onChange with updated diet', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFood({ diet: 'high_meat' });

    // Click the "Vegan" radio option. The exact label text comes from DIET_LABELS.
    await user.click(screen.getByLabelText(/vegan/i));

    expect(onChange).toHaveBeenCalledWith({ diet: 'vegan' });
  });

  it('calls onChange with updated food waste', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFood({ foodWaste: 'high' });

    // Click the "Low" option.
    await user.click(screen.getByLabelText(/low — i rarely waste food/i));

    expect(onChange).toHaveBeenCalledWith({ foodWaste: 'low' });
  });
});
