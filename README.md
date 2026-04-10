````md
# Player Journey — README

A lightweight React/Vite app for visualizing player telemetry on game minimaps (paths, events, heatmaps, timeline playback). Focused on client-side rendering of preprocessed telemetry JSON and responsive minimap overlays.

---

## Live Demo
https://yanshi-lila-apm.netlify.app

Interactive visualization of player telemetry including:
- Movement paths
- Kill / death heatmaps
- Timeline-based playback
- Insight-driven exploration for level designers

---

## Objective

This tool helps level designers and product teams:
- Identify high-engagement zones
- Understand player movement patterns
- Detect imbalance in combat distribution
- Make data-driven map design decisions

---

## What to Explore in the Demo

- Toggle between Kill / Death / Movement heatmaps
- Observe clustered combat zones
- Use the timeline to understand gameplay flow
- Hover on insights to see map highlights
- Analyze player path density

---

## Tech Stack

- React (functional components + hooks)
- Vite (fast dev server + build)
- Tailwind CSS
- SVG / DOM overlays (no heavy map libraries)
- Optional: parquetjs-lite (not recommended for production)

---

## Prerequisites

- Node.js 16+
- npm or yarn
- Git

---

## Quick Start (Local Development)

### 1. Clone
```bash
git clone git@github.com:yanshityagi/lilaapmtest-yanshi.git
cd lilaapmtest-yanshi
````

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Start dev server

```bash
npm run dev
# or
yarn dev
```

### 4. Open in browser

[http://localhost:5173](http://localhost:5173)

---

## Build & Preview (Production)

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

Deploy the `dist/` folder to Netlify, Vercel, or GitHub Pages.

---

## Environment Variables

Use `VITE_` prefix:

```
VITE_APP_PORT=5173
```

No secret keys required.

---

## Data & Assets

### Minimap Images

Location:

```
player_data/minimaps/
```

or

```
public/player_data/minimaps/
```

Example files:

* AmbroseValley_Minimap.png
* GrandRift_Minimap.png
* Lockdown_Minimap.jpg

---

### Telemetry Input

* Default: Mock JSON (`gameDataAdapter.js`)
* Recommended: Convert Parquet to JSON

Place in:

```
public/data/events.json
```

---

## Map Configuration

Each map requires:

```js
{
  ambrose_valley: {
    src: '/player_data/minimaps/AmbroseValley_Minimap.png',
    scale: 900,
    originX: -370,
    originZ: -473,
    imageSize: 1024
  }
}
```

---

## Coordinate Mapping

Uses world X and Z:

```
u = (x - originX) / scale
v = (z - originZ) / scale

pixel_x = u * imageSize
pixel_y = (1 - v) * imageSize
```

---

## Project Structure

```
src/
  components/
    MapView.jsx
    Sidebar.jsx
    InsightsPanel.jsx
    Timeline.jsx

  data/
    gameDataAdapter.js

  utils/
    mapCoords.js
    analytics.js

player_data/minimaps/
```

---

## Adding a New Minimap

1. Add image to:

```
player_data/minimaps/
```

2. Update config in:

```
src/data/gameDataAdapter.js
```

3. Restart dev server

---

## UX and Design Decisions

* Heatmaps clipped to map bounds to avoid visual bleed
* Low-opacity paths to reduce clutter
* Interactive insights with hover and focus states
* Timeline-based progressive reveal
* Minimal UI to prioritize map readability

---

## Troubleshooting

### Map not loading

* Check file path
* Verify filename casing
* Try opening image URL directly

### Misaligned points

* Check `scale`, `originX`, `originZ`
* Ensure X/Z coordinates are used

### Heatmap artifacts

* Ensure proper gradient opacity
* Confirm clipping inside map bounds

---

## Parquet Data Handling

Recommended workflow:

```
Parquet → JSON (offline) → UI
```

Include:

* event_type
* x, z
* timestamp
* player_id
* match_id

Avoid browser-side parsing unless necessary.

---




