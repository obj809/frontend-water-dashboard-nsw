// src/components/Footer/Footer.test.tsx
import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  beforeAll(() => {
    // Freeze time so the year is deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-22T00:00:00+10:00')); // pick any date you like
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders a contentinfo landmark with the current year', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Year comes from new Date().getFullYear()
    expect(
      screen.getByText(/© 2025 Water Dashboard NSW/i)
    ).toBeInTheDocument();
  });

  it('renders external links with correct attributes', () => {
    render(<Footer />);

    const nav = screen.getByRole('navigation', { name: /external links/i });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(3);

    const openData = within(nav).getByRole('link', { name: /NSW Open Data API/i });
    const waterNSW = within(nav).getByRole('link', { name: /WaterNSW/i });
    const github = within(nav).getByRole('link', { name: /GitHub/i });

    expect(openData).toHaveAttribute('href', 'https://api.nsw.gov.au/Product/Index/26');
    expect(waterNSW).toHaveAttribute('href', 'https://www.waternsw.com.au/');
    expect(github).toHaveAttribute('href', 'https://github.com/cyberforge1/SydneyDamMonitoring');

    for (const a of [openData, waterNSW, github]) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
