# Original Buildings, New Skins

Revision 127 restores the pre-import City112 building templates and original
venue node transforms. It does not run the imported-model replacement,
additional-building, or taller-building passes. The existing hospital exception,
DeVos front-glass collision wall, and ambulance behavior remain unchanged.

The 24 facade finishes reuse photographed brick, concrete, stone, metal, and
window details from the supplied building library. They retain the original
window openings, floor repetition, rooflines, and shell geometry. A stable
per-building material selection adds variation without changing transforms.
Window masks retain the existing sky-reflection and shadow rendering. Finish
tones exclude pink and purple masonry.

Original storefronts, awnings, and fire escapes are restored. The landscaping
pass replans furnishings around the original footprints; it only keeps spaces
that have room and a clear sidewalk connection. Original building contacts are
used again instead of the imported models' diagonal contact prisms.

`original-geometry.json` records the original template geometry hashes and venue
building transforms, captured before the skin pass. The geometry test compares
positions, normals, UVs, indices, transforms, and source mesh references.

From the project root:

```sh
node city106/build.mjs
node city106/skins127/test.mjs
NODE_PATH=../work/browser/node_modules node city106/buildings125/test.cjs
NODE_PATH=../work/browser/node_modules node city106/skins127/walk-test.cjs
```

Browser tests require the local venue on port 8014. They cover desktop/mobile
rendering, nonblank moving canvas, shadows, the glass-wall/entrance collision,
ambulance return-to-bay, and the retained landscaping walking routes. They do
not certify the separately tracked timed ambulance driving test.
