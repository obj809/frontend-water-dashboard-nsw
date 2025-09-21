// src/graphs/index/index.ts

import DamStorageOverview from '../DamStorageOverview/DamStorageOverview';
import DamBarChart from '../DamBarChart/DamBarChart';

export type GraphSpec = {
  id: string;
  title: string;
  Component: React.FC;
};

export const graphs: GraphSpec[] = [
  { id: 'storage', title: 'Storage Volume Over Time', Component: DamStorageOverview },
  { id: 'release', title: 'Release (Daily)',          Component: DamBarChart },
];
