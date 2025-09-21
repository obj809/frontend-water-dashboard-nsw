// src/components/SearchBar/SearchBar.tsx

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import './SearchBar.scss';
import { useGetAllDamsQuery } from '../../services/damsApi';
import type { Dam } from '../../types/types';

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  buttonLabel?: string;
  autoFocus?: boolean;
  className?: string;
};

const normalize = (s: string) => s.toLowerCase().trim();

const SearchBar: React.FC<Props> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search for a dam…',
  ariaLabel = 'Search for a dam',
  buttonLabel = 'Search',
  autoFocus = false,
  className,
}) => {
  const { data: dams = [], isLoading } = useGetAllDamsQuery();

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
        onChange('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onChange]);

  const results: Dam[] = useMemo(() => {
    const q = normalize(value);
    if (!q) return dams;
    return dams.filter(
      (d) =>
        normalize(d.dam_name ?? '').includes(q) ||
        normalize(d.dam_id ?? '').includes(q)
    );
  }, [dams, value]);

  const doSearch = useCallback(() => {
    if (activeIdx >= 0 && activeIdx < results.length) {
      onSearch(results[activeIdx].dam_id);
      setOpen(false);
      onChange('');
      return;
    }
    const q = value.trim();
    if (q) {
      onSearch(q);
      setOpen(false);
      onChange('');
    }
  }, [activeIdx, results, value, onSearch, onChange]);

  const select = (dam: Dam) => {
    onSearch(dam.dam_id);
    setOpen(false);
    setActiveIdx(-1);
    onChange('');
  };

  return (
    <div
      ref={wrapperRef}
      className={['SearchBar', className].filter(Boolean).join(' ')}
      role="combobox"
      aria-expanded={open}
      aria-owns={listId}
      aria-haspopup="listbox"
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((prev) =>
              results.length ? (prev + 1 + results.length) % results.length : -1
            );
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((prev) =>
              results.length ? (prev - 1 + results.length) % results.length : -1
            );
          } else if (e.key === 'Enter') {
            e.preventDefault();
            doSearch();
          } else if (e.key === 'Escape') {
            setOpen(false);
            setActiveIdx(-1);
            onChange('');
          }
        }}
      />

      <button type="button" onClick={doSearch}>{buttonLabel}</button>

      {open && (
        <ul id={listId} role="listbox" className="SearchBar__dropdown">
          {isLoading && (
            <li className="SearchBar__option is-muted">Loading dams…</li>
          )}
          {!isLoading && results.map((d, idx) => (
            <li
              key={d.dam_id}
              id={`${listId}-opt-${idx}`}
              role="option"
              aria-selected={idx === activeIdx}
              className={[
                'SearchBar__option',
                idx === activeIdx ? 'is-active' : '',
              ].join(' ')}
              onMouseDown={(e) => { e.preventDefault(); select(d); }}
            >
              {d.dam_name ?? 'Unnamed Dam'}
            </li>
          ))}
          {!isLoading && results.length === 0 && (
            <li className="SearchBar__option is-muted">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
