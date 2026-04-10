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
  if (!events.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };

  const xs = events.map((e) => e.x);
  const ys = events.map((e) => e.y);

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
  const nx = clamp01((x - bounds.minX) / (bounds.maxX - bounds.minX));
  const ny = clamp01((y - bounds.minY) / (bounds.maxY - bounds.minY));
  const oy = invertY ? 1 - ny : ny;

  return { x: nx * width, y: oy * height };
};

const computeStageSize = (cw, ch, ratio) => {
  if (!cw || !ch || !ratio) return { width: 0, height: 0 };

  const containerRatio = cw / ch;
  if (containerRatio > ratio) {
    return { width: ch * ratio, height: ch };
  }
  return { width: cw, height: cw / ratio };
};

const getActorStyle = (event) => ACTOR_STYLE[event.actor_type] || ACTOR_STYLE.human;

const MapView = ({
  events,
  visibleEvents,
  layers,
  heatmapMode = 'none',
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
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setStageSize(
        computeStageSize(entry.contentRect.width, entry.contentRect.height, imageRatio)
      );
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [imageRatio]);

  const mappedVisibleEvents = useMemo(
    () =>
      visibleEvents.map((e) => ({
        ...e,
        mapped: mapPointToPixel(e, bounds, stageSize.width, stageSize.height, invertY),
      })),
    [visibleEvents, bounds, stageSize, invertY]
  );

  const killHeatmapEvents = useMemo(
    () => mappedVisibleEvents.filter((e) => e.event_type === 'kill'),
    [mappedVisibleEvents]
  );

  const deathHeatmapEvents = useMemo(
    () => mappedVisibleEvents.filter((e) => e.event_type === 'death'),
    [mappedVisibleEvents]
  );

  const movementHeatmapEvents = mappedVisibleEvents;

  const activeHeatmapLabel =
    heatmapMode === 'kill'
      ? 'Kill'
      : heatmapMode === 'death'
      ? 'Death'
      : heatmapMode === 'movement'
      ? 'Movement'
      : null;

  const focusPixel = useMemo(() => {
    if (!focusRegion) return null;

    const center = mapPointToPixel(
      focusRegion,
      bounds,
      stageSize.width,
      stageSize.height,
      invertY
    );

    return {
      ...center,
      radius: focusRegion.radius * Math.min(stageSize.width, stageSize.height),
    };
  }, [focusRegion, bounds, stageSize, invertY]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-slate-100"
    >
      <div style={{ width: stageSize.width, height: stageSize.height }} className="relative">

        <img
          src={mapImage}
          alt="map"
          className={`h-full w-full ${focusRegion ? 'opacity-40' : ''}`}
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth && naturalHeight) {
              setImageRatio(naturalWidth / naturalHeight);
            }
          }}
        />


        <svg className="absolute inset-0 w-full h-full">

          <defs>
            <radialGradient id="kill-heat">
              <stop offset="0%" stopColor="rgba(255,70,0,0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="death-heat">
              <stop offset="0%" stopColor="rgba(255,40,0,0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <radialGradient id="movement-heat">
              <stop offset="0%" stopColor="rgba(255,120,0,0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* ✅ Heatmap only if active */}
          {heatmapMode !== 'none' && (
            <>
              {heatmapMode === 'movement' &&
                movementHeatmapEvents.map((e, i) => (
                  <circle key={i} cx={e.mapped.x} cy={e.mapped.y} r="12" fill="url(#movement-heat)" />
                ))}

              {heatmapMode === 'kill' &&
                killHeatmapEvents.map((e, i) => (
                  <circle key={i} cx={e.mapped.x} cy={e.mapped.y} r="14" fill="url(#kill-heat)" />
                ))}

              {heatmapMode === 'death' &&
                deathHeatmapEvents.map((e, i) => (
                  <circle key={i} cx={e.mapped.x} cy={e.mapped.y} r="14" fill="url(#death-heat)" />
                ))}
            </>
          )}

          {/* Paths */}
          {layers.playerPaths &&
            Array.from(playerPaths.entries()).map(([playerId, points]) => {
              const style = getActorStyle(points[0]);
              return (
                <polyline
                  key={playerId}
                  points={points
                    .map((p) =>
                      mapPointToPixel(p, bounds, stageSize.width, stageSize.height, invertY)
                    )
                    .map((p) => `${p.x},${p.y}`)
                    .join(' ')}
                  fill="none"
                  stroke={style.markerColor}
                  strokeOpacity="0.2"
                  strokeWidth="2"
                  strokeDasharray={style.pathDash}
                />
              );
            })}
        </svg>

        {/* Event markers */}
        <div className="absolute inset-0">
          {mappedVisibleEvents.map((event, index) => {
            const visible =
              (event.event_type !== 'kill' || layers.killEvents) &&
              (event.event_type !== 'death' || layers.deathEvents);

            if (!visible) return null;

            const style = getActorStyle(event);

            return (
              <button
                key={index}
                className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 border"
                style={{
                  left: event.mapped.x,
                  top: event.mapped.y,
                  background: style.markerColor,
                }}
                onClick={() => onFocusSelect(event)}
                onMouseEnter={() =>
                  setTooltip({
                    x: event.mapped.x,
                    y: event.mapped.y,
                    event,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute text-xs bg-black text-white px-2 py-1 rounded"
            style={{ left: tooltip.x + 8, top: tooltip.y }}
          >
            {tooltip.event.event_type}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;