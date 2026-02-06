// src/pages/BubbleChartPage/BubbleChartPage.tsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllDamsQuery } from '../../services/damsApi';
import DamBubbleChart from '../../graphs/DamBubbleChart/DamBubbleChart';
import './BubbleChartPage.scss';

const BubbleChartPage: React.FC = () => {
  const { data: dams = [], isLoading, isError } = useGetAllDamsQuery();

  const bubbleData = useMemo(
    () =>
      dams
        .filter((d) => d.full_volume && d.full_volume > 0)
        .map((d) => ({
          dam_id: d.dam_id,
          dam_name: d.dam_name ?? d.dam_id,
          capacity: Number(d.full_volume ?? 0),
        })),
    [dams]
  );

  if (isLoading) {
    return (
      <div className="bubble-chart-page">
        <div className="loading-message">Loading dam capacity data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bubble-chart-page">
        <div className="error-message">Could not load dam capacity data.</div>
      </div>
    );
  }

  return (
    <div className="bubble-chart-page">
      <Link to="/" className="home-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </Link>
      <DamBubbleChart data={bubbleData} />
    </div>
  );
};

export default BubbleChartPage;
