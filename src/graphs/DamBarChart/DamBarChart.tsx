// src/graphs/DamBarChart/DamBarChart.tsx

import React from 'react';
import './DamBarChart.scss';

type Props = {
  fullScreen?: boolean;
};

const DamBarChart: React.FC<Props> = ({ fullScreen = false }) => {
  return (
    <div className={`barChartPlaceholder ${fullScreen ? 'is-fullscreen' : ''}`}>
      <div>
        <div className="barChartPlaceholder__title">Dam Bar Chart</div>
        <div className="barChartPlaceholder__sub">(bar chart goes here)</div>
      </div>
    </div>
  );
};

export default DamBarChart;
