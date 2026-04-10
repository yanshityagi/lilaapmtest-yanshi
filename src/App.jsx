import { useEffect, useMemo, useState } from 'react'

const initialToggles = [
  { id: 'traffic', label: 'Traffic', enabled: true },
  { id: 'weather', label: 'Weather', enabled: false },
  { id: 'events', label: 'Events', enabled: true },
  { id: 'heatmap', label: 'Heatmap', enabled: true },
]

const overlaySize = { width: 100, height: 100 }

function App() {
  const [toggles, setToggles] = useState(initialToggles)
  const [timeline, setTimeline] = useState(100)
  const [selectedMap, setSelectedMap] = useState('All')
  const [selectedMatch, setSelectedMatch] = useState('All')
  const [selectedPlayerType, setSelectedPlayerType] = useState('All')
  const [localData, setLocalData] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadLocalJson = async () => {
      setIsLoadingData(true)
      setLoadError('')

      try {
        const response = await fetch('/data/local-insights.json')

        if (!response.ok) {
          throw new Error(`Failed to load local JSON (status: ${response.status})`)
        }

        const data = await response.json()
        setLocalData(data)

        console.group('Local JSON structure')
        console.log('Top-level keys:', Object.keys(data))
        console.log('meta keys:', Object.keys(data.meta ?? {}))
        console.log('summary keys:', Object.keys(data.summary ?? {}))
        console.log('timeline length:', Array.isArray(data.timeline) ? data.timeline.length : 0)
        console.log('entities length:', Array.isArray(data.entities) ? data.entities.length : 0)
        console.log('playerPaths length:', Array.isArray(data.playerPaths) ? data.playerPaths.length : 0)
        console.log('markers length:', Array.isArray(data.markers) ? data.markers.length : 0)
        console.groupEnd()
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unknown loading error')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadLocalJson()
  }, [])

  const mapWidth = localData?.meta?.mapDimensions?.width ?? 1
  const mapHeight = localData?.meta?.mapDimensions?.height ?? 1

  const allTimestamps = useMemo(() => {
    if (!localData) return []

    const pathTimes = (localData.playerPaths ?? []).flatMap((path) =>
      (path.positions ?? []).map((position) => new Date(position.timestamp).getTime()),
    )
    const markerTimes = (localData.markers ?? []).map((marker) => new Date(marker.timestamp).getTime())
    const entityTimes = (localData.entities ?? []).map((entity) => new Date(entity.timestamp).getTime())

    return [...pathTimes, ...markerTimes, ...entityTimes].filter((time) => Number.isFinite(time))
  }, [localData])

  const timelineBounds = useMemo(() => {
    if (!allTimestamps.length) return { min: Date.now(), max: Date.now() }
    return {
      min: Math.min(...allTimestamps),
      max: Math.max(...allTimestamps),
    }
  }, [allTimestamps])

  const timelineCutoff = useMemo(() => {
    const { min, max } = timelineBounds
    return min + ((max - min) * timeline) / 100
  }, [timeline, timelineBounds])

  const filteredEntities = useMemo(() => {
    const entities = Array.isArray(localData?.entities) ? localData.entities : []

    return entities.filter((entity) => {
      const ts = new Date(entity.timestamp).getTime()
      const mapMatches = selectedMap === 'All' || entity.map === selectedMap
      const matchMatches = selectedMatch === 'All' || entity.match === selectedMatch
      const playerMatches = selectedPlayerType === 'All' || entity.type === selectedPlayerType
      const timeMatches = ts <= timelineCutoff
      return mapMatches && matchMatches && playerMatches && timeMatches
    })
  }, [localData, selectedMap, selectedMatch, selectedPlayerType, timelineCutoff])

  const scaledEntities = useMemo(
    () =>
      filteredEntities.map((entity) => ({
        ...entity,
        scaledX: (entity.x / mapWidth) * overlaySize.width,
        scaledY: (entity.y / mapHeight) * overlaySize.height,
      })),
    [filteredEntities, mapHeight, mapWidth],
  )

  const scaledPaths = useMemo(() => {
    const paths = Array.isArray(localData?.playerPaths) ? localData.playerPaths : []

    return paths
      .filter((path) => {
        const mapMatches = selectedMap === 'All' || path.map === selectedMap
        const matchMatches = selectedMatch === 'All' || path.match === selectedMatch
        const playerMatches = selectedPlayerType === 'All' || path.type === selectedPlayerType
        return mapMatches && matchMatches && playerMatches
      })
      .map((path) => {
        const ordered = [...path.positions]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .filter((position) => new Date(position.timestamp).getTime() <= timelineCutoff)

        const scaledPositions = ordered.map((position) => ({
          x: (position.x / mapWidth) * overlaySize.width,
          y: (position.y / mapHeight) * overlaySize.height,
        }))

        return {
          playerId: path.playerId,
          type: path.type,
          points: scaledPositions.map((point) => `${point.x},${point.y}`).join(' '),
          scaledPositions,
          hasEnoughPoints: scaledPositions.length >= 2,
        }
      })
      .filter((path) => path.hasEnoughPoints)
  }, [localData, mapHeight, mapWidth, selectedMap, selectedMatch, selectedPlayerType, timelineCutoff])

  const scaledMarkers = useMemo(() => {
    const markers = Array.isArray(localData?.markers) ? localData.markers : []

    return markers
      .filter((marker) => {
        const ts = new Date(marker.timestamp).getTime()
        const mapMatches = selectedMap === 'All' || marker.map === selectedMap
        const matchMatches = selectedMatch === 'All' || marker.match === selectedMatch
        const playerMatches = selectedPlayerType === 'All' || marker.actorType === selectedPlayerType
        const timeMatches = ts <= timelineCutoff
        return mapMatches && matchMatches && playerMatches && timeMatches
      })
      .map((marker) => ({
        ...marker,
        scaledX: (marker.x / mapWidth) * overlaySize.width,
        scaledY: (marker.y / mapHeight) * overlaySize.height,
      }))
  }, [localData, mapHeight, mapWidth, selectedMap, selectedMatch, selectedPlayerType, timelineCutoff])

  const toggleLayer = (id) => {
    setToggles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
  }


  const isHeatmapEnabled = toggles.find((item) => item.id === 'heatmap')?.enabled ?? false

  const heatPoints = useMemo(
    () => [
      ...scaledEntities.map((entity) => ({ x: entity.scaledX, y: entity.scaledY, weight: 1 })),
      ...scaledMarkers.map((marker) => ({ x: marker.scaledX, y: marker.scaledY, weight: 0.7 })),
    ],
    [scaledEntities, scaledMarkers],
  )


  const toZoneKey = (x, y) => {
    const col = Math.min(3, Math.max(0, Math.floor(x / 25)))
    const row = Math.min(3, Math.max(0, Math.floor(y / 25)))
    return `R${row + 1}-C${col + 1}`
  }

  const insightCards = useMemo(() => {
    const deathZones = scaledMarkers
      .filter((marker) => marker.type === 'death')
      .reduce((acc, marker) => {
        const key = toZoneKey(marker.scaledX, marker.scaledY)
        acc[key] = (acc[key] ?? 0) + 1
        return acc
      }, {})

    const highDeathZones = Object.entries(deathZones)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    const trafficCounts = {}
    for (let row = 1; row <= 4; row += 1) {
      for (let col = 1; col <= 4; col += 1) {
        trafficCounts[`R${row}-C${col}`] = 0
      }
    }

    const movementTrafficPoints = scaledPaths.flatMap((path) => path.scaledPositions)
    ;[...scaledEntities, ...movementTrafficPoints].forEach((item) => {
      const key = toZoneKey(item.scaledX ?? item.x, item.scaledY ?? item.y)
      trafficCounts[key] += 1
    })

    const lowTrafficZones = Object.entries(trafficCounts)
      .filter(([, count]) => count <= 2)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)

    const botZones = [
      ...scaledEntities.filter((entity) => entity.type === 'Bot').map((entity) => ({ x: entity.scaledX, y: entity.scaledY })),
      ...scaledPaths
        .filter((path) => path.type === 'Bot')
        .flatMap((path) => path.scaledPositions),
    ].reduce((acc, point) => {
      const key = toZoneKey(point.x, point.y)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    const botClusters = Object.entries(botZones)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    return {
      highDeathZones,
      lowTrafficZones,
      botClusters,
    }
  }, [scaledEntities, scaledMarkers, scaledPaths])

  return (
    <div className="app-shell">
      <header className="top-bar card">
        <div className="filters">
          <label>
            Map
            <select value={selectedMap} onChange={(e) => setSelectedMap(e.target.value)}>
              <option>All</option>
              {(localData?.meta?.maps ?? []).map((map) => (
                <option key={map}>{map}</option>
              ))}
            </select>
          </label>
          <label>
            Match
            <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}>
              <option>All</option>
              {(localData?.meta?.matches ?? []).map((match) => (
                <option key={match}>{match}</option>
              ))}
            </select>
          </label>
          <label>
            Player Type
            <select value={selectedPlayerType} onChange={(e) => setSelectedPlayerType(e.target.value)}>
              <option>All</option>
              <option>Human</option>
              <option>Bot</option>
            </select>
          </label>
          <span className="data-status" role="status">
            {isLoadingData
              ? 'Loading local JSON…'
              : loadError
                ? `Load error: ${loadError}`
                : 'Local JSON loaded'}
          </span>
        </div>
      </header>

      <div className="content-grid">
        <aside className="left-sidebar card">
          <h2>Layers</h2>
          {toggles.map((item) => (
            <label key={item.id} className="toggle-row">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={() => toggleLayer(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </aside>

        <main className="map-area card">
          <h2>Map Area</h2>
          <div className="map-stage" aria-label="Minimap with overlay">
            <div className="minimap-surface" aria-label="Map background" />
            <svg
              className="map-overlay"
              viewBox={`0 0 ${overlaySize.width} ${overlaySize.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" className="overlay-frame" />
              {isHeatmapEnabled && (
                <g className="heatmap-layer"> 
                  {heatPoints.map((point, idx) => (
                    <circle
                      key={`heat-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r={4.5 * point.weight}
                      className="heat-point"
                    />
                  ))}
                </g>
              )}
              {scaledPaths.map((path) => (
                <polyline
                  key={path.playerId}
                  points={path.points}
                  className={path.type === 'Human' ? 'movement-line human-line' : 'movement-line bot-line'}
                />
              ))}

              {scaledMarkers.map((marker) => (
                <circle
                  key={marker.id}
                  cx={marker.scaledX}
                  cy={marker.scaledY}
                  r="1.4"
                  className={`event-marker ${marker.type}-marker`}
                />
              ))}
              {scaledEntities.map((entity) => (
                <circle
                  key={entity.id}
                  cx={entity.scaledX}
                  cy={entity.scaledY}
                  r="1.8"
                  className={entity.type === 'Human' ? 'entity-dot human-dot' : 'entity-dot bot-dot'}
                />
              ))}
            </svg>
          </div>
        </main>

        <aside className="right-panel card">
          <h2>Insights</h2>
          <div className="insight-cards">
            <article className="insight-card high-death">
              <h3>High death zones</h3>
              <p>Highest concentration of death events.</p>
              {insightCards.highDeathZones.length ? (
                <ul>
                  {insightCards.highDeathZones.map(([zone, count]) => (
                    <li key={zone}>{zone}: {count} deaths</li>
                  ))}
                </ul>
              ) : (
                <p>No death hotspots in current filter window.</p>
              )}
            </article>

            <article className="insight-card low-traffic">
              <h3>Low traffic zones</h3>
              <p>Fewest movement + entity points.</p>
              <ul>
                {insightCards.lowTrafficZones.map(([zone, count]) => (
                  <li key={zone}>{zone}: {count} events</li>
                ))}
              </ul>
            </article>

            <article className="insight-card bot-cluster">
              <h3>Bot clusters</h3>
              <p>Zones with dense bot presence.</p>
              {insightCards.botClusters.length ? (
                <ul>
                  {insightCards.botClusters.map(([zone, count]) => (
                    <li key={zone}>{zone}: {count} bots</li>
                  ))}
                </ul>
              ) : (
                <p>No bot clusters detected.</p>
              )}
            </article>
          </div>

          <p className="helper-text">Heatmap: {isHeatmapEnabled ? 'On' : 'Off'}</p>
          {isLoadingData && <p className="helper-text">Loading local JSON file...</p>}
          {!isLoadingData && !loadError && (
            <p className="helper-text">Loaded timeline entries: {localData?.timeline?.length ?? 0}</p>
          )}
          {!!loadError && <p className="helper-text error-text">{loadError}</p>}
        </aside>
      </div>

      <footer className="bottom-timeline card">
        <label htmlFor="timeline-slider">
          Timeline: {timeline}% ({new Date(timelineCutoff).toISOString()})
        </label>
        <input
          id="timeline-slider"
          type="range"
          min="0"
          max="100"
          value={timeline}
          onChange={(e) => setTimeline(Number(e.target.value))}
        />
      </footer>
    </div>
  )
}

export default App
