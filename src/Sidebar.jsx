import React, { useState } from 'react';
import './styles/ui-overrides.css';

/**
 * Sidebar
 * Lightweight UI-only sidebar that toggles layers/filters.
 * - Does NOT change data or map rendering logic.
 * - Calls window.mapApi.* handlers if your map exposes them (defensive).
 */
export default function Sidebar({
  onTogglePaths,
  onToggleHighIntensityOnly,
  onToggleHeatmap,
  initial = { paths: true, highOnly: false, heatmap: true },
}) {
  const [pathsEnabled, setPathsEnabled] = useState(initial.paths);
  const [highOnly, setHighOnly] = useState(initial.highOnly);
  const [heatmapEnabled, setHeatmapEnabled] = useState(initial.heatmap);

  const callMapApi = (fnName, ...args) => {
    try {
      if (window.mapApi && typeof window.mapApi[fnName] === 'function') {
        window.mapApi[fnName](...args);
      }
    } catch (e) {
      // defensive: do not throw, map API might not be present in all environments
      // eslint-disable-next-line no-console
      console.warn('mapApi call failed', fnName, e);
    }
  };

  const togglePaths = (checked) => {
    setPathsEnabled(checked);
    onTogglePaths?.(checked);
    callMapApi('setPathsVisibility', checked);
  };

  const toggleHighOnly = (checked) => {
    setHighOnly(checked);
    onToggleHighIntensityOnly?.(checked);
    callMapApi('setHighIntensityOnly', checked);
  };

  const toggleHeatmap = (checked) => {
    setHeatmapEnabled(checked);
    onToggleHeatmap?.(checked);
    callMapApi('setHeatmapVisibility', checked);
  };

  return (
    <div className="panel" style={{ padding: 16 }}>
      <div className="mb-4">
        <div className="font-semibold text-sm">Layers</div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium">Movement</div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm">Player Paths</div>
          <input
            aria-label="Toggle player paths"
            type="checkbox"
            checked={pathsEnabled}
            onChange={(e) => togglePaths(e.target.checked)}
          />
        </div>
        <div className="text-xs text-mutedText mt-1">Reduced opacity by default for low visual clutter</div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium">Combat</div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm">Heatmap</div>
          <input
            aria-label="Toggle heatmap"
            type="checkbox"
            checked={heatmapEnabled}
            onChange={(e) => toggleHeatmap(e.target.checked)}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium">Filters</div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm">High-intensity zones only</div>
          <input
            aria-label="High intensity zones only"
            type="checkbox"
            checked={highOnly}
            onChange={(e) => toggleHighOnly(e.target.checked)}
          />
        </div>
        <div className="text-xs text-mutedText mt-1">Show only hotspots to reduce noise</div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium">Analysis</div>
        <div className="text-xs text-mutedText mt-2">
          Use Insights on the right to highlight regions on the map. Hover to preview; click to focus.
        </div>
      </div>
    </div>
  );
}