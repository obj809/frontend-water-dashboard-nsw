// src/pages/DamGraphPage/DamGraphPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

const rrdMocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('../../graphs/Graph1/Graph1', () => ({ default: () => <div>Graph 1 stub</div> }));
vi.mock('../../graphs/Graph2/Graph2', () => ({ default: () => <div>Graph 2 stub</div> }));
vi.mock('../../graphs/Graph3/Graph3', () => ({ default: () => <div>Graph 3 stub</div> }));
vi.mock('../../graphs/Graph4/Graph4', () => ({ default: () => <div>Graph 4 stub</div> }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: rrdMocks.useParams,
    useNavigate: rrdMocks.useNavigate,
  };
});

import DamGraphPage from './DamGraphPage';
import { useParams, useNavigate, MemoryRouter } from 'react-router-dom';

describe('DamGraphPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the correct graph when graphId is valid', () => {
    (useParams as unknown as Mock).mockReturnValue({ damId: 'WARR', graphId: 'graph1' });
    (useNavigate as unknown as Mock).mockReturnValue(vi.fn());

    render(
      <MemoryRouter initialEntries={['/dams/WARR/graph/graph1']}>
        <DamGraphPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/graph 1 stub/i)).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back to dam/i });
    expect(backLink).toHaveAttribute('href', '/dams/WARR');
  });

  it('renders fallback when graphId is unknown and navigates back on click', () => {
    const mockNavigate = vi.fn();
    (useParams as unknown as Mock).mockReturnValue({ damId: 'WARR', graphId: 'badgraph' });
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter initialEntries={['/dams/WARR/graph/badgraph']}>
        <DamGraphPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/unknown graph/i)).toBeInTheDocument();
    expect(screen.getByText(/badgraph/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
