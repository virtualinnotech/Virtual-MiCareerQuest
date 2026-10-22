"""Convert the supplied vehicle sources with Blender; never execute blend scripts."""
import bpy
import json
import pathlib
import sys
from mathutils import Vector

root = pathlib.Path(__file__).resolve().parents[3] / 'work' / 'traffic114'
name = sys.argv[sys.argv.index('--') + 1]
folder = root / 'source' / name
sources = [p for p in folder.rglob('*') if p.suffix.lower() in ('.blend', '.fbx', '.obj', '.glb', '.dae') and 'animations' not in p.parts]
source = max(sources, key=lambda p: p.stat().st_size)
bpy.ops.wm.read_factory_settings(use_empty=True)
ext = source.suffix.lower()
if ext == '.blend':
    bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
elif ext == '.fbx':
    bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
elif ext == '.obj':
    bpy.ops.wm.obj_import(filepath=str(source))
elif ext == '.glb':
    bpy.ops.import_scene.gltf(filepath=str(source))
else:
    bpy.ops.wm.collada_import(filepath=str(source))

# Relink texture paths from the archive, without retaining multi-megapixel images.
images = {p.name.lower(): p for p in folder.rglob('*') if p.suffix.lower() in ('.png', '.jpg', '.jpeg')}
for image in bpy.data.images:
    if image.source != 'FILE':
        continue
    base = pathlib.Path(image.filepath.replace('\\', '/')).name.lower()
    path = images.get(base) or images.get(base.replace('.jpg', '.jpeg'))
    if path and not image.packed_file:
        image.filepath = str(path)
        image.reload()
    if max(image.size) > 1024:
        ratio = 1024 / max(image.size)
        image.scale(max(1, round(image.size[0] * ratio)), max(1, round(image.size[1] * ratio)))
        image.pack()

objects = []
for obj in list(bpy.data.objects):
    if obj.type != 'MESH':
        continue
    obj.hide_set(False)
    obj.hide_viewport = False
    obj.hide_render = False
    points = [obj.matrix_world @ Vector(p) for p in obj.bound_box]
    objects.append({'name': obj.name, 'triangles': sum(len(p.vertices)-2 for p in obj.data.polygons),
                    'lo': [min(v[i] for v in points) for i in range(3)],
                    'hi': [max(v[i] for v in points) for i in range(3)],
                    'materials': [m.name if m else '' for m in obj.data.materials]})
out = root / 'converted'
out.mkdir(exist_ok=True)
(out / (name + '.json')).write_text(json.dumps({'source': str(source), 'objects': objects}, indent=2))
bpy.ops.export_scene.gltf(filepath=str(out / (name + '.glb')), export_format='GLB',
                          export_animations=False, export_extras=False, export_cameras=False,
                          export_lights=False, export_apply=True, export_image_format='AUTO')
print('CONVERTED', name, len(objects), sum(o['triangles'] for o in objects))
