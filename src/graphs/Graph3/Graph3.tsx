// src/graphs/Graph3/Graph3.tsx

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Label,
} from 'recharts';
import { useParams } from 'react-router-dom';
import { useGetSpecificDamAnalysisByIdQuery } from '../../services/damsApi';
import type { DamAnalysis } from '../../types/types';
import './Graph3.scss';

type Props = { fullScreen?: boolean };

const PctTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  const hasVal = typeof v === 'number' && !Number.isNaN(v);
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
      <div>{hasVal ? `${v.toFixed(2)}%` : '—'}</div>
    </div>
  );
};

const Graph3: React.FC<Props> = ({ fullScreen = false }) => {
  const { damId = '' } = useParams<{ damId: string }>();
  const { data = [], isLoading, isError } = useGetSpecificDamAnalysisByIdQuery(
    { damId },
    { skip: !damId }
  );

  const chartData = useMemo(() => {
    if (!damId || !data?.length) return [];

    const analyses = [...(data as DamAnalysis[])].filter(Boolean);
    analyses.sort((a, b) => (a.analysis_date < b.analysis_date ? -1 : a.analysis_date > b.analysis_date ? 1 : 0));
    const latest = analyses[analyses.length - 1];
    if (!latest) return [];

    const v12 = latest.avg_percentage_full_12_months;
    const v5  = latest.avg_percentage_full_5_years;
    const v20 = latest.avg_percentage_full_10_years;

    if ([v12, v5, v20].every((v) => v == null)) return [];

    return [
      { horizon: '12m', value: v12 == null ? null : Number(v12) },
      { horizon: '5y',  value: v5  == null ? null : Number(v5)  },
      { horizon: '10y', value: v20 == null ? null : Number(v20) },
    ];
  }, [damId, data]);

  // States
  if (!damId) {
    return (
      <div className={`graph3Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Please open a specific dam to view Graph 3.</div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className={`graph3Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Loading Graph 3…</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={`graph3Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Could not load data.</div>
      </div>
    );
  }
  if (!chartData.length) {
    return (
      <div className={`graph3Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>No data available.</div>
      </div>
    );
  }

  const blueShades = ['#60a5fa', '#3b82f6', '#2563eb'];

  return (
    <div className={`graph3Container ${fullScreen ? 'is-fullscreen' : ''}`}>
      <h2 className="graph3Title">Average % Full by Horizon</h2>

      <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, bottom: 55, left: 20 }}
        barCategoryGap={20}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="horizon" tickLine={false} axisLine={true} tickMargin={12}>
          <Label value="Time Horizon" position="insideBottom" offset={-30} />
        </XAxis>
        <YAxis unit="%" domain={[0, 100]} width={70}>
          <Label
            value="Average Percentage Full (%)"
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: 'middle' }}
          />
        </YAxis>
        <Tooltip content={<PctTooltip />} />

        <Bar
          dataKey="value"
          name="Avg % Full"
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
          fillOpacity={0.8}
          barSize={80}
        >
          {chartData.map((_, idx) => (
            <Cell key={`cell-${idx}`} fill={blueShades[idx % blueShades.length]} />
          ))}
        </Bar>
      </BarChart>


      </ResponsiveContainer>
    </div>
  );
};

export default Graph3;
