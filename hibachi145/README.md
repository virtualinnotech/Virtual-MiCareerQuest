# Hospitality Hibachi 145

The first Hospitality challenge sits at `[-7.15, 3.027, -28.65]`, in the window-side corner. The 25 employer spaces remain available. `booth-layout139.js` reserves both the counter and its approach before assets load.

Walk up and press T, or use the nearby grill button. The player moves behind the counter into first person while the supplied chef steps aside. The clipboard button looks up at the physical hood ticket. Escape or T returns the player to their prior position and camera; the unfinished order pauses until they return.

## Cooking

- Power on, preheat, crack the egg, scramble, pour rice, and mix.
- Scrambling/mixing requires dragging across the griddle or holding the corresponding utensil button (Space also works with the canvas focused).
- Place the three proteins, optionally turn or probe them, and serve once the order is ready.
- The requested game targets are chicken 165 F, steak 135 F, shrimp 165 F. These are game-order rules, not a real-world cooking/safety simulator. Cooking times are accelerated and temperatures stop at the targets.
- The squeeze-bottle flame is a bounded theatrical effect, not a real fuel recipe or ignition procedure.
- Serving records `hibachi` in the existing student progress store. Reset/replay does not remove previously earned mission credit.

`core.js` is the deterministic state machine. `scene.js` loads shared meshes/textures and renders food, utensils, steam, sizzle, and flames in the existing venue render pass. `runtime.js` owns UI/input/camera/sound and three counter colliders. There is no second animation loop or renderer.

## Supplied Assets

`prepare.py` and `build-assets.py` convert the user's Desktop archives and Chef FBX through Blender with embedded scripts disabled. Runtime files are in `assets/`. Large source files and intermediate blends stay in `../work/hibachi145` outside the shipped directory.

The grill omits its extra stool; the chef is baked into a lowered-arm standing pose and reduced for runtime. The realistic cooked steak comes from `steak (1).zip`; the simpler `steak.zip` conversion is retained as an unused alternate. Raw steak and shrimp are rotated onto their flat sides. The shrimp uses its embedded GLB texture because the loose PNG has a different vertical orientation. The utensil archive contributes one spatula, carving fork, and pair of tongs. The supplied plate, egg, rice bowl, raw/cooked chicken, and raw/cooked steak are used in the challenge. Provenance and redistribution rights remain those of the supplied assets.

## Verification

Run `node hibachi145/core-test.cjs`, `node missions99/core-test.cjs`, and `env NODE_PATH=../work/browser/node_modules node hibachi145/browser-test.cjs` with the local server on port 8014. Browser tests cover the complete order, pointer input, animation pixel changes, serving gates, saved credit, exit/resume/reset, 25 loaded booths, and day/night desktop/laptop framing.

Preview: `/venue-frame.html?v=20261019-hibachi145&time=night&challenge=hibachi`.
Copy runtime/assets with `node booth-shipping/scripts/sync-forklift.cjs`, then update the embedded venue with `bash splice-venue.sh`.
