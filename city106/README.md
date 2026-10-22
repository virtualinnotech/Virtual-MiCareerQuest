# City and Gallery Update 106

## Supplied Street Assets and Gallery Details 130

- All 15 newly supplied archives contribute models or photographed surfaces.
  Forty-seven benches cycle through the three supplied styles; 139 outdoor bins,
  the dumpster, flower stands, signals and pedestrian pushbuttons use the supplied
  meshes. Twenty-eight street-name boards are attached to signal assemblies.
- Sidewalk slabs use the supplied concrete color/normal maps with the existing
  per-square wear and visible joints through painted areas. Park paths use the
  supplied cobblestone. Lawns use an overhead bake of the supplied grass with
  world-scale UVs and nearby three-dimensional grass clumps.
- Nine original school-bus placements use the supplied bus exterior. Camper
  cabinetry intersecting that source's body was omitted. The new RoAZ city bus
  has four independently animated wheels, front steering and road-height fitting.
  Reflective body materials remain shared between vehicle instances.
- The gallery has nineteen queue stanchions with black belts, six three-stream
  sorting stations outside hall door approaches, closed restroom entrances beside
  IT, a bottle filler, AED, extinguishers and electrical access panels. Hall markers
  and drapes are A/yellow, B/red and blue, C/green, from front/right to rear.
- Puddle captures now update every rendered exterior frame using that frame's
  camera, replacing the old 15/6 FPS capture throttle. Targets follow the viewport
  up to 1600px wide (85% scale on mobile); filtered sampling reduces pixel shimmer.
- Existing street-prop impacts and 30-second restoration remain. Attached street
  signs fall with their signal, while its concrete footing stays fixed. Building
  shapes, heights, wall collision, challenge locks and ambulance reset are unchanged.

`assets130/unpack.py` extracts the named Desktop archives into
`../../work/assets130/source`. Import model archives with Blender's
`--disable-autoexec --background --python city106/assets130/convert.py -- <asset-ids>`;
the cobblestone archive contributes textures only. `build-library.mjs` repairs
source material links, bakes transforms/skin rest poses, normalizes scale, merges
shared materials and caps imported maps at 1024px. `preview.cjs` renders an asset
contact sheet and regenerates the grass bake. Source archives are never modified.

```sh
node city106/assets130/build-library.mjs
env NODE_PATH=../work/browser/node_modules node city106/assets130/preview.cjs
node city106/build.mjs
env NODE_PATH=../work/browser/node_modules node city106/assets130/test.cjs
```

Desktop/mobile screenshots and per-frame reflection, bus animation, asset coverage
and WebGL checks are recorded in `../../work/assets130/qa`. The new details are
browser-optimized assets, not unique 8K maps or Unreal Engine rendering.

## Exterior Materials and Rider Fit 129

- Removed both supplied electrical cabinets from the road/crosswalk placements.
- E-bike rider pelvis is raised onto the saddle; torso lean makes the handlebar
  grips reachable, with palm contact measured on the skinned mesh. Neck/head
  compensation keeps the rider looking forward. Challenge locks stay unchanged.
- Sidewalk wear is seeded in world-space per slab: independent stains, pores,
  beveled joints and occasional branching cracks. The same joints and grain
  remain visible through the DeVos gray/gold painted paving.
- Asphalt combines denser photographic aggregate with differently oriented
  samples, world-space repairs and fine normal relief. Wet basins vary across
  the city; dry and damp material roughness remain distinct.
- Wet ground captures actual nearby buildings, vehicles, the player and rentals
  in a bounded planar reflection pass. Window Fresnel uses the existing sky
  environment and photographic pane detail, not ray-traced window reflections.
- A local 2048px moving shadow pass adds skinned player, vehicle and ride shadows
  to the existing cached architectural sun map. Both use the same sun direction.
- Chicago photographic window surrounds supplement the 24 facade skins. All
  395 original building shapes, placements and heights remain unchanged.

The Matrix recording was reviewed for surface/lighting references, not copied
into assets. This is a browser material improvement, not Unreal Engine parity or
a complete replacement of every asset with unique 8K maps. Shared source photos
remain; procedural world-space variation reduces repetition. Update 130 replaces
the original 768 x 512 throttled reflection capture with a per-frame viewport-sized
target and retains distance culling.

```sh
node city106/skins127/test.mjs
node city106/street128/core-test.mjs
env NODE_PATH=../work/browser/node_modules node city106/materials129-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/street128/browser-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/buildings125/test.cjs
```

Rendering/fit probes and desktop/mobile evidence are in `../../work/materials129`.
`materials129-probe.js` is test-only and is not loaded or shipped by the venue.

## Motion and Navigation 120

