# Crash lag, full-venue and ready-for-students changes — builds `20261021-crash162` and `20261021-fin162`

Preview URL (the new version tags make browsers fetch the changed scripts):

`http://127.0.0.1:8014/venue-frame.html?v=20261021-fin162&time=day`

Section 3 (secret code, booth lock, booth optimizer) is the `fin162` part.

All changes are in the files listed below. `booth-shipping/public/` has been
re-synced (`node booth-shipping/scripts/sync-forklift.cjs`) and the venue has
been re-spliced into `MiCareerQuest-Ship-to-Venue-v13.html` (`bash splice-venue.sh`,
verified byte-for-byte). Nothing was deployed.

## 1. Lag after crashing the Segway / Rivian / ambulance

Knocked-over street furniture (lamps, bins, benches, signs, hydrants) lies on
the sidewalk for 30 seconds. Pedestrians whose way was blocked re-planned
their route **every frame**, and four different fallback searches
repeated every frame while they kept failing. The more you crashed, the more
sidewalks were blocked. In a CPU profile of Rivian crashes this was about
40% of all CPU time.

Fix (`city106/life111.js`): a failed search waits before it is retried:
0.8 s for a route, 0.5 s for a detour, and 0.8–1 s for a recovery. All of
these reset as soon as the furniture layout changes. A route that is found is
not throttled (the existing `pedestrian121` test requires every walker to
recover within 10 s).

Related smaller fixes:

* `city106/street128/runtime.js`, `core.mjs`: props lying still keep their
  matrices and contacts. Impact bursts share one sun-shadow re-render every
  1.5 s. Debris ground tiles are shared. Cheaper clean-up.
* `visitors100/scooter.js`: solved Segway/bike rider poses are cached (the
  full-body IK ran on every frame of a crash or turn).
* `ambulance35/vehicle-physics.js`: obstacle refresh every 1/30 s instead of
  every substep. The collision-cooldown table no longer grows forever.
* `rivian147/runtime.js`, `ambulance35/ambulance.js`: 60 Hz physics substeps
  below 40 FPS, instead of up to twelve 120 Hz steps per slow frame.
* `rivian147`, `hotel146`, `hibachi145` runtime: cheap "is riding" check
  instead of building a full Segway snapshot several times per frame.
* `venue-frame.html`: static sun shadow refreshed every 3 s instead of every
  0.5 s (the sun moves ~0.1°/s and the maps are blended, so it looks the same).
  Faster floor raycasts and 4×4 matrix multiply. Indoor crowd floor heights
  are reused.
* `city106/materials129.js`: the moving-object shadow pass loops over moving
  batches only, not all ~40,000.

Simulated Chromebook (4× slower CPU, Chromebook settings), 2 minutes of
continuous Segway crashes:

| | Before crashing | While crashing | Worst frame |
| --- | --- | --- | --- |
| Original | 8.2 fps | fell to 4.3 fps | 867 ms |
| Fixed | 9.7 fps | steady 10–11 fps | ~200 ms |

Simulated Chromebook, 90 s of Rivian crashes (about 60 hits into props and
moving cars), fps:

| | Before crashing | Crash 1–30 s | 31–60 s | 61–90 s | Worst frame |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original | 9 | 6.4 | 5.1 | 9.2 | 322 ms |
| Fixed | 10 | 10.9 | 10.0 | 10.5 | 213 ms |

In the 20 s after the crashing stopped, the fixed run measured 7–8 fps and the
original 10. That fixed run had more wreckage still on the road (5 wrecked cars and
up to 6 knocked-over props, against 2 and 1). Crashes play out differently on every
run, so this was not isolated further. The car-recovery unit tests pass at both
60 Hz and 120 Hz.

## 2. A full venue of employer booths (150–175)

Tested with 175 real booth exports from the booth editor (`studio-frame.html`),
each with an uploaded logo and two photos, served through a mocked
`/api/manifest` exactly as students receive them.

