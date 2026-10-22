"""Inspect/import user assets with Blender, with embedded script execution disabled."""
import bpy
import json
import sys
import re
import shutil
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3] / 'work' / 'downtown134'
names = sys.argv[sys.argv.index('--') + 1:]
for name in names:
    folder = ROOT / 'source' / name
    candidates = [p for p in folder.rglob('*') if p.suffix.lower() in ['.blend', '.fbx', '.glb', '.gltf', '.obj', '.dae']]
    source = next((p for p in candidates if p.suffix == '.glb'), max(candidates, key=lambda p:p.stat().st_size))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    ext = source.suffix.lower()
    if ext == '.blend':
        bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
    elif ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=str(source), use_anim=False)
    elif ext in ['.glb', '.gltf']:
        bpy.ops.import_scene.gltf(filepath=str(source))
    elif ext == '.dae':
        bpy.ops.wm.collada_import(filepath=str(source))
    else:
        bpy.ops.wm.obj_import(filepath=str(source))
    images = {p.name.lower():p for p in folder.rglob('*') if p.suffix.lower() in ['.png','.jpg','.jpeg']}
    normalized = {re.sub('[^a-z0-9]','',p.stem.lower()):p for p in images.values()}
    for image in bpy.data.images:
        if ext in ['.glb', '.gltf']: continue
        if image.source != 'FILE': continue
        base = Path(image.filepath.replace('\\','/')).name.lower()
        found = images.get(base) or images.get(base.replace('.jpg','.jpeg')) or normalized.get(re.sub('[^a-z0-9]','',Path(base).stem))
        if found and not image.packed_file:
            image.filepath = str(found)
            image.reload()
        if max(image.size) > 2048:
            ratio = 2048 / max(image.size)
            image.scale(max(1,round(image.size[0]*ratio)),max(1,round(image.size[1]*ratio)))
        if image.size[0] > 0:
            try: image.pack()
            except RuntimeError: print('UNRESOLVED_IMAGE',name,base,flush=True)
    records=[]
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH': continue
        obj.hide_set(False);obj.hide_viewport=False;obj.hide_render=False
        points=[obj.matrix_world @ Vector(p) for p in obj.bound_box]
        records.append(dict(name=obj.name,triangles=sum(len(p.vertices)-2 for p in obj.data.polygons),
                            lo=[min(v[k] for v in points) for k in range(3)],hi=[max(v[k] for v in points) for k in range(3)],
                            materials=[m.name if m else '' for m in obj.data.materials]))
    materials=[]
    for m in bpy.data.materials:
        textures=[{'name':n.image.name,'file':n.image.filepath,'size':list(n.image.size)} for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image] if m.use_nodes else []
        materials.append(dict(name=m.name,color=list(m.diffuse_color),textures=textures))
    out=ROOT/'converted';out.mkdir(parents=True,exist_ok=True)
    (out/(name+'.json')).write_text(json.dumps(dict(source=str(source),objects=records,materials=materials),indent=2))
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            obj.data = obj.data.copy()
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',export_animations=False,
                              export_extras=False,export_cameras=False,export_lights=False,export_apply=True)
    print('ASSET134',name,len(records),sum(r['triangles'] for r in records),flush=True)
