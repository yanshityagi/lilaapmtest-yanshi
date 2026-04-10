import { useEffect, useMemo, useRef, useState } from 'react';
import { formatTimestamp, groupPathByPlayer } from '../utils/analytics';

const COLORS = {
  kill: '#ef4444',
  death: '#3b82f6',
  loot: '#facc15',
  storm_death: '#a855f7',
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));

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

const mapPointToPixel = ({ x, y }, bounds, width, height, invertY = false) => {
  // x_map = (x - min_x) / (max_x - min_x) * width
  const normalizedX = clamp01((x - bounds.minX) / (bounds.maxX - bounds.minX));

  // y_map = (y - min_y) / (max_y - min_y) * height
  const normalizedY = clamp01((y - bounds.minY) / (bounds.maxY - bounds.minY));
  const orientedY = invertY ? 1 - normalizedY : normalizedY;

  return {
    x: normalizedX * width,
    y: orientedY * height,
  };
};

const computeStageSize = (containerWidth, containerHeight, imageAspectRatio) => {
  if (!containerWidth || !containerHeight || !imageAspectRatio) {
    return { width: 0, height: 0 };
  }

  const containerAspectRatio = containerWidth / containerHeight;
  if (containerAspectRatio > imageAspectRatio) {
    return {
      width: containerHeight * imageAspectRatio,
      height: containerHeight,
    };
  }

  return {
    width: containerWidth,
    height: containerWidth / imageAspectRatio,
  };
};

const MapView = ({ events, layers, mapImage, debug = false, invertY = false }) => {
  const [tooltip, setTooltip] = useState(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  const playerPaths = useMemo(() => groupPathByPlayer(events), [events]);
  const bounds = useMemo(() => buildBounds(events), [events]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const nextSize = computeStageSize(entry.contentRect.width, entry.contentRect.height, imageRatio);
      setStageSize(nextSize);
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [imageRatio]);

  const mappedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        mapped: mapPointToPixel(event, bounds, stageSize.width, stageSize.height, invertY),
      })),
    [events, bounds, stageSize, invertY],
  );

  useEffect(() => {
    if (!debug || !mappedEvents.length) {
      return;
    }

    const sample = mappedEvents.slice(0, 5).map((event) => ({
      player_id: event.player_id,
      event_type: event.event_type,
      raw: { x: event.x, y: event.y },
      mapped: {
        x: Number(event.mapped.x.toFixed(2)),
        y: Number(event.mapped.y.toFixed(2)),
      },
    }));

    console.log('[MapView debug] mapped sample points', {
      bounds,
      stageSize,
      invertY,
      sample,
    });
  }, [debug, mappedEvents, bounds, stageSize, invertY]);

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
      <div className="relative" style={{ width: stageSize.width, height: stageSize.height }}>
        <img
          src={mapImage}
          alt="Selected game map"
          className="h-full w-full"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth && naturalHeight) {
              setImageRatio(naturalWidth / naturalHeight);
            }
          }}
          onError={(event) => {
            event.currentTarget.style.opacity = '0.1';
          }}
        />

        <svg viewBox={`0 0 ${stageSize.width || 1} ${stageSize.height || 1}`} className="pointer-events-none absolute inset-0 h-full w-full">
          {layers.heatmap && (
            <defs>
              <radialGradient id="heat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,70,0,0.45)" />
                <stop offset="100%" stopColor="rgba(255,0,0,0)" />
              </radialGradient>
            </defs>
          )}

          {debug && (
            <g>
              {Array.from({ length: 11 }).map((_, index) => {
                const x = (stageSize.width * index) / 10;
                const y = (stageSize.height * index) / 10;
                return (
                  <g key={`grid-${index}`}>
                    <line x1={x} y1={0} x2={x} y2={stageSize.height} stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                    <line x1={0} y1={y} x2={stageSize.width} y2={y} stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                  </g>
                );
              })}
            </g>
          )}

          {layers.heatmap &&
            mappedEvents.map((event, index) => (
              <circle key={`heat-${index}`} cx={event.mapped.x} cy={event.mapped.y} r="22" fill="url(#heat)" />
            ))}

          {layers.playerPaths &&
            Array.from(playerPaths.entries()).map(([playerId, points]) => (
              <polyline
                key={playerId}
                points={points
                  .map((point) => mapPointToPixel(point, bounds, stageSize.width, stageSize.height, invertY))
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.6"
              />
            ))}
        </svg>

        <div className="absolute inset-0">
          {mappedEvents.map((event, index) => {
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
                  left: `${event.mapped.x}px`,
                  top: `${event.mapped.y}px`,
                  background: COLORS[event.event_type],
                }}
                onMouseEnter={() =>
                  setTooltip({
                    x: event.mapped.x,
                    y: event.mapped.y,
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
            style={{ left: `${tooltip.x + 10}px`, top: `${tooltip.y - 10}px` }}
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
    </div>
  );
};

export default MapView;