### 2a. Full venue never finished loading (fixed)

`loading155/world.js`: the "street pedestrians" loading step started as soon
as the crowd graphics were ready. With many booths that happened before the
character models had loaded, its one-time setup silently did nothing, and the
loading screen stalled for 5 minutes, then showed "Loading street
pedestrians is taking too long". It now waits for the crowd and retries.
Result: all 175 booths load in about 41 s on a Mac. The game's minimum
loading screen is 30 s.

### 2b. 100+ booths made the whole game run at 2–5 fps (fixed)

Root cause, confirmed by isolating it: when a single frame issues more than
roughly 2,000–2,500 draws that each change shader values, the browser's
WebGL-to-Metal layer grows an internal pool that **never shrinks**. Every
later frame is then 6–10× slower, even after the booths are removed. With
100+ booths, the frame that refreshes the sun-shadow map draws every booth
piece (~25 per booth) and crosses that line. One burst of 5,000 such draws
of a single existing object reproduced the collapse with no booths at all.

Fix (`venue-frame.html`, the existing WebGL wrapper `Performance21.cacheGL`):
submit queued GPU work (`gl.flush()`) every 250 draws. Nothing on screen
changes.

Also fixed (`drone44/assets.js`): the instanced exhibit drawing re-allocated
a GPU buffer for every model part on every call, every frame. It now reuses
one buffer per part. Same output, ~8% less frame time.

Same Mac, same view (entrance), before → after:

| Booths | Before | After |
| ---: | ---: | ---: |
| 50 | 30 fps | 30 fps |
| 100 | 3.4–5 fps | **39.9 fps** |
| 175 | ~1.5–2 fps | **25 fps** |

Simulated Chromebook (4× slower CPU, Chromebook settings), 150 booths:

| Where | fps |
| --- | ---: |
| Entrance | 8.6 |
| Inside Manufacturing (30 booths around you) | 9.6 |
| Inside Health Science | 12.3 |
| Empty venue, for comparison | ~8.6–13 |

Booths no longer slow the game down. What remains on a slow CPU is the
base game's own per-frame cost.

### 2c. Memory with a full venue (reduced)

* The student game now frees each booth's source file and CPU geometry copy
  once it is on the GPU (≈950 MB for a full venue). The booth editor and
  employer views keep them. JS heap with 175 booths: ~2.0–2.5 GB → ~1.2 GB.
* Devices detected as Chromebook / ≤4 GB (the game's existing detection)
  load textures one size step lower (1024→512, 512→256, minimum 256).
  Graphics memory with 175 booths: ~2.3 GB → ~0.8 GB. Desktops are unchanged.

## 3. Ready for students (build `fin162`)

### 3a. Secret code instead of the test button

The **Complete all missions (test)** buttons are gone: the one on the controls
card shown at the start, and the one in the missions panel. The old Shift+K /
Alt+K shortcut is gone too (a student could hit it by accident).

New secret code: **hold Shift + F + I + N together**. It completes every
mission, which unlocks the bikes, scooters, Segway and Rivian (the Rivian model
starts loading at once). The first time, the usual "visit the information
booth for your prize" message appears; after that a short confirmation shows.
Keys typed into a text field never count. Files: `missions99/guard.js`,
`missions99/ui.js`, `visitors100/scooter.js`. The two tests that used the old
button/shortcut (`visitors100/fix101-test.cjs`, `visitors100/browser-test.cjs`)
now use the code.

### 3b. Booth editing lock (admin page)

New **Booth editing** panel on `/admin.html`. Lock it once every employer has
finished. While locked, shipping, re-shipping and claiming a booth are refused
with "Booth editing is closed because the career fair is live for students.
Contact the organizer..." (the studio shows this message). Unlock any time.
The header button that used to say **Lock** (it signs the admin out) now says
**Sign out**, so the two are not confused.

### 3c. Optimize booths for students (admin page)

New **Optimize booths for students** panel (needs booth editing locked). It runs
in the admin's browser and takes about 12 s for 150 booths on this Mac (longer
over the internet: it downloads every booth once). For each booth:

