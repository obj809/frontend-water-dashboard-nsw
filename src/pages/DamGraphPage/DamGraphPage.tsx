// File: src/pages/DamGraphPage/DamGraphPage.tsx

import React, { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './DamGraphPage.scss';

// Final graphs for DamDetailPage
import Graph1 from '../../graphs/Graph1/Graph1';
import Graph2 from '../../graphs/Graph2/Graph2';
import Graph3 from '../../graphs/Graph3/Graph3';
import Graph4 from '../../graphs/Graph4/Graph4';

type DetailGraph = React.ComponentType<{ fullScreen?: boolean }>;

const GRAPH_REGISTRY: Record<string, DetailGraph> = {
  graph1: Graph1,
  graph2: Graph2,
  graph3: Graph3,
  graph4: Graph4,
};

const TITLES: Record<string, string> = {
  graph1: 'Graph 1',
  graph2: 'Graph 2',
  graph3: 'Graph 3',
  graph4: 'Graph 4',
};

const DamGraphPage: React.FC = () => {
  const navigate = useNavigate();
  const { damId = '', graphId = '' } = useParams<{ damId: string; graphId: string }>();

  const GraphComp: DetailGraph | undefined = useMemo(
    () => GRAPH_REGISTRY[graphId],
    [graphId]
  );

  if (!GraphComp) {
    return (
      <div style={{ padding: 16 }}>
        <p>Unknown graph: <code>{graphId}</code></p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const title = TITLES[graphId] ?? 'Dam Graph';

  return (
    <div className="DamGraphPage" aria-label="Dam Graph Page">
      <header className="DamGraphPage__header">
        <Link className="btn" to={`/dams/${encodeURIComponent(damId)}`}>← Back to dam</Link>
        <h1 className="DamGraphPage__title">{title}</h1>
        <div />
      </header>

      <main className="DamGraphPage__main">
        <GraphComp fullScreen />
      </main>
    </div>
  );
};

export default DamGraphPage;
