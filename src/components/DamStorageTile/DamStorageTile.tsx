// src/components/DamStorageTile/DamStorageTile.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';
import './DamStorageTile.scss';

type Props = {
  damId: string;
  name: string;
  pct: number | null;
};

const DamStorageTile: React.FC<Props> = ({ damId, name, pct }) => {
  const fill = pct == null ? 0 : Math.max(0, Math.min(100, pct));
  const remainder = 100 - fill;
  const hasData = pct != null;

  // Dynamic color based on fill percentage - all shades of blue
  const getFillColor = (percentage: number): string => {
    if (percentage >= 75) return '#1e40af'; // Dark blue for high levels
    if (percentage >= 50) return '#3b82f6'; // Medium blue for good levels
    if (percentage >= 25) return '#60a5fa'; // Light blue for medium levels
    return '#93c5fd'; // Very light blue for low levels
  };

  const fillColor = getFillColor(fill);

  const data = [
    { name: 'Full', value: fill },
    { name: 'Remaining', value: remainder },
  ];

  return (
    <Link
      to={`/dams/${encodeURIComponent(damId)}`}
      className={`storageTile ${hasData ? '' : 'is-muted'}`}
      role="link"
      aria-label={`${name}: ${hasData ? `${fill.toFixed(0)}% full` : 'No data'}`}
    >
      <div className="tileTitle" title={name}>
        {name}
      </div>

      <div className="donutWrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius="65%"
              outerRadius="90%"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={fillColor} />
              <Cell fill="#e5e7eb" />
              <Label
                value={hasData ? `${Math.round(fill)}%` : '—'}
                position="center"
                fontSize={20}
                fontWeight={800}
                fill="#1e293b"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Link>
  );
};

export default DamStorageTile;
