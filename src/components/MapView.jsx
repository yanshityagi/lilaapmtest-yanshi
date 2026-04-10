import { useEffect, useMemo, useRef, useState } from 'react';
import { formatTimestamp, groupPathByPlayer } from '../utils/analytics';

const EVENT_COLORS = {
  kill: '#ef4444',
  death: '#3b82f6',
  loot: '#facc15',
  storm_death: '#a855f7',
};

const ACTOR_STYLE = {
  human: {
    markerColor: '#22c55e',
    markerShape: 'circle',
    pathDash: undefined,
    label: 'Human',
  },
  bot: {
    markerColor: '#f97316',
    markerShape: 'square',
    pathDash: '8 5',
    label: 'Bot',
  },
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
  const normalizedX = clamp01((x - bounds.minX) / (bounds.maxX - bounds.minX));
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

const getActorStyle = (event) => ACTOR_STYLE[event.actor_type] || ACTOR_STYLE.human;

const MapView = ({
  events,
  visibleEvents,
  layers,
  mapImage,
  debug = false,
  invertY = false,
  focusRegion,
  onFocusSelect,
  onFocusExit,
}) => {
  const [tooltip, setTooltip] = useState(null);
  const [imageRatio, setImageRatio] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  const playerPaths = useMemo(() => groupPathByPlayer(visibleEvents), [visibleEvents]);
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

  const mappedVisibleEvents = useMemo(
    () =>
      visibleEvents.map((event) => ({
        ...event,
        mapped: mapPointToPixel(event, bounds, stageSize.width, stageSize.height, invertY),
      })),
    [visibleEvents, bounds, stageSize, invertY],
  );


  const debugSamplePoints = useMemo(
    () =>
      mappedVisibleEvents.slice(0, 6).map((event, index) => ({
        id: `S${index + 1}`,
        playerId: event.player_id,
        rawX: event.x,
        rawY: event.y,
        x: event.mapped.x,
        y: event.mapped.y,
      })),
    [mappedVisibleEvents],
  );


  const killHeatmapEvents = useMemo(
    () => mappedVisibleEvents.filter((event) => event.event_type === 'kill'),
    [mappedVisibleEvents],
  );
  const deathHeatmapEvents = useMemo(
    () => mappedVisibleEvents.filter((event) => event.event_type === 'death'),
    [mappedVisibleEvents],
  );
  const movementHeatmapEvents = mappedVisibleEvents;

  const activeHeatmaps = [
    layers.killHeatmap ? 'Kill' : null,
    layers.deathHeatmap ? 'Death' : null,
    layers.movementHeatmap ? 'Movement' : null,
  ].filter(Boolean);

  const focusPixel = useMemo(() => {
    if (!focusRegion) {
      return null;
    }

    const center = mapPointToPixel(focusRegion, bounds, stageSize.width, stageSize.height, invertY);
    return {
      ...center,
      radius: focusRegion.radius * Math.min(stageSize.width, stageSize.height),
    };
  }, [focusRegion, bounds, stageSize, invertY]);

  useEffect(() => {
    if (!debug || !mappedVisibleEvents.length) {
      return;
    }

    const sample = debugSamplePoints.map((point) => ({
      sample_id: point.id,
      player_id: point.playerId,
      raw: { x: Number(point.rawX.toFixed(4)), y: Number(point.rawY.toFixed(4)) },
      mapped: { x: Number(point.x.toFixed(2)), y: Number(point.y.toFixed(2)) },
    }));

    console.log('[MapView debug] mapped sample points', {
      bounds,
      stageSize,
      invertY,
      focusMode: Boolean(focusRegion),
      sample,
    });
  }, [debug, debugSamplePoints, bounds, stageSize, invertY, focusRegion]);

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
      <div className="relative" style={{ width: stageSize.width, height: stageSize.height }}>
        <img
          src={mapImage}
          alt="Selected game map"
          className={`h-full w-full transition-opacity ${focusRegion ? 'opacity-35' : 'opacity-100'}`}
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

        <div className="absolute right-3 top-3 z-20 rounded-md border border-slate-600 bg-slate-900/85 px-3 py-2 text-xs">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full border border-slate-100 bg-green-500" />
              <span>Human</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border border-slate-100 bg-orange-500" />
              <span>Bot</span>
            </div>
          </div>
        </div>


        {activeHeatmaps.length > 0 && (
          <div className="absolute right-3 top-24 z-20 rounded-md border border-orange-400/40 bg-slate-900/80 px-3 py-2 text-[11px] text-orange-200">
            Heatmap: {activeHeatmaps.join(', ')}
          </div>
        )}

        {focusRegion && (
          <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
            <span className="rounded bg-indigo-500/80 px-2 py-1 text-[11px] font-medium">Focus Mode</span>
            <button
              type="button"
              onClick={onFocusExit}
              className="rounded border border-slate-500 bg-slate-900/85 px-2 py-1 text-[11px] hover:bg-slate-800"
            >
              Exit Focus
            </button>
          </div>
        )}

        <svg viewBox={`0 0 ${stageSize.width || 1} ${stageSize.height || 1}`} className="pointer-events-none absolute inset-0 h-full w-full">
          {(layers.killHeatmap || layers.deathHeatmap || layers.movementHeatmap) && (
            <defs>
              <radialGradient id="kill-heat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,70,0,0.34)" />
                <stop offset="55%" stopColor="rgba(255,120,0,0.18)" />
                <stop offset="100%" stopColor="rgba(255,0,0,0)" />
              </radialGradient>
              <radialGradient id="death-heat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,40,0,0.28)" />
                <stop offset="55%" stopColor="rgba(255,140,0,0.16)" />
                <stop offset="100%" stopColor="rgba(255,0,0,0)" />
              </radialGradient>
              <radialGradient id="movement-heat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,90,0,0.2)" />
                <stop offset="55%" stopColor="rgba(255,150,0,0.11)" />
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

          {debug && (
            <g>
              <circle cx="14" cy="14" r="4" fill="#34d399" />
              <text x="24" y="18" fill="#a7f3d0" fontSize="11">Origin (0,0) top-left</text>
              {debugSamplePoints.map((point) => (
                <g key={point.id}>
                  <rect x={point.x - 4.5} y={point.y - 4.5} width="9" height="9" fill="#38bdf8" stroke="#f8fafc" strokeWidth="1.5" />
                  <text x={point.x + 7} y={point.y - 6} fill="#e2e8f0" fontSize="11" fontWeight="700">
                    {point.id}
                  </text>
                </g>
              ))}
            </g>
          )}

          {focusPixel && (
            <g>
              <rect x="0" y="0" width={stageSize.width} height={stageSize.height} fill="rgba(2,6,23,0.45)" />
              <circle cx={focusPixel.x} cy={focusPixel.y} r={focusPixel.radius} fill="rgba(56,189,248,0.18)" stroke="rgba(56,189,248,0.95)" strokeWidth="2" />
            </g>
          )}

          {layers.movementHeatmap &&
            movementHeatmapEvents.map((event, index) => (
              <circle key={`movement-heat-${index}`} cx={event.mapped.x} cy={event.mapped.y} r="18" fill="url(#movement-heat)" />
            ))}

          {layers.killHeatmap &&
            killHeatmapEvents.map((event, index) => (
              <circle key={`kill-heat-${index}`} cx={event.mapped.x} cy={event.mapped.y} r="24" fill="url(#kill-heat)" />
            ))}

          {layers.deathHeatmap &&
            deathHeatmapEvents.map((event, index) => (
              <circle key={`death-heat-${index}`} cx={event.mapped.x} cy={event.mapped.y} r="24" fill="url(#death-heat)" />
            ))}

          {layers.playerPaths &&
            Array.from(playerPaths.entries()).map(([playerId, points]) => {
              const actorStyle = getActorStyle(points[0]);
              return (
                <polyline
                  key={playerId}
                  points={points
                    .map((point) => mapPointToPixel(point, bounds, stageSize.width, stageSize.height, invertY))
                    .map((point) => `${point.x},${point.y}`)
                    .join(' ')}
                  fill="none"
                  stroke={actorStyle.markerColor}
                  strokeOpacity="0.78"
                  strokeWidth="2.25"
                  strokeDasharray={actorStyle.pathDash}
                />
              );
            })}
        </svg>

        <div className="absolute inset-0">
          {mappedVisibleEvents.map((event, index) => {
            const visible =
              (event.event_type !== 'kill' || layers.killEvents) &&
              (event.event_type !== 'death' || layers.deathEvents) &&
              (event.event_type !== 'loot' || layers.lootEvents) &&
              (event.event_type !== 'storm_death' || layers.stormDeaths);

            if (!visible || !EVENT_COLORS[event.event_type]) {
              return null;
            }

            const actorStyle = getActorStyle(event);
            const baseShape = actorStyle.markerShape === 'circle' ? 'rounded-full' : '';

            return (
              <button
                key={`${event.player_id}-${event.timestamp}-${index}`}
                type="button"
                className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 border-2 border-slate-100 ${baseShape}`}
                style={{
                  left: `${event.mapped.x}px`,
                  top: `${event.mapped.y}px`,
                  background: actorStyle.markerColor,
                  boxShadow: `0 0 0 1px rgba(2,6,23,0.9), 0 0 0 2px ${EVENT_COLORS[event.event_type]}`,
                }}
                onClick={() => onFocusSelect(event)}
                onMouseEnter={() =>
                  setTooltip({
                    x: event.mapped.x,
                    y: event.mapped.y,
                    playerId: event.player_id,
                    eventType: event.event_type,
                    timestamp: event.timestamp,
                    actorType: event.actor_type,
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
              <span className="text-slate-400">Actor:</span> {tooltip.actorType || 'human'}
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
