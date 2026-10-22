"""Import the supplied architecture without executing embedded scripts."""
import bpy
import json
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3] / 'work' / 'skyline135'
for name in sys.argv[sys.argv.index('--') + 1:]:
    folder = ROOT / 'source' / name
    source = next(p for p in folder.rglob('*') if p.suffix.lower() in ['.fbx', '.obj'])
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if source.suffix.lower() == '.fbx':
        bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
    else:
        bpy.ops.wm.obj_import(filepath=str(source))
    images = {p.name.lower(): p for p in folder.rglob('*') if p.suffix.lower() in ['.png', '.jpg', '.jpeg']}
    for image in bpy.data.images:
        if image.source != 'FILE':
            continue
        found = images.get(Path(image.filepath.replace('\\', '/')).name.lower())
        if found:
            image.filepath = str(found)
            image.reload()
            image.pack()
    if name == 'beveled':
        # FBX carries an obsolete absolute image path; bind the supplied PBR maps.
        for mat in bpy.data.materials:
            mat.use_nodes = True
            shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
            for suffix, socket in [('basecolor.jpg', 'Base Color'), ('roughness.jpg', 'Roughness'), ('metallic.jpg', 'Metallic')]:
                file = next(p for p in images.values() if p.name.endswith(suffix))
                tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
                tex.image = bpy.data.images.load(str(file), check_existing=True)
                if socket != 'Base Color':
                    tex.image.colorspace_settings.name = 'Non-Color'
                mat.node_tree.links.new(tex.outputs['Color'], shader.inputs[socket])
    records = []
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        points = [obj.matrix_world @ Vector(p) for p in obj.bound_box]
        records.append(dict(name=obj.name, triangles=sum(len(p.vertices)-2 for p in obj.data.polygons),
                            lo=[min(v[k] for v in points) for k in range(3)], hi=[max(v[k] for v in points) for k in range(3)],
                            materials=[m.name if m else '' for m in obj.data.materials]))
        obj.data = obj.data.copy()
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    out = ROOT / 'converted'
    (out / (name + '.json')).write_text(json.dumps(records, indent=2))
    bpy.ops.export_scene.gltf(filepath=str(out / (name + '.glb')), export_format='GLB', export_animations=False,
                              export_extras=False, export_cameras=False, export_lights=False, export_apply=True)
    print('SKYLINE135', name, len(records), sum(r['triangles'] for r in records), flush=True)
