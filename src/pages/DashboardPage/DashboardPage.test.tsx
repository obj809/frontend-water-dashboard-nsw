// src/pages/DashboardPage/DashboardPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  useGetAllDamsQuery: vi.fn(),
  useGetAllLatestDataQuery: vi.fn(),
}));

vi.mock('../../graphs/DamStorageOverview/DamStorageOverview', () => ({
  default: () => <div>StorageGraph stub</div>,
}));

vi.mock('../../graphs/DamBubbleChart/DamBubbleChart', () => ({
  default: (props: any) => (
    <div data-testid="bubble-props">{JSON.stringify(props)}</div>
  ),
}));

vi.mock('../../graphs/DamBarChart/DamBarChart', () => ({
  default: (props: any) => (
    <div data-testid="bar-props">{JSON.stringify(props)}</div>
  ),
}));

vi.mock('../../services/damsApi', () => apiMocks);

import DashboardPage from './DashboardPage';
import * as damsApi from '../../services/damsApi';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (damsApi.useGetAllDamsQuery as unknown as Mock).mockReturnValue({
      data: [
        { dam_id: 'A', dam_name: 'Alpha', full_volume: 1000 },
        { dam_id: 'B', dam_name: 'Bravo', full_volume: 0 },
        { dam_id: 'C', dam_name: 'Charlie', full_volume: 2500 },
        { dam_id: 'D', dam_name: 'Delta', full_volume: null },
        { dam_id: 'E', dam_name: undefined, full_volume: 500 },
      ],
    });

    (damsApi.useGetAllLatestDataQuery as unknown as Mock).mockReturnValue({
      data: [
        { dam_id: 'A', storage_volume: 100 },
        { dam_id: 'C', storage_volume: 1250 },
      ],
    });
  });

  it('starts on the Bubble graph and cycles right through Storage → Bar → Bubble', () => {
    render(<DashboardPage />);

    const bubbleNode = screen.getByTestId('bubble-props');
    expect(bubbleNode).toBeInTheDocument();
    expect(screen.queryByText(/storagegraph stub/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('bar-props')).not.toBeInTheDocument();

    const bubbleProps = JSON.parse(bubbleNode.textContent || '{}');
    const bubbleIds = (bubbleProps.data || []).map((d: any) => d.dam_id);
    expect(bubbleIds).toEqual(['A', 'C', 'E']);
    const capById: Record<string, number> = {};
    for (const d of bubbleProps.data) capById[d.dam_id] = d.capacity;
    expect(capById).toEqual({ A: 1000, C: 2500, E: 500 });

    fireEvent.click(screen.getByRole('button', { name: /next graph/i }));
    expect(screen.getByText(/storagegraph stub/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next graph/i }));
    const barNode = screen.getByTestId('bar-props');
    expect(barNode).toBeInTheDocument();

    const barProps = JSON.parse(barNode.textContent || '{}');
    const barIds = (barProps.data || []).map((d: any) => d.dam_id);
    expect(barIds).toEqual(['A', 'C']); // Only dams with latest_data
    const filledById: Record<string, number> = {};
    for (const d of (barProps.data || [])) filledById[d.dam_id] = d.filled;
    expect(filledById).toEqual({ A: 100, C: 1250 });

    fireEvent.click(screen.getByRole('button', { name: /next graph/i }));
    expect(screen.getByTestId('bubble-props')).toBeInTheDocument();
  });

  it('cycles left (wrap) from Bubble to Bar', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('bubble-props')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous graph/i }));
    expect(screen.getByTestId('bar-props')).toBeInTheDocument();
  });
});
