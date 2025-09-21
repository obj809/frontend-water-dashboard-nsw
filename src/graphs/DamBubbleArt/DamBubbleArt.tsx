// src/graphs/DamBubbleArt/DamBubbleArt.tsx

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllLatestDataQuery, useGetAllDamsQuery } from '../../services/damsApi';
import type { Dam, DamResource } from '../../types/types';
import './DamBubbleArt.scss';

type Props = { fullScreen?: boolean };

type Bubble = {
  damId: string;
  name: string;
  capacity: number;
  current: number;
  pctFull: number;
  color: string;
  x: number;
  y: number;
  rOuter: number;
  rInner: number;
};

const PALETTE = [
  '#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#22c55e',
  '#e11d48','#0ea5e9','#a78bfa','#f43f5e','#14b8a6','#84cc16','#d946ef','#fb7185',
  '#38bdf8','#34d399','#fbbf24','#60a5fa',
];

function phyllotaxis(idx: number, cx: number, cy: number, scale: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const r = scale * Math.sqrt(idx + 0.5);
  const theta = idx * golden;
  return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
}

const DamBubbleArt: React.FC<Props> = ({ fullScreen = false }) => {
  const navigate = useNavigate();
  const { data: latest = [], isLoading: loadingLatest, isError: errorLatest } = useGetAllLatestDataQuery();
  const { data: dams = [], isLoading: loadingDams, isError: errorDams } = useGetAllDamsQuery();

  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ w: Math.max(0, rect.width), h: Math.max(0, rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bubbles = useMemo<Bubble[]>(() => {
    const latestRows = (latest as DamResource[]) ?? [];
    const damRows = (dams as Dam[]) ?? [];

    if (!latestRows.length) return [];

    const capacityById = new Map<string, number>();
    for (const d of damRows) {
      if (d?.dam_id) capacityById.set(d.dam_id, Number(d.full_volume ?? 0));
    }

    const prelim = latestRows
      .map((r) => {
        const damId = r.dam_id;
        const name = r.dam_name ?? damId;
        const pct = Math.max(0, Math.min(100, Number(r.percentage_full ?? 0)));
        const current = Math.max(0, Number(r.storage_volume ?? 0));
        let capacity = capacityById.get(damId) || 0;
        if ((!capacity || capacity <= 0) && pct > 0) {
          capacity = current / (pct / 100);
        }
        return { damId, name, pctFull: pct, current, capacity };
      })
      .filter((d) => d.capacity > 0);

    if (!prelim.length) return [];

    const capVals = prelim.map((d) => d.capacity).filter((v) => v > 0);
    const capMinS = Math.sqrt(Math.min(...capVals));
    const capMaxS = Math.sqrt(Math.max(...capVals));

    const { w, h } = size;
    const maxDim = Math.max(200, Math.min(w, h));
    const outerMin = Math.max(10, Math.round(maxDim * 0.03));
    const outerMax = Math.max(outerMin + 6, Math.round(maxDim * 0.10));

    const rOuterFromCap = (cap: number) => {
      if (cap <= 0) return outerMin;
      const s = Math.sqrt(cap);
      const t = (s - capMinS) / (capMaxS - capMinS || 1);
      return outerMin + t * (outerMax - outerMin);
    };

    const sorted = [...prelim].sort((a, b) => b.capacity - a.capacity);

    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.22;

    return sorted.map((d, i) => {
      const { x, y } = phyllotaxis(i, cx, cy, scale);
      const rOuter = rOuterFromCap(d.capacity);
      const rInner = Math.min(rOuter, Math.max(2, rOuter * Math.sqrt(d.current / Math.max(d.capacity, 1))));
      const color = PALETTE[i % PALETTE.length];
      const margin = rOuter + 4;
      const clampedX = Math.max(margin, Math.min(w - margin, x));
      const clampedY = Math.max(margin, Math.min(h - margin, y));
      return {
        damId: d.damId,
        name: d.name,
        capacity: d.capacity,
        current: d.current,
        pctFull: d.pctFull,
        color,
        x: clampedX,
        y: clampedY,
        rOuter,
        rInner,
      };
    });
  }, [latest, dams, size]);

  const onClick = (damId: string) => {
    navigate(`/dams/${encodeURIComponent(damId)}`);
  };

  if (loadingLatest || loadingDams) {
    return (
      <div className={`dbaWrap ${fullScreen ? 'is-fullscreen' : ''}`} ref={wrapRef}>
        <div className="dbaEmpty">Loading bubble art…</div>
      </div>
    );
  }
  if (errorLatest || errorDams) {
    return (
      <div className={`dbaWrap ${fullScreen ? 'is-fullscreen' : ''}`} ref={wrapRef}>
        <div className="dbaEmpty">Could not load data.</div>
      </div>
    );
  }
  if (!bubbles.length) {
    return (
      <div className={`dbaWrap ${fullScreen ? 'is-fullscreen' : ''}`} ref={wrapRef}>
        <div className="dbaEmpty">No dams to display.</div>
      </div>
    );
  }

  return (
    <div
      className={`dbaWrap ${fullScreen ? 'is-fullscreen' : ''}`}
      ref={wrapRef}
      role="region"
      aria-label="Dam bubble art"
    >
      <svg
        className="dbaSvg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
      >
        {bubbles.map((b) => (
          <g
            key={b.damId}
            className="dbaBubble"
            transform={`translate(${b.x}, ${b.y})`}
            onClick={() => onClick(b.damId)}
            role="button"
            tabIndex={0}
          >
            <circle r={b.rOuter} fill="none" stroke={b.color} strokeWidth={2} />
            <circle r={b.rInner} fill={b.color} opacity={0.65} />
            <title>
              {b.name}
              {`\n% Full: ${b.pctFull.toFixed(1)}%`}
              {`\nCurrent: ${Math.round(b.current).toLocaleString()} ML`}
              {`\nCapacity: ${Math.round(b.capacity).toLocaleString()} ML`}
            </title>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default DamBubbleArt;
