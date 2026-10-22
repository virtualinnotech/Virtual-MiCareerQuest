# Riverfront Night Lighting

- Uses the supplied `street-lamp.zip` FBX and its albedo/normal maps. The ornamental lamps are 2.1 world units tall; their light sources are located at the imported glass lenses.
- Lamps follow the near and far riverwalk edges, avoiding the bridge mouths and existing furniture contacts. Pole contacts stay outside the through-walking band.
- Blue Bridge has rail-mounted uplights, downlights at its five structural stations, and concealed handrail lighting. All fixture heights follow the bridge camber.
- Seventeen warm-white exterior washes cover the rear exhibit-hall and Grand Gallery walls. They follow the existing accelerated night cycle, with no extra shadow maps.
- The mounted bike, scooter, and Segway have a visible headlamp and a forward ground-light beam. Their shared rendered pose drives the light, and one of the eight moving-light slots is reserved for the active ride.
- The second police SUV's supplied loose texture atlas is vertically inverted relative to its source glTF. Its UVs now match the maps; source side panels classified as decals are retained, recolored, and labelled Grand Rapids POLICE. Tire rubber is nonmetallic and rough.
- The supplied skyscraper window assemblies are offset 0.024 world units outward from the wall to remove depth fighting at walking distances.

## Rebuild

Run `convert.py` with Blender after extracting the supplied lamp archive into `work/riverlights136/source`. Then run `model.mjs`, `../downtown134/build-models.mjs`, `../skyline135/build-models.mjs`, and `../build.mjs` from the project root using their full relative paths.

## Verify

- `node city106/riverlights136/models-test.mjs`
- `NODE_PATH=../work/browser/node_modules node city106/riverlights136/test.cjs`

The browser test checks actual lit-pixel changes, night/day desktop and mobile views, mounted bike/scooter beams, smooth headlight transforms, and live WebGL status. Images and metrics are written to `work/riverlights136`.

Night preview: `http://127.0.0.1:8014/venue-frame.html?v=20261016-riverlights136&time=night`.
