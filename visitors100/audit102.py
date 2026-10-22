import bpy, bmesh, json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
RAW=ROOT.parent.parent/'work'/'visitors100-raw'
report={}
for ident in ['student2','green','casual','stride-a','stride-b','smiling','teenage']:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 source=next((RAW/ident/'source').iterdir())
 if source.suffix.lower()=='.fbx':bpy.ops.import_scene.fbx(filepath=str(source))
 else:bpy.ops.import_scene.gltf(filepath=str(source))
 rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
 items=[]
 for o in bpy.context.scene.objects:
  if o.type!='MESH' or not o.data.materials:continue
  bm=bmesh.new();bm.from_mesh(o.data)
  before=(len(bm.verts),sum(e.is_boundary for e in bm.edges))
  bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001)
  items.append({'name':o.name,'before':before,'welded':(len(bm.verts),sum(e.is_boundary for e in bm.edges)),'materials':[m.name for m in o.data.materials]})
  bm.free()
 report[ident]={'meshes':items,'rigs':[{ 'name':r.name,'bones':[(b.name,list(b.head_local),list(b.tail_local)) for b in r.data.bones]} for r in rigs],'actions':[(a.name,list(a.frame_range)) for a in bpy.data.actions]}
(ROOT/'audit102.json').write_text(json.dumps(report,indent=2))
print('AUDIT DONE')
