import { useMemo, useState } from 'react';
import { formatTimestamp, groupPathByPlayer } from '../utils/analytics';

const COLORS = {
  kill: '#ef4444',
  death: '#3b82f6',
  loot: '#facc15',
  storm_death: '#a855f7',
};

const MapView = ({ events, layers, mapImage }) => {
  const [tooltip, setTooltip] = useState(null);

  const playerPaths = useMemo(() => groupPathByPlayer(events), [events]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
      <img src={mapImage} alt="Selected game map" className="h-full w-full object-contain" onError={(e)=>{e.currentTarget.style.opacity='0.1';}} />

      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        {layers.heatmap && (
          <defs>
            <radialGradient id="heat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,70,0,0.45)" />
              <stop offset="100%" stopColor="rgba(255,0,0,0)" />
            </radialGradient>
          </defs>
        )}

        {layers.heatmap &&
          events.map((event, index) => (
            <circle key={`heat-${index}`} cx={event.x * 1000} cy={event.y * 1000} r="22" fill="url(#heat)" />
          ))}

        {layers.playerPaths &&
          Array.from(playerPaths.entries()).map(([playerId, points]) => (
            <polyline
              key={playerId}
              points={points.map((point) => `${point.x * 1000},${point.y * 1000}`).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.6"
            />
          ))}
      </svg>

      <div className="absolute inset-0">
        {events.map((event, index) => {
          const visible =
            (event.event_type !== 'kill' || layers.killEvents) &&
            (event.event_type !== 'death' || layers.deathEvents) &&
            (event.event_type !== 'loot' || layers.lootEvents) &&
            (event.event_type !== 'storm_death' || layers.stormDeaths);

          if (!visible || !COLORS[event.event_type]) {
            return null;
          }

          return (
            <button
              key={`${event.player_id}-${event.timestamp}-${index}`}
              type="button"
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950"
              style={{
                left: `${event.x * 100}%`,
                top: `${event.y * 100}%`,
                background: COLORS[event.event_type],
              }}
              onMouseEnter={() =>
                setTooltip({
                  x: event.x,
                  y: event.y,
                  playerId: event.player_id,
                  eventType: event.event_type,
                  timestamp: event.timestamp,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-slate-600 bg-slate-950/90 px-3 py-2 text-xs shadow-lg"
          style={{ left: `calc(${tooltip.x * 100}% + 10px)`, top: `calc(${tooltip.y * 100}% - 10px)` }}
        >
          <p>
            <span className="text-slate-400">Player:</span> {tooltip.playerId}
          </p>
          <p>
            <span className="text-slate-400">Event:</span> {tooltip.eventType}
          </p>
          <p>
            <span className="text-slate-400">Time:</span> {formatTimestamp(tooltip.timestamp)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
