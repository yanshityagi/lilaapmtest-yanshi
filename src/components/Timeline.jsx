const Timeline = ({ minTimestamp, maxTimestamp, value, onChange, isPlaying, onTogglePlay }) => {
  const hasRange = Number.isFinite(minTimestamp) && Number.isFinite(maxTimestamp) && minTimestamp !== maxTimestamp;

  return (
    <footer className="w-full rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3 text-xs text-slate-700">
        <span className="w-20 font-semibold">Timeline</span>
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!hasRange}
          className="rounded border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold disabled:opacity-50"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          disabled={!hasRange}
        />
        <span className="w-12 text-right font-semibold">{value}%</span>
      </div>
    </footer>
  );
};

export default Timeline;
