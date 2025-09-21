// src/pages/DamDetailPage/DamDetailPage.tsx

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './DamDetailPage.scss';
import { useGetDamByIdQuery } from '../../services/damsApi';

import Graph1 from '../../graphs/Graph1/Graph1';
import Graph2 from '../../graphs/Graph2/Graph2';
import Graph3 from '../../graphs/Graph3/Graph3';
import Graph4 from '../../graphs/Graph4/Graph4';

type DetailGraph = {
  id: string;
  title: string;
  Component: React.ComponentType<{ fullScreen?: boolean }>;
};

const DamDetailPage: React.FC = () => {
  const { damId = '' } = useParams<{ damId: string }>();
  const { data: dam, isLoading } = useGetDamByIdQuery(damId, { skip: !damId });

  const title = isLoading ? 'Loading…' : (dam?.dam_name ?? 'Dam Detail');

  const detailGraphs: DetailGraph[] = [
    { id: 'graph1', title: 'Graph 1', Component: Graph1 },
    { id: 'graph2', title: 'Graph 2', Component: Graph2 },
    { id: 'graph3', title: 'Graph 3', Component: Graph3 },
    { id: 'graph4', title: 'Graph 4', Component: Graph4 },
  ];

  return (
    <div className="DamDetailPage" aria-label="Dam Detail Page">
      <section className="detail-stage" role="region" aria-label="Dam detail layout">
        <header className="hero" aria-live="polite">
          <Link to="/" className="home-btn" aria-label="Back to Home">
            Home
          </Link>
          <div className="hero__title">{title}</div>
        </header>

        {detailGraphs.map(({ id, title, Component }) => (
          <Link
            key={id}
            to={`/dams/${encodeURIComponent(damId)}/graph/${encodeURIComponent(id)}`}
            className="panel panel--link"
            aria-label={`Open ${title} in full screen`}
          >
            <Component />
          </Link>
        ))}
      </section>
    </div>
  );
};

export default DamDetailPage;
