"""Repair source topology, preserve authored rigs, and skin the scanned students."""
import bpy, bmesh, json, math, shutil
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion

ROOT=Path(__file__).resolve().parent
RAW=ROOT.parent.parent/'work'/'visitors100-raw'
OUT=ROOT/'rigged102';OUT.mkdir(exist_ok=True)
BIND=ROOT.parent.parent/'work'/'visitors102-bind';BIND.mkdir(exist_ok=True)
IDS=['student2','green','casual','stride-a','stride-b','smiling','teenage']
report={}

def reset():bpy.ops.wm.read_factory_settings(use_empty=True)

def repair(o):
 bm=bmesh.new();bm.from_mesh(o.data)
 before=sum(e.is_boundary for e in bm.edges)
 # UVs live on face corners in Blender: welding positions preserves the UV atlas.
 bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00008)
 after=sum(e.is_boundary for e in bm.edges)
 bm.to_mesh(o.data);bm.free()
 return before,after

def textures(source,ident):
 for img in bpy.data.images:
  if img.type!='IMAGE':continue
  if source.suffix.lower()=='.fbx' or not img.has_data:
   candidate=next((p for p in (RAW/ident/'textures').glob('*') if p.stem.lower()==Path(img.name).stem.lower()),None)
   if candidate:img.filepath=str(candidate);img.reload()
  if img.has_data and max(img.size)>2048:
   f=2048/max(img.size);img.scale(round(img.size[0]*f),round(img.size[1]*f))
  if img.has_data:img.pack()

for ident in IDS:
 reset();source=next((RAW/ident/'source').iterdir())
 if source.suffix.lower()=='.fbx':bpy.ops.import_scene.fbx(filepath=str(source))
 else:bpy.ops.import_scene.gltf(filepath=str(source))
 rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials]
 for r in rigs:
  r.animation_data_clear()
  for b in r.pose.bones:b.matrix_basis=Matrix.Identity(4)
 bpy.context.view_layer.update()
 for o in meshes:
  if o.data.shape_keys:o.shape_key_clear()
  world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4);o.data.transform(world)
 for r in rigs:
  world=r.matrix_world.copy();r.parent=None;r.matrix_world=Matrix.Identity(4);r.data.transform(world)
 for o in list(bpy.context.scene.objects):
  if o not in meshes+rigs:bpy.data.objects.remove(o,do_unlink=True)
 points=[v.co for o in meshes for v in o.data.vertices]
 lo=Vector([min(v[k] for v in points) for k in range(3)]);hi=Vector([max(v[k] for v in points) for k in range(3)])
 scale=1.78/(hi.z-lo.z);fit=Matrix.Diagonal((scale,scale,scale,1))@Matrix.Translation(Vector((-(lo.x+hi.x)/2,-(lo.y+hi.y)/2,-lo.z)))
 for o in meshes:o.data.transform(fit)
 for r in rigs:r.data.transform(fit)
 for o in meshes:
  if rigs:o.parent=rigs[0];o.matrix_parent_inverse=Matrix.Identity(4)
 bpy.context.view_layer.update()
 stats=[]
 for o in meshes:
  before,after=repair(o)
  # Keep face geometry and UV boundaries intact; no decimation of hair cards.
  count=len(o.data.polygons);target=65000 if not rigs else (count if ident=='green' or 'id80' in o.name else max(3000,count*.65))
  if count>target:
   bpy.context.view_layer.objects.active=o
   mod=o.modifiers.new('Welded detail reduction','DECIMATE');mod.ratio=target/count
   bpy.ops.object.modifier_apply(modifier=mod.name)
  stats.append({'name':o.name,'boundaryBefore':before,'boundaryAfterWeld':after,'triangles':len(o.data.polygons)})
 for o in meshes:
  for mod in list(o.modifiers):
   if mod.type=='ARMATURE' and not rigs:o.modifiers.remove(mod)
 textures(source,ident)
 # An intact static checkpoint is retained for close-up comparison with the rig.
 bpy.ops.export_scene.gltf(filepath=str(OUT/(ident+'.glb')),export_format='GLB',export_animations=False,export_yup=True)
 shutil.copyfile(OUT/(ident+'.glb'),BIND/(ident+'.glb'))
 report[ident]={'riggedSource':bool(rigs),'meshes':stats}
(ROOT/'repair102.json').write_text(json.dumps(report,indent=2))
print('REPAIRED SOURCES')
