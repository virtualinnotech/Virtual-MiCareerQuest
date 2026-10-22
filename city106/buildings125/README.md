# Supplied City Buildings

Revision 125 uses building geometry and photographic materials from all six
user-supplied archives: `free-london-skyscraper`, `realistic-chicago-buildings`,
`city-nyc-buildings`, `city-scene`,
`realistic-lowpoly-gameready-building-4k-pbr`, and `procedural-city-3`.
The original archives are not modified. This does not establish redistribution
rights; keep the original asset licenses with any published distribution.

`convert.py` exports Blender sources with embedded scripts disabled. `assets.mjs`
reads the extracted sources in `work/buildings125`, separates building models,
reconnects supplied texture files, preserves texture coordinates and normals
during simplification, and generates shared near/far geometry. `preview.cjs`
renders a visual contact sheet for inspection.

Pink/lavender plaster is replaced with neutral concrete, zinc, and natural brick
colors. Separate glazing uses the existing opaque Fresnel/sky-reflection shader;
masonry remains rough. Window panes and small building shells are retained at
distance to prevent missing faces. Desktop sun shadows use a 4096px depth map,
with the existing 2048px budget retained for narrow/mobile viewports.

`place.mjs` selects 19 models for 395 existing lots. All placements use uniform
scales and stay within the original footprints. The ambulance hospital remains
under its existing mission-specific renderer. Old storefront and fire-escape
overlays are removed because those details now belong to the imported models.
Revision 126 replaces the original lot collision proxies with imported building
silhouettes and furnishes their remaining spaces; see `../blocks126`. A separate
continuous collider protects the recessed DeVos front glazing while leaving
the main vestibule accessible.

Rebuild: `node city106/buildings125/assets.mjs`, then `node city106/build.mjs`.
Verify: `NODE_PATH=../work/browser/node_modules node city106/buildings125/test.cjs`.
The browser check expects the local venue server at port 8014.
# Revision 127

The active city build now uses this library for facade textures only. Original
City112 building geometry and venue placement are restored; see
`../skins127/README.md`. The imported-model placement below is retained as an
authoring option, not used in the active build. The DeVos facade collider helper
and the browser regression checks remain in use.

