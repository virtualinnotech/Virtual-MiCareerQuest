import bpy
import pathlib
import sys

source, destination = map(pathlib.Path, sys.argv[sys.argv.index('--') + 1:])
bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
root = source.parent.parent
files = {p.name.lower(): p for p in root.rglob('*') if p.is_file()}
for image in bpy.data.images:
    if image.packed_file:
        continue
    name = pathlib.PureWindowsPath(image.filepath).name.lower()
    match = files.get(name)
    if match:
        image.filepath = str(match)
        image.reload()
destination.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(destination), export_format='GLB', export_animations=False, export_cameras=False, export_lights=False)
