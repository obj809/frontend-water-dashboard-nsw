// src/components/SearchBar/SearchBar.test.tsx
import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SearchBar from './SearchBar';

vi.mock('../../services/damsApi', () => ({
  useGetAllDamsQuery: () => ({
    isLoading: false,
    data: [
      { dam_id: 'WARR', dam_name: 'Warragamba' },
      { dam_id: 'SHOL', dam_name: 'Shoalhaven' },
      { dam_id: 'NEPE', dam_name: 'Nepean' },
    ],
  }),
}));

function Harness({
  onSearch = vi.fn(),
  autoFocus = true,
}: {
  onSearch?: (q: string) => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState('');
  return (
    <div>
      <SearchBar
        value={value}
        onChange={setValue}
        onSearch={onSearch}
        autoFocus={autoFocus}
      />
      <button aria-label="outside" />
    </div>
  );
}

describe('SearchBar', () => {
  it('filters as you type and ArrowDown + Enter selects the active option (calls onSearch with dam_id)', async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /search for a dam/i });
    await userEvent.click(input);
    await userEvent.type(input, 'warr');

    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getAllByRole('option').length).toBe(1);
    expect(within(listbox).getByRole('option', { name: /warragamba/i })).toBeInTheDocument();

    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('WARR');

    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('pressing Enter with no active option searches the raw typed query', async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /search for a dam/i });
    await userEvent.click(input);
    await userEvent.type(input, 'unknown-123');
    await userEvent.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('unknown-123');
  });

  it('Escape closes and clears; click outside closes and clears', async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    const input = screen.getByRole('textbox', { name: /search for a dam/i });
    await userEvent.click(input);
    await userEvent.type(input, 'sho');

    await userEvent.keyboard('{Escape}');
    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.click(input);
    await userEvent.type(input, 'nep');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /outside/i }));
    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    expect(onSearch).not.toHaveBeenCalled();
  });
});
