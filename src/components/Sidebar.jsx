const layerLabelMap = {
  playerPaths: 'Player Paths',
  killEvents: 'Kill Events',
  deathEvents: 'Death Events',
  lootEvents: 'Loot Events',
  stormDeaths: 'Storm Deaths',
  killHeatmap: 'Kill Heatmap',
  deathHeatmap: 'Death Heatmap',
  movementHeatmap: 'Movement Heatmap',
};

const Sidebar = ({ layers, onToggleLayer }) => (
  <aside className="w-64 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Layers</h2>
    <div className="space-y-2">
      {Object.keys(layerLabelMap).map((key) => (
        <label key={key} className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-medium">{layerLabelMap[key]}</span>
          <input type="checkbox" checked={layers[key]} onChange={() => onToggleLayer(key)} className="h-4 w-4 accent-slate-700" />
        </label>
      ))}
    </div>
  </aside>
);

export default Sidebar;
