"""Import the supplied FBX and bind its accompanying texture maps."""
import bpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3] / 'work' / 'riverlights136'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(ROOT / 'source/source/street_lamp.fbx'), use_anim=False)
for mat in bpy.data.materials:
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Metallic'].default_value = .45
    shader.inputs['Roughness'].default_value = .42
    for suffix, socket in [('albedo', 'Base Color'), ('normal', 'Normal')]:
        tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images.load(str(ROOT / ('source/textures/street_light_' + suffix + '.png')), check_existing=True)
        if suffix == 'normal':
            tex.image.colorspace_settings.name = 'Non-Color'
            normal = mat.node_tree.nodes.new('ShaderNodeNormalMap')
            mat.node_tree.links.new(tex.outputs['Color'], normal.inputs['Color'])
            mat.node_tree.links.new(normal.outputs['Normal'], shader.inputs[socket])
        else:
            mat.node_tree.links.new(tex.outputs['Color'], shader.inputs[socket])
bpy.ops.export_scene.gltf(filepath=str(ROOT / 'lamp.glb'), export_format='GLB', export_animations=False,
                          export_cameras=False, export_lights=False, export_apply=True)