- Far-bank asphalt and approach slabs use world-space texture density, matching
  the other roads instead of stretching one texture across the whole slab.
- Outdoor walkers turn at a bounded rate and move along their facing direction.
  Passing choices stay committed, speed changes are gradual, and blocked walkers
  choose a checked local detour instead of alternating axis slides or reversing
  repeatedly. Neighbor decisions use a shared frame snapshot.
- Emergency traffic plans a collision-checked curved pull-over path. Position,
  body heading and front-wheel angle come from that same path; a stopped vehicle
  cannot shift sideways. Cars brake into a clear shoulder, stop in lane when
  blocked, and hold behind the ambulance. Re-entry is also checked and curved.
  Drivers retain individual reaction delays and only respond locally.
- Normal lane positions on the ambulance route leave a usable center gap even
  when opposing queues stop. Parking, signal logic and physical collisions remain.
- `ambulance35/minimap120.js` draws a heading-up circular route map from the real
  street lanes, river, bridges and checkpoints. It replaces the walking-controls
  circle only while mounted; the challenge's optional controls remain available.

```sh
node city106/motion120-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/motion120-browser.cjs
node city106/vehicles114-test.cjs --unit
node city106/district115-test.cjs --unit
```

Focused tests cover all four traffic headings, front-wheel steering, no stopped
lateral motion, blocked shoulders, trailing traffic, re-entry, repeated crowd
turnarounds, synchronous separation and route clearance. Browser evidence in
`../../work/motion120/` covers texture density, road/steel rendering, all 175
walkers, changing map pixels, mobile bounds, restored walking controls and GL
errors. This is custom emergency-yield behavior, not GTA or LCPDFR code.

The revised short-look-ahead test driver completed the live-traffic ambulance
course in 53.568 simulated seconds with 77% health. Startup displacement/damage,
timer, reset and checkpoint checks passed. Ordinary collisions remain active;
the test driver incurred four junction contacts rather than passing through cars.

## Walking and Traffic Repairs 118

- The park's paver spine now reaches both connecting sidewalks and the northern cross-path. Six benches sit on connected paver pads beside the path, rather than in isolated lawn positions. The path remains one non-overlapping mesh.
- The visible foundation now participates in collision. Ground support is sampled from actual walkable geometry for the player and outdoor pedestrians, including sidewalks, lawns, bridge decks and steps. General curb/step assistance replaces the entrance-only special case.
- Swept river-edge containment preserves access to all three bridges, prevents walking off their sides, and recovers invalid water positions. A last-supported position also protects against falling below the map.
- The rear entrance has three raised treads plus the promenade as the final level, removing the coplanar fourth slab. Forty smaller solid gallery risers and two intermediate landings replace the eighteen oversized floating glass treads; handrails remain connected.
- Outdoor pedestrians anticipate slower, stopped and oncoming walkers, hold a passing side, damp steering, and keep minimum separation without reversing when catching a slower walker.
- Siren response uses a forward/local corridor, speed-dependent warning distance, individual reaction delays, gentle lateral movement and occupied-shoulder checks. The ambulance itself is reserved in traffic movement, including while parked, so NPC pull-over moves cannot shove it out of its bay.
- New traffic and parked-car placement reserve the nine original school buses and ambulance bay. Static school-bus footprints also participate in runtime traffic reservations. There are 435 new fleet vehicles after rejecting three conflicting parked placements.

```sh
node city106/build.mjs
node city106/walk118-test.cjs --unit
env NODE_PATH=../work/browser/node_modules node city106/walk118-test.cjs
env NODE_PATH=../work/browser/node_modules node ambulance35/browser-test.cjs
```

Focused checks cover path continuity, seating pads, river containment, bridge access, overtaking, stopped/head-on walkers, local emergency response, occupied ambulance space and school-bus spawn clearance. Browser checks cover actual ground support, gallery stair ascent/descent, river-edge walking, NPC elevation, desktop/mobile pixels and WebGL errors. Evidence is in `../../work/walk118/`. Two complete ambulance runs finished in 48.8 and 48.4 simulated seconds with no startup displacement or damage; ordinary driving collisions remain enabled. Existing paver, axle/articulation, six-cycle traffic-flow and Matter.js collision tests passed.

## Riverfront Repairs 117

