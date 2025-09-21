import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

// Hoisted mock for react-router-dom hooks
const rrdMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
}));

// Stub the SearchBar to a simple button that calls onSearch('WARR')
vi.mock('../../components/SearchBar/SearchBar', () => ({
  default: (props: any) => (
    <div data-testid="searchbar-stub">
      <button onClick={() => props.onSearch('WARR')}>Search now</button>
    </div>
  ),
}));

// Keep actual router components, but override hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: rrdMocks.useNavigate,
  };
});

import HomePage from './HomePage';
import { MemoryRouter, useNavigate } from 'react-router-dom';

describe('HomePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders heading, subtitle and background video', () => {
    (useNavigate as unknown as Mock).mockReturnValue(vi.fn());

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /water dashboard nsw/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/recent and historical data on dams/i)
    ).toBeInTheDocument();

    // Assert background video exists by class (no unused variable)
    expect(document.querySelector('video.home-bg-video')).toBeTruthy();
  });

  it('navigates to the dam detail page when SearchBar triggers onSearch', () => {
    const mockNavigate = vi.fn();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    );

    // Our stubbed SearchBar renders a button that calls onSearch('WARR')
    fireEvent.click(screen.getByRole('button', { name: /search now/i }));

    // Should navigate to encoded route
    expect(mockNavigate).toHaveBeenCalledWith('/dams/WARR');
  });
});
