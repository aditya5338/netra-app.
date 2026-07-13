[OPEN] link-analysis-render

## Hypotheses

1. ForceGraph2D is receiving an implicit zero or stale canvas size from its parent, so the simulation exists but paints outside the visible panel.
2. The graph never calls `zoomToFit()`, so initial node coordinates stay off-frame until hover interaction forces a repaint.
3. The panel lacks a stable measured width/height, so the canvas doesn't recenter after layout settles or after resize.
4. Low-contrast link/node styling against the dark background makes the graph look empty until hover states appear.
5. The Leaflet panel is unrelated to the graph bug, but its tile URL still needs the requested dark basemap swap.

## Evidence

- `src/App.jsx` currently renders `ForceGraph2D` without explicit `width` or `height`.
- The parent graph wrapper only has `h-[300px]`, with no explicit width measurement passed to the graph.
- There is no `ref`, no `zoomToFit()`, and no resize handling around the graph instance.

## Plan

1. Add minimal sizing/ref logic only around the Link Analysis panel.
2. Pass explicit dimensions and fit/center the graph after mount and resize.
3. Swap the Leaflet `TileLayer` URL/attribution without changing map behavior.
4. Verify with a production build.
