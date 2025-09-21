// File: src/graphs/Graph1/Graph1.tsx

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useParams } from 'react-router-dom';
import { useGetAllDamResourcesQuery } from '../../services/damsApi';
import type { DamResource } from '../../types/types';
import './Graph1.scss';

type Props = { fullScreen?: boolean };

/** Helpers */
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

/** Rotated X tick to ensure all months fit neatly */
const RotatedTick: React.FC<any> = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text dy={12} textAnchor="end" fontSize={12} transform="rotate(-30)">
      {payload?.value}
    </text>
  </g>
);

const Graph1: React.FC<Props> = ({ fullScreen = false }) => {
  const { damId = '' } = useParams<{ damId: string }>();
  const { data: allResources = [], isLoading, isError } = useGetAllDamResourcesQuery();

  const chartData = useMemo(() => {
    if (!damId || !allResources.length) return [];

    // Filter to this dam and sort ascending by date
    const damRows = (allResources as DamResource[])
      .filter((r) => r.dam_id === damId && r.date)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    if (!damRows.length) return [];

    // Anchor on the latest month in the dataset
    const latestDate = parseISO(damRows[damRows.length - 1].date);
    latestDate.setDate(1);

    // Build last 12 month keys ending at latest
    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(latestDate);
      d.setMonth(d.getMonth() - i);
      monthKeys.push(toMonthKey(d));
    }

    // Collect percentage_full values per month within the window
    const monthToValues: Record<string, number[]> = {};
    for (const r of damRows) {
      const key = toMonthKey(parseISO(r.date));
      if (!monthKeys.includes(key)) continue;
      const v = r.percentage_full;
      if (v == null) continue;
      (monthToValues[key] ??= []).push(Number(v));
    }

    // Build final points (ensure every month appears; null = gap)
    return monthKeys.map((key) => {
      const arr = monthToValues[key];
      const avg =
        arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      return {
        date: labelForMonthKey(key),
        percentage: avg,
      };
    });
  }, [damId, allResources]);

  // States
  if (!damId) {
    return (
      <div className={`graph1Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Please open a specific dam to view Graph 1.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`graph1Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Loading Graph 1…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`graph1Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Could not load data.</div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className={`graph1Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>No data available.</div>
      </div>
    );
  }

  // Chart
  return (
    <div className="graph1Container">
      {/* Title with spacing (matches Graph2 style) */}
      <h2 className="graph1Title">Percentage Full (Last 12 Months)</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          // Extra bottom margin so rotated month labels don’t cross the border
          margin={{ top: 10, right: 30, bottom: 70, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            interval={0}      // show every month label
            tickMargin={14}
            minTickGap={0}
            tickLine={false}
            tick={<RotatedTick />}
          />

          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip<number, string> formatter={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)} />

          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            // connectNulls // optional: connect across months with no data
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph1;
