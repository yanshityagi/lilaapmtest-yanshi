import { useEffect, useMemo, useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import InsightsPanel from './components/InsightsPanel';
import Timeline from './components/Timeline';
import SummaryBar from './components/SummaryBar';
import { getGameData } from './data/gameDataAdapter';
import { generateInsights } from './utils/analytics';

const DEFAULT_FOCUS_RADIUS = 0.14;
const ZONES = [
  ['North-West', 'North', 'North-East'],
  ['West', 'Center', 'East'],
  ['South-West', 'South', 'South-East'],
];

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

const zoneName = (x, y) => {
  const col = Math.min(2, Math.floor(Math.max(0, Math.min(0.999, x)) * 3));
  const row = Math.min(2, Math.floor(Math.max(0, Math.min(0.999, y)) * 3));
  return ZONES[row][col];
};

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
  const [isPlaying, setIsPlaying] = useState(false);
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

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimelinePercent((current) => {
        const next = current + 1;
        if (next >= 100) {
          window.clearInterval(intervalId);
          setIsPlaying(false);
          return 100;
        }
        return next;
      });
    }, 90);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);

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
  const insights = useMemo(() => generateInsights(visibleEvents), [visibleEvents]);

  const summaryStats = useMemo(() => {
    const totalPlayers = new Set(visibleEvents.map((event) => event.player_id)).size;
    const totalKills = visibleEvents.filter((event) => event.event_type === 'kill').length;

    const killZoneCounts = visibleEvents
      .filter((event) => event.event_type === 'kill')
      .reduce((acc, event) => {
        const zone = zoneName(event.x, event.y);
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
      }, {});

    const visitZoneCounts = visibleEvents.reduce((acc, event) => {
      const zone = zoneName(event.x, event.y);
      acc[zone] = (acc[zone] || 0) + 1;
      return acc;
    }, {});

    const topKillZone = Object.entries(killZoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const leastVisitedZone = Object.entries(visitZoneCounts).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';

    return {
      totalPlayers,
      totalKills,
      topKillZone,
      leastVisitedZone,
    };
  }, [visibleEvents]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
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

      <div className="flex min-h-0 flex-1 gap-4 p-4">
        <Sidebar layers={layers} onToggleLayer={(key) => setLayers((current) => ({ ...current, [key]: !current[key] }))} />

        <main className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SummaryBar stats={summaryStats} />
          <div className="mt-4 min-h-0 h-[calc(100%-88px)]">
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
          </div>
        </main>

        <InsightsPanel insights={insights} />
      </div>

      <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-4 shadow-[0_-1px_0_0_rgba(226,232,240,1)]">
        <Timeline
        minTimestamp={minTimestamp}
        maxTimestamp={maxTimestamp}
        value={timelinePercent}
        onChange={(value) => {
          setTimelinePercent(value);
          setIsPlaying(false);
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((current) => !current)}
        />
      </div>
    </div>
  );
}

export default App;
