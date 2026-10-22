"""Bake bounded, texture-packed runtime assets and inspection renders."""
import bpy
import json
import math
import sys
import struct
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion

PROJECT=Path(__file__).resolve().parents[1]
WORK=PROJECT.parent/'work'/'hibachi145'
OUT=PROJECT/'hibachi145'/'assets'
OUT.mkdir(exist_ok=True)
specs=[('grill','grill',None,None),('chef','chef',None,.72),('egg','egg',None,.15),
       ('rice','rice',None,.18),('steak','steak',None,.16),('steak-raw','steak-raw',None,.16),
       ('steak-cooked','steak-cooked',['pCube1'],.16),('chicken-raw','chicken-raw',None,.15),
       ('chicken-cooked','chicken-cooked',None,.15),('shrimp','shrimp',None,.075),('plate','plate',None,.34),
       ('spatula','utensils',['004_Kitchen Tools_Ultensils_WH_Spatula'],.23),
       ('fork','utensils',['004_Kitchen Tools_Ultensils_WH_Straight Carving Fork'],.23),
       ('tongs','utensils',['004_Kitchen Tools_Ultensils_Tongs'],.21)]
selected=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
report_path=WORK/'asset-report.json'
report=json.loads(report_path.read_text()) if selected and report_path.exists() else []
for name,source,keep,size in specs:
    if selected and name not in selected:
        continue
    bpy.ops.wm.open_mainfile(filepath=str(WORK/'converted'/(source+'.blend')),load_ui=False,use_scripts=False)
    if name=='chef':
        rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
        rig.animation_data_clear()
        for p in rig.pose.bones:
            p.matrix_basis=Matrix.Identity(4)
        for side in ['Left','Right']:
            p=rig.pose.bones['mixamorig:'+side+'Arm']
            world=rig.matrix_world@p.bone.matrix_local;r=world.to_quaternion()
            direction=(rig.matrix_world.to_3x3()@(p.bone.tail_local-p.bone.head_local)).normalized()
            target=Vector((.12 if world.translation.x>0 else -.12,-.04,-1)).normalized()
            p.rotation_mode='QUATERNION';p.rotation_quaternion=r.inverted()@direction.rotation_difference(target)@r
        bpy.context.view_layer.update()
    for obj in list(bpy.context.scene.objects):
        if obj.type=='MESH' and ((keep and obj.name not in keep) or (name=='grill' and obj.name=='Cube')):
            bpy.data.objects.remove(obj,do_unlink=True)
    # Maya's aiStandardSurface link is not imported by Blender's FBX loader.
    if name=='steak-cooked':
        mat=bpy.data.materials['aiStandardSurface1'];mat.use_nodes=True
        image=bpy.data.images.load(str(WORK/'source'/'steak-cooked'/'textures'/'steak_standardSurface1_BaseColor.png'))
        image.scale(1024,1024);image.pack()
        n=mat.node_tree.nodes.new('ShaderNodeTexImage');n.image=image
        mat.node_tree.links.new(n.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    if name=='shrimp':
        mat=bpy.data.materials['Shrimp_Mesh_Baked']
        # The loose PNG is vertically flipped relative to the GLB's UVs.
        data=(WORK/'source'/'shrimp'/'source'/'Shrimp.glb').read_bytes()
        length=struct.unpack_from('<I',data,12)[0];document=json.loads(data[20:20+length])
        view=document['bufferViews'][document['images'][0]['bufferView']]
        start=28+length+view.get('byteOffset',0);image_path=WORK/'shrimp-embedded.png'
        image_path.write_bytes(data[start:start+view['byteLength']])
        image=bpy.data.images.load(str(image_path))
        image.scale(1024,1024);image.pack()
        n=mat.node_tree.nodes.new('ShaderNodeTexImage');n.image=image
        mat.node_tree.links.new(n.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    graph=bpy.context.evaluated_depsgraph_get()
    for obj in meshes:
        baked=bpy.data.meshes.new_from_object(obj.evaluated_get(graph),depsgraph=graph)
        baked.transform(obj.matrix_world)
        if name in ['steak-raw','shrimp']:
            baked.transform(Matrix.Rotation(math.pi/2,4,'Y'))
        obj.modifiers.clear();obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.data=baked
    for obj in list(bpy.context.scene.objects):
        if obj.type!='MESH':
            bpy.data.objects.remove(obj,do_unlink=True)
    verts=[v.co for o in meshes for v in o.data.vertices]
    lo=Vector([min(v[k] for v in verts) for k in range(3)]);hi=Vector([max(v[k] for v in verts) for k in range(3)])
    factor=.82 if name=='grill' else size/((hi-lo).z if name=='chef' else max((hi-lo).x,(hi-lo).y))
    center=Vector((0,0,lo.z)) if name=='grill' else Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
    for obj in meshes:
        for v in obj.data.vertices:
            v.co=(v.co-center)*factor
        if name=='chef':
            triangles=sum(len(p.vertices)-2 for p in obj.data.polygons)
            if triangles>1000:
                bpy.context.view_layer.objects.active=obj
                modifier=obj.modifiers.new('Runtime mesh budget','DECIMATE');modifier.ratio=.45
                bpy.ops.object.modifier_apply(modifier=modifier.name)
        if name=='steak-cooked':
            bpy.context.view_layer.objects.active=obj
            modifier=obj.modifiers.new('Runtime mesh budget','DECIMATE');modifier.ratio=.16
            bpy.ops.object.modifier_apply(modifier=modifier.name)
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        bsdf=mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            bsdf.inputs['Roughness'].default_value=.65
        # Only retain base-color textures; tiny food props do not need large PBR maps.
        for n in list(mat.node_tree.nodes):
            if n.type=='TEX_IMAGE' and not any(l.to_socket.name=='Base Color' for output in n.outputs for l in output.links):
                mat.node_tree.nodes.remove(n)
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False,export_apply=True)
    verts=[v.co for o in meshes for v in o.data.vertices]
    bounds=dict(lo=[min(v[k] for v in verts) for k in range(3)],hi=[max(v[k] for v in verts) for k in range(3)])
    record=dict(name=name,source=source,bytes=(OUT/(name+'.glb')).stat().st_size,triangles=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons),blenderBounds=bounds)
    report=[r for r in report if r['name']!=name]+[record];print('ASSET145',json.dumps(record),flush=True)
    if name in ['grill','chef','spatula','plate','rice','steak-cooked','steak-raw','shrimp']:
        scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12
        scene.render.resolution_x=700;scene.render.resolution_y=700;scene.render.resolution_percentage=100
        scene.world=bpy.data.worlds.new('Preview');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.28,.30,.32,1)
        high=Vector(bounds['hi']);low=Vector(bounds['lo']);target=(high+low)/2;extent=max(high-low)
        bpy.ops.object.camera_add(location=target+Vector((extent*1.4,extent*1.9,extent*1.15)))
        cam=bpy.context.object;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=extent*1.8;scene.camera=cam
        for pos in [(2,-2,4),(-2,1,3)]:
            bpy.ops.object.light_add(type='AREA',location=target+Vector(pos)*extent)
            lamp=bpy.context.object;lamp.data.energy=250*extent*extent;lamp.data.shape='DISK';lamp.data.size=extent*2
            lamp.rotation_euler=(target-lamp.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(WORK/(name+'-preview.png'));bpy.ops.render.render(write_still=True)
report_path.write_text(json.dumps(report,indent=2))
