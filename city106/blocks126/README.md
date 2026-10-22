# Neighborhood Infill

The active revision 127 build calls this pass with `preserveBuildings: true`.
It restores the original buildings, skips infill/height/contact replacements,
and only replans landscaping in the remaining clear spaces. The behavior below
describes revision 126's optional imported-building mode.

`build.mjs` runs after the six-pack building placement pass. It selects taller
existing variants using uniform scales, adds up to 24 compact buildings inside
unused lot strips, and furnishes connected spaces around the imported facades.
The original building materials, reflective windows, and shadow system remain.

Plazas share the established paver texture, leafy shrubs, trees, cast-iron
benches, cafe furniture, and bins. Three small shop pavilions reuse the street
sign atlas. Trees have flush circular soil beds. Paving is clipped against
roads, the venue, the hospital, and the river. Furniture and tree canopies stay
clear of building silhouettes; a reserved walking corridor connects each
plaza to its sidewalk and remains clear of other plazas' furniture.

Imported convex footprints replace the obsolete building-lot collision boxes.
The old square campus barriers move to the outer neighborhood edge; the river
movement constraint and bridge guardrails are unchanged. This opens the gaps
without allowing players to enter buildings or walk into the river.

Rebuild with `node city106/build.mjs`. The report's `blocks` section includes
placements, before/after heights, exclusions, and walking routes. Run
`NODE_PATH=../work/browser/node_modules node city106/blocks126/test.cjs` with
the venue server on port 8014. The test checks geometric clearance, traverses
every plaza using player collision physics, and captures desktop/mobile views.

Revision 126 verification: all 64 plaza routes and eight diagonal wall contact
checks pass. The buildings125 regression also passes the venue entrance,
ambulance return-to-bay, and desktop/mobile rendering checks. The separate
ambulance full-course test passes its static road-clearance audit, but its
automated driver collides with vehicle-11 while merging and misses the timed
completion assertion. Ambulance behavior is unchanged by this scenery pass.