- Rear gallery side returns now join the curtain wall to both existing side walls, with matching glazing, mullions, foundation closures and solid walking collision. The six swinging doors and four entrance steps remain intact.
- `district115/bridge117.mjs` reuses 1,558 members from the original blue bridge: all four through-truss spans, overhead X-bracing, gussets, railings and five stone piers. The bridge remains narrow and straight across the river at the Riverwalk sign. Continuous handrails are subdivided to follow the new deck camber.
- `road-pose117.js` fits vehicle bodies to actual axle heights. Front and rear wheels follow ascent, crest and descent in either direction; the ambulance uses the same contact fit.
- The supplied articulated bus is split at its original bellows. The front section fits its two axles; the rear section pivots about a shared hitch and fits its rear axle. Its rear axle trails steering changes. The original bellows and connecting trim use the existing renderer's two-bone skinning, with continuous weights and no separation at the hitch. This is road-following articulation, not a new suspension or sheet-metal simulation.
- Bus exterior panels render on both sides to accommodate reversed faces in the source model. Six spinning wheels, front steering, brake lights, shared buffers and distant LODs are preserved. Pose fitting and joint uploads are cached between traffic steps.

```sh
node city106/vehicles114/build.mjs
node city106/build.mjs
node city106/river117-test.cjs --unit
env NODE_PATH=../work/browser/node_modules node city106/river117-test.cjs
```

The focused test checks 27,056 axle contacts, horizontal and vertical joint motion, exact hitch continuity, rear-wall collision, desktop/mobile pixels and live bus skinning. Screenshots are in `../../work/river117/`. Existing paver, traffic-flow, collision, entrance traversal and ambulance-route tests cover the surrounding behavior. Traffic routes and planar Matter.js collision simulation are unchanged.

## Park Paver Fix 116

`district115/park116.mjs` replaces the four overlapping path boxes with a single joined mesh. Rectangle-edge partitioning gives every crossing exactly one top surface, removing angle-dependent depth fighting without changing the path layout or height. The outer edges extend down to the foundation; there are no internal overlapping side faces.

A shared 512-pixel color/normal texture provides staggered gray stone pavers. World-space UVs keep their size and alignment consistent along long paths and through intersections, replacing the stretched slab lines. Nearby lawns, trees, roads and bridges are unchanged.

```sh
node city106/build.mjs
node city106/park116-test.cjs --unit
env NODE_PATH=../work/browser/node_modules node city106/park116-test.cjs
```

The focused test checks 2,400 points for one path surface, consistent texture scale, embedded textures, eight desktop viewing angles, mobile pixels, walking across the junction and WebGL status. Screenshots and results are in `../../work/park116/`.

## Riverfront and Traffic Update 115

- The police SUV uses plain white body paint and one projected `POLICE` marking on each side. The original repeating lettering and city name are removed; wheel and trim textures remain.
- The rear Grand Gallery entrance now has three pairs of proximity-operated swinging glass doors, a short landing, four physical stair treads and handrails. The old ramp, blocking window geometry and sill are removed only in the new doorway. Walking collision follows each moving door leaf.
- Buildings use the camera frustum and conservative solid-wall occlusion, not the player's indoor/outdoor state. The skyline remains visible through gallery glass; geometry behind the camera is culled.
- The straight, narrower blue footbridge is aligned with the Riverwalk sign at X -6.3. Two gently arched road bridges flank DeVos Place. The ambulance uses the east road bridge. Water is lowered to Y -1.8, with visible banks and matching bridge collision/elevation profiles.
- 360 crossing approaches cover 102 road intersections, including T-junctions. There are 395 moving vehicles on 16 lanes and 43 parked vehicles. Queues respect lights, turning space and crossing traffic; vehicles never reserve intersections outside their actual routes.
- Walking players collide with oriented vehicle bounds. Nearby NPC vehicles become Matter.js rigid bodies during ambulance collisions, with speed-scaled impulses, angular motion and damage to both vehicles. Damage adds darkened/compressed body visuals, not simulated sheet-metal deformation. Traffic checks shoulder occupancy before pulling over and merges back after the siren passes.
- A park with paths and benches fills the west side of the venue. 748 additional red/gold/green trees and shared fallen-leaf patches extend throughout the sidewalks. Tree placement keeps intersections and lamp bases clear.
- The supplied city-props collection contributes 29 placements: benches, bins, mailboxes, hydrants, parking meters, utility cabinets and a dumpster. Only selected models are shipped.

Source archives are the user's `tree.zip`, `yellow tree.zip`, `bridge.zip` and `city-props-collection-volume-1.zip`. Originals remain untouched. Offline Blender import disables embedded scripts; `district115/assets.mjs` and `props-assets.mjs` simplify geometry, resize textures and compact selected meshes. Red/gold tree sources of 814,771 / 201,293 triangles become 12,551 / 12,325 shared triangles, with smaller distant index LODs. The supplied bridge is reduced from 57,456 to 8,850 triangles. All repeated foliage and vehicle geometry shares GPU buffers.

