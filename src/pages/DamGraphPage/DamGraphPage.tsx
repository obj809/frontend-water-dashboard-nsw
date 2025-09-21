import React, { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './DamGraphPage.scss';

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

  return (
    <div className="DamGraphPage" aria-label="Dam Graph Page">
      <header className="DamGraphPage__header">
        <Link className="btn" to={`/dams/${encodeURIComponent(damId)}`}>← Back to dam</Link>
        <div /> {/* keep grid structure balanced */}
        <div />
      </header>

      <main className="DamGraphPage__main">
        <div className="graph-wrapper" role="region" aria-label="Dam chart">
          <GraphComp />
        </div>
      </main>
    </div>
  );
};

export default DamGraphPage;
