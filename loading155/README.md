# Startup loading screen

`loading.js` installs the input barrier before the game scripts start.
`world.js` waits for the actual scene/module readiness states, including character
animations, street LODs, hotel staff, employer booths, vehicles, and the PC workshop.
Previously proximity-loaded farm buildings, bikes, scooters and the locked Rivian
are prepared explicitly. Preloading never awards mission or vehicle unlocks.

The progress bar combines weighted asset readiness with the minimum slideshow
duration, taking the lower of the two. It never advances ahead of actual asset
preparation. The caption names a currently active group. Venue geometry also
reports its processed fraction. A final scene render and GPU fence complete before
controls are released. Revision 156 also keeps the slideshow visible for a minimum
of 30 seconds; slower asset preparation still takes priority. When the assets are
ready before that minimum, the bar continues filling and the caption says
"Starting your visit...". "Ready" appears only at the final handoff into gameplay.
Startup errors retain the barrier and offer a reload retry;
missing optional slideshow images advance to another image.

The nine supplied PNGs are compressed into `art/*.webp`. The slideshow alternates
slow zoom-in, pan and zoom-out motion with crossfades. Reduced-motion preferences
disable movement. Images fill the screen; the status and three-pixel progress bar
remain along the bottom on desktop and narrow layouts.

Slideshow order: Front Entrance, Ambulance, Grand Gallery, River Walk, Farming,
Exhibit Hall, Robotics, Crane, PC Lab.

The transparent `title158.png` uses the supplied Virtual MiCareerQuest logo,
without redrawing its lettering. With the user's approval, `prepare-title158.cjs`
removes the original dark backdrop by pixel brightness while preserving visible
lettering colors. It accepts the original screenshot path as its argument.
The title scales within the footer and stays above the status and progress bar.

Normal previews reset to the main entrance after all scene initialization has
finished. Explicit challenge, sector and employer preview links retain their
requested destination.

The PC workshop is loaded once in a hidden, inert iframe and retained for later
entry. Its render loop and automatic challenge progression pause while hidden.
The PC race car, environment and decoder files are cached at startup; its separate
test-drive renderer is only created when that activity is started.

The venue already excludes phone clients using `desktop141`; responsive loading
layout tests do not remove that device policy. Preloading shifts work to startup
and keeps world assets ready, but does not guarantee a particular gameplay FPS or
eliminate later dynamic employer edits or newly selected procedural content.

Commands from the repository root:

```sh
NODE_PATH=../work/browser/node_modules node loading155/prepare-art.cjs
NODE_PATH=../work/browser/node_modules node loading155/ui-test.cjs
NODE_PATH=../work/browser/node_modules node loading155/browser-test.cjs
NODE_PATH=../work/browser/node_modules node loading155/failure-test.cjs
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

The browser test deliberately holds the Rivian download, verifies locked inputs,
checks animated artwork and mobile bounds, releases the asset, checks nonblank
WebGL output and restored movement, then verifies PC iframe reuse and suspension.
The UI test covers reduced motion, failed artwork, non-simulated progress, readiness
enforcement, late errors, retry, and restoration of preexisting inert state.
The failure test intercepts an actual MRI asset request with an HTTP 503 response
and verifies that gameplay remains locked with a visible retry action.
