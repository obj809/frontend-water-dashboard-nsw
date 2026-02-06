// src/pages/BarChartPage/BarChartPage.tsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllDamsQuery, useGetAllLatestDataQuery } from '../../services/damsApi';
import DamBarChart from '../../graphs/DamBarChart/DamBarChart';
import './BarChartPage.scss';

const BarChartPage: React.FC = () => {
  const { data: dams = [], isLoading: damsLoading, isError: damsError } = useGetAllDamsQuery();
  const { data: latest = [], isLoading: latestLoading, isError: latestError } = useGetAllLatestDataQuery();

  const barData = useMemo(() => {
    const latestById = new Map(latest.map((l) => [l.dam_id, l]));
    return dams
      .filter((d) => d.full_volume && d.full_volume > 0)
      .filter((d) => latestById.has(d.dam_id))
      .map((d) => {
        const latestRow = latestById.get(d.dam_id);
        return {
          dam_id: d.dam_id,
          dam_name: d.dam_name ?? d.dam_id,
          capacity: Number(d.full_volume ?? 0),
          filled: Number(latestRow?.storage_volume ?? 0),
        };
      })
      .filter((d) => d.dam_name !== 'Lake Brewster');
  }, [dams, latest]);

  if (damsLoading || latestLoading) {
    return (
      <div className="bar-chart-page">
        <div className="loading-message">Loading dam storage data...</div>
      </div>
    );
  }

  if (damsError || latestError) {
    return (
      <div className="bar-chart-page">
        <div className="error-message">Could not load dam storage data.</div>
      </div>
    );
  }

  return (
    <div className="bar-chart-page">
      <Link to="/" className="home-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </Link>
      <DamBarChart data={barData} />
    </div>
  );
};

export default BarChartPage;
