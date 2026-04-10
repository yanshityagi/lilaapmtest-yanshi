const TopBar = ({ maps, matches, filters, onFilterChange, debugMode, onToggleDebug }) => {
  return (
    <header className="flex items-center gap-4 border-b border-slate-700 bg-slate-900/90 px-4 py-3">
      <h1 className="mr-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Player Journey Tool</h1>

      <select
        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
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
        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
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

      <div className="ml-auto flex rounded-lg border border-slate-600 bg-slate-800 p-1 text-sm">
        {['all', 'solo', 'squad'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onFilterChange('playerType', type)}
            className={`rounded-md px-3 py-1 capitalize transition ${
              filters.playerType === type ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onToggleDebug}
        className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
          debugMode
            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
            : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        Debug {debugMode ? 'On' : 'Off'}
      </button>
    </header>
  );
};

export default TopBar;
