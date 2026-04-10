import { useState } from 'react'

const initialToggles = [
  { id: 'traffic', label: 'Traffic', enabled: true },
  { id: 'weather', label: 'Weather', enabled: false },
  { id: 'events', label: 'Events', enabled: true },
]

function App() {
  const [toggles, setToggles] = useState(initialToggles)
  const [timeline, setTimeline] = useState(50)

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
            <li>Hotspots detected: 8</li>
            <li>Avg response time: 3.2m</li>
            <li>Coverage score: 92%</li>
          </ul>
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
