"""Inspect and prepare rideable meshes; the supplied archives remain untouched."""
import bpy, bmesh, json, zipfile, io
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parent
RAW = ROOT.parent.parent / 'work' / 'rides103-raw'
RAW.mkdir(parents=True, exist_ok=True)
def extract(archive, target):
    for entry in archive.infolist():
        p = Path(entry.filename)
        if p.is_absolute() or '..' in p.parts:
            raise ValueError('Unsafe archive path')
        if not entry.is_dir():
            out = target / p
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(archive.read(entry))
with zipfile.ZipFile('/Users/mapettiforsd/Desktop/off-road-segway.zip') as archive:
    extract(archive, RAW)
    with zipfile.ZipFile(io.BytesIO(archive.read('source/Off_Road Segway.zip'))) as nested:
        extract(nested, RAW / 'source')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(RAW / 'source' / 'Off_Road Segway.fbx'))
report = []
for o in bpy.context.scene.objects:
    if o.type != 'MESH': continue
    points = [o.matrix_world @ v.co for v in o.data.vertices]
    report.append(dict(name=o.name, vertices=len(points), materials=[m.name for m in o.data.materials],
        bounds=[[min(v[k] for v in points) for k in range(3)], [max(v[k] for v in points) for k in range(3)]]))
(RAW / 'inspection.json').write_text(json.dumps(report, indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(RAW / 'segway.blend'))
print('SEGWAY', json.dumps(report))

def bounds(o):
    points = [o.matrix_world @ v.co for v in o.data.vertices]
    return [Vector([f(v[k] for v in points) for k in range(3)]) for f in [min, max]]

def wheel(o, name):
    lo, hi = bounds(o)
    center = (lo + hi) / 2
    o.name = name
    return dict(name=name, pivot=[center.x, center.z, -center.y], radius=(hi.z-lo.z)/2)

data = {'segway': {'wheels': []}, 'scooter': {'wheels': []}}
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in meshes:
    o.data.transform(o.matrix_world)
    o.matrix_world = Matrix.Identity(4)
fit = Matrix.Diagonal((.99, .99, .99, 1)) @ Matrix.Translation((0, .04029, -.0019316))
for o in meshes:
    o.data.transform(fit)
    if 'Tyre' in o.name:
        data['segway']['wheels'].append(wheel(o, 'wheel_left' if ' L.' in o.name else 'wheel_right'))
    else:
        o.name = 'segway_body'
material = bpy.data.materials.new('Segway graphite and teal')
material.use_nodes = True
nodes = material.node_tree.nodes
bsdf = nodes.get('Principled BSDF')
bsdf.inputs['Metallic'].default_value = .3
bsdf.inputs['Roughness'].default_value = .48
for filename, socket, normal in [('Segway Albedo.png', 'Base Color', False), ('Segway_Normal.png', 'Normal', True)]:
    tex = nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(str(RAW / 'textures' / filename))
    tex.image.pack()
    output = tex.outputs['Color']
    if normal:
        tex.image.colorspace_settings.name = 'Non-Color'
        n = nodes.new('ShaderNodeNormalMap')
        material.node_tree.links.new(output, n.inputs['Color'])
        output = n.outputs['Normal']
    material.node_tree.links.new(output, bsdf.inputs[socket])
for o in meshes:
    o.data.materials.clear()
    o.data.materials.append(material)
bpy.ops.export_scene.gltf(filepath=str(ROOT / 'segway103.glb'), export_format='GLB', export_animations=False)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'scooter.glb'))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in meshes:
    o.data.transform(o.matrix_world)
    o.matrix_world = Matrix.Identity(4)
tires = next(o for o in meshes if 'front_tire_surface' in o.name)
for front in [True, False]:
    mesh = tires.data.copy()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if (v.co.y < 0) != front], context='VERTS')
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new('tire', mesh)
    bpy.context.collection.objects.link(o)
    data['scooter']['wheels'].append(wheel(o, 'wheel_front_tire' if front else 'wheel_rear_tire'))
bpy.data.objects.remove(tires, do_unlink=True)
for old, name, tire in [('Circle.008', 'wheel_front_hub', 0), ('Circle.012', 'wheel_rear_hub', 1)]:
    o = bpy.data.objects.get(old)
    if o:
        o.name = name
        data['scooter']['wheels'].append(dict(data['scooter']['wheels'][tire], name=name))
bpy.ops.export_scene.gltf(filepath=str(ROOT / 'scooter103.glb'), export_format='GLB', export_animations=False)
(ROOT / 'rides103-data.js').write_text('window.RideData103=' + json.dumps(data) + ';\n')
print('RIDE WHEELS', json.dumps(data))
