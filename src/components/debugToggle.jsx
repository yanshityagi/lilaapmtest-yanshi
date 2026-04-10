// DebugToggle.jsx
import React from 'react';

export default function DebugToggle({ mapApi }) {
  const [on, setOn] = React.useState(false);

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (mapApi?.setDebugMode) mapApi.setDebugMode(next);
  };

  return (
    <div className="flex items-center gap-2" title="Shows coordinate grid and debug overlays">
      <label className="text-sm font-medium">Debug Mode</label>
      <button
        onClick={toggle}
        className={`px-2 py-1 rounded border ${on ? 'bg-gray-200' : 'bg-white'}`}
        aria-pressed={on}
      >
        {on ? 'On' : 'Off'}
      </button>
    </div>
  );
}