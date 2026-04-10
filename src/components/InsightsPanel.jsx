const InsightsPanel = ({ insights }) => (
  <aside className="w-80 border-l border-slate-700 bg-slate-900/70 p-4">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Insights</h2>
    <div className="space-y-3">
      {insights.map((insight) => (
        <article key={insight.title} className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
          <h3 className="mb-2 text-sm font-semibold text-sky-300">{insight.title}</h3>
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
