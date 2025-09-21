// src/graphs/DamStorageOverview/DamStorageOverview.tsx

import React, { useMemo } from 'react';
import { useGetAllLatestDataQuery } from '../../services/damsApi';
import type { DamResource } from '../../types/types';
import DamStorageTile from '../../components/DamStorageTile/DamStorageTile';
import './DamStorageOverview.scss';

type Props = { fullScreen?: boolean };

const clampPct = (v: number) => Math.max(0, Math.min(100, v));

const DamStorageOverview: React.FC<Props> = ({ fullScreen = false }) => {
  const { data: latest = [], isLoading, isError } = useGetAllLatestDataQuery();

  const rows = useMemo(() => {
    if (!latest?.length) return [];
    const sorted = [...(latest as DamResource[])].sort((a, b) =>
      (a.dam_name ?? '').localeCompare(b.dam_name ?? '')
    );
    return sorted
      .filter((r) => r.dam_name !== 'Cochrane Dam')
      .map((r) => {
        const pct =
          typeof r.percentage_full === 'number'
            ? clampPct(Number(r.percentage_full))
            : null;
        return {
          damId: r.dam_id,
          name: r.dam_name ?? r.dam_id,
          pct,
        };
      });
  }, [latest]);

  if (isLoading) {
    return (
      <div className={`storageGrid ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div className="storageEmpty">Loading current storage…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`storageGrid ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div className="storageEmpty">Could not load storage data.</div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={`storageGrid ${fullScreen ? 'is-fullscreen' : ''}`}>
        <div className="storageEmpty">No dams found.</div>
      </div>
    );
  }

  return (
    <div className="storageOverviewWrapper">
  
      <div className={`storageGrid ${fullScreen ? 'is-fullscreen' : ''}`}>
        {rows.map((row) => (
          <DamStorageTile key={row.damId} {...row} />
        ))}
      </div>
    </div>
  );
};

export default DamStorageOverview;
