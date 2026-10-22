# Challenge-Aware Booth Layout

`../booth-layout139.js` owns the equipment and approach reservations used by
both packing and shipment validation. Keep these rectangles in sync when a
challenge moves or expands. They are available before model loading finishes.

Each sector plans at least 30 positions; `/api/sectors` can request more up to
the existing organizer limits. The packer retains valid authored anchors,
fills the remaining gaps, and reduces booth footprints without reducing the
0.60-world-unit walking gap or changing student/challenge scale. At expanded
capacity a row layout is available if the authored rings cannot fit.

Exports are fitted uniformly using their actual full GLB bounds, including
architectural extensions. Compact, standard and wide designs use the same
slots. Exports requiring less than the existing minimum scale are rejected
with a builder correction message. Explicit size edits still undergo normal
clearance validation. Old saved placements are validated/reseated; current
safe placements remain stable.

Sector overviews fit the complete sector to the viewport and skip unrelated
city geometry and other sectors' booths for that inspection view only. All
shipments stay loaded, and walking/whole-hall views keep normal visibility.
Booth GPU photo/contact textures are bounded to 512 pixels (wide name signs
retain 1024); source GLBs/images are unchanged. Solar maps are not rebuilt at
night when changing roof cutaways, because there is no direct sunlight.

The former per-challenge anchor deletions were removed. They removed capacity
without replacing it, checked centers instead of full geometry, and could
run in a different order from the capacity generator.

## Verification

- `node booth-shipping/layout139-test.cjs`: rotated footprints, all challenge
  reservations, fixed aisle gaps, deterministic placement, oversize fitting,
  150 preview slots and the existing configured maximum capacities.
- `NODE_PATH=../work/browser/node_modules node booth-shipping/layout139-browser-test.cjs`:
  isolated local browser harness, 150 actual exported booth models, all five
  sector entrances and every booth approach, saved-placement stability,
  desktop/mobile screenshots and WebGL context checks after every view.

The browser test does not write employer submissions, production APIs or the
user's saved venue session. Reports/screenshots go to `../work/booths139`.

Run `node booth-shipping/scripts/sync-forklift.cjs` and `bash splice-venue.sh`
after source changes. The sync script includes the shared layout module.
