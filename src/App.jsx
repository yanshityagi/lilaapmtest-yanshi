import { useEffect, useState } from 'react'

const initialToggles = [
  { id: 'traffic', label: 'Traffic', enabled: true },
  { id: 'weather', label: 'Weather', enabled: false },
  { id: 'events', label: 'Events', enabled: true },
]

function App() {
  const [toggles, setToggles] = useState(initialToggles)
  const [timeline, setTimeline] = useState(50)
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
        console.groupEnd()
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unknown loading error')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadLocalJson()
  }, [])

  const toggleLayer = (id) => {
    setToggles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )
  }

  return (
    <div className="app-shell">
      <header className="top-bar card">
        <div className="filters">
          <label>
            Region
            <select>
              <option>All</option>
              <option>North</option>
              <option>South</option>
            </select>
          </label>
          <label>
            Status
            <select>
              <option>Active</option>
              <option>Idle</option>
              <option>Offline</option>
            </select>
          </label>
          <button>Apply Filters</button>
          <span className="data-status" role="status">
            {isLoadingData ? 'Loading local JSON…' : loadError ? `Load error: ${loadError}` : 'Local JSON loaded'}
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
          <div className="map-placeholder">Interactive map placeholder</div>
        </main>

        <aside className="right-panel card">
          <h2>Insights</h2>
          <ul>
            <li>Hotspots detected: {localData?.summary?.hotspots ?? '—'}</li>
            <li>Avg response time: {localData?.summary?.avgResponseMinutes ?? '—'}m</li>
            <li>Coverage score: {localData?.summary?.coverageScore ?? '—'}%</li>
          </ul>
          {isLoadingData && <p className="helper-text">Loading local JSON file...</p>}
          {!isLoadingData && !loadError && (
            <p className="helper-text">Loaded timeline entries: {localData?.timeline?.length ?? 0}</p>
          )}
          {!!loadError && <p className="helper-text error-text">{loadError}</p>}
        </aside>
      </div>

      <footer className="bottom-timeline card">
        <label htmlFor="timeline-slider">Timeline: {timeline}%</label>
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
