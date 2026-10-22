# Drone Inspection

The supplied drone and corn models are converted to GLB. The field contains 5,984 instanced plants with a lower-detail model for distant plants. All fifteen former sprinkler clearings are planted again. It sits west of the hay field; overlapping city buildings are removed at initialization.

`display.js` creates the semicircular Agribusiness corner display and seven independently hovering drones. `farm-boundary.js` supplies the shared corn/wheat fence, tree line, outside sidewalk, paired dirt tracks and vehicle-access gaps. The supplied Barn.fbx is converted to `barn.glb` with 1024px textures and placed behind the parked farm vehicles, clear of their starting positions and crop rows. Boundary and barn collisions are registered for pedestrians and both farm vehicles.

`farm-boundary-test.cjs` verifies all fifteen replanted areas, all seven hover motions, desktop/mobile screenshots, rendered geometry/motion, and vehicle driveway clearance.

`stables.js` adds six bedded stalls and six horses from the two supplied horse archives. The white horse retains its supplied standing idle; the brown horse uses a restrained neck, ear and tail idle. Each instance has an independent animation offset, with pose updates limited to 24 Hz near the barn. The barn uses its actual mesh for pedestrian collision, preserving both open doorways and the center aisle; farm vehicles still collide with the exterior footprint. `?exhibit=stables` opens beside the entrance. `stables-test.cjs` walks through both doors and verifies visible idle motion and desktop/mobile rendering.

Approach the indoor Agribusiness drone and press T. WASD flies, Q/E changes altitude, dragging orbits the camera, and the wheel zooms. Five parallel irrigation rigs use arched pipes, braced trusses, wheeled towers and 75 hanging nozzles. Each rig has three inspectable sections. Fourteen sections spray; one randomized section is stopped. Click any nozzle in that section from within 12 horizontal units of its center and below 14 units altitude. The soil and crop are uniform with no fault-colored patch, and the sensor clue names only a broad north/central/south area.

### Drone and Pump Repair (56)

Finding the fault begins the return flight, with no reward yet. Land on the southeast
yellow-plus pad: within 1.2 units, below .6 altitude, and horizontal speed below .8.
The UTV is staged beside the landed drone, with the farmer at its driver's door.
The farmer boards immediately with T, then drives to the numbered control
beside the eastern service lane, gets out, and presses T to reset the correct section.
Driving more than five units and arriving within three units of the correct control
is required. Wrong controls, remote resets and in-vehicle resets cannot complete it.
Only the final reset restores all water flow and awards 200 points, once per run.
Replay randomizes the fault; exit restores the pre-mission student/location.

Large supply hoses connect both ends of all five rigs to pump housings. Fifteen
numbered reset panels correspond to the inspected sections. The old translucent
sky/horizon shell crossed the new west farm boundary at x=-117.15; it is removed
while the opaque sky and physical farm limits remain intact.

The UTV has persistent collision damage, ambulance-style ballistic debris, and a
disabled driving state at 100% damage. Fence bounds, barn/stall geometry, parked
vehicles, silos, irrigation wheels and pump controls register impacts. Recovering
to the barn repairs the UTV without discarding the current irrigation mission.
`browser-test.cjs` covers the full inspection/landing/drive/reset flow, real collision
damage, breakdown/recovery, replay, exit and desktop/mobile screenshots.

Tests: `node drone44/core-test.cjs`; browser tests use Playwright from `../work/browser/node_modules`.

The welding update uses the supplied pin, actual surface-position trails, tighter accuracy scoring, and a steady white warning overlay for helmetless attempts. It does not use strobing. Eye-protection reference: https://www.osha.gov/sites/default/files/publications/OSHAfactsheet-eyeprotection-during-welding.pdf
### Farm UTV and Crop Damage (53-54)

`farm-vehicles.js` parks the optimized supplied UTV just outside the barn. Press T nearby to board;
the driver door opens and closes before driving. WASD/arrow keys steer, Space brakes,
and T exits. Touch controls are also available. The vehicle uses the existing Matter
vehicle simulation with stall/doorway collisions and a complete-footprint farm limit,
including open pedestrian entrances. `?exhibit=utv` previews the barn entrance.

`farmer.js` uses the supplied scan's face and straw hat on the venue's proven skinned
body, with a baked plaid work jacket, blue trousers and brown shoes. The original
static scan's hands touch the clothing; the attempted full-scan skinning introduced
tears and stretched triangles and is no longer used. The jacket, trousers and shoes
retain all production triangles and weights. `farmer-rig-test.cjs` verifies those
counts, bounded edge deformation across walking phases, and close-up screenshots.
It shares the venue NPC idle/walk animations. Entering the farm or starting Drone
Harvest switches the player to the farmer; returning to the venue restores the
original student actor and outfit. Seated leg orientation is defined per rig so the
farmer works in the UTV, tractor and combine. `farmer-test.cjs` covers these transitions,
rendered motion, seat posture and mobile preview.

The UTV uses left-hand drive with separate left/right palm targets on the steering
wheel. Four independently pivoted tire/rim assemblies roll from signed travel;
front wheels use inner/outer steering angles, and the steering wheel and hands turn
together. `utv-animation-test.cjs` checks hand alignment, forward/reverse rolling,
stopped wheels, steering response, and desktop/mobile rendering.

The farm perimeter is now character-scaled, with a fenced grass paddock connected to
the rear barn doorway and two additional idling horses. Corn and standing wheat flatten
under vehicles and remain damaged for the current visit. Wheat damage reduces grain
and hay yield; normal forward harvesting does not count as crushing. Restarting the
harvest restores wheat. The UTV HUD shows remaining yield and the bottom warning
explains the benefit of staying on the designated tracks.

Run `farm-vehicles-test.cjs` with Playwright to check boarding, door motion, barn exit,
crop damage, all four farm bounds, and desktop/mobile rendering. Crop-yield accounting
is also covered by `../farming36/harvest-core.test.cjs`.

## Separate Countryside Scene

`farm-scene.js` switches the shared renderer and pedestrian collision index between
the city and farm. Coordinates are reused in separate worlds, not stacked vertically.
Original city buildings are no longer removed. The city-only drone display remains
in the agriculture sector; starting either challenge transports the player to the
farm. The return button restores the venue, and ordinary destination navigation
also leaves the farm safely, including when a vehicle is moving.

Only the active world's geometry is drawn. City crowds and exhibit animation are
paused on the farm, and city NPCs cannot collide with farm vehicles. Existing farm
models remain cached for repeat visits; countryside ground and low-poly hills add
two batches without another model or texture download. This lowers active rendering
work, but is not a claim of measured Chromebook frame rates or lower initial downloads.

Run `farm-scene-test.cjs` for city restoration, separate collisions, harvesting,
tractor entry, drone travel, mobile rendering, and repeated travel without model
redownloads. `browser-test.cjs` covers the full drone/UTV/pump repair flow.
