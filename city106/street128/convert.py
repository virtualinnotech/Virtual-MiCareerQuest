"""Convert the supplied FBX assets without running embedded scripts."""
import bpy
import json
from pathlib import Path
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parent
RAW = ROOT.parents[2] / 'work' / 'street128'
for kind, filename in [('bike', 'ebike__applied.fbx'), ('stand', 'cyclestand.fbx')]:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.fbx(filepath=str(RAW / kind / 'source' / filename))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    report = []
    for o in meshes:
        o.data.transform(o.matrix_world)
        o.matrix_world = Matrix.Identity(4)
        points = [v.co for v in o.data.vertices]
        report.append(dict(name=o.name, vertices=len(points), materials=[m.name for m in o.data.materials],
                           bounds=[[f(v[k] for v in points) for k in range(3)] for f in [min, max]]))
    (RAW / (kind + '-inspection.json')).write_text(json.dumps(report, indent=2))
    lo = Vector([min(v.co[k] for o in meshes for v in o.data.vertices) for k in range(3)])
    hi = Vector([max(v.co[k] for o in meshes for v in o.data.vertices) for k in range(3)])
    factor = (1.95 if kind == 'bike' else 5.2) / (hi.y - lo.y)
    fit = Matrix.Diagonal((factor, factor, factor, 1)) @ Matrix.Translation((-(lo.x+hi.x)/2, -(lo.y+hi.y)/2, -lo.z))
    if kind == 'stand':
        from math import pi
        fit = Matrix.Rotation(pi/2, 4, 'Z') @ fit
    wheels = []
    for o in meshes:
        o.data.transform(fit)
        if kind == 'bike' and o.name in ['Cylinder', 'Cylinder.012']:
            o.name = 'ebike_wheel_rear' if o.name == 'Cylinder' else 'ebike_wheel_front'
            points = [v.co for v in o.data.vertices]
            a = Vector([min(v[k] for v in points) for k in range(3)])
            b = Vector([max(v[k] for v in points) for k in range(3)])
            c = (a+b)/2
            wheels.append(dict(name=o.name, pivot=[c.x,c.z,-c.y], radius=(b.z-a.z)/2))
        if len(o.data.polygons) > 6000:
            bpy.context.view_layer.objects.active = o
            modifier = o.modifiers.new('Game ready', 'DECIMATE')
            modifier.ratio = 6000 / len(o.data.polygons)
            bpy.ops.object.modifier_apply(modifier=modifier.name)
    for m in {m for o in meshes for m in o.data.materials if m}:
        if not m.use_nodes: continue
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        if not bsdf: continue
        bsdf.inputs['Roughness'].default_value = .32 if 'metal' in m.name or 'rahmen' in m.name else .7
        bsdf.inputs['Metallic'].default_value = .55 if 'metal' in m.name or 'rahmen' in m.name else .08
        if kind == 'stand':
            for link in list(m.node_tree.links):
                m.node_tree.links.remove(link)
            tex = m.node_tree.nodes.new('ShaderNodeTexImage')
            tex.image = bpy.data.images.load(str(RAW / 'stand' / 'textures' / 'cyclestand.png'))
            tex.image.pack()
            m.node_tree.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
            m.node_tree.links.new(bsdf.outputs['BSDF'], m.node_tree.nodes.get('Material Output').inputs['Surface'])
    for o in list(meshes):
        if kind == 'bike' and o.name.startswith('gwg_ebike'):
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=str(ROOT / (kind + '.glb')), export_format='GLB', export_animations=False)
    if kind == 'bike':
        (ROOT / 'bike-data.js').write_text('window.BikeData128=' + json.dumps(dict(wheels=wheels)) + ';\n')
    print(kind, 'converted', len(meshes), 'meshes', 'scale', factor)
