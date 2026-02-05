// src/graphs/Graph1/Graph1.tsx

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

const Graph1: React.FC<Props> = ({ fullScreen = false }) => {
  const { damId = '' } = useParams<{ damId: string }>();
  const { data: allResources = [], isLoading, isError } = useGetAllDamResourcesQuery();

  const chartData = useMemo(() => {
    if (!damId || !allResources.length) return [];

    const damRows = (allResources as DamResource[])
      .filter((r) => r.dam_id === damId && r.date)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    if (!damRows.length) return [];

    const latestDate = parseISO(damRows[damRows.length - 1].date);
    latestDate.setDate(1);

    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(latestDate);
      d.setMonth(d.getMonth() - i);
      monthKeys.push(toMonthKey(d));
    }

    const monthToValues: Record<string, number[]> = {};
    for (const r of damRows) {
      const key = toMonthKey(parseISO(r.date));
      if (!monthKeys.includes(key)) continue;
      const v = r.percentage_full;
      if (v == null) continue;
      (monthToValues[key] ??= []).push(Number(v));
    }

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

  return (
    <div className={`graph1Container ${fullScreen ? 'is-fullscreen' : ''}`}>
      <h2 className="graph1Title">Percentage Full (Last 12 Months)</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, bottom: 70, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            interval={0}
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
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph1;
