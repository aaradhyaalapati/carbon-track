import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultFootprintInput } from '@/lib';
import type { TransportInput } from '@/components/calculator/validation';
import { TransportStep } from '@/components/calculator/steps/TransportStep';

function renderTransport(overrides: Partial<TransportInput> = {}) {
  const onChange = vi.fn();
  const value: TransportInput = { ...defaultFootprintInput.transport, ...overrides };
  render(<TransportStep value={value} onChange={onChange} errors={{}} />);
  return { onChange };
}

describe('TransportStep', () => {
  it('calls onChange with updated carFuel', async () => {
    const user = userEvent.setup();
    const { onChange } = renderTransport({ carFuel: 'petrol' });

    await user.selectOptions(screen.getByLabelText(/what do you drive/i), 'electric');

    expect(onChange).toHaveBeenCalledWith({ carFuel: 'electric' });
  });

  it('calls onChange with updated carKmPerWeek', async () => {
    const { onChange } = renderTransport({ carKmPerWeek: 100 });

    const input = screen.getByLabelText(/distance driven/i);
    fireEvent.change(input, { target: { value: '150' } });

    // The component might call onChange for each keystroke or once. We just check the final expected value.
    expect(onChange).toHaveBeenLastCalledWith({ carKmPerWeek: 150 });
  });
});
