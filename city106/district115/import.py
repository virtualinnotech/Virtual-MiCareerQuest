"""Import supplied landscape assets without executing embedded scripts."""
import bpy
import json
import pathlib
import sys
from mathutils import Vector

root = pathlib.Path(__file__).resolve().parents[3] / 'work' / 'city115'
name = sys.argv[sys.argv.index('--') + 1]
folder = root / 'source' / name
sources = list(folder.rglob('*.fbx')) + list(folder.rglob('*.obj'))
source = next((p for p in sources if 'LOD3.fbx' in p.name), max(sources, key=lambda p: p.stat().st_size))
bpy.ops.wm.read_factory_settings(use_empty=True)
if source.suffix == '.fbx':
    bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
else:
    bpy.ops.wm.obj_import(filepath=str(source))
images = {p.name.lower(): p for p in folder.rglob('*') if p.suffix.lower() in ('.png', '.jpg', '.jpeg')}
for image in bpy.data.images:
    if image.source != 'FILE':
        continue
    base = pathlib.Path(image.filepath.replace('\\', '/')).name.lower()
    path = images.get(base) or images.get(base.replace('.jpg', '.jpeg'))
    if path:
        image.filepath = str(path)
        image.reload()
    if max(image.size) > 512:
        ratio = 512 / max(image.size)
        image.scale(max(1, round(image.size[0]*ratio)), max(1, round(image.size[1]*ratio)))
        image.pack()
records = []
for obj in bpy.data.objects:
    if obj.type != 'MESH':
        continue
    points = [obj.matrix_world @ Vector(p) for p in obj.bound_box]
    records.append({'name': obj.name, 'triangles': sum(len(p.vertices)-2 for p in obj.data.polygons),
                    'lo': [min(v[i] for v in points) for i in range(3)],
                    'hi': [max(v[i] for v in points) for i in range(3)],
                    'materials': [m.name if m else '' for m in obj.data.materials]})
out = root / 'converted'
out.mkdir(exist_ok=True)
(out / (name+'.json')).write_text(json.dumps(records, indent=2))
bpy.ops.export_scene.gltf(filepath=str(out / (name+'.glb')), export_format='GLB', export_apply=True,
                          export_animations=False, export_cameras=False, export_lights=False)
print('CONVERTED', name, sum(r['triangles'] for r in records))
