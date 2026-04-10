const InsightsPanel = ({ insights }) => (
  <aside className="w-80 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Legend</p>
      <div className="mb-2 space-y-1 text-slate-700">
        <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full border border-slate-400 bg-green-500" />Human</div>
        <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 border border-slate-400 bg-orange-500" />Bot</div>
      </div>
      <div className="space-y-1 border-t border-slate-200 pt-2 text-slate-700">
        <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />Kill</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />Death</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />Loot</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />Storm</div>
      </div>
    </div>

    <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Insights</h2>
    <div className="space-y-3">
      {insights.slice(0, 3).map((insight, index) => (
        <article key={`${insight.category}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 inline-block rounded bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">{insight.category}</p>
          <p className="mb-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Observation:</span> {insight.observation}
          </p>
          <p className="mb-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Evidence:</span> {insight.evidence}
          </p>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Suggested action:</span> {insight.action}
          </p>
        </article>
      ))}
    </div>
  </aside>
);

export default InsightsPanel;
