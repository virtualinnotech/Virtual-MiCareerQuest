# Skyline 135

Four supplied buildings, one scene instance each:

- Modern Building 002: front road opposite DeVos.
- One Chase Manhattan Bank: west road, with a walkable paved forecourt.
- Skyscraper: east road near the river end.
- Beveled glass tower: across the river immediately beside the hospital.

Each occupies one existing generic building lot. Only that lot's original mesh,
contact, and attached storefront details are retired. Placement validates road
and neighboring-building clearance. The hospital and The H hotel remain intact.

The modern model's oversized source landscape is excluded. The Chase OBJ's up
axis is corrected. Source materials and geometry are retained, with bounded
attribute-aware mesh simplification, nighttime glazing, and entrance lights.
The skyscraper archive omits its optional `Long brick.png` bump map; the absent
map is disabled rather than leaving an unresolved texture reference.

Facade 138 repairs the skyscraper's 496 window assemblies using the original
5,952 rectangular pane outlines. Frame openings and glazing have nonoverlapping
topology and are excluded from building-wide mesh simplification. The backing
shell is inset 0.045 units to separate it from the detailed cladding. Surface 33
uses one UV-based occupancy cell per window, keeping nighttime lighting fixed
as the camera moves. This reduces the tower from 304,236 to 223,263 triangles.

Ground illumination now uses the geometric floor normal for diffuse light and
shadow bias. Texture normals still provide specular detail. Indoor/outdoor fill
uses one feathered spatial calculation and does not change with small floor
height offsets. Remaining untextured exterior ground and connector surfaces use
the shared concrete material. The Chase forecourt also shares this material.
Different pavement, grass, and terrazzo colors remain intentional.

## Rebuild

Extract the ZIPs into `work/skyline135/source` beside the project, including the
nested Chase and skyscraper ZIPs. Convert with Blender's auto-execution disabled:

```sh
blender --background --factory-startup --disable-autoexec --python city106/skyline135/convert.py -- beveled chase skyscraper
node city106/skyline135/build-models.mjs
node city106/skyline135/facade138-test.mjs
node city106/build.mjs
env NODE_PATH=../work/browser/node_modules node city106/skyline135/test.cjs
env NODE_PATH=../work/browser/node_modules node city106/skyline135/facade138-browser-test.cjs
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

The modern GLB is read from the user-supplied Desktop path during model import.
The normal city build only needs the prepared `models.glb` in this directory.
Browser screenshots and pixel-test evidence are under `work/skyline135`.
Preview starts at night with `?v=20261016-skyline135&time=night`.
The repaired tower preview uses `?v=20261017-facade138&time=night`;
day/night movement, pixel stability, and mobile evidence is in `work/tower138`.
