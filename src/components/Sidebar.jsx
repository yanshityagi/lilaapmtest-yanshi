// src/components/Sidebar.jsx
import React from 'react';

const Sidebar = ({ layers, onToggleLayer, heatmapMode, onSetHeatmapMode }) => (
  <aside className="w-56 rounded-lg border border-slate-200 bg-white panel-compact shadow-sm p-4">
    <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Layers</h2>

    <div className="mb-3">
      <div className="text-xs font-semibold text-slate-600 mb-2">Movement</div>
      <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700">
        <span className="font-medium">Player Paths</span>
        <input type="checkbox" checked={layers.playerPaths} onChange={() => onToggleLayer('playerPaths')} />
      </label>
    </div>

    <div className="mb-3">
      <div className="text-xs font-semibold text-slate-600 mb-2">Combat</div>
      <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700">
        <span className="font-medium">Kill Events</span>
        <input type="checkbox" checked={layers.killEvents} onChange={() => onToggleLayer('killEvents')} />
      </label>
      <label className="flex items-center justify-between mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700">
        <span className="font-medium">Death Events</span>
        <input type="checkbox" checked={layers.deathEvents} onChange={() => onToggleLayer('deathEvents')} />
      </label>
    </div>

    <div className="mb-3">
      <div className="text-xs font-semibold text-slate-600 mb-2">Environment</div>
      <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700">
        <span className="font-medium">Loot Events</span>
        <input type="checkbox" checked={layers.lootEvents} onChange={() => onToggleLayer('lootEvents')} />
      </label>
      <label className="flex items-center justify-between mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700">
        <span className="font-medium">Storm Deaths</span>
        <input type="checkbox" checked={layers.stormDeaths} onChange={() => onToggleLayer('stormDeaths')} />
      </label>
    </div>

    <div>
      <div className="text-xs font-semibold text-slate-600 mb-2">Heatmap</div>

      <div className="flex flex-col space-y-2 text-sm text-slate-700">
        <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="heatmapMode"
              value="none"
              checked={heatmapMode === 'none'}
              onChange={() => onSetHeatmapMode('none')}
            />
            <span>None</span>
          </div>
          <span className="text-xs text-slate-500">—</span>
        </label>

        <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="heatmapMode"
              value="kill"
              checked={heatmapMode === 'kill'}
              onChange={() => onSetHeatmapMode('kill')}
            />
            <span>Kill zones</span>
          </div>
          <span className="text-xs text-rose-500">Kill</span>
        </label>

        <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="heatmapMode"
              value="death"
              checked={heatmapMode === 'death'}
              onChange={() => onSetHeatmapMode('death')}
            />
            <span>Death zones</span>
          </div>
          <span className="text-xs text-sky-500">Death</span>
        </label>

        <label className="flex items-center justify-between px-2 py-1 rounded border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="heatmapMode"
              value="movement"
              checked={heatmapMode === 'movement'}
              onChange={() => onSetHeatmapMode('movement')}
            />
            <span>High traffic</span>
          </div>
          <span className="text-xs text-amber-500">Movement</span>
        </label>
      </div>
    </div>
  </aside>
);

export default Sidebar;