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
  capacity: number; // ML total capacity
  filled: number;   // ML currently filled
};

type Props = {
  data?: DamBarDatum[]; // make optional
};

const BLUE = '#1e3a8a';  // deep blue
const TURQ = '#14b8a6';  // turquoise

const fmtML = (n: number) => `${Math.round(n).toLocaleString()} ML`;

const DamBarChart: React.FC<Props> = ({ data = [] }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return []; // guard

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
    return <div style={{ padding: 16 }}>No dam data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
          label={{ value: 'Capacity (ML)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: any, name: string) => {
            if (name === 'capacity') return fmtML(Number(value));
            if (name === 'filled') return fmtML(Number(value));
            if (name === 'pct') return `${Number(value).toFixed(1)}% full`;
            return value;
          }}
          labelFormatter={(label: string) => `Dam: ${label}`}
        />

        <Bar dataKey="capacity" name="Capacity" fill={BLUE} barSize={40} />

        <Bar
          dataKey="pct"
          name="% Full"
          fill={TURQ}
          barSize={40}
          shape={(props: any) => {
            const { x, y, width, height, payload } = props;
            const pct: number = payload?.pct ?? 0;
            const overlayH = (pct / 100) * height;
            return (
              <rect
                x={x}
                y={y + (height - overlayH)}
                width={width}
                height={overlayH}
                fill={TURQ}
              />
            );
          }}
        >
          <LabelList
            dataKey="pctText"
            position="insideTop"
            style={{ fill: '#ffffff', fontWeight: 700, fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DamBarChart;
