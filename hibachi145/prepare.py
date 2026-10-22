"""Import supplied cooking assets without running embedded scripts."""
import bpy
import json
import re
import sys
import zipfile
import subprocess
from pathlib import Path
from mathutils import Vector

PROJECT = Path(__file__).resolve().parents[1]
WORK = PROJECT.parent / 'work' / 'hibachi145'
DESKTOP = Path('/Users/mapettiforsd/Desktop')
FILES = {'grill':'Hibachi Grill.zip', 'chef':'Chef.fbx', 'egg':'fried-egg-pbr-game-asset.zip',
         'rice':'rice.zip', 'steak':'steak.zip', 'steak-cooked':'steak (1).zip', 'steak-raw':'raw-steak.zip',
         'shrimp':'cooked-shrimp-low-poly.zip', 'chicken-raw':'chicken-breast.zip',
         'chicken-cooked':'cc0-cooked-chicken-breast-2.zip', 'plate':'plate.zip', 'utensils':'004-kitchen-tools-utensils.zip'}
names = sys.argv[sys.argv.index('--')+1:] or list(FILES)
for name in names:
    folder = WORK / 'source' / name
    folder.mkdir(parents=True, exist_ok=True)
    src = DESKTOP / FILES[name]
    if src.suffix == '.zip':
        pending = [src]
        seen = set()
        while pending:
            archive = pending.pop()
            if archive in seen:
                continue
            seen.add(archive)
            with zipfile.ZipFile(archive) as z:
                for member in z.infolist():
                    target = (folder / member.filename).resolve()
                    if not target.is_relative_to(folder.resolve()):
                        raise ValueError('Archive path outside asset folder')
                z.extractall(folder)
            pending.extend(p for p in folder.rglob('*.zip') if p not in seen)
        for rar in folder.rglob('*.rar'):
            subprocess.run(['/usr/bin/tar','-xf',str(rar),'-C',str(folder)], check=True)
        candidates = [p for p in folder.rglob('*') if p.suffix.lower() in ['.fbx','.glb','.gltf','.obj','.blend']]
        source = next((p for p in candidates if p.suffix.lower()=='.glb'), max(candidates,key=lambda p:p.stat().st_size))
    else:
        source = src
    bpy.ops.wm.read_factory_settings(use_empty=True)
    ext = source.suffix.lower()
    if ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=str(source), use_anim=True)
    elif ext in ['.glb','.gltf']:
        bpy.ops.import_scene.gltf(filepath=str(source))
    elif ext == '.blend':
        bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
    else:
        bpy.ops.wm.obj_import(filepath=str(source))
    images = {p.name.lower():p for p in folder.rglob('*') if p.suffix.lower() in ['.png','.jpg','.jpeg']}
    for im in bpy.data.images:
        base=Path(im.filepath.replace('\\','/')).name.lower()
        found=images.get(base) or images.get(base.replace('.jpg','.jpeg')) or images.get(base.replace('.psd','.png'))
        if found and not im.packed_file:
            im.filepath=str(found)
            im.reload()
        if max(im.size)>1024:
            ratio=1024/max(im.size)
            im.scale(max(1,round(im.size[0]*ratio)),max(1,round(im.size[1]*ratio)))
        if im.size[0]>0:
            im.pack()
    records=[]
    for obj in bpy.context.scene.objects:
        if obj.type!='MESH':
            continue
        obj.hide_set(False);obj.hide_render=False;obj.hide_viewport=False
        points=[obj.matrix_world @ Vector(p) for p in obj.bound_box]
        records.append(dict(name=obj.name,triangles=sum(len(p.vertices)-2 for p in obj.data.polygons),
            lo=[min(v[k] for v in points) for k in range(3)],hi=[max(v[k] for v in points) for k in range(3)],
            materials=[m.name if m else '' for m in obj.data.materials]))
    report=dict(source=str(source),objects=records,actions=[a.name for a in bpy.data.actions],
        bones={o.name:[b.name for b in o.data.bones] for o in bpy.context.scene.objects if o.type=='ARMATURE'},
        materials=[dict(name=m.name,color=list(m.diffuse_color),textures=[dict(name=n.image.name,file=n.image.filepath,size=list(n.image.size)) for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image]) for m in bpy.data.materials if m.use_nodes])
    target=WORK/'converted';target.mkdir(exist_ok=True)
    (target/(name+'.json')).write_text(json.dumps(report,indent=2))
    bpy.ops.wm.save_as_mainfile(filepath=str(target/(name+'.blend')))
    print('INSPECT145',name,len(records),sum(r['triangles'] for r in records),flush=True)
