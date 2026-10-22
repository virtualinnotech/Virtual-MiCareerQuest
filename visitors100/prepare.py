"""Prepare supplied assets with Blender; originals remain untouched."""
import bpy, json, math, zipfile
from pathlib import Path
from mathutils import Vector, Matrix

ROOT=Path(__file__).resolve().parent
RAW=ROOT.parent.parent/'work'/'visitors100-raw'
RAW.mkdir(parents=True,exist_ok=True)
ASSETS=['student-2','student-green-talking-standing','casual-contemplation-boy','joyful-stride','joyful-stride (1)','smiling-student-with-backpack','teenage-student-with-backpack','tier-scooter']
report={}
for index,name in enumerate(ASSETS):
    ident=['student2','green','casual','stride-a','stride-b','smiling','teenage','scooter'][index]
    target=RAW/ident;target.mkdir(exist_ok=True)
    with zipfile.ZipFile(Path('/Users/mapettiforsd/Desktop')/(name+'.zip')) as archive:
        for entry in archive.infolist():
            p=Path(entry.filename)
            if p.is_absolute() or '..' in p.parts:raise ValueError('Unsafe archive path')
            if not entry.is_dir():
                out=target/p;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(archive.read(entry))
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    source=next((target/'source').iterdir())
    if source.suffix.lower()=='.fbx':bpy.ops.import_scene.fbx(filepath=str(source))
    else:bpy.ops.import_scene.gltf(filepath=str(source))
    bpy.context.scene.frame_set(1)
    rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials]
    report[ident]={'source':name+'.zip','rigged':bool(rigs),'actions':[a.name for a in bpy.data.actions], 'sourceTriangles':sum(len(o.data.polygons) for o in meshes)}
    # Export evaluated meshes so sculpted and animated-source poses share one inexpensive renderer.
    deps=bpy.context.evaluated_depsgraph_get();copies=[]
    for o in meshes:
        evaluated=o.evaluated_get(deps);mesh=bpy.data.meshes.new_from_object(evaluated,depsgraph=deps)
        n=bpy.data.objects.new(o.name,mesh);bpy.context.collection.objects.link(n);mesh.transform(o.matrix_world);copies.append(n)
    for o in list(bpy.context.scene.objects):
        if o not in copies:bpy.data.objects.remove(o,do_unlink=True)
    if ident=='scooter':
        # Supplied scooter faces +X; venue assets face +Z (Blender -Y).
        for o in copies:o.data.transform(Matrix.Rotation(-math.pi/2,4,'Z'))
    points=[o.matrix_world@v.co for o in copies for v in o.data.vertices]
    lo=Vector(tuple(min(v[k] for v in points) for k in range(3)));hi=Vector(tuple(max(v[k] for v in points) for k in range(3)))
    height=1.22 if ident=='scooter' else 1.78
    scale=height/(hi.z-lo.z);center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
    fit=Matrix.Diagonal((scale,scale,scale,1))@Matrix.Translation(-center)
    total=sum(len(o.data.polygons) for o in copies);ratio=min(1,(18000 if ident=='scooter' else 14000)/max(1,total))
    parts=[]
    for o in copies:
        o.data.transform(fit);bpy.context.view_layer.objects.active=o;o.select_set(True)
        if ratio<1:
            mod=o.modifiers.new('Display detail budget','DECIMATE');mod.ratio=ratio;mod.use_collapse_triangulate=True
            bpy.ops.object.modifier_apply(modifier=mod.name)
        parts.append({'name':o.name,'materials':[m.name if m else None for m in o.data.materials], 'bounds':[[min(v.co[k] for v in o.data.vertices) for k in range(3)],[max(v.co[k] for v in o.data.vertices) for k in range(3)]]})
    for img in bpy.data.images:
        if img.type!='IMAGE':continue
        if source.suffix.lower()=='.fbx' or not img.has_data:
            candidates=list((target/'textures').glob('*'))
            stem=Path(img.name).stem.lower()
            candidate=next((p for p in candidates if p.stem.lower()==stem),None)
            if candidate:img.filepath=str(candidate);img.reload()
        if img.has_data and max(img.size)>1024:
            factor=1024/max(img.size);img.scale(max(1,int(img.size[0]*factor)),max(1,int(img.size[1]*factor)))
        if img.has_data:img.pack()
    report[ident].update({'fitScale':scale,'parts':parts,'runtimeTriangles':sum(len(o.data.polygons) for o in copies)})
    bpy.ops.export_scene.gltf(filepath=str(ROOT/(ident+'.glb')),export_format='GLB',export_animations=False,export_yup=True,export_extras=True)
    # Clear imported data between files, keeping memory bounded for the large source meshes.
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for _ in range(3):bpy.ops.outliner.orphans_purge(do_recursive=True)
(ROOT/'inspection.json').write_text(json.dumps(report,indent=2))
print('PREPARED',json.dumps({k:{'triangles':v['runtimeTriangles'],'rigged':v['rigged']} for k,v in report.items()}))
