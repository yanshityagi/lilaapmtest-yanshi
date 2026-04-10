const SummaryBar = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm xl:grid-cols-4">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Total Players</p>
      <p className="text-lg font-semibold text-slate-900">{stats.totalPlayers}</p>
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Total Kills</p>
      <p className="text-lg font-semibold text-slate-900">{stats.totalKills}</p>
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Top Kill Zone</p>
      <p className="text-sm font-semibold text-slate-800">{stats.topKillZone}</p>
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Least Visited Zone</p>
      <p className="text-sm font-semibold text-slate-800">{stats.leastVisitedZone}</p>
    </div>
  </div>
);

export default SummaryBar;