The city GLB is 39,836,028 bytes, or 17,792,220 bytes over the gzip path. The selected props asset is 1,240,352 bytes. More traffic, visible skyline and foliage still increase rendering work. Local Chrome fixed-view measurements ranged from 672 to 1,955 draw calls and 0.98 to 6.78 million submitted triangles, with render-only medians of 4.9 to 13 ms. These are not end-to-end FPS measurements or a low-powered-device guarantee. See `../../work/city106/district115-final.json`.

An 18-view moving-camera check completed without JavaScript errors, page crashes or WebGL context loss. Collected JavaScript heap changed from 137.11 MB to 137.34 MB across the passes. This bounds the tested JS heap, not total GPU/process memory; see `../../work/city115/stability.json`.

Verification covers desktop/mobile nonblank pixels, all nine vehicle models, moving wheels and front steering, brake states, six traffic cycles from four starting phases, occupied-shoulder yielding/remerging, speed-scaled crashes, bidirectional rear-door/stair traversal, the complete footbridge, bridge-surface raycasts, skyline visibility and a complete ambulance run across the road bridge. The district drive completed in 48.48 seconds with 92% health and 72 vehicles yielding at peak. Known static-preview 404s are the optional API endpoints and favicon, not model failures.

```sh
node city106/build.mjs
node city106/vehicles114-test.cjs --unit
node city106/district115-test.cjs --unit
node ambulance35/vehicle-physics.test.cjs
env NODE_PATH=../work/browser/node_modules node city106/district115-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/vehicles114-test.cjs --browser-only
env NODE_PATH=../work/browser/node_modules node ambulance35/browser-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/measure.cjs district115-final
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

## Street and Rider Refinements 112

- Replaced primitive dog body parts with the user's textured, skinned model from `dog.zip`. Its continuous mesh has 7,286 triangles, 43 joints and the supplied walk clip. The optimized shared GLB is 541,792 bytes with a 1024-pixel fur map. Six actors reuse the same mesh and texture, while nearby dogs animate and their leashes follow the neck and walker hand.
- Inspected `golden-retriever-dog-3d-model-free.zip`: its static model has 701,574 triangles, no rig and no animation. It is retained as a source reference but is not shipped or substituted for an animated walker.
- Pedestrians now have seeded independent speeds, phases, direction changes, short pauses, lateral meandering and neighbor yielding. Wider venue sidewalks use broader paths; narrow city sidewalks keep bounded detours around street furniture.
- Moved all three bus shelters to the curb at Z 39.02, with slatted benches facing the road, transit timetables and two-sided blue circular BUS signs. Existing entrance clearances, school buses and road dimensions remain unchanged. Parking meters sit closer to the curb to leave room for pedestrians.
- `architecture112.mjs` replaces the four similar facade tiles with eight distinct building families: brick warehouses, white apartments, green copper crowns, limestone Art Deco, charcoal lofts, burgundy masonry, blue-green glass and silver stepped towers. Their window proportions, cornices, setbacks, balconies, roof tanks and crowns differ. Original building bounds and collision proxies are retained.
- The rider leg solver now uses an analytic two-bone solution with an explicit forward/outward knee pole. Feet stay fixed on separate deck contacts while the torso leans. Arm grip IK, vehicle movement, braking and dismount behavior remain intact.

The city asset is 6,085,980 bytes, plus the 541,792-byte dog asset, compared with 7,184,188 bytes before this revision. This is an asset-size improvement, not a guarantee of frame rate on old Chromebooks. Close-up human geometry, original venue geometry and exhibit halls remain unchanged.

October 14 verification passed: 40 seconds of pedestrian movement with independent pauses, 29 of 30 front walkers varying laterally by more than 0.2 units, and no detected furniture contacts; 24 Segway lean cases across six character models; animated dog pixels; desktop/mobile rendering; full street-life, furnishing, signal, atmosphere, curb, gallery and visibility regressions. All seven venue walking routes and the original geometry hash are preserved. Five frozen occlusion comparisons have zero changed pixels.

Final local Chrome workload at 1366 x 768: street 152 draws / 191,932 triangles, riverwalk 189 / 206,311, populated east-side view 315 / 1,001,787. These counts include existing scenery and visible people and are higher than revision 111; the new animated dogs and building geometry are not free rendering work. See `../../work/city106/city112-final.json`. The four-core/4 GB metadata profile with 4x CPU throttling kept movement working and full-quality settings, but reported about 10 FPS in the gallery. This is not a Chromebook GPU benchmark or a lag-free certification.

Build the supplied animated dog after extracting `dog.zip` into `city106/dogs112/source-dog`:

```sh
node --experimental-default-type=module city106/dogs112/build.mjs
node --experimental-default-type=module city106/build.mjs
env NODE_PATH=../work/browser/node_modules node city106/refinements112-test.cjs
env NODE_PATH=../work/browser/node_modules node visitors100/rides103-test.cjs
```

The dog pipeline uses the existing Three.js FBX loader and GLTF exporter offline. Unique FBX IDs disambiguate duplicate front/hind bone labels before export; no runtime Three.js dependency is added. The user-provided originals are not included in the public asset package. Existing street-life, curb, signal, atmosphere, furnishing, visibility and gallery tests remain applicable.

## Street Life Update 111

`life111.mjs` adds an NYC-inspired layer to the existing city, without moving buildings, roads, venue entrances or exhibits. It authors yellow taxis, sedans, delivery vans and blue-striped city buses: 80 moving vehicles and 33 parked cars. Wheels rotate with traveled distance, brake lenses illuminate while stopping, and traffic follows the existing signal cycle. Queues maintain separation and yield to the player and vehicles clearing a junction. The western routes stay outside the separate farm challenge.

The sidewalks have 149 walking pedestrians, including six people walking animated dogs on leashes attached to their animated hands. Pedestrians follow two-way sidewalk loops, avoid furniture, and pause near the player. Shopfront additions include 106 striped awnings, 58 fire escapes, 63 bins, tied refuse bags, newsboxes, parking meters, flower kiosks, cafe tables and transit shelters. The bare foundation strip beside the venue now uses the paving material and has trees, planters and benches. The original parked school buses remain.

`life111.js` runs traffic at 20 Hz and reuses the existing instanced GPU crowd animation. A maximum of 64 nearby street pedestrians is submitted before the established frustum and wall-occlusion checks. Moving props are excluded from the cached static sun-shadow pass. Shared vehicles, furniture and dogs use one new 1024 x 1024 atlas; no new per-vehicle point lights, reflection passes or framework runtime are added.

`street-lods-build.cjs` generates index-only pedestrian LODs using the installed meshoptimizer 1.3 simplifier with border locking and normal/UV attributes. It preserves original vertex positions, UVs, skin weights and animation data. Close-up street characters retain original geometry; medium/far street characters share the original vertex buffers with new index buffers. Indoor crowd LOD selection is unchanged. The six far meshes range from 7,194 to 15,171 triangles each. The LOD asset is 2,168,280 bytes; loading errors retain the original meshes.

The combined city GLB is 7,184,188 bytes with 23,108 unique shared triangles. More moving objects do add work; these changes do not guarantee Chromebook frame rates or Unreal Engine visual parity. See the measured results in `../../work/city106/citylife111-final.json`. Actual school hardware still needs testing.

Final local Chrome measurements at 1366 x 768: the fixed street view submitted 146 draws / 143,727 triangles; riverwalk 183 / 157,518; the populated east-side view 302 / 931,222. These include existing scenery and people visible in each view, not just new assets. All regression tests passed, including zero changed pixels in five frozen wall-occlusion comparisons. The four-core/4 GB metadata profile with 4x CPU throttling retained movement and native-quality settings, but reported about 16 FPS in the gallery; it is not a Chromebook GPU benchmark or a lag-free certification.

Verification:

```sh
node --experimental-default-type=module city106/build.mjs
env NODE_PATH=../work/browser/node_modules node city106/street-lods-build.cjs
env NODE_PATH=../work/browser/node_modules node city106/life111-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/measure.cjs citylife111-final
```

The street-life test covers red/green stops, queues, brake state, player yielding, six complete signal cycles at four starting phases, cross-traffic separation, farm exclusions, continuous pedestrian loops, loaded LODs, animated canvas pixels, furniture clearance, desktop/mobile framing and browser/WebGL errors. Existing signal, furnishing, atmosphere, curb and seven-route gallery tests also remain applicable. `?city111off` disables the new moving actors for development comparisons while keeping static street decorations.

All new vehicle, dog and furniture geometry and the street-life atlas are generated locally by `life111.mjs`. The shop names are fictional; supplied screenshots are not used as game textures.

## Atmosphere and Street Detail Update 109

`materials109.mjs` adds a generated photographic cloud panorama, scanned-style asphalt color, baked asphalt/concrete normal maps, and four detailed facade atlases. The facades have recessed frames, blinds, reflected sky, office furnishings and selectively illuminated rooms. Their normal-map alpha channel doubles as a window/occupied-room mask, avoiding a separate texture fetch. The texture loader retains mipmaps and uses at most 2x anisotropy where supported.

The sunset has a visible sun disc aligned with the directional shadow camera, warm direct light, cooler ambient shade and distance haze. Exterior lighting is restricted to world positions outside the venue footprint; interior fill and exhibit light controls remain in place. The existing static shadow cache now uses four hardware-filtered comparison samples instead of nine unfiltered comparisons. No per-lamp dynamic lighting, bloom, ray tracing, extra reflection render pass or per-frame shadow-map rendering was added. River reflections move in the surface shader. This is a fixed late-afternoon setting, not a day/night simulation.

`details109.mjs` adds shared storm drains, utility covers, iron tree grates, ribbed bins, hydrants, reflective-band bollards, bicycle racks and three shopfront variants. Road details follow the original road spans; shopfronts attach to original building bounds. The original building positions, road plan and exhibit geometry are unchanged. All small details share one atlas. Farm-scene exclusions remain active. Full authored counts are in `report.json`; runtime counts omit the separate farm challenge area.

The city asset is 5,781,520 bytes (about 5.8 MB), including all textures, with 8,766 unique triangles and 50 shared prop draw groups. This increases the asset by about 2 MB over revision 108, mainly for photographic surfaces and relief maps. It is not zero additional work: the improvement uses more texture memory and a few more visible draws. Do not describe it as Unreal Engine parity or guaranteed lag-free rendering on old Chromebooks. Actual target school hardware still needs to be tested.

The larger load exposed a pre-existing PC booth initialization race: `state.ready` becomes true before asynchronous discovery/shipping setup captures `baselineColliders`. `pc66/venue.js` now waits for that array before registering the booth. `atmosphere-test.cjs` checks that the booth reaches ready state as well as sky/normal-map loading, all new detail categories, exterior-only placement, budgets, animated river pixels, desktop/mobile screenshots, WebGL status and asset HTTP failures. The optional `/api/sectors`, `/api/manifest` endpoints and favicon are not provided by this static preview server; their known 404 fallbacks are excluded from the asset-failure assertion.

Additional verification:

```sh
env NODE_PATH=../work/browser/node_modules node city106/atmosphere-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/measure.cjs atmosphere109-final
```

Final local fixed-view comparison against 108: the street went from 123 draws / 107,461 submitted triangles to 129 / 109,643; the river view went from 161 / 121,193 to 168 / 123,149. These are workload counts, not hardware FPS predictions. Interior timing comparisons are not stable because the asynchronous exhibit display loads can finish at different points; the startup-race fix also ensures the PC booth initializes successfully. Final visual, signal, furnishing, visibility, mobile and seven gallery-route tests passed with no JavaScript/WebGL errors. Under 4x CPU throttling, movement worked but reported frame rates were below 30 FPS; this does not certify lag-free performance and does not emulate Chromebook graphics hardware.

## Traffic Signals Update 108

`signals.mjs` derives intersection corners and approach directions from the existing road geometry. Yellow three-aspect heads hang from dark mast arms, with black backplates and lens visors. T-junctions do not get heads pointing into the convention center. The build authors 44 heads across 14 nearby junctions; the runtime retains the established farm-scene exclusion, leaving 35 heads in the current venue view. Poles have small physical contact boxes on the sidewalk corners.

Opposing directions share a 44-second cycle: 18 seconds green, 3 seconds yellow and 1 second all-red clearance, then the crossing direction receives the same sequence. Each head lights exactly one lens. This is visual scenery; it does not add vehicle traffic simulation or change parked bus behavior.

The shared signal mesh adds 688 unique triangles and about 52 KB to the city asset. Lenses update material colors/emission only at phase changes; there are no additional textures, point lights, per-head timers or geometry uploads. At most ten additional shared draw groups cover every signal. `City106.setTrafficTime(seconds)` freezes the visual cycle for inspection; passing `null` resumes automatic cycling.

`signals-test.cjs` checks two full cycles and phase boundaries, mutually exclusive traffic directions, all-red clearance, T-junction placement, farm exclusions, exactly one active lens per head, visible red/yellow/green pixel changes, automatic timing and desktop/mobile screenshots.

## Street Furniture Update 107

`furnishings.mjs` adds curved LED streetlights, warm riverwalk lanterns, two-sided entrance/riverwalk/crossing signs, more slatted benches, cast-stone planter boxes, leafy shrubs and flowering ornamental grasses. Furniture is placed along existing sidewalks and the riverwalk, with open entrance routes. Existing riverfront tree planters also receive understory plants. The runtime excludes any placements inside the separate agriculture challenge field.

The complete city asset is about 3.71 MB, up about 228 KB from revision 106. Eight additional shared meshes add 1,748 unique triangles. Lamps use emissive lenses and the existing cached sun-shadow pass, not additional dynamic light or reflection passes. Signs share one 512 x 768 texture atlas; shrubs reuse the existing leaf texture. Pole, bench and planter contacts use simple collision boxes, with no collisions added for leaves or grass.

`furnishings-test.cjs` verifies asset budgets, exterior placement, clear entrance corridors, loaded props, instancing, lamp emission, physical bench contact, desktop/mobile rendering and walking along the entrance sidewalk and riverwalk. Local measurements showed 113 draws / 105,225 triangles in the street test view and 148 draws / 119,081 triangles in the river view. These are workload observations on the local Mac, not a guarantee of Chromebook frame rate.

## Scope

- Continuous S-curved suspended gallery light, with swept metal rims, lenses, service channel, downlights and suspension cables. Source: `../gallery105/build.mjs`.
- Missions now uses the bundled Lucide Menu icon. Mission completion, questionnaires and certificates are unchanged.
- 109 exterior trees share three branching maple models and one alpha-cutout leaf texture. Four riverwalk benches share one slatted teak/cast-iron model.
- Eight shared city building shells replace the damaged imported skyline meshes. The runtime maps each replacement into the original mesh bounds. Building positions, heights, footprints and collision proxies remain unchanged.
- Mipmapped facade tiles include masonry joints, window recesses, frames, blinds and interior color variation. Cornices, setbacks, pilasters, entrance canopies and roof equipment remain geometry.
- Asphalt aggregate and paving use shared textures. Exhibit models and textures are not replaced.

## Rendering

Static venue batches are grouped by material and spatial tile, with conservative sphere and box frustum checks. The collision loader still processes the original geometry, including replaced tree/bench visuals.

Opaque rectangular wall faces can hide an object only when the projection of its entire bounding box lies inside one solid wall rectangle. Windows, door leaves, glass, roofs and translucent materials are excluded from occluder collection. People still simulate and animate behind walls. Doorway and partial-object views remain drawn. Culling does not change the sun shadow pass. Foliage shadows use the same alpha mask as the visible leaves.

Old-device detection no longer automatically disables shadows or lowers resolution to 75%. It keeps native resolution, existing textures and shadows. The pre-existing lower crowd population for low-memory devices is retained. No new real-time lights, reflection passes, bloom or framework runtime were added.

Debug comparisons: `?city106off` retains original city assets; `?culling106off` disables spatial tiling/frustum bounds; `?occlusion106off` disables wall occlusion. These are development checks, not student controls.

### Curb Flicker Fix (110)

The front and east curb faces shared exactly the same depth as the continuous sidewalks and older city sidewalk pieces. The entrance apron also duplicated the sidewalk beneath it. Raising the apron in Y did not separate the vertical faces.

`curbGeometry` removes the redundant apron visual and subtracts the covered portions of coplanar sidewalk faces at load time. Partial sidewalk ends remain intact, and the original collision buffers and curb geometry are unchanged. No per-frame work, extra draw pass, shader change, or texture reduction is required.

`curb-test.cjs` checks 1,572 points across both curb faces, exposed ends, immutable geometry inputs, and matching authored venue/furniture collision hashes. It also captures before/after and moving desktop/mobile views and checks canvas pixels and browser/WebGL errors.

## Performance Evidence

Local Chrome, 1366 x 768, same fixed views, full shadows, same resolution:

| View | Before Submitted Triangles | Updated Submitted Triangles |
| --- | ---: | ---: |
| City street | 2,447,621 | 100,629 |
| Riverwalk | 2,292,274 | 106,881 |

These are draw-submission counts, not claims of Chromebook FPS. Crowd placement and asynchronous exhibit loading affect interior frame comparisons. Full measurement JSON and screenshots are in `../../work/city106/`.

An old Chromebook's GPU, driver, memory pressure and supported browser version cannot be reproduced by CPU throttling on a Mac. Real school hardware is required before claiming a minimum frame rate or lag-free operation. The result is a more detailed lightweight WebGL scene, not Unreal Engine rendering or visual parity with the supplied high-end GPU examples.

## Build and Verify

Run from the project root:

```sh
node --experimental-default-type=module gallery105/build.mjs
node --experimental-default-type=module city106/build.mjs
env NODE_PATH=../work/browser/node_modules node city106/test.cjs
env NODE_PATH=../work/browser/node_modules node city106/furnishings-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/signals-test.cjs
env NODE_PATH=../work/browser/node_modules node city106/curb-test.cjs
env NODE_PATH=../work/browser/node_modules node gallery105/test.cjs
env NODE_PATH=../work/browser/node_modules node city106/measure.cjs after
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

