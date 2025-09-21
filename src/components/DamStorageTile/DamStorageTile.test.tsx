import React from 'react';
import { renderUI, screen } from '../../test/utils';
import DamStorageTile from './DamStorageTile';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) =>
  renderUI(<MemoryRouter>{ui}</MemoryRouter>);

test('shows clamped percentage and proper aria-label', () => {
  renderWithRouter(<DamStorageTile damId="WARR" name="Warragamba" pct={132} />);
  expect(
    screen.getByRole('link', { name: /Warragamba: 100% full/i })
  ).toBeInTheDocument();

  expect(screen.getByText('100%')).toBeInTheDocument();
});

test('renders em dash when pct is null', () => {
  renderWithRouter(<DamStorageTile damId="WARR" name="Warragamba" pct={null} />);
  expect(
    screen.getByRole('link', { name: /No data/i })
  ).toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();
});
