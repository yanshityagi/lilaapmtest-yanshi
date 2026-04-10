const TopBar = ({ maps, matches, filters, onFilterChange, debugMode, onToggleDebug }) => {
  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <h1 className="mr-4 text-sm font-bold uppercase tracking-wide text-slate-700">Player Journey Tool</h1>

      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        value={filters.map}
        onChange={(event) => onFilterChange('map', event.target.value)}
      >
        <option value="all">All Maps</option>
        {maps.map((mapName) => (
          <option key={mapName} value={mapName}>
            {mapName}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        value={filters.match}
        onChange={(event) => onFilterChange('match', event.target.value)}
      >
        <option value="all">All Matches</option>
        {matches.map((matchId) => (
          <option key={matchId} value={matchId}>
            {matchId}
          </option>
        ))}
      </select>

      <div className="ml-auto flex rounded-lg border border-slate-300 bg-slate-50 p-1 text-sm">
        {['all', 'solo', 'squad'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onFilterChange('playerType', type)}
            className={`rounded-md px-3 py-1 capitalize transition ${
              filters.playerType === type ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onToggleDebug}
        title="Shows coordinate grid and debug overlays"
        className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
          debugMode ? 'border-slate-400 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
        }`}
      >
        Debug Mode
      </button>
    </header>
  );
};

export default TopBar;
