import React from 'react';

export default function MapSelector({ maps = [], value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label htmlFor="map-select" style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
        Map
      </label>
      <select
        id="map-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          background: '#fff',
          color: '#0f172a',
        }}
      >
        {maps.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}