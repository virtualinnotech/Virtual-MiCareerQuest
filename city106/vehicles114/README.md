# Supplied Vehicle Fleet

Nine user-supplied models replace the procedural traffic: the 1965 Malibu, Logan taxi, Blazer, Raptor, Ford police SUV, Mercedes E-Class, Sprinter, delivery truck, and articulated Volvo bus. The remaining supplied archives are retained in the local import workspace, not shipped to the browser. Original asset licensing is unchanged.

The import step uses Blender with auto-execution disabled. `build.mjs` bakes transforms, separates the original wheels at their axle centers, removes selected interiors and redundant wheel LODs, simplifies with meshoptimizer, caps textures at 768px (512px on the bus), and creates index-only distant LODs. Body meshes, textures, and wheel geometry are shared across the 113 traffic and parked instances.

Run from the repository root:

```sh
node city106/vehicles114/build.mjs
node city106/build.mjs
NODE_PATH=../work/browser/node_modules node city106/vehicles114-test.cjs
node booth-shipping/scripts/sync-forklift.cjs
bash splice-venue.sh
```

Raw conversions live in `../work/traffic114/converted`. `import.py` regenerates them from the extracted archives in `../work/traffic114/source`; use Blender's `--background --factory-startup --disable-autoexec` options.

The browser loads the gzipped city asset, with an uncompressed fallback for browsers without `DecompressionStream`. Distant models reuse the same vertex buffers with smaller index buffers. Traffic uses right-turn connectors, front-axle Ackermann steering, distance-driven tire rotation, and separate instancing keys for paint, brake state, and detail level. The articulated bus stays on straight routes so its rigid chassis never bends incorrectly around a corner.
