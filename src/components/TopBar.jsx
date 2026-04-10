const TopBar = ({ maps = [], matches = [], filters = {}, onFilterChange }) => {
  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white topbar-compact shadow-sm">
      <h1 className="ml-4 text-sm font-bold uppercase tracking-wide text-slate-700">Player Journey Tool</h1>

      <select
        className="ml-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
        value={filters.map}
        onChange={(e) => onFilterChange('map', e.target.value)}
      >
        <option value="all">All Maps</option>
        {maps.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
        value={filters.match}
        onChange={(e) => onFilterChange('match', e.target.value)}
      >
        <option value="all">All Matches</option>
        {matches.map((id) => <option key={id} value={id}>{id}</option>)}
      </select>

      <div className="ml-auto flex rounded-lg border border-slate-300 bg-slate-50 p-1 text-sm mr-4">
        {['all','solo','squad'].map((t) => (
          <button key={t} type="button" onClick={() => onFilterChange('playerType', t)}
            className={`rounded-md px-2 py-1 text-sm ${filters.playerType === t ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;