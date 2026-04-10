const layerLabelMap = {
  playerPaths: 'Player Paths',
  killEvents: 'Kill Events',
  deathEvents: 'Death Events',
  lootEvents: 'Loot Events',
  stormDeaths: 'Storm Deaths',
  heatmap: 'Heatmap',
};

const Sidebar = ({ layers, onToggleLayer }) => (
  <aside className="w-64 border-r border-slate-700 bg-slate-900/70 p-4">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Layers</h2>
    <div className="space-y-2">
      {Object.keys(layerLabelMap).map((key) => (
        <label key={key} className="flex cursor-pointer items-center justify-between rounded-md bg-slate-800/80 px-3 py-2 text-sm">
          <span>{layerLabelMap[key]}</span>
          <input type="checkbox" checked={layers[key]} onChange={() => onToggleLayer(key)} className="h-4 w-4 accent-sky-500" />
        </label>
      ))}
    </div>
  </aside>
);

export default Sidebar;
