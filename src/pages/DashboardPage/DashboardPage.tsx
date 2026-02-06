// src/pages/DashboardPage/DashboardPage.tsx

import React, { useState, useMemo } from 'react';
import './DashboardPage.scss';

import StorageGraph from '../../graphs/DamStorageOverview/DamStorageOverview';
import DamBarChart from '../../graphs/DamBarChart/DamBarChart';
import DamBubbleChart from '../../graphs/DamBubbleChart/DamBubbleChart';

import { useGetAllDamsQuery, useGetAllLatestDataQuery } from '../../services/damsApi';

const DashboardPage: React.FC = () => {
  const [index, setIndex] = useState(0);

  const { data: dams = [] } = useGetAllDamsQuery();
  const { data: latest = [] } = useGetAllLatestDataQuery();

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

  const barData = useMemo(() => {
    const latestById = new Map(latest.map((l) => [l.dam_id, l]));
    return dams
      .filter((d) => d.full_volume && d.full_volume > 0)
      .filter((d) => latestById.has(d.dam_id)) // Only include dams with latest_data
      .map((d) => {
        const latestRow = latestById.get(d.dam_id);
        return {
          dam_id: d.dam_id,
          dam_name: d.dam_name ?? d.dam_id,
          capacity: Number(d.full_volume ?? 0),
          filled: Number(latestRow?.storage_volume ?? 0),
        };
      })
      .filter((d) => d.dam_name !== 'Lake Brewster'); // Exclude Lake Brewster (no API data)
  }, [dams, latest]);

  const graphs = [
    { id: 'storage', Component: StorageGraph },
    { id: 'bubble', Component: () => <DamBubbleChart data={bubbleData} /> },
    { id: 'release', Component: () => <DamBarChart data={barData} /> },
  ];

  const prev = () => setIndex((i) => (i - 1 + graphs.length) % graphs.length);
  const next = () => setIndex((i) => (i + 1) % graphs.length);

  const ActiveGraph = graphs[index].Component;

  return (
    <div className="DashboardPage" aria-label="Dashboard">
      <button className="nav-arrow nav-arrow--left" onClick={prev} aria-label="Previous graph">
        <span className="arrow-icon arrow-icon--left" />
      </button>

      <section className="graph-stage" role="region" aria-label="Graph stage">
        <div className="graph-canvas">
          <ActiveGraph />
        </div>
      </section>

      <button className="nav-arrow nav-arrow--right" onClick={next} aria-label="Next graph">
        <span className="arrow-icon arrow-icon--right" />
      </button>
    </div>
  );
};

export default DashboardPage;
