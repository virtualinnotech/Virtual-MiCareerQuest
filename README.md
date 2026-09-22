# MiCareerQuest - Ship to Venue v11

Playable social crowd, individually colored clothing, rigged accessories and 50 purple-shirt volunteers. This is a local planning/game test, not a public employer submission service.

## Test the game

Open MiCareerQuest-Ship-to-Venue-v11.html in Chrome. Keep internet access on for the public Draco character decoder. The venue, booth editor, 13 edited character assets and graphics are embedded in the HTML; only the decoder script is requested online.

Choose **Start 1,000 people**. The population contains 950 attendees plus exactly 50 volunteers: 45 stationed and 5 roaming. Brad is the player, separate from that count. Representatives created for shipped employer booths are also separate. The old additional guide actors are no longer spawned, avoiding duplicate volunteer counts.

Add 5 sample booths, load 140 demo booths, or open an existing venue session. The crowd recalculates safe walking areas around the placed booths. Sample companies are not actual employer submissions.

In **Social crowd / v11**:
- **Visit a group** moves the player near a conversation after a group has formed.
- **Find volunteer** moves the player near a purple-shirt helper. Press **E** or click the prompt for the local event navigation panel.
- **New outfits** assigns a new consistent wardrobe without moving the people or changing their roles.
- **Save NPC roster** exports each NPC's identity, source model, assigned shirt/pants/shoe colors, accessories and station.
- **50 helpers only** previews the 45 stationed and 5 patrolling volunteers without the larger attendee crowd.
- **Pause crowd**, **Walking pace** and **Crowd detail** remain available. Lighter graphics reduces distant detail.

Use **Save venue session** before closing. A saved session includes the wardrobe seed, population, walking settings and all employer booths. Reopening keeps clothing assignments deterministic. People begin a new simulation from the saved route seed; exact mid-conversation poses are not saved.

## Behavior

Attendees combine walking with 12-46-second destination stops and additional browsing breaks. People naturally near each other can form groups of 2-4. They approach a clear meeting spot, face its center, use small head/body/forearm movements, stay for 35-100 seconds and then resume exploration. Up to 26 groups can coexist in the full crowd. Groups and stops avoid gateway approach reservations. This is visual conversational behavior, without generated speech, audio or online chat.

45 volunteer stations are distributed across the four industry sectors, IT room, Grand Gallery and main aisles. Gate-adjacent stations sit beside the circulation space rather than inside door openings. Volunteers retain their stations during normal walking, but positions are recalculated when the booth layout changes. Only the other five volunteer IDs patrol. Purple helpers do not wave; automatic greetings are restricted to employer-booth representatives.

No game crowd can certify real-world occupant capacity or crowd safety. The soft avoidance system may still allow brief overlap at a busy bottleneck and does not make people solid walls that can trap the player.

## Clothing and edited character GLBs

The characters directory contains edited copies of all 13 supplied GLBs. Original body vertex streams, skins and original animation samples are retained. Shared clothing materials were duplicated so clothing recoloring does not recolor skin, hair or eyes. Clothing has neutral fabric maps plus semantic material roles for shirt/jacket, pants and shoes. James has a combined-mesh atlas, so an atlas-region mask separates clothing from non-clothing pixels; that mask needs a normal visual check on the original decoded body.

All 950 attendees have distinct shirt RGB values for a given seed. All 1,000 people have distinct full outfit combinations, including the volunteers who intentionally share the reserved purple shirt. Regular shirts exclude the purple/violet hue range. Booth representatives and Brad receive non-purple wardrobes too. Pants, shoes and smaller accents vary independently. Clothing remains stable between frames.

Optional backpack bodies, pockets, straps, buckles, zippers, rounded cap crowns, visors, seams and chest-logo patches are actual additional meshes in the GLBs. The backpack and logo are bound to the original torso joint; hats are bound to the head joint. Pete retains his original construction helmet and does not receive a second cap. Roughly one quarter of attendees get a backpack and one tenth get a cap; the exact count depends on the seed.

The separate characters-volunteers directory contains 13 directly viewable purple-shirt/logo versions. The standard viewer defaults vary by template. In the game the same geometry is reused and each person receives independent outfit colors and accessory flags. This avoids storing 1,000 redundant copies of the same animated meshes. These are 26 edited template files, not 1,000 individual exported GLBs.

Volunteer shirts use #7038aa. The original supplied MiCareerQuest logo is on the front chest patch. Purple shirts and this logo patch are shown only on the fifty designated volunteers in the crowd.

## Source structure

- `venue/source/crowd-navigation.js`: navigation grid, flow fields, obstacle-aware motion.
- `venue/source/crowd-social.js`: stationary help points, breaks, group formation/release.
- `venue/source/crowd-wardrobe.js`: deterministic unique per-person clothing/accessory assignments.
- `venue/source/crowd-renderer.js`: GPU-instanced, distance-detailed geometry and shared animation atlases, including subtle conversation poses.
- `venue/source/characters.js`: GLB decoding, original player animation and local helper interactions.
- `venue/source/render.js`: garment-specific instance colors and accessory visibility.
- `venue/source/crowd.js`: controls, simulation integration, volunteers, booth reps and session settings.
- `build_characters_v11.py`: rebuild edited character/volunteer GLBs from `characters-original/`.
- `build_workspace.py`: rebuild the self-contained HTML from source and assets.

Rebuild:

```
python -m pip install -r requirements-build.txt
python build_characters_v11.py
python build_workspace.py
```

Do not run the character-edit script on already edited files outside this project. The provided script reads the dedicated original backups. The older venue rebuild scripts are retained for provenance but are not needed for this update.

## Validation and limitation

- 136 production-asset integrity checks pass. Original compressed geometry bytes, original skin/animation data, valid accessory weights, serialized volunteer visibility, embedded payloads and unchanged venue/booth editor were checked.
- 37 navigation/wardrobe checks pass, including a 1,000-person simulation with 140 conservative occupied booth footprints, group cycling, safe station allocation and 50 exclusive uniforms.
- 43 browser integration checks pass, including clothing-instance GPU attributes, original rigs/clips, actual new accessory meshes, group behavior, E at volunteers, five actual sample booth GLBs, staff-only waves, saving and restoring sessions.

The test environment cannot download the Draco decoder for the original compressed body meshes. Browser tests therefore use explicitly labeled test-only proxy bodies with the user's original rigs/animations and the actual new accessory geometry. Those proxies are NEVER embedded in the delivered game or edited character GLBs. The final body appearance, fit of accessories across all source characters and full 140-booth/1,000-character hardware performance still need an internet-connected Chrome check. This is not a completed visual verification of all original character bodies.

If character loading fails, use Retry characters. The local venue remains usable. Existing floors, steps, curtains, eleven sector entrances, signs, bus scale, player height, industry layout and booth editor are unchanged from v10.
