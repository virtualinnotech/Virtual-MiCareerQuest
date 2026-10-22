"""Convert the supplied FBX without executing imported scripts."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT.parent / 'work' / 'hotel152'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(WORK / 'source/source/RevolvingDoor.fbx'), use_anim=False)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and o.name.endswith('LOD0')]
points = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
low = Vector([min(p[k] for p in points) for k in range(3)])
high = Vector([max(p[k] for p in points) for k in range(3)])
center = Vector([(low.x + high.x) / 2, (low.y + high.y) / 2, low.z])
factor = 1.02 / (high.z - low.z)
albedo = bpy.data.images.load(str(WORK / 'source/textures/Revolving_Door_LOD0_LOD0_AlbedoTransparenc.png'))
pixels = list(albedo.pixels)
width, height = albedo.size

def material(name, color, metal, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = color
    shader.inputs['Metallic'].default_value = metal
    shader.inputs['Roughness'].default_value = rough
    shader.inputs['Alpha'].default_value = color[3]
    m.diffuse_color = color
    if color[3] < 1:
        m.surface_render_method = 'DITHERED'
    return m

gold = material('Brushed gold frame', (.68, .43, .12, 1), .76, .27)
glass = material('Clear entrance glass', (.66, .83, .86, .13), .08, .12)
base = material('Charcoal entrance mat', (.055, .06, .06, 1), 0, .92)
report = {'source': 'revolving-door.zip', 'height': 1.02, 'scale': factor, 'parts': []}
for obj in list(bpy.context.scene.objects):
    if obj not in meshes:
        bpy.data.objects.remove(obj, do_unlink=True)
for obj in meshes:
    mesh = obj.data
    world = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world.identity()
    for v in mesh.vertices:
        v.co = (world @ v.co - center) * factor
    mesh.materials.clear()
    for m in [gold, glass, base]:
        mesh.materials.append(m)
    clear = 0
    for polygon in mesh.polygons:
        # The source atlas marks glass with lower alpha; preserve those faces
        # as a separate transparent material instead of tinting the whole door.
        uvs = [mesh.uv_layers.active.data[i].uv for i in polygon.loop_indices]
        uv = sum(uvs, Vector((0, 0))) / len(uvs)
        x = max(0, min(width - 1, int(uv.x * width)))
        y = max(0, min(height - 1, int(uv.y * height)))
        transparent = pixels[(y * width + x) * 4 + 3] < .8
        polygon.material_index = 2 if 'Base_' in obj.name else 1 if transparent else 0
        clear += transparent
    obj.name = 'door-rotor' if 'MainDoor' in obj.name else 'door-mat' if 'Base_' in obj.name else 'door-frame'
    report['parts'].append({'name': obj.name, 'polygons': len(mesh.polygons), 'glassPolygons': clear})
    mesh.update()
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT / 'hotel146/assets/revolving-door.glb'), export_format='GLB', use_selection=True, export_animations=False, export_yup=True)
(WORK / 'conversion.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report))
