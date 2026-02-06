// src/graphs/DamBarChart/DamBarChart.tsx

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import './DamBarChart.scss';

type DamBarDatum = {
  dam_id: string;
  dam_name: string;
  capacity: number;
  filled: number;
};

type Props = {
  data?: DamBarDatum[];
};

const BLUE = '#1e3a8a';
const TURQ = '#14b8a6';

const fmtML = (n: number) => `${Math.round(n).toLocaleString()} ML`;

const DamBarChart: React.FC<Props> = ({ data = [] }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return [...data]
      .filter((d) => d.capacity > 0)
      .sort((a, b) => a.capacity - b.capacity)
      .map((d) => {
        const pct = d.capacity > 0 ? (d.filled / d.capacity) * 100 : 0;
        return {
          dam: d.dam_name,
          capacity: d.capacity,
          filled: d.filled,
          pct,
          pctText: `${pct.toFixed(0)}%`,
        };
      });
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="dam-bar-chart-wrap">
        <div className="dam-bar-header">
          <h2 className="dam-bar-title">Dam Storage Capacity & Fill Levels</h2>
          <p className="dam-bar-subtitle">Comparison of total capacity and current water storage across NSW dams</p>
        </div>
        <div className="bar-placeholder">No dam data available</div>
      </div>
    );
  }

  return (
    <div className="dam-bar-chart-wrap">
      <div className="dam-bar-header">
        <h2 className="dam-bar-title">Dam Storage Capacity & Fill Levels</h2>
        <p className="dam-bar-subtitle">Comparison of total capacity and current water storage across NSW dams</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="dam"
          interval={0}
          angle={-40}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
          label={{ value: 'Volume (ML)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: any, name: string) => {
            if (name === 'Capacity') return fmtML(Number(value));
            if (name === 'Current Storage') return fmtML(Number(value));
            return value;
          }}
          labelFormatter={(label: string) => `Dam: ${label}`}
        />

        <Bar
          dataKey="filled"
          name="Current Storage"
          fill={TURQ}
          barSize={40}
        >
          <LabelList
            dataKey="pctText"
            position="top"
            style={{ fill: '#111827', fontWeight: 600, fontSize: 11 }}
          />
        </Bar>

        <Bar
          dataKey="capacity"
          name="Capacity"
          fill={BLUE}
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default DamBarChart;
