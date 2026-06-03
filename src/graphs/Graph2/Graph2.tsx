// src/graphs/Graph2/Graph2.tsx

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import { useParams } from 'react-router-dom';
import { useGetAllDamResourcesQuery } from '../../services/damsApi';
import type { DamResource } from '../../types/types';
import './Graph2.scss';

type Props = { fullScreen?: boolean };

const toMonthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const labelForMonthKey = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-AU', {
    month: 'short',
    year: '2-digit',
  });
};
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const RotatedTick: React.FC<any> = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text dy={12} textAnchor="end" fontSize={12} transform="rotate(-30)" fill="currentColor">
      {payload?.value}
    </text>
  </g>
);
const NetTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: '8px 10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>Net (Inflow − Release): <strong>{Number(p.net ?? 0).toFixed(1)}</strong></div>
      <div>Inflow: {Number(p.inflowTotal ?? 0).toFixed(1)}</div>
      <div>Release: {Number(p.releaseTotal ?? 0).toFixed(1)}</div>
    </div>
  );
};

const Graph2: React.FC<Props> = ({ fullScreen = false }) => {
  const { damId = '' } = useParams<{ damId: string }>();
  const { data: allResources = [], isLoading, isError } = useGetAllDamResourcesQuery();

  const { chartData, hasData } = useMemo(() => {
    const empty = { chartData: [] as Array<Record<string, unknown>>, hasData: false };
    if (!damId || !allResources.length) return empty;
    const rows = (allResources as DamResource[])
      .filter((r) => r.dam_id === damId && r.date)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    if (!rows.length) return empty;

    const latestDate = parseISO(rows[rows.length - 1].date);
    latestDate.setDate(1);

    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(latestDate);
      d.setMonth(d.getMonth() - i);
      monthKeys.push(toMonthKey(d));
    }

    const totals: Record<string, { inflow: number; release: number }> = {};
    for (const r of rows) {
      const key = toMonthKey(parseISO(r.date));
      if (!monthKeys.includes(key)) continue;
      const inflow = Number(r.storage_inflow ?? 0);
      const release = Number(r.storage_release ?? 0);
      const acc = (totals[key] ??= { inflow: 0, release: 0 });
      acc.inflow += inflow;
      acc.release += release;
    }

    const data = monthKeys.map((key) => {
      const { inflow = 0, release = 0 } = totals[key] ?? {};
      return {
        date: labelForMonthKey(key),
        net: inflow - release,
        inflowTotal: inflow,
        releaseTotal: release,
      };
    });

    // Many dams report inflow/release as all-zero (data not captured), which
    // would otherwise render a misleading flat line at 0. Treat the window as
    // having data only if some month has a non-zero inflow or release total.
    const hasData = data.some((d) => d.inflowTotal !== 0 || d.releaseTotal !== 0);

    return { chartData: data, hasData };
  }, [damId, allResources]);

  if (!damId) {
    return (
      <div className={`graph2Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Please open a specific dam to view Graph 2.</div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className={`graph2Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Loading Graph 2…</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={`graph2Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Could not load data.</div>
      </div>
    );
  }
  if (!chartData.length || !hasData) {
    return (
      <div className={`graph2Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>No inflow or release data available for this dam.</div>
      </div>
    );
  }

  return (
    <div className={`graph2Container ${fullScreen ? 'is-fullscreen' : ''}`}>
      <h2 style={{ textAlign: 'center', marginBottom: '12px', fontSize: '1.2rem' }}>
        Net Inflow vs Release (Last 12 Months)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 55, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            interval={0}
            tickMargin={12}
            minTickGap={0}
            tickLine={false}
            tick={<RotatedTick />}
          >
            <Label value="Month" position="insideBottom" offset={-45} />
          </XAxis>
          <YAxis width={80}>
            <Label
              value="Net Volume (ML)"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip content={<NetTooltip />} />
          <ReferenceLine y={0} stroke="#111827" />
          <Line
            type="monotone"
            dataKey="net"
            name="Net (Inflow − Release)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph2;
