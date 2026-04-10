# Player Journey Visualization Tool — ARCHITECTURE

## 1. Tech Stack & Rationale
- Frontend: React (Vite) — chosen for fast iteration, minimal build complexity, and very fast dev server + HMR.
- Why: Vite + React delivers quick developer feedback, small production bundles, and straightforward deployment to static hosting (Netlify, Vercel, GitHub Pages).
- Backend: None. The app consumes preprocessed static JSON files (exported from Parquet). This keeps deployment simple and removes backend operational overhead.

## 2. Data Flow
1. Source: Raw gameplay telemetry stored as Parquet files (.parquet).
2. Preprocess: Offline job converts Parquet → compact JSON (filtering, aggregation, coordinate bounds).
3. Bundle or host the JSON as static assets (or load from a CDN).
4. React loads JSON at startup or on demand.
5. In-app processing:
   - Filter by map, match, timeframe.
   - Transform into view models (positions, events, timelines, density grids).
6. Rendering:
   - Map layer: draw normalized positions, heatmaps, and event markers.
   - Timeline & match controls: drive filters and playback.
7. Result: interactive visualization (map + timeline) rendered fully client-side.

## 3. Coordinate Mapping (IMPORTANT)
- Normalization formula:
  x_map = (x - min_x) / (max_x - min_x) * width  
  y_map = (y - min_y) / (max_y - min_y) * height
- Handling:
  - Scaling: use dataset min/max to scale world coordinates into pixel space. Cache bounds per map for consistency.
  - Alignment: translate origin and offsets so map assets (minimap image) and normalized coordinates align; apply additional x/y offsets if the minimap image includes margins.
  - Aspect ratio: preserve aspect ratio by computing scale = min(width/(max_x-min_x), height/(max_y-min_y)) and center the result in the target canvas; optionally letterbox to avoid distortion.
- Challenges:
  - Coordinate mismatch: different sources may use different origins (center vs corner) or units; require a preprocessing normalization step.
  - Orientation issues: game Y-axis may be inverted relative to canvas Y (flip Y during map draw if needed).

## 4. Assumptions
- .nakama or raw telemetry is preprocessed externally into JSON before the UI consumes it.
- Coordinate bounds (min_x, max_x, min_y, max_y) are inferred from the dataset during preprocessing and shipped with the JSON.
- Minimap alignment is assumed linear (no non-linear projection); mapping is an affine normalization described above.

## 5. Tradeoffs

| Decision | Alternative | Tradeoff |
|---------|------------|---------|
| React frontend only | Full backend (APIs, streaming) | Faster development and simpler deployment vs reduced flexibility for real-time queries and large on-demand aggregations |
| JSON instead of parquet in UI | Direct parquet parsing in browser | Simplicity and portability (JSON) vs potential for on-the-fly compression and fewer preprocessing steps (parquet) |
| Static heatmaps | Real-time aggregation | Fast client rendering and cheap hosting vs more accurate, up-to-date statistics and heavier compute needs |

## 6. Key Learnings
- Map flow patterns reveal primary player corridors and common traversal routes.
- Combat clustering highlights concentrated engagement zones (good candidates for balancing).
- Bot vs human behavior differences are visible in movement regularity and clustering patterns; use them for labeling or filtering.