`city106/test.cjs` checks wall-visibility edge cases, live pixel equivalence with occlusion on/off, the Missions button, mobile framing, and movement under 4x CPU throttling. The low-device check overrides reported hardware metadata to four cores and 4 GB; it does not restrict physical memory or emulate an old GPU. The gallery test verifies the original source-geometry hash and walks all seven entrance/hallway routes. Generated city assets fail back to the original scenery if their download fails.

The October 13 local checks passed at 1366 x 768 and 390 x 844. Frozen-frame comparisons with wall occlusion disabled/enabled had zero differing pixels in the entrance, gallery, doorway, exhibit hall and street views. All seven gallery walking routes passed with no browser errors.

## Asset Provenance

The leaf source is saved at `city106/maple-source.png`; its optimized texture is embedded in `city106/city.glb`. It was generated with the built-in image-generation tool, not a downloaded stock photograph. Other textures and geometry are reproducibly authored in `build.mjs`.

Generation prompt:

> Use case: photorealistic-natural. Asset type: alpha-cutout foliage texture for a low-poly 3D deciduous city tree, square 1024. Create one compact airy cluster of small realistic maple leaves on delicate branching twigs, isolated on true transparent background with transparent holes between leaves. Face-on orthographic asset, all leaves fully inside image with small empty margin. About 45 individually distinct leaves, irregular asymmetrical silhouette, muted natural olive and forest green with a few lighter new leaves, fine veins and slight curled edges. Real botanical photography, diffuse overcast even lighting, soft intrinsic leaf shading but no cast background shadow. Not a whole tree, no trunk, no pot, no scenery, no text, no watermark. This texture will be placed on many differently oriented small cards to create 3D canopies; avoid perfectly round clumps or dense opaque masses.

