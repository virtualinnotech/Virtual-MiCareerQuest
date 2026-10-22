# Street Lighting and Layout 131

The supplied `city-street-light-3.zip` contains a nested Collada model. The existing
asset converter imports it with Blender auto-execution disabled. `model.mjs`
removes its concrete footing, anchors the metal base, preserves the photographed
materials, and builds a shared 10,040-triangle fixture at 3.2 world units high.
`place.mjs` replaces 54 streetlights and adds 332 along road sidewalks, 12 smaller
park lights, and four entrance sconces. Nine existing riverwalk lanterns are also
connected to the night-light system: 410 light sources altogether.

`core.js` maps 1,800 active seconds to 06:00-18:00 and 600 to 18:00-06:00, repeating
every 40 minutes. A session starts at 09:00. Game pause and inactive tabs pause the
clock. Sun direction, direct light, ambient light, fog, sky, moon and window
emission transition together. Architectural and moving-actor shadow maps follow
the same sun. Indoor exhibit lighting and farm lighting remain independent.

At night the renderer uses at most 32 nearby light sources. Their downward pools
illuminate pavement, vehicles and people. These are local diffuse/specular lights,
not ray-traced or individually shadow-mapped lights. Broken poles lose their light
until the existing 30-second physics reset restores the assembled fixture.

Road puddles use a higher basin threshold. The park has three small irregular
world-anchored wet patches plus sparse damp spots. Reflection capture still tracks
every rendered camera frame, without the earlier multi-frame hold.

## Layout Corrections

- All three shelter benches face the street, clear of poles, hydrants and meters.
- Shelter route labels have separate correctly oriented front and back faces.
- Street-name boards sit above the signal poles, with text clear of each pole.
- A rectangular sidewalk joins the front/east curbs; the curved curb is retired.
- Nine school buses use explicit curbside headings. The former diagonal bus is
  parked on the side street, clear of the crossing. The supplied model faces -Z.
- Vehicle meshes, traffic obstacles and new collision boxes share one placement
  definition. Original bus proxies and old flat contact patches are retired.
- Existing concrete signal footings are recessed, with their poles seated at
  sidewalk level rather than left floating over the buried foundations.

## Verification

Run from the project root:

```sh
node city106/build.mjs
node city106/lighting131/placement-test.mjs
env NODE_PATH=../work/browser/node_modules node city106/lighting131/test.cjs
node city106/street128/core-test.mjs
node city106/skins127/test.mjs
```

Browser checks cover solar timing, live clock advancement, day/night pixels,
architectural shadow movement, illuminated pavement, broken-light resets, park
paths, gallery lighting, bus stops, retired/new collisions and desktop/mobile
canvases. Screenshots and verification JSON are in `../../work/lighting131/`.

## Motion Follow-Up 132

Traffic retains its authoritative 20 Hz simulation. Display positions, headings,
steering and wheel travel interpolate between completed ticks. Crashes, external
physics changes, route wraps and recovery resets invalidate that history. The
walking camera and character similarly interpolate the 90 Hz walking controller;
mounted controllers retain their own presentation. Collision poses are unchanged.

Architectural shadows blend two half-second solar samples every rendered frame,
with an exact shared endpoint when advancing the cache. Roof/prop changes and
clock jumps rebuild both maps. Moving shadows and puddles capture every frame.
The old circular player shadow is removed. All six park benches face their paths;
the sixteen entrance/riverwalk benches also face their adjoining walkways.

Run `node city106/motion132-test.cjs --unit` for interpolation checks, or
`env NODE_PATH=../work/browser/node_modules node city106/motion132-test.cjs` for
browser checks and screenshots in `../../work/motion132/`.
