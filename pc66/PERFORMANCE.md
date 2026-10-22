# Exhibit display models

The venue loads `display88-*.glb`, `peripherals87.glb`, `gallery88.glb`, and
`furniture87-*.glb`. Do not replace these with the full-detail collection exports:
six desk stations plus ten shelf displays made the exhibit alone draw almost
three million triangles in 1,782 draw calls.

`optimize-displays.cjs` generates the display assets from the existing exports.
It removes tiny transparent decals, consolidates material colors into a palette,
retains three lightweight fan pivots per display, and simplifies surfaces with meshoptimizer. It
preserves glass, illuminated surfaces, and the separately named monitor screen.
The interactive workshop still constructs the full-detail selected PC, including
its animated fans. Reward availability and saved selections are unchanged.
Display lighting pulses update at most 12.5 times per second using the existing
emissive materials, without shadow maps, bloom buffers, or additional lights.
The IT room's dropped ceiling adds four batched meshes. Its original floor area
and exterior stay unchanged; the camera stays below the ceiling inside the room.

With the dependencies in the existing browser-tool directory:

```sh
NODE_PATH=../work/browser/node_modules node pc66/optimize-displays.cjs
NODE_PATH=../work/browser/node_modules node pc66/performance-test.cjs
NODE_PATH=../work/browser/node_modules node pc66/station-test.cjs
NODE_PATH=../work/browser/node_modules node pc66/room-test.cjs
NODE_PATH=../work/browser/node_modules node pc66/collection-test.cjs
node --test pc66/core.test.mjs pc66/collection.test.mjs
```

The performance test checks nonblank desktop/mobile canvases, all eleven builds,
browser errors, and exhibit budgets: fewer than 400 draw calls, 700,000 triangles,
and 25 MB of model downloads. It also rejects full-detail exhibit model requests.
Observed with lightweight animation: 336 calls, 309,803 triangles, and 10,478,408 bytes
(previously 1,782 calls, 2,999,331 triangles, and 127,727,128 bytes).
Frame timings are machine-specific; these budgets are the regression guard.

After changing runtime assets, run the repository's `sync:forklift` command in
`booth-shipping` and `splice-venue.sh` to refresh the packaged copies.
