// src/graphs/Graph4/Graph4.tsx

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
} from 'recharts';
import { useParams } from 'react-router-dom';
import { useGetSpecificDamAnalysisByIdQuery } from '../../services/damsApi';
import type { DamAnalysis } from '../../types/types';
import './Graph4.scss';

type Props = { fullScreen?: boolean };

type MetricKey =
  | 'avg_percentage_full'
  | 'avg_storage_volume'
  | 'avg_storage_inflow'
  | 'avg_storage_release';

type Horizon = '12m' | '5y' | '10y';

const METRICS: Array<{ key: MetricKey; label: string; unit: '%' | 'ML' }> = [
  { key: 'avg_percentage_full', label: '% Full', unit: '%' },
  { key: 'avg_storage_volume',  label: 'Storage Volume', unit: 'ML' },
  { key: 'avg_storage_inflow',  label: 'Inflow', unit: 'ML' },
  { key: 'avg_storage_release', label: 'Release', unit: 'ML' },
];

const RadarTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '8px 10px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        maxWidth: 300,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 6, columnGap: 10 }}>
        {payload.map((p: any) => {
          const seriesName = p?.name;
          const raw = p?.payload?.[`raw_${seriesName}`];
          const unit = p?.payload?.unit ?? '';
          const norm = typeof p?.value === 'number' ? p.value.toFixed(1) : '—';
          const rawText =
            raw == null
              ? '—'
              : unit === '%'
              ? `${Number(raw).toFixed(2)}%`
              : `${Number(raw).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${unit}`;
          return (
            <React.Fragment key={seriesName}>
              <span style={{ color: p?.stroke || p?.fill, fontWeight: 600 }}>{seriesName}</span>
              <span>{norm}/100 · {rawText}</span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Graph4: React.FC<Props> = ({ fullScreen = false }) => {
  const { damId = '' } = useParams<{ damId: string }>();
  const { data = [], isLoading, isError } = useGetSpecificDamAnalysisByIdQuery(
    { damId },
    { skip: !damId }
  );

  const { chartData, hasAny } = useMemo(() => {
    const result = { chartData: [] as any[], hasAny: false };
    if (!damId || !data?.length) return result;

    // Latest record
    const analyses = [...(data as DamAnalysis[])].filter(Boolean);
    analyses.sort((a, b) => (a.analysis_date < b.analysis_date ? -1 : a.analysis_date > b.analysis_date ? 1 : 0));
    const latest = analyses[analyses.length - 1];
    if (!latest) return result;

    const rawByMetric: Record<MetricKey, Record<Horizon, number | null>> = {
      avg_percentage_full: {
        '12m': latest.avg_percentage_full_12_months == null ? null : Number(latest.avg_percentage_full_12_months),
        '5y' : latest.avg_percentage_full_5_years   == null ? null : Number(latest.avg_percentage_full_5_years),
        '10y': latest.avg_percentage_full_10_years  == null ? null : Number(latest.avg_percentage_full_10_years),
      },
      avg_storage_volume: {
        '12m': latest.avg_storage_volume_12_months == null ? null : Number(latest.avg_storage_volume_12_months),
        '5y' : latest.avg_storage_volume_5_years   == null ? null : Number(latest.avg_storage_volume_5_years),
        '10y': latest.avg_storage_volume_10_years  == null ? null : Number(latest.avg_storage_volume_10_years),
      },
      avg_storage_inflow: {
        '12m': latest.avg_storage_inflow_12_months == null ? null : Number(latest.avg_storage_inflow_12_months),
        '5y' : latest.avg_storage_inflow_5_years   == null ? null : Number(latest.avg_storage_inflow_5_years),
        '10y': latest.avg_storage_inflow_10_years  == null ? null : Number(latest.avg_storage_inflow_10_years),
      },
      avg_storage_release: {
        '12m': latest.avg_storage_release_12_months == null ? null : Number(latest.avg_storage_release_12_months),
        '5y' : latest.avg_storage_release_5_years   == null ? null : Number(latest.avg_storage_release_5_years),
        '10y': latest.avg_storage_release_10_years  == null ? null : Number(latest.avg_storage_release_10_years),
      },
    };

    const rows = METRICS.map(({ key, label, unit }) => {
      const vals = rawByMetric[key];
      const nums = (['12m', '5y', '10y'] as Horizon[])
        .map((h) => vals[h])
        .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
      const max = Math.max(0, ...nums);

      const norm = (v: number | null) => (v == null || max === 0 ? 0 : (v / max) * 100);

      return {
        metric: label,
        unit,
        '12m': norm(vals['12m']),
        '5y' : norm(vals['5y']),
        '10y': norm(vals['10y']),
        raw_12m: vals['12m'],
        raw_5y : vals['5y'],
        raw_10y: vals['10y'],
      };
    });

    const anyData = rows.some(
      (r) =>
        (r.raw_12m != null && !Number.isNaN(r.raw_12m)) ||
        (r.raw_5y  != null && !Number.isNaN(r.raw_5y)) ||
        (r.raw_10y != null && !Number.isNaN(r.raw_10y))
    );

    return { chartData: rows, hasAny: anyData };
  }, [damId, data]);

  if (!damId) {
    return (
      <div className={`graph4Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Please open a specific dam to view Graph 4.</div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className={`graph4Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Loading Graph 4…</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={`graph4Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>Could not load data.</div>
      </div>
    );
  }
  if (!hasAny || !chartData.length) {
    return (
      <div className={`graph4Placeholder ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div>No data available.</div>
      </div>
    );
  }

  return (
    <div className={`graph4Container ${fullScreen ? 'is-fullscreen' : ''}`}>
      <h2 className="graph4Title">Dam Fingerprint — 12m vs 5y vs 10y</h2>

      <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            margin={{ top: 0, right: 24, bottom: 24, left: 24 }}
          >
          <defs>
            <linearGradient id="grad12m" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="grad5y" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="grad10y" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.36" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.10" />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
              <feOffset in="blur" dx="0" dy="1" result="offset" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="offset" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <PolarGrid gridType="circle" radialLines />

          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11 }} tickCount={5} />

          <Radar
            name="12m"
            dataKey="12m"
            stroke="#06b6d4"
            fill="url(#grad12m)"
            fillOpacity={1}
            strokeWidth={2}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
            style={{ filter: 'url(#softShadow)' }}
          />
          <Radar
            name="5y"
            dataKey="5y"
            stroke="#3b82f6"
            fill="url(#grad5y)"
            fillOpacity={1}
            strokeWidth={2}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
            style={{ filter: 'url(#softShadow)' }}
          />
          <Radar
            name="10y"
            dataKey="10y"
            stroke="#8b5cf6"
            fill="url(#grad10y)"
            fillOpacity={1}
            strokeWidth={2}
            isAnimationActive
            animationDuration={1100}
            animationEasing="ease-out"
            style={{ filter: 'url(#softShadow)' }}
          />

          <Tooltip content={<RadarTip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 30 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Graph4;
