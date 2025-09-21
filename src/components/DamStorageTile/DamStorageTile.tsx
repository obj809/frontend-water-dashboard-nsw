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
              innerRadius="68%"
              outerRadius="92%"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="#3b82f6" />
              <Cell fill="#e5e7eb" />
              <Label
                value={hasData ? `${Math.round(fill)}%` : '—'}
                position="center"
                fontSize={18}
                fontWeight={700}
                fill="#111827"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Link>
  );
};

export default DamStorageTile;