* Textures that two or more booths share (the studio's material maps are in
  every export) are stored once in `booths/library/`.
* Logos and photos are saved at exactly the size the game draws them, losslessly
  (PNG, or WebP only after checking it decodes to the same pixels). Lossy WebP was
  measured and rejected: even at quality 0.98 it visibly softened colored logo text.
* The file is gzipped (geometry compresses ~6×).

The employer's original upload is never changed. **Undo optimization** points
students back at the originals instantly. If you unlock and an employer
re-ships, their booth goes back to the original automatically; run Optimize
again. Optimized files are named by their content, so the edge and students'
browsers cache them for a year (a reload costs nothing).

The venue rebuilds each booth on load (`expandShippedBooth162`), downloads 4
booths ahead instead of one at a time, shows "Loading employer booths (37 of
150)..." and allows the booth step 15 minutes instead of 5.

### 3d. Results (150 booths shipped through the real Worker code, run locally)

Tested end to end with a local stand-in for Cloudflare (the real
`src/index.js` with SQLite for D1 and a folder for R2; nothing was deployed):

| | Original | Optimized |
| --- | ---: | ---: |
| Booth download per student | 722 MB | **73.5 MB** (70.1 booths + 3.4 shared) |
| Booths step at 10 Mbps | ≥ 578 s (over the old 5-min limit: loading failed) | **149 s** |
| Frame rate at the entrance (Mac, 1024×576) | 37.5 fps | 36.8–38.5 fps |
| JS memory after loading | 1,269 MB | 930–1,200 MB |

* All 150 booths load and are placed; no errors.
* Every booth's geometry, materials and nodes are byte-identical (55,185 data
  blocks compared) and all 4,714 textures draw pixel-identical in the game.
* Lock refuses ship/claim (423), unlock accepts them again, Undo restores all
  150 originals, Optimize can be re-run.
* One frame-rate sample right after the admin test measured 1.8 fps; four
  later runs, including the identical configuration, measured 36.8–40.8 fps.
* Chromebook profile (Chromebook browser ID, half-size textures): loads, 40.8 fps.

### 3e. Short links

`/student` opens the student fair and `/vendor` opens the booth builder
(`booth-shipping/src/index.js`). The address bar keeps the short link.
`/Student`, `/student/` and so on redirect to the exact link, query
parameters included. The bare domain now redirects to `/student`.
`/venue.html` and `/design.html` keep working. Phones still get the
"computer required" page.

Full fair check: all 175 demo booths through `/student` (Information
Technology raised to 30 slots on the admin page). Download went from 844 MB to
85 MB (Optimize took 13 s), the booths step took 10 s, and there were no
errors. Frame rate at 175 booths varied between runs on this Mac (1.8,
17→9 and 27→24 fps) while every run sent the same GPU work per frame. That
points below the game, at the GPU driver, as with the full-venue slowdown in
section 2b. It has not yet been compared run for run against unoptimized
booths.

### 3f. Macs: game crawled after loading or refreshing (fixed)

On Macs, Chrome and Safari run WebGL on Apple's Metal. The game's main shader
passed one value, `vOutfitFlags` (outfit accessories), as a `flat` varying.
WebGL takes a flat value from a triangle's last vertex, Metal from the first,
so the browser rewrote the index buffer of every draw (~6,400 per frame) into
scratch memory sized to the largest model (the MRI room people, 3.4 MB). On the
second frame after loading, the GPU process grew from ~4 GB to 12–19 GB (~2,700
identical 3.4 MB blocks), the Mac started swapping and the game fell to ~2 fps,
with everyone moving in slow motion. It was in the original build too, with or
without booths. Whether a given load crawled depended on how much memory was
free at that moment, which is why it looked random and seemed tied to refreshing.

