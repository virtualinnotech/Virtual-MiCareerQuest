# Construction Crane Challenge

The miniature crane in Construction opens the outdoor lift with T. The same entry is available near the outdoor tower. Exit returns to the entry location and preserves progress; Restart clears the three deliveries.

Controls: A/D or left/right slew, W/S or up/down hoist, Q/E trolley, F attach, R release, T/Escape exit. Pointer controls support holding on touchscreens. Zoom buttons change the operating view.

The three supplied GLBs are optimized without runtime mesh decoders. Source world transforms were baked; the crane's upper triangles are separated at load time for slewing. Both crane instances share GPU buffers. Building replacement is limited to City_Front_206 and its footprint. Hardhat and associated furnishings are removed by exact Discovery IDs in prepareVenue.

Deliver three bundles to the highlighted top-floor bays for 200 challenge points. Any free bay accepts a bundle. Collision queries use the existing Matter.js library and neighboring building footprints with vertical clearance checks. Contact blocks the attempted move and emits temporary debris; it does not permanently remove building geometry. Dropped bundles respawn at their pickup points.

Run `node crane39/core-test.cjs` and `NODE_PATH='../work/browser/node_modules' node crane39/browser-test.cjs` with the local preview on port 8014. The browser test exercises collision-checked delivery of all three bundles, controls, dropped loads, collision debris, responsive framing and exit. Run `npm run sync:forklift --prefix booth-shipping` after asset/runtime changes and `bash splice-venue.sh` after venue HTML changes.
