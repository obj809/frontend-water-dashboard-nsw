// src/pages/DashboardPage/DashboardPage.tsx

import React, { useState, useMemo } from 'react';
import './DashboardPage.scss';

import StorageGraph from '../../graphs/DamStorageOverview/DamStorageOverview';
import DamBarChart from '../../graphs/DamBarChart/DamBarChart';
import DamBubbleChart from '../../graphs/DamBubbleChart/DamBubbleChart';

import { useGetAllDamsQuery } from '../../services/damsApi';

const DashboardPage: React.FC = () => {
  const [index, setIndex] = useState(0);

  // fetch all dams
  const { data: dams = [], isLoading, isError } = useGetAllDamsQuery();

  // map API data into format for DamBubbleChart
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

  const graphs = [
    { id: 'storage', Component: StorageGraph },
    { id: 'bubble', Component: () => <DamBubbleChart data={bubbleData} width={800} height={600} /> },
    { id: 'release', Component: DamBarChart },
  ];

  const prev = () => setIndex((i) => (i - 1 + graphs.length) % graphs.length);
  const next = () => setIndex((i) => (i + 1) % graphs.length);

  const ActiveGraph = graphs[index].Component;

  return (
    <div className="DashboardPage" aria-label="Dashboard">
      <button
        className="nav-arrow nav-arrow--left"
        onClick={prev}
        aria-label="Previous graph"
      >
        <span className="arrow-icon arrow-icon--left" />
      </button>

      <section className="graph-stage" role="region" aria-label="Graph stage">
        <div className="graph-canvas">
          {isLoading && <div>Loading dam data…</div>}
          {isError && <div>Could not load dam data.</div>}
          {!isLoading && !isError && <ActiveGraph />}
        </div>
      </section>

      <button
        className="nav-arrow nav-arrow--right"
        onClick={next}
        aria-label="Next graph"
      >
        <span className="arrow-icon arrow-icon--right" />
      </button>
    </div>
  );
};

export default DashboardPage;
