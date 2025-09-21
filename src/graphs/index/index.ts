// src/graphs/index/index.ts

import DamStorageOverview from '../DamStorageOverview/DamStorageOverview';
import InflowGraph from '../InflowGraph/InflowGraph';
import ReleaseGraph from '../ReleaseGraph/ReleaseGraph';

export type GraphSpec = {
  id: string;
  title: string;
  Component: React.FC;
};

export const graphs: GraphSpec[] = [
  { id: 'storage', title: 'Storage Volume Over Time', Component: DamStorageOverview },
  { id: 'inflow',  title: 'Inflow (Daily)',           Component: InflowGraph },
  { id: 'release', title: 'Release (Daily)',          Component: ReleaseGraph },
];
