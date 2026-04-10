import { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import InsightsPanel from './components/InsightsPanel';
import Timeline from './components/Timeline';
import { getGameData } from './data/gameDataAdapter';
import { generateInsights } from './utils/analytics';

const DEFAULT_FOCUS_RADIUS = 0.14;

const initialLayers = {
  playerPaths: true,
  killEvents: true,
  deathEvents: true,
  lootEvents: true,
  stormDeaths: true,
  killHeatmap: false,
  deathHeatmap: false,
  movementHeatmap: false,
};

const buildBounds = (events) => {
  if (!events.length) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }

  const xs = events.map((event) => event.x);
  const ys = events.map((event) => event.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX: maxX === minX ? minX + 1 : maxX,
    minY,
    maxY: maxY === minY ? minY + 1 : maxY,
  };
};

const normalize = (value, min, max) => (value - min) / (max - min);

const filterByFocusRegion = (events, focusRegion) => {
  if (!focusRegion) {
    return events;
  }

  const bounds = buildBounds(events);
  return events.filter((event) => {
    const nx = normalize(event.x, bounds.minX, bounds.maxX);
    const ny = normalize(event.y, bounds.minY, bounds.maxY);
    const fx = normalize(focusRegion.x, bounds.minX, bounds.maxX);
    const fy = normalize(focusRegion.y, bounds.minY, bounds.maxY);
    return Math.hypot(nx - fx, ny - fy) <= focusRegion.radius;
  });
};

function App() {
  const [events, setEvents] = useState([]);
  const [mapConfig, setMapConfig] = useState({});
  const [layers, setLayers] = useState(initialLayers);
  const [timelinePercent, setTimelinePercent] = useState(100);
  const [debugMode, setDebugMode] = useState(false);
  const [focusRegion, setFocusRegion] = useState(null);
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


  const focusEvents = useMemo(() => filterByFocusRegion(filteredEvents, focusRegion), [filteredEvents, focusRegion]);
  const visibleEvents = focusRegion ? focusEvents : filteredEvents;

  const selectedMap = filters.map === 'all' ? maps[0] : filters.map;
  const mapImage = mapConfig[selectedMap] || '/maps/ambrose_valley.png';
  const insights = useMemo(() => generateInsights(visibleEvents, layers), [visibleEvents, layers]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <TopBar
        maps={maps}
        matches={matches}
        filters={filters}
        debugMode={debugMode}
        onToggleDebug={() => setDebugMode((current) => !current)}
        onFilterChange={(key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setFocusRegion(null);
        }}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar layers={layers} onToggleLayer={(key) => setLayers((current) => ({ ...current, [key]: !current[key] }))} />

        <main className="min-h-0 flex-1 p-4">
          <MapView
            events={filteredEvents}
            visibleEvents={visibleEvents}
            layers={layers}
            mapImage={mapImage}
            debug={debugMode}
            focusRegion={focusRegion}
            onFocusSelect={(event) => setFocusRegion({ x: event.x, y: event.y, radius: DEFAULT_FOCUS_RADIUS })}
            onFocusExit={() => setFocusRegion(null)}
          />
        </main>

        <InsightsPanel insights={insights} />
      </div>

      <Timeline minTimestamp={minTimestamp} maxTimestamp={maxTimestamp} value={timelinePercent} onChange={setTimelinePercent} />
    </div>
  );
}

export default App;
