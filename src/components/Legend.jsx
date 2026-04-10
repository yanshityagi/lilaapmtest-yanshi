// Legend.jsx
import React from 'react';

export default function Legend({ layers = [], mapApi }) {
  // layers: [{ id, name, color, visible }]
  const handleToggle = (layer) => {
    if (mapApi?.toggleLayer) mapApi.toggleLayer(layer.id);
    // fallback: if no mapApi, still update UI if local state used
  };

  const handleHover = (layer, enter = true) => {
    if (mapApi?.highlightLayer) mapApi.highlightLayer(layer.id, enter);
  };

  return (
    <div className="legend-compact">
      <div className="font-semibold mb-2">Legend</div>
      <ul className="space-y-2">
        {layers.map((layer) => (
          <li key={layer.id} className="flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleToggle(layer)}
              onMouseEnter={() => handleHover(layer, true)}
              onMouseLeave={() => handleHover(layer, false)}
            >
              <span style={{ width: 12, height: 12, background: layer.color, borderRadius: 3, display: 'inline-block' }} />
              <span className="text-sm font-medium">{layer.name}</span>
            </div>
            <input
              type="checkbox"
              checked={layer.visible}
              onChange={() => handleToggle(layer)}
              aria-label={`Toggle ${layer.name}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}