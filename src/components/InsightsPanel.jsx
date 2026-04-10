const InsightsPanel = ({ insights }) => (
  <aside className="w-80 border-l border-slate-700 bg-slate-900/70 p-4">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Insights</h2>
    <div className="space-y-3">
      {insights.slice(0, 3).map((insight, index) => (
        <article key={`${insight.category}-${index}`} className="rounded-lg border border-slate-700 bg-slate-800/85 p-3 shadow-sm shadow-black/30">
          <p className="mb-2 inline-block rounded bg-sky-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200">{insight.category}</p>
          <p className="mb-2 text-sm text-slate-200">
            <span className="font-medium text-slate-100">Observation:</span> {insight.observation}
          </p>
          <p className="mb-2 text-xs text-slate-300">
            <span className="font-medium text-slate-100">Evidence:</span> {insight.evidence}
          </p>
          <p className="text-xs text-slate-300">
            <span className="font-medium text-slate-100">Suggested action:</span> {insight.action}
          </p>
        </article>
      ))}
    </div>
  </aside>
);

export default InsightsPanel;