The reference city screenshots were not incorporated as game textures.

### Generated Assets for 109

Mode: new image generation with the built-in image tool, opaque backgrounds. Project sources: `city106/sky-source.png` and `city106/asphalt-source.png`. The build embeds optimized JPEG derivatives in `city106/city.glb`; normal maps are derived offline. The generated originals remain available in the project. No reference screenshot was used as an in-game photograph.

Sky prompt:

> Create a photoreal panoramic SKY TEXTURE asset for a browser 3D city. 2:1 wide equirectangular sky panorama, seamless at the left and right edges. SKY ONLY: no ground, skyline, buildings, mountains, trees, objects, writing, water, or horizon silhouettes. A beautiful late afternoon approaching sunset: cool muted cerulean blue upper sky, ivory sunlit mid-altitude cumulus clouds with soft slate-blue shadow bottoms, fine cirrus streaks, delicate blush and pale apricot haze near the lower horizon. Clouds are realistically layered with substantial empty blue areas and subtle natural depth, not giant storm clouds. Bright warm illumination near the lower center, but NO visible sun disc (the game adds its own sun). The top quarter has thin wispy clouds, middle half has scattered stretched cloud banks, bottom quarter has restrained warm gray-blue atmospheric haze. Exposure like a high-quality architectural photograph, natural colors, preserve cloud highlight details. Full bleed bitmap asset, no frames or UI. Avoid a uniformly orange sky or theatrical fantasy colors. The cloud pattern should form a coherent full panorama without visible seams.

