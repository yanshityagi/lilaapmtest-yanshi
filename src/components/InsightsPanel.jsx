// src/components/InsightsPanel.jsx
import React from 'react';

const LegendBlock = () => (
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
);

const InsightsPanel = ({ insights = [] }) => {
  // defensive map API helpers
  const callMapApi = (fn, ...args) => {
    try {
      if (window.mapApi && typeof window.mapApi[fn] === 'function') {
        window.mapApi[fn](...args);
      }
    } catch (e) {
      // noop: do not throw; mapApi might not exist in every environment
      // eslint-disable-next-line no-console
      console.warn('mapApi call failed', fn, e);
    }
  };

  const handleHover = (insight, enter) => {
    if (!insight.regionId) return;
    callMapApi('highlightRegion', insight.regionId, !!enter);
  };

  const handleClick = (insight) => {
    if (!insight.regionId) return;
    callMapApi('focusRegion', insight.regionId);
    callMapApi('dimOtherRegions', insight.regionId);
  };

  return (
    <aside
      className="w-80 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{
        maxHeight: 'calc(100vh - 140px)',
        overflowY: 'auto',
        paddingRight: 12,
      }}
      aria-label="Insights and legend"
    >
      <LegendBlock />

      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Insights</h2>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
            <div className="font-medium">No insights available</div>
            <div className="text-xs text-slate-500 mt-1">Try widening the time range or selecting a different match/map.</div>
          </div>
        ) : (
          insights.map((insight, index) => (
            <article
              key={`${insight.category || 'insight'}-${index}`}
              role="button"
              tabIndex={0}
              onMouseEnter={() => handleHover(insight, true)}
              onMouseLeave={() => handleHover(insight, false)}
              onClick={() => handleClick(insight)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(insight);
                }
              }}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <p className="mb-2 inline-block rounded bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                {insight.category || 'Analysis'}
              </p>
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
          ))
        )}
      </div>
    </aside>
  );
};

export default InsightsPanel;