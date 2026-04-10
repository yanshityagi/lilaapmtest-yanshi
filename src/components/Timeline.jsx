const Timeline = ({ minTimestamp, maxTimestamp, value, onChange }) => {
  const hasRange = Number.isFinite(minTimestamp) && Number.isFinite(maxTimestamp) && minTimestamp !== maxTimestamp;

  return (
    <footer className="border-t border-slate-700 bg-slate-900/90 px-4 py-3">
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <span className="w-20">Timeline</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700"
          disabled={!hasRange}
        />
        <span className="w-12 text-right">{value}%</span>
      </div>
    </footer>
  );
};

export default Timeline;
