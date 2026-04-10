import { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import InsightsPanel from './components/InsightsPanel';
import Timeline from './components/Timeline';
import { getGameData } from './data/gameDataAdapter';
import { generateInsights } from './utils/analytics';

const initialLayers = {
  playerPaths: true,
  killEvents: true,
  deathEvents: true,
  lootEvents: true,
  stormDeaths: true,
  heatmap: false,
};

function App() {
  const [events, setEvents] = useState([]);
  const [mapConfig, setMapConfig] = useState({});
  const [layers, setLayers] = useState(initialLayers);
  const [timelinePercent, setTimelinePercent] = useState(100);
  const [filters, setFilters] = useState({
    map: 'all',
    match: 'all',
    playerType: 'all',
  });

  useEffect(() => {
    getGameData().then(({ events: gameEvents, mapConfig: config }) => {
      setEvents(gameEvents);
      setMapConfig(config);
    });
  }, []);

  const maps = useMemo(() => Object.keys(mapConfig), [mapConfig]);
  const matches = useMemo(() => [...new Set(events.map((event) => event.match_id))], [events]);

  const { filteredEvents, minTimestamp, maxTimestamp } = useMemo(() => {
    const baseFiltered = events.filter((event) => {
      if (filters.map !== 'all' && event.map_name !== filters.map) return false;
      if (filters.match !== 'all' && event.match_id !== filters.match) return false;
      if (filters.playerType !== 'all' && event.player_type !== filters.playerType) return false;
      return true;
    });

    const minTs = Math.min(...baseFiltered.map((event) => event.timestamp));
    const maxTs = Math.max(...baseFiltered.map((event) => event.timestamp));

    if (!Number.isFinite(minTs) || !Number.isFinite(maxTs)) {
      return { filteredEvents: [], minTimestamp: undefined, maxTimestamp: undefined };
    }

    const timelineCutoff = minTs + ((maxTs - minTs) * timelinePercent) / 100;

    return {
      filteredEvents: baseFiltered.filter((event) => event.timestamp <= timelineCutoff),
      minTimestamp: minTs,
      maxTimestamp: maxTs,
    };
  }, [events, filters, timelinePercent]);

  const selectedMap = filters.map === 'all' ? maps[0] : filters.map;
  const mapImage = mapConfig[selectedMap] || '/maps/ambrose_valley.png';
  const insights = useMemo(() => generateInsights(filteredEvents, layers), [filteredEvents, layers]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <TopBar
        maps={maps}
        matches={matches}
        filters={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar layers={layers} onToggleLayer={(key) => setLayers((current) => ({ ...current, [key]: !current[key] }))} />

        <main className="min-h-0 flex-1 p-4">
          <MapView events={filteredEvents} layers={layers} mapImage={mapImage} />
        </main>

        <InsightsPanel insights={insights} />
      </div>

      <Timeline minTimestamp={minTimestamp} maxTimestamp={maxTimestamp} value={timelinePercent} onChange={setTimelinePercent} />
    </div>
  );
}

export default App;
