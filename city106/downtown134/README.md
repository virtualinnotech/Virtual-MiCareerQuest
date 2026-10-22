# Downtown 134

Imports both supplied police SUVs and The H hotel. Police variants alternate in
the existing traffic and parked fleet. Both use the same 2.03-unit length, four
independently animated source wheels, fitted Grand Rapids POLICE door markings,
and existing traffic, collision, recovery, and interpolation code.

The hotel replaces only `City_West_070_Building-Medium-01`, across the west road
from DeVos's rear-left corner. Its footprint stops before the river and road.
The old building's visual, contact, and attached storefront details are retired.

The main shader now separates indoor lighting using the three actual room
volumes, with feathered boundaries, rather than one large rectangle encompassing
outdoor sidewalks. Warm architectural fixtures illuminate the front canopy,
gallery glazing, wing colonnades, sculpture plaza, and hotel approaches. Existing
streetlights have wider, brighter pools. Night highlight compression preserves
the warm light color without changing the existing daylight tone mapping.

Every fleet vehicle has fitted headlights and rear lamps. Original lamp shapes
are retained where supplied; their vertices are projected onto the exterior
housings to prevent opaque covers from hiding them. Moving road-light cones use
the same interpolated, road-pitched vehicle pose as the visible body, not the
fixed-step simulation pose. The renderer budgets 32 nearby static lights and
eight nearby headlight beams; all moving vehicles retain visible lamp lenses.

## Rebuild

Source archives are extracted under `work/downtown134/source` beside the project.
Extract the police SUV's nested RAR with `tar`; no embedded scripts are run.
`convert.py` uses Blender with `--factory-startup --disable-autoexec` and disables
scripts when opening the hotel blend. Run it for the Ford and hotel, then:

```sh
node city106/downtown134/build-models.mjs
node city106/build.mjs
env NODE_PATH=../work/browser/node_modules node city106/downtown134/test.cjs
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

`build-models.mjs` repairs the SUV's source image references by their archive
image indices, removes baked body glare and old agency decals, and retains the
authored geometry. The daytime and nighttime browser evidence is written under
`work/downtown134`. Preview with `?v=20261016-downtown134&time=night`.
