# Agriculture: Hay Harvest

The field is west (left) of the venue, between x=-68..-26 and z=-25..35.
Buildings whose footprints overlap this field and two street trees are cleared;
their collision shapes are removed too. The hospital and ambulance route remain.

Open **Agriculture: hay harvest**, choose **Visit hay field**, and press T by the
combine. WASD / arrow keys drive, Space brakes, T exits, and Escape stops/exits.
Touch controls and camera reset are provided. Mouse-wheel zoom is vehicle-specific.

1. Drive the combine's header through the standing crop. Wheels, rear steering,
   reel and auger animate. Straw streams from the rear into collectible windrows.
   Grain visibly fills the tank, whose capacity is half the field. At capacity,
   harvesting pauses but driving remains available. Park facing south in either
   yellow silo bay and use U / Unload grain. The pipe swings out 90 degrees,
   grain flows into the hopper, and the tank empties before harvesting resumes.
2. Both vehicles are available from the start. Exit with T and enter the other
   vehicle on foot, or use **Drive tractor-baler** / **Drive combine** to switch.
   Vehicle positions, harvested rows, collected hay and chamber contents persist.
3. Align the trailing pickup with the hay rows. Its wheels/pickup animate, the
   chamber fills, and the rear gate ejects each round bale while driving and pickup continue.
4. Completion requires every crop unit harvested and collected, including the
   final partial bale, the last ejection cycle completed, and all grain delivered.
   Award: 200 local
   challenge points. No time limit, backend score, or persistent career badge.

The field map shows remaining crop, loose hay, vehicles, and completed bales.
Two corrugated silos, receiving hoppers, and elevator pipes occupy the north edge.
The supplied wheat.zip Collada geometry and albedo/opacity maps are repeated in
one batched draw with deterministic height and rotation variation. Source assets
are in wheat/. The runtime combines the supplied opacity and color maps without
external texture dependencies. Harvested patches flatten into stubble.
Progress survives exiting/reentering a vehicle, but resets on restart or page reload.
Pedestrian contact while driving either machine fails the entire attempt, including
contact with the combine header or trailing baler. Driving and reentry are locked
until Restart clears all crop, grain delivery, bale, and point progress.

Farm vehicles use the venue's 0.40 model scale, matching the player and ambulance.
Collision dimensions, hitch/pickup offsets, cutter reach, driver, ejection and bale
size follow that scale. The unchanged field now takes nine narrower full-width passes.

The player's selected character and outfit appear inside both cabs. The seated
pose aligns the hips to the seat and solves the arms toward the steering wheel;
exiting clears the driving pose. Seat geometry is moved forward during conversion
to put the steering wheel within reach at the shared player/vehicle scale.

## Assets

`combine.glb`, `tractor.glb`, `baler.glb`, and `bale.glb` are converted from the
user-supplied `combine-3d.zip` and `tractor-baler.zip` offline Three.js scenes.
The supplied bodywork, wheel geometry, text plates, baler gate, and textured bale
are retained. Animated subassemblies are exported independently. The runtime
uses the existing venue WebGL renderer and the existing vendored Matter.js engine.

`prepare-assets.cjs` reproduces the conversion with Playwright/Chrome from the
extracted source folders in `../work/farming` relative to the repository root.
The converter does not add the source HTML's standalone driving simulation to
the game. Farm mechanics live in `harvest-core.js`; physics and UI are in `farming.js`.

## Verification

```sh
node farming36/harvest-core.test.cjs
NODE_PATH='../work/browser/node_modules' node farming36/browser-test.cjs
node ambulance35/vehicle-physics.test.cjs
NODE_PATH='../work/browser/node_modules' node ambulance35/browser-test.cjs
```

The farming browser test uses actual vehicle physics along each swath, with
controlled repositioning only on the turning headland between swaths. It checks
asset loading, cleared meshes/colliders, entry, full crop/hay conservation,
switching, bale ejection/completion, camera zoom, desktop/mobile layout and pixels.

`npm run sync:forklift --prefix booth-shipping` copies the canonical farming assets
alongside the other vehicle runtimes into the Cloudflare public directory.
Run `bash splice-venue.sh` after changes to `venue-frame.html`.
