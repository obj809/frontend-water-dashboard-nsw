// src/graphs/DamBubbleChart/DamBubbleChart.tsx

import React from 'react';
import './DamBubbleChart.scss';

type Props = { fullScreen?: boolean };

const DamBubbleChart: React.FC<Props> = ({ fullScreen = false }) => {
  return (
    <div
      className={`dbaWrap ${fullScreen ? 'is-fullscreen' : ''}`}
      role="region"
      aria-label="Dam bubble chart placeholder"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#111827' }}>
        Dam Bubble Chart Placeholder
      </div>
    </div>
  );
};

export default DamBubbleChart;