Fix (`venue-frame.html`, `initRenderer` shaders): `vOutfitFlags` is a plain
varying. Its value is per instance or a uniform, so it is identical on every
vertex and the picture is unchanged. Other computers never did this rewrite,
so they are unaffected.

Full fair (175 booths, `/student`), Mac, Chrome on Metal:

| | Before | After |
| --- | ---: | ---: |
| GPU process memory | 12–19 GB | 4.8 GB peak |
| Lowest free memory on the Mac | 6% | 74% |
| Frame rate: first load / refresh / refresh | 1.8–27 fps, ~2 after refresh | 39.1 / 39.2 / 40.1 fps |

Chromebook profile with the CPU slowed 4×: 8.8 fps at 175 booths, normal
memory (limited by the slow CPU, as before). Secret code, rides and the Rivian
re-tested. `perf-tests/firstframes.cjs` steps frames one at a time with a memory
guard; `perf-tests/reload-test.cjs` loads and refreshes the fair.

### 3g. Booth videos and links (new)

Students can now watch an employer's video and open their resource links
from inside the fair. Files: `boothmedia162/media.js` + `media.css` (new),
plus small hooks in `venue-frame.html` (records each booth's TV and resource
papers when it loads), `missions99/guard.js` (keys belong to the panel while it
is open) and `missions99/ui.js` (the representative's booth panel lists the
same video and links). `booth-shipping/scripts/sync-forklift.cjs` copies the
new folder.

* Look at a booth's TV from the aisle (up to 3 m) and the prompt reads
  "E - Watch company video". Look at a resource paper (2 m) and it reads
  "E - Open: <title>". At the counter, facing the representative, E still talks
  to them, and their booth panel has "Watch company video" / "Open: <title>".
