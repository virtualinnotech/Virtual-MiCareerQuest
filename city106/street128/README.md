# Street 128

## Collision 161

Crash effects retain their particle counts and geometry, but glass, water jets
and droplets now use at most three instanced draws instead of one draw per
particle (123 draws per broken hydrant before this change).

Fallen objects share non-overlapping, reference-counted ground tiles at their
original elevation. Contact callbacks enqueue only one secondary activation per
object per physics step. Ground tiles, vehicle contacts and debris are released
when the last owner resets. The existing 30-second reset behavior is unchanged.

The shared ambulance/Rivian controller in `ambulance35/vehicle-physics.js` reuses
recovery collision probes and round-robins path validation with a budget of 24
sample checks per 60 Hz simulation tick. Every actual movement still checks live
contacts. Clear routes drive back normally; trapped traffic retains its
off-camera, empty-slot recovery rule.

Additional checks:

```sh
node ambulance35/collision161-test.cjs
node ambulance35/recovery123-test.cjs
node city106/street128/collision161-test.mjs
env NODE_PATH=../work/browser/node_modules node rivian147/collision161-browser.cjs --tag=after --verify
```

The browser stress test uses real traffic impacts followed by a controlled
roadside chain reaction and cleanup. Live traffic timing can vary between runs.
Use unprofiled runs for frame-time comparisons: enabling/stopping the CPU profiler
can pause the browser. Local unprofiled tests stayed below 100 ms per frame during
the impact phases; the user's sustained freeze was not reproduced. Visual tests
wait for `Loading155` and read actual WebGL pixels, not just screenshot colors.

Three docking stations reuse the supplied e-bike and charging-stand assets.
Each has two e-bikes and two scooters. The existing six-mission completion gate
controls boarding; rentals return to their dock on dismount. Existing building
shapes and heights are unchanged.

`core.mjs` runs pinned Cannon ES 0.20.0 rigid bodies at 60 Hz, with scene scale
0.4 world units per meter. Swept vehicle footprints activate street furniture;
mass, speed, contact location, gravity and friction determine its motion.
Assemblies remain together. Glass pieces have a separate bounded debris pool.
Hydrant spray remains at the original water connection. Restoration happens
30 simulation seconds after the first impact, including the original transforms,
glass and collision barriers. Pausing the game pauses this timer.

`runtime.js` adapts city furniture, imported park props, docks and rentals to
the custom WebGL renderer. Trees, concrete planters, buildings and structural
bridge elements stay fixed. Individual riverwalk railing bays can fall.
The pedestrian obstacle graph follows fallen furniture instead of retaining
invisible upright obstacles. Nearby vehicle bodies support fallen props.

`convert.py` imports the user's FBX archives with Blender auto-execution disabled,
normalizes bike length to 1.95 m and stand length to 5.2 m, and reconnects the
stand texture. `bike-data.js` contains the measured wheel pivots.

Checks, from the project root:

```sh
node city106/street128/core-test.mjs
env NODE_PATH=../work/browser/node_modules node city106/street128/browser-test.cjs
node city106/skins127/test.mjs
env NODE_PATH=../work/browser/node_modules node city106/buildings125/test.cjs
```

Browser checks use the existing server on port 8014 and an isolated Chrome
profile. They do not modify the user's progress. Screenshots are saved to
`../work/street128`. Update distributable copies with the existing shipping
sync and `splice-venue.sh` after changing runtime assets.
