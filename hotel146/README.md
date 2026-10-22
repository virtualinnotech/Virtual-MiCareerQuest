# Hotel guest check-in

The supplied `3d-model.3ds.zip` replaces `City_Front_103_Building-Medium-01`
across from the red sculpture. The hotel's central world origin is
`(-26.7315, -0.099, 51.7019)`, level with the sidewalk. The ground-floor envelope is remodeled to contain
the vaulted lobby; the original model's upper stories and repeated window detail
are retained. Assimp is required to resolve its 1,507 instance nodes correctly.
The 3DS archive contains no bitmap textures. Version 149 applies the neighboring
city's photographic brick and stone finishes with world-scale UVs. The supplied
Victorian windows have wood textures and transparent glass; real openings are cut
through both the 3DS facade and the lobby shell. Upper-story windows remain opaque.
The street tree intersecting the entrance is retired without removing other trees.

Version 151 fits the supplied upper stories within the original sidewalk setback
and removes the source model's entire projecting ground-floor frontage. The lobby
has 33 supplied, transparent Victorian windows in closely spaced front/side bays
on both levels. The revolving entrance is recessed inside the facade, with a flush
sign and no canopy or vestibule across the pedestrian route. Sidewalk paving is
retained outside the lot; street navigation also recognizes the hotel footprint.
`asset-test.mjs`, `facade151-test.cjs`, and `facade151-browser-test.cjs` check the
openings, envelope, pedestrian clearance, street views, and mobile framebuffer.

Version 152 replaces the procedural revolving leaves with `revolving-door.zip`.
`prepare-door152.py` imports only the supplied LOD0 frame, mat, and rotor in
Blender with scripts disabled. Source-atlas alpha separates clear glass from
the brushed-gold metal. The complete door is 1.02 units high and 1.003 units wide,
about 22% smaller in each dimension; the opening and sign are resized to match.
The fixed drum has collision geometry, the source rotor turns independently on
approach, and the entire assembly remains behind the facade. Verify using
`door152-test.mjs`, `door152-browser-test.cjs`, and the existing hotel browser test.

`wooden-stairs-8-mb.zip` supplies both curved stair flights and the shared landing.
The landing is aligned at Y=2.1 and both flights have triangle collision geometry.
The supplied opulent and Victorian rooms provide carved ceiling/cornice, fireplace,
wall-panel and window modules; only the selected optimized modules ship.
The large preparation GLBs remain outside the public assets folder under `../work`.

The hospitality reception kiosk starts an eight-step, first-person check-in.
It stands against the solid IT-side wall at `(-19.25, 3.027, -14.15)` and has no
computer. Both counters are enlarged. The lobby desk is rotated 180 degrees,
with its white/gold logo on the guest-facing front and its computer on the staff side.
The guest has a backpack, dog and luggage. Correct service choices earn up to
100 points and a $20 virtual tip. Identity, reservation, room and charge checks
must be completed before issuing a key. All guest information, rates and policies
are fictional training data, not claims about the actual hotel's current policies.

Build tools: `prepare.py` (Blender, scripts disabled), `prepare-supplied.mjs`,
`finish-supplied.mjs`, `prepare-building.mjs`, `finish-furniture149.mjs`, and `build.mjs`.
Run `core-test.cjs` and `browser-test.cjs`. The latter checks the street doorway,
both stair flights, the hospitality kiosk, scoring, persistence, and laptop framing.

## Revision 154
Signs and desk fronts now say Grand Plaza Hotel, centered between two gold leaves
on each side. The old circular seat, fountain, flowers, and its collision volume
are removed. Supplied Victorian sofas face inward around the front-right waiting
area, with upholstered chairs, an antique table and warm table lamps. The rear
fireplace reading area and the clear central aisle remain.

`prepare-people154.mjs` prepares the supplied gray-trench-coat doorman and burgundy
hotel staff. The doorman's recovered coat weights are repaired before matching
the existing student NPC's neutral Idle arm directions. The already relaxed staff
scan receives a small continuous torso/head idle rig. Textures are retained;
runtime geometry is 4,430 and 19,999 triangles respectively. The doorman stands
beside the revolving entrance, and reception staff stand behind the counter.

During check-in, dragging the scene or using arrow keys looks around from a fixed
position. Guest/computer buttons reset the view direction. X, Escape and Done
close the challenge without teleporting the student; walking resumes behind the
desk. Indoor people pause and hide while either road vehicle is driven, then
restore automatically. Run `lobby154-test.mjs` and the expanded browser test.

## Upholstery Asset
`assets/velvet-tufted149.png` was created with the built-in image generation tool.
Prompt: "Seamless square tiling blue-gray velvet upholstery for a realistic hotel
lobby sofa, regular diamond button tufting, tiny covered buttons, fine woven fibers,
subtle wear and delicate folds. Orthographic material scan, neutral diffuse light,
no furniture silhouette, background, text or border. Muted steel blue, not cyan."
`finish-furniture149.mjs` applies cylindrical back and planar seat UVs to the supplied circular couch.
This archived centerpiece asset is no longer loaded or displayed by the lobby.
