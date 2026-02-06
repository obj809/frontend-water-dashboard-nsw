// src/pages/AboutPage/AboutPage.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  useGetMetadataQuery: vi.fn(),
}));

vi.mock('../../services/damsApi', () => apiMocks);

import AboutPage from './AboutPage';
import * as damsApi from '../../services/damsApi';

describe('AboutPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders heading and content', () => {
    (damsApi.useGetMetadataQuery as unknown as Mock).mockReturnValue({
      data: null,
    });

    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /about this project/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/about page/i)).toBeInTheDocument();
    expect(screen.getByText(/WaterNSW manages key dams/i)).toBeInTheDocument();
  });

  it('includes the footer', () => {
    (damsApi.useGetMetadataQuery as unknown as Mock).mockReturnValue({
      data: null,
    });

    render(<AboutPage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays the latest data date when metadata is available', () => {
    (damsApi.useGetMetadataQuery as unknown as Mock).mockReturnValue({
      data: { latest_data_date: '2024-01-15' },
    });

    render(<AboutPage />);
    expect(screen.getByLabelText(/latest data date/i)).toBeInTheDocument();
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/15 Jan 2024/i)).toBeInTheDocument();
  });

  it('does not display the data date when metadata is not available', () => {
    (damsApi.useGetMetadataQuery as unknown as Mock).mockReturnValue({
      data: null,
    });

    render(<AboutPage />);
    expect(screen.queryByLabelText(/latest data date/i)).not.toBeInTheDocument();
  });

  it('does not display the data date when latest_data_date is null', () => {
    (damsApi.useGetMetadataQuery as unknown as Mock).mockReturnValue({
      data: { latest_data_date: null },
    });

    render(<AboutPage />);
    expect(screen.queryByLabelText(/latest data date/i)).not.toBeInTheDocument();
  });
});
