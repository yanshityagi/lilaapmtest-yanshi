const SummaryBar = ({ stats }) => (
  <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-700 bg-slate-900/85 p-4 shadow-sm shadow-black/30 xl:grid-cols-4">
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">Total Players</p>
      <p className="text-lg font-semibold text-slate-100">{stats.totalPlayers}</p>
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">Total Kills</p>
      <p className="text-lg font-semibold text-slate-100">{stats.totalKills}</p>
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">Top Kill Zone</p>
      <p className="text-sm font-semibold text-rose-300">{stats.topKillZone}</p>
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">Least Visited Zone</p>
      <p className="text-sm font-semibold text-amber-300">{stats.leastVisitedZone}</p>
    </div>
  </div>
);

export default SummaryBar;
