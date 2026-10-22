# Gallery and Riverwalk 133

- Restroom leaves are .84 world units tall alongside the .72-unit student.
- The supplied FBX fountain and OBJ extinguisher retain their source textures,
  normalized to .524 and .235 units respectively. The fountain mounts .14 units
  above the gallery floor. All three wall extinguishers use the supplied model.
- Six brass-framed ticket windows sit beneath a recessed, tiled soffit on the
  west entry wall (z=22.95 to 28.05). The counter, returns and queue have contacts;
  the main aisle and both IT entrances remain traversable.
- Six real local downlights remain on through the solar cycle. Exterior lights
  retain their existing night-only schedule and breakaway behavior.
- School buses retain fine source geometry. Duplicate rear letters are removed,
  and the original complete front/rear word meshes move outside the body skin.
  Rubber, glass, metal and restrained enamel use separate material responses.
- A continuous paved east riverwalk corner covers the exposed foundation and
  joins the promenade to the east sidewalk, with a shallow grade at its south
  end. Four recoverable railing bays connect to the bridge-side railing.
- `?time=night` starts the preview at midnight and continues the existing
  30-minute day / 10-minute night cycle.

## Build

Convert the supplied archives with `assets130/convert.py` using Blender with
`--disable-autoexec`. The extracted inputs live under `work/assets130/source`.

```sh
node city106/gallery133/build-models.mjs
node city106/assets130/build-library.mjs
node city106/build.mjs
NODE_PATH=../work/browser/node_modules node city106/gallery133/test.cjs
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

The test saves desktop/mobile screenshots and verification results under
`work/gallery133`, including day/night lighting pixel comparisons, sidewalk
height samples, fence/counter contacts, and walking routes.
