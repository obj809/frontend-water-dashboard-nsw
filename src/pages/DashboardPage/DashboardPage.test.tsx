import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

// --- Hoisted mocks for the data hooks ---
const apiMocks = vi.hoisted(() => ({
  useGetAllDamsQuery: vi.fn(),
  useGetAllLatestDataQuery: vi.fn(),
}));

// --- Stub the graphs ---
// StorageGraph can just render a stub string
vi.mock('../../graphs/DamStorageOverview/DamStorageOverview', () => ({
  default: () => <div>StorageGraph stub</div>,
}));

// Bubble and Bar graphs: render the received props as JSON so we can assert on them
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

// --- Mock the API module to use the hoisted fns ---
vi.mock('../../services/damsApi', () => apiMocks);

// Import after mocks
import DashboardPage from './DashboardPage';
import * as damsApi from '../../services/damsApi';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default datasets — you can tweak per test if needed
    (damsApi.useGetAllDamsQuery as unknown as Mock).mockReturnValue({
      data: [
        { dam_id: 'A', dam_name: 'Alpha', full_volume: 1000 },
        { dam_id: 'B', dam_name: 'Bravo', full_volume: 0 },        // filtered out (<= 0)
        { dam_id: 'C', dam_name: 'Charlie', full_volume: 2500 },
        { dam_id: 'D', dam_name: 'Delta', full_volume: null },     // filtered out (falsy)
        { dam_id: 'E', dam_name: undefined, full_volume: 500 },    // uses dam_id as name fallback
      ],
    });

    (damsApi.useGetAllLatestDataQuery as unknown as Mock).mockReturnValue({
      data: [
        { dam_id: 'A', storage_volume: 100 }, // 10% of 1000
        { dam_id: 'C', storage_volume: 1250 },// 50% of 2500
        // E missing → falls back to 0
      ],
    });
  });

  it('starts on the Storage graph and cycles right through Bubble → Bar → Storage', () => {
    render(<DashboardPage />);

    // Initially the Storage graph stub should be visible
    expect(screen.getByText(/storagegraph stub/i)).toBeInTheDocument();
    expect(screen.queryByTestId('bubble-props')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bar-props')).not.toBeInTheDocument();

    // Click right → should show Bubble (index 1)
    fireEvent.click(screen.getByRole('button', { name: /next graph/i }));
    const bubbleNode = screen.getByTestId('bubble-props');
    expect(bubbleNode).toBeInTheDocument();

    // Assert bubble data transformation (only dams with full_volume > 0, capacity = full_volume)
    const bubbleProps = JSON.parse(bubbleNode.textContent || '{}');
    // Expect ids A, C, E only
    const bubbleIds = (bubbleProps.data || []).map((d: any) => d.dam_id);
    expect(bubbleIds).toEqual(['A', 'C', 'E']);
    // Capacity numbers
    const capById: Record<string, number> = {};
    for (const d of bubbleProps.data) capById[d.dam_id] = d.capacity;
    expect(capById).toEqual({ A: 1000, C: 2500, E: 500 });

    // Click right → should show Bar (index 2)
    fireEvent.click(screen.getByRole('button', { name: /next graph/i }));
    const barNode = screen.getByTestId('bar-props');
    expect(barNode).toBeInTheDocument();

    // Assert bar data transformation (join latest by id, filled from storage_volume)
    const barProps = JSON.parse(barNode.textContent || '{}');
    // A, C, E present
    const barIds = (barProps.data || []).map((d: any) => d.dam_id);
    expect(barIds).toEqual(['A', 'C', 'E']);
    // Filled should come from latest (A=100, C=1250, E missing → 0)
    const filledById: Record<string, number> = {};
    for (const d of (barProps.data || [])) filledById[d.dam_id] = d.filled;
    expect(filledById).toEqual({ A: 100, C: 1250, E: 0 });

    // Click right → wrap back to Storage (index 0)
    fireEvent.click(screen.getByRole('button', { name: /next graph/i }));
    expect(screen.getByText(/storagegraph stub/i)).toBeInTheDocument();
  });

  it('cycles left (wrap) from Storage to Bar', () => {
    render(<DashboardPage />);

    // Initially Storage
    expect(screen.getByText(/storagegraph stub/i)).toBeInTheDocument();

    // Click left → wrap to last (Bar)
    fireEvent.click(screen.getByRole('button', { name: /previous graph/i }));
    expect(screen.getByTestId('bar-props')).toBeInTheDocument();
  });
});
