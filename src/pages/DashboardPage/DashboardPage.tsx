// src/pages/DashboardPage/DashboardPage.tsx

import React, { useState } from 'react';
import './DashboardPage.scss';

import StorageGraph from '../../graphs/DamStorageOverview/DamStorageOverview';
import ReleaseGraph from '../../graphs/ReleaseGraph/ReleaseGraph';
import DamBubbleArt from '../../graphs/DamBubbleArt/DamBubbleArt'; // ⬅️ NEW

// Add your graphs to the carousel here
const graphs = [
  { id: 'storage', Component: StorageGraph },
  { id: 'bubbleart', Component: DamBubbleArt },   // ⬅️ NEW
  { id: 'release', Component: ReleaseGraph },
];

const DashboardPage: React.FC = () => {
  const [index, setIndex] = useState(0);

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
          <ActiveGraph />
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
