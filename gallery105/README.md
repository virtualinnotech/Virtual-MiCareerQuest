# DeVos Entrance and Grand Gallery

## Exhibit Side 122

Three tapered white wall masses project over the second-floor seating areas,
with tiled soffits, recessed lights and track fixtures. Matching brick masses
reach the main floor, leaving deep entrance recesses at the existing three hall
portals. Their contact surfaces follow the inclined faces. The original balcony
slab, guard panels, exhibit interiors and entire left-side architecture remain.

The front check-in table, tabletop items, staff and storage are relocated together
1.5 world units toward the aisle, with updated navigation and staff-only bounds.
`gallery122.mjs` contains the new architecture; the shared builder remains
idempotent and preserves the original mesh bytes. `gallery122-test.cjs` checks
door traversal in both directions, brick contacts, gallery and balcony circulation,
check-in clearance, moving canvas pixels and desktop/mobile rendering.

Two hospital-frontage trees whose crowns intersected the building are moved to
open riverwalk planting spaces with their trunk contacts, leaves and circular beds.
`city106/hospital122-test.mjs` verifies the old and new planting clearances.

## Continuous Steel Profile 120

The gallery legs now run along one straight incline from their floor plates to
the roof springline. A tangent-continuous curve joins that incline to the roof;
the former balcony-clearance offset and reverse bend are removed. The roof skin,
purlins and glazing follow the revised profile. A glazed return closes the space
back to the existing upper wall, and a short transition retains the original
entrance canopy. Floor plates, walk-behind clearance and solid contacts remain.

The gallery119 traversal checks still cover both doors and the aisle behind all
supports. `city106/motion120-browser.cjs` captures the lower legs, roof junction,
overall gallery and mobile framing. The source geometry preservation test and
seven original walking routes remain part of regression coverage.

## Gallery 119

- Closed the entrance-side brick wall gap with a matching face and solid backing.
- Narrowed the two IT portals to 1.22 world units, centered at z=-7.3 and z=9.25.
  Honey-oak double doors are permanently held open on the room side, with metal
  jambs, kick plates, push bars, closers, wood overpanels and room lettering.
- Brought every gallery rib down to a bolted floor plate, clearing the balcony
  edge and leaving a usable aisle behind the supports. The obsolete wall-mounted
  column colliders are omitted at load time. Revision 120 refines this profile.
- Replaced the interior inlays with ten adjoining terrazzo regions, using a
  fine, shared mipmapped aggregate texture and a polished material. All band
  edges are ordered and shared, with no overlapping strips or raised borders.
  Original floor collision and exterior steps are preserved.

`gallery119.mjs` extends the existing reproducible builder. It changes only
gallery finishes, portal infills and supporting contacts; original source mesh
bytes and exhibit interiors remain untouched. The report retains the original
baseline counts so regeneration replaces, rather than duplicates, appended data.

```sh
node --experimental-default-type=module gallery105/build.mjs
NODE_PATH=../work/browser/node_modules node gallery105/gallery119-test.cjs
NODE_PATH=../work/browser/node_modules node gallery105/test.cjs
bash splice-venue.sh
```

The focused test checks both IT doorways in both directions, the full aisle
behind the pillars, wall containment, solid pillar contacts, floor band ordering,
movement, and desktop/mobile rendering. Evidence is in `../work/gallery119`.

## Original Revision 105

Photo-guided architectural revision confined to the entrance and Grand Gallery.
The existing plan is retained, including the five hall openings, door banks,
entry stairs and ramp, balconies, rear stairs, information table and floor inlays.
Exhibit interiors and their materials, assets and challenge code are not edited.

## Architecture

- Asymmetric swept I-section steel ribs with visible webs, flange plates,
  transverse stiffeners, base plates, bolts and stone feet.
- Twin entrance boomerang frames and a flared glazed entrance canopy.
- Ribbed solid roof panels, longitudinal skylights, purlins and glazing crossbars.
- Detailed entrance curtain-wall grid, folded silver cheek panel and black fascia.
- Gray upper-wall cassettes, tan brick gallery-facing walls, black stone bases,
  pale stone IT-facing gallery walls and door-head louvers.
- Stainless balcony rails, entry bridge soffit grid and recessed lights.
- Suspended silver airfoil fixtures, warm lenses, downlights and cable stays.
- Blue gallery banners and a glazed upper closure at the river end.

This is a reconstruction from the supplied photographs, not a surveyed model.
Dimensions are adapted to the existing game footprint and circulation.

## Implementation

`build.mjs` appends generated geometry and an embedded brick texture to the
existing GLB in `venue-frame.html`. Three.js supplies the geometry primitives
and Bezier curves. No additional runtime requests are introduced.

The original binary geometry is kept byte-for-byte. Named obsolete gallery
visuals are marked `gallery105HideVisual`; the renderer still registers their
original collision surfaces. New contact meshes are limited to the new steel
feet and lower ribs, with the two IT door openings kept clear.

The generator checks every original node and every original mesh, accessor,
material and image record before writing. `report.json` records the original
geometry hash and appended mesh counts. Regeneration removes only revision 105
data and is idempotent. A receiver-bias adjustment applies only to new gallery
steel/soffit materials (surface type 16), leaving exhibit lighting unchanged.

## Verification

From the repository root, with the existing local server on port 8014:

```sh
node --experimental-default-type=module gallery105/build.mjs
NODE_PATH=../work/browser/node_modules node gallery105/test.cjs
NODE_PATH=../work/browser/node_modules node gallery105/capture.cjs final
bash splice-venue.sh
```

The browser test walks through the front doors and stairs, along the full
gallery, and through all three exhibit-hall and both IT openings. It also checks
the protected source geometry hash, scope of replacement visuals, nonblank
desktop/mobile canvas pixels and browser errors. Captures are saved in `../work`.
