// src/pages/DamDetailPage/DamDetailPage.test.tsx
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

// --- Hoisted mocks (so factories can see them) ---
const apiMocks = vi.hoisted(() => ({
  useGetDamByIdQuery: vi.fn(),
}));
const rrdMocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

// --- Module mocks ---
vi.mock('../../services/damsApi', () => apiMocks);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: rrdMocks.useParams,
  };
});

// Stub the heavy chart components so Recharts doesn't render in tests
vi.mock('../../graphs/Graph1/Graph1', () => ({ default: () => <div>Graph 1 stub</div> }));
vi.mock('../../graphs/Graph2/Graph2', () => ({ default: () => <div>Graph 2 stub</div> }));
vi.mock('../../graphs/Graph3/Graph3', () => ({ default: () => <div>Graph 3 stub</div> }));
vi.mock('../../graphs/Graph4/Graph4', () => ({ default: () => <div>Graph 4 stub</div> }));

// --- Imports AFTER mocks are registered ---
import DamDetailPage from './DamDetailPage';
import { useParams } from 'react-router-dom';
import * as damsApi from '../../services/damsApi';

describe('DamDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useParams as unknown as Mock).mockReturnValue({ damId: 'WARR' });
  });

  it('shows Loading… while dam data is fetching and renders 4 graph panels with correct links', () => {
    (damsApi.useGetDamByIdQuery as unknown as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <DamDetailPage />
      </MemoryRouter>
    );

    // Back to Home link
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();

    // Title during loading
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    // Four panels linking to each graph
    const panels = screen.getAllByRole('link', { name: /open .* in full screen/i });
    expect(panels).toHaveLength(4);

    const hrefs = panels.map((a) => (a as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).toEqual([
      '/dams/WARR/graph/graph1',
      '/dams/WARR/graph/graph2',
      '/dams/WARR/graph/graph3',
      '/dams/WARR/graph/graph4',
    ]);

    // Stub content present
    expect(screen.getByText(/graph 1 stub/i)).toBeInTheDocument();
    expect(screen.getByText(/graph 2 stub/i)).toBeInTheDocument();
    expect(screen.getByText(/graph 3 stub/i)).toBeInTheDocument();
    expect(screen.getByText(/graph 4 stub/i)).toBeInTheDocument();
  });

  it('shows the dam name when loaded and panels remain correctly linked', () => {
    (damsApi.useGetDamByIdQuery as unknown as Mock).mockReturnValue({
      data: { dam_id: 'WARR', dam_name: 'Warragamba' },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <DamDetailPage />
      </MemoryRouter>
    );

    // Title becomes dam name
    expect(screen.getByText('Warragamba')).toBeInTheDocument();

    // Panels and links still correct
    const region = screen.getByRole('region', { name: /dam detail layout/i });
    const links = within(region).getAllByRole('link', { name: /open .* in full screen/i });
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/dams/WARR/graph/graph1');
    expect(links[1]).toHaveAttribute('href', '/dams/WARR/graph/graph2');
    expect(links[2]).toHaveAttribute('href', '/dams/WARR/graph/graph3');
    expect(links[3]).toHaveAttribute('href', '/dams/WARR/graph/graph4');
  });
});
