# Manufacturing: Robotic Error Challenge

The robot cell occupies the northwest corner of Manufacturing at (10.56, -23.22),
with its left and rear glass aligned to the inside faces of the curtains.
No existing exhibits are removed. Glass panels and a collision volume enclose the
robot, conveyor and three-slot fixture. The controller is outside the enclosure.
The cell is reserved in student-crowd navigation and robot-dog navigation.

Walk to the console and press T. The developer Manufacturing robots panel also
has a Robotics challenge visit button. T, Escape or the close button exits.
Desktop splits the scene/controller equally; mobile puts a scrollable controller
below the scene. Existing HUD elements are hidden only while using the controller.

The supplied broken program releases a component before lowering it into its
seat. Commands execute in their actual order, with animated travel, grip, lift,
release and falling parts. The current row highlights. Arrow buttons and drag/drop
reorder commands while idle; Test speed changes the preview rate. Test cycle
resets the workpiece but retains the edited sequence. Production is unlocked only
after a successful test and repeats that sequence for three slots. Success awards
200 local challenge points, not persistent career badges or backend points.

Emergency stop and loss of focus stop execution. Leaving the controller stops an
unfinished cycle. Reset restores the original broken program and clears points.
This is a simplified educational task, not industrial-robot operating training.

The robot is procedural articulated geometry, not the concept image's exact asset.
It uses the existing venue renderer. No extra runtime libraries or remote assets.

Verification:
```
node robotics37/robot-core.test.cjs
NODE_PATH='../work/browser/node_modules' node robotics37/browser-test.cjs
```
Run bash splice-venue.sh for venue changes and npm run sync:forklift --prefix
booth-shipping for deployment asset copies. These commands do not publish.
# Interactive Console

The walk-up terminal uses scale 0.085 with matching screen and collision bounds. Its monitor is taller to accommodate all eight commands in one column. The close-up uses the student's existing skinned avatar for a shoulder view; an affine projection keeps the clickable controls aligned with the angled screen. The fixed 480 by 420 control layout fits without scrolling.

## Welding Display

`welding.js` replaces the large double-gear sculpture and its pedestal, not the separate smaller gear display. `welding.glb` preserves the supplied 113.928-second animated cycle. Optimization reduced 1,064,102 triangles to 178,231, using Meshoptimizer simplification with 0.006 error tolerance and 512px textures. The file is about 7 MB versus the 35.7 MB original.

The display reuses the venue's animated asset loader and WebGL context. Poses update at up to 30 Hz when visible and nearby; hidden-tab and pause states stop updates. The cell has player collision and crowd navigation exclusion. `?exhibit=welding` opens its viewing spot.

Run `NODE_PATH='../work/browser/node_modules' node robotics37/welding-test.cjs` for placement, animation, looping, collision and viewport checks.

The supplied orange terminal is `console.glb`, optimized from 101.4 MB to about 3 MB by removing unused PBR maps, deduplicating resources, and reducing color textures. The original archive is not deployed.

`console.js` shares GPU geometry/textures between the world terminal and a scissored close-up viewport. Accessible HTML controls are aligned to the model's monitor plane; the robot remains live in the other view. On narrow screens the monitor scrolls to keep every command reachable. No second WebGL context is created.