Asphalt prompt:

> Photorealistic PBR base-color material texture, square, seamless/tileable. Straight-down orthographic scan of a 6 by 6 meter patch of an ordinary used urban asphalt road. Neutral charcoal gray bitumen with thousands of tiny varied gray aggregate pebbles, subtle warm gray weathering, a few fine branching hairline cracks, barely visible irregular repaired tar seams, muted rubbed dusty patches. Natural restrained tonal variation across the surface, enough detail for a first-person 3D game. Dry mostly matte surface, no dramatic wet reflections, no directional light or shadows. NO lane markings, painted lines, manholes, curbs, plants, trash, objects, borders, labels or text. Even diffuse lighting, sharp physically real fine texture, NOT a stylized illustration, not black flat noise, no giant wide cracked tiles.
# Performance 160

Fresh-load walking was also expensive, not only driving. The controlled entrance
comparison remained slow with hotel and Rivian drawing disabled; outdoor capture
passes and repeated graphics setup were significant costs. This does not rule out
additional hardware/browser-specific stalls.

- Reuse city and crowd vertex layouts and cache stable WebGL methods/constants.
- Change static detail levels only at their existing distance thresholds.
- Frustum-cull directly drawn furniture/exhibits with conservative world bounds;
  preserve animated actors and independent shadow/reflection views.
- After sustained outdoor FPS below 40, keep wet-surface sky lighting but suspend
  the extra city reflection capture and use a 1024 moving-shadow map. This applies
  on foot as well as driving. Loading, hidden tabs and pause are excluded. The
  fallback remains stable until reload or an explicit graphics-quality change.
- All hotel geometry, Rivian geometry/textures, population settings and collision
  geometry remain unchanged.

`node city106/performance160-test.cjs` covers layout caching, live GL properties,
effect-budget transitions and visibility. `performance160.cjs` is the profiling
harness; `performance160-browser-test.cjs` checks a fresh unlocked game, walking,
sustained driving, walking afterward, and desktop/mobile canvas health. Run browser
tests with the workspace Playwright dependencies, one full game browser at a time.