* YouTube and Vimeo links play inside the panel through their own embed
  players (YouTube's privacy-enhanced `youtube-nocookie.com`). A direct
  `.mp4`/`.webm` link plays in a video player. Anything else (a PDF, a careers
  page, another video site) opens in a new tab. Esc or "Back to the fair"
  closes it.
* Light on Chromebooks: nothing is downloaded until a student opens a panel.
  While it is open the game is paused and draws nothing (0 frames measured).
  Closing removes the player completely. The proximity check costs 0.3 ms even
  with the CPU slowed 4×. Full fair: 39.7 / 40.0 fps (load / refresh), same as
  before.
* Safety: only `http(s)` links are used. Embeds are built from the video ID,
  never from the employer's text, and run sandboxed. Employer titles are shown
  as plain text. Links open with `noopener noreferrer`.
* Links come from the booth file the studio already exports (video link in
  `employerData`, each resource paper's link on its node), so existing booths
  work as they are, and the links survive Optimize.
* Tested with `perf-tests/media-test.cjs` on Mac and on the Chromebook profile:
  YouTube, Vimeo, a direct `.mp4`, a video on another site, a resource link,
  the representative's panel, keys blocked while open, Esc, resume.
  `perf-tests/gen-media-booths.cjs` makes the test booths.
* School networks often block YouTube. If an embedded video stays blank, the
  panel's "Open in a new tab" link is the fallback, and Vimeo may be a safer
  host for employers.

### 3h. Visual fixes (2026-10-22)

* **Taxi wheels were chrome.** Each taxi wheel is one mesh with one textured
  material, named "rim", and the fleet build made anything named "rim"
  chrome, tyre included. It is now shaded like every other car's tyres
  (metal 0, roughness 0.65). Patched in `city106/city.glb` (+ `.gz`) and
  `vehicles114/fleet.glb` (that material only; geometry and textures unchanged);
  `vehicles114/build.mjs` has a `wholeWheel` rule so a rebuild keeps it.
* **PC builder booth: desks turned pink at some angles.** The exhibit draws the
  first copy of each desk style normally and the rest as GPU instances.
  `drawBatch` skips an off-screen object without setting its material, so when
  the first desk was out of view the others were drawn with the previous
  object's material (the pink neon). `drone44/assets.js` `instances()` now
  draws the first *visible* copy normally and instances only visible copies.
  Measured: at most 0.5% pink (the neon decor) from every angle, was up to 12%.
* **Rivian camera zoomed in on every prop hit.** The chase camera pulls in
  for anything between car and camera, and a knocked bench, bin or lamp post
  flew through that line. Street props (standing or knocked over) are now
  ignored by the Rivian's and the ambulance's camera. Measured over 12 impacts:
  the camera stays at 3.25 m; it still moves in for building walls.
* **Network lab laptop looked like two screens.** The "network commands"
  screen stood upright 5 cm in front of the tilted lid, with its own dark
  slab. It now lies flush on the lid (17.3° tilt, measured from
  `console.glb`) in `network40/network.js`.
* **Sidewalk past the blue bridge ran into the road.** The bridge's far
  landing was 2.5 m long and ended 1.05 m inside the road. It now stops at
  the kerb line (z −67.2): `city106/district115/build.mjs` and the same 12
  vertices in `city.glb` (texture mapping adjusted, tiles not stretched).

Originals: `backup-before-crash162-2026-10-21/` (city files as hard links,
taking no extra space). Re-tested: secret code 17/17, farm, IT, hall,
entrance with no errors.

### Before the fair

1. Every employer has shipped (admin page summary).
2. **Lock booth editing.**
3. **Optimize booths** and wait for "Optimized N of N booths".
4. Send students `/student` (employers get `/vendor`).

These changes are in the files only. They go live when you deploy
(`npm run deploy` in `booth-shipping`).

## Still to consider

* **Base game download.** With booths optimized, the rest of the game is the
  bigger download: ~390 MB per student in this local test (the 53 MB
  `venue.html` and the city, character and vehicle assets). Cloudflare
  compresses the text files on the way, and browsers cache them for the next
  visit, but a classroom's first load on shared Wi-Fi is still large.
* Real Chromebook check: these numbers come from CPU throttling on a Mac. A
  real Chromebook's GPU behaves differently.

## Existing tests

Every node test that runs without a browser passes. That includes `pedestrian121`,
`performance150`, `traffic159`, the street-prop physics tests, and the ambulance,
recovery and vehicle-physics tests. Tests that need the `work/browser/node_modules`
packages (playwright, sharp, gltf-transform) were not run: `bus-kiosk121`,
`hospital122`, `riverbank123`, `life111-test`, `walk118`.

`visitors100/fix101-test.cjs` and `visitors100/browser-test.cjs` were updated for
the secret code, but they cannot pass as they are: they first wait for
`Visitors100` (`visitors100/visitors.js`), which the venue no longer loads. That
was already the case before these changes (the original and committed
`venue-frame.html` do not load it either). The secret code is covered by
`perf-tests/secret-code.cjs` instead (17 checks, all passing).

## Testing tools

`perf-tests/` (beside the project in this session) contains the harness used here:
`gen-booths.cjs` (exports 175 booths from the editor), `booth-routes.cjs`
(mock `/api/manifest` and `/api/sectors`), `safe-fps.cjs` (guarded frame-rate
measurement with a watchdog that stops the browser on any long stall), and
`trace.cjs` (GPU-process trace).

For section 3: `secret-code.cjs` (the Shift+F+I+N code and removed buttons),
`local-worker.mjs` (runs the real Worker locally with SQLite for D1 and a folder
for R2), `ship-booths.cjs` (ships test booths through `/api/ship`),
`admin-e2e.cjs` (lock, refusal, optimize, quality comparison, undo, unlock),
`venue-e2e.cjs` (student load: bytes, timing, frame rate, optional throttling)
and `webp-quality.cjs` (the encoding comparison behind choosing lossless).
