// Temporary diagnostic component
import { useGetAllDamsQuery, useGetAllLatestDataQuery } from '../services/damsApi';

const DataDebug = () => {
  const { data: dams = [] } = useGetAllDamsQuery();
  const { data: latest = [] } = useGetAllLatestDataQuery();

  const hume = dams.find(d => d.dam_name?.includes('Hume'));
  const brewster = dams.find(d => d.dam_name?.includes('Brewster'));

  const humeLatest = latest.find(l => l.dam_id === hume?.dam_id);
  const brewsterLatest = latest.find(l => l.dam_id === brewster?.dam_id);

  return (
    <div style={{ padding: 20, background: '#f5f5f5', margin: 20, fontFamily: 'monospace', fontSize: 12 }}>
      <h3>Data Debug</h3>

      <div style={{ marginBottom: 20 }}>
        <h4>Hume Dam</h4>
        <pre>{JSON.stringify({ dam: hume, latest: humeLatest }, null, 2)}</pre>
      </div>

      <div>
        <h4>Lake Brewster</h4>
        <pre>{JSON.stringify({ dam: brewster, latest: brewsterLatest }, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>All Latest Data dam_ids:</h4>
        <pre>{JSON.stringify(latest.map(l => l.dam_id), null, 2)}</pre>
      </div>
    </div>
  );
};

export default DataDebug;
