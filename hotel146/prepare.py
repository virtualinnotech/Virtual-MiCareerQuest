"""Safely import the supplied hotel models and pack bounded runtime textures."""
import bpy
import json
import sys
import zipfile
import subprocess
import math
from pathlib import Path
from mathutils import Vector, Matrix

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT.parent/'work'/'hotel146'
FILES={
 'desk':('modern-reception-desk-marble-wood-metal-tri.zip',1.85,'width'),
 'trolley':('gold-hotel-luggage-trolley-fallout-miami.zip',.82,'height'),
 'luggage':('hand-luggage.zip',.30,'height'),
 'computer':('desktop-computer.zip',.26,'height'),
 'chandelier':('710572-tesoro-osgona-chandelier.zip',1.65,'width'),
 'couch':('circle-couch-for-diegos-room.zip',2.2,'width'),
 'side-table':('marble-side-table.zip',.25,'height'),
 'lamp':('wall-lamp-2048px2.zip',.28,'height'),
 'console':('victorian-console-table.zip',.34,'height'),
 'sofa':('victorian-lounge-sofa.zip',.95,'width'),
 'seat':('victorian-seat.zip',.41,'height'),
 'coffee-table':('victorian-coffee-table.zip',.57,'width'),
 'window':('victorian-window.zip',1.15,'height'),
 'stairs':('victorial-stairs.zip',1.85,'height'),
 'wooden-stairs':('wooden-stairs-8-mb.zip',2.65,'height'),
 'bellhop':('red-bellhop-in-uniform (1).zip',.74,'height')}
names=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else list(FILES)
for name in names:
 filename,size,axis=FILES[name]
 folder=WORK/'source'/name;folder.mkdir(parents=True,exist_ok=True)
 pending=[Path('/Users/mapettiforsd/Desktop')/filename];seen=set()
 while pending:
  archive=pending.pop();seen.add(archive)
  with zipfile.ZipFile(archive) as z:
   for item in z.infolist():
    if not (folder/item.filename).resolve().is_relative_to(folder.resolve()):raise ValueError('Unsafe archive path')
   z.extractall(folder)
  pending.extend(p for p in folder.rglob('*.zip') if p not in seen)
 for archive in list(folder.rglob('*.7z'))+list(folder.rglob('*.rar')):
  entries=subprocess.check_output(['/usr/bin/tar','-tf',str(archive)],text=True).splitlines()
  if any(not (folder/n).resolve().is_relative_to(folder.resolve()) for n in entries):raise ValueError('Unsafe archive path')
  subprocess.run(['/usr/bin/tar','-xf',str(archive),'-C',str(folder)],check=True)
 candidates=[p for p in folder.rglob('*') if p.suffix.lower() in ['.glb','.gltf','.fbx','.obj','.dae','.blend'] and '__MACOSX' not in str(p)]
 if not candidates:raise ValueError('No usable model: '+name)
 source=sorted(candidates,key=lambda p:(['.glb','.gltf','.fbx','.obj','.dae','.blend'].index(p.suffix.lower()),-p.stat().st_size))[0]
 bpy.ops.wm.read_factory_settings(use_empty=True)
 if source.suffix.lower()=='.fbx':
  if int.from_bytes(source.read_bytes()[23:27],'little')<7100:
   from io_scene_fbx import parse_fbx
   tree,version=parse_fbx.parse(str(source))
   objects=next(e for e in tree.elems if e.id==b'Objects')
   for model in objects.elems:
    nodes={e.id:e for e in model.elems}
    if b'Vertices' not in nodes:continue
    values=nodes[b'Vertices'].props;indices=nodes[b'PolygonVertexIndex'].props
    if len(values)==1:values=values[0]
    if len(indices)==1:indices=indices[0]
    points=[values[i:i+3] for i in range(0,len(values),3)];faces=[];face=[]
    for i in indices:
     face.append(i if i>=0 else -i-1)
     if i<0:faces.append(face);face=[]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(points,[],faces);mesh.validate();mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    for title,color in [('Crystal',(.62,.72,.78,1)),('Gold',(.48,.32,.09,1)),('Ivory',(.82,.80,.69,1)),('Metal',(.23,.20,.13,1)),('Glass',(.62,.70,.74,1))]:
     mat=bpy.data.materials.new(title);mat.diffuse_color=color;mesh.materials.append(mat)
    layer=nodes.get(b'LayerElementMaterial')
    if layer:
     ids=next((e.props for e in layer.elems if e.id==b'Materials'),[])
     if len(ids)==1 and not isinstance(ids[0],int):ids=ids[0]
     for poly,index in zip(mesh.polygons,ids):poly.material_index=index%5
  else:bpy.ops.import_scene.fbx(filepath=str(source),use_anim=False)
 elif source.suffix.lower() in ['.glb','.gltf']:bpy.ops.import_scene.gltf(filepath=str(source))
 elif source.suffix.lower()=='.obj':bpy.ops.wm.obj_import(filepath=str(source))
 elif source.suffix.lower()=='.dae':bpy.ops.wm.collada_import(filepath=str(source))
 else:bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False,use_scripts=False)
 images={p.name.lower():p for p in folder.rglob('*') if p.suffix.lower() in ['.png','.jpg','.jpeg']}
 # COLLADA/3ds Max material links often omit the diffuse image on import.
 for mat in bpy.data.materials:
  mat.use_nodes=True;bsdf=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if not bsdf:continue
  if name=='chandelier':
   bsdf.inputs['Base Color'].default_value=mat.diffuse_color
   bsdf.inputs['Metallic'].default_value=.72 if mat.name in ['Gold','Metal'] else .06
   bsdf.inputs['Roughness'].default_value=.24 if mat.name in ['Gold','Metal'] else .16
  aliases={'Material__218':'Base_gold','M_Marmol':'Marmol_d','M_Curtains':'Curtain_d','M_iron02':'M_iron02_d'}
  stem=aliases.get(mat.name,mat.name).lower()
  if name=='wooden-stairs':stem='basecolor'
  image=next((p for p in images.values() if p.stem.lower() in [stem,stem+'_albedo',stem+'_basecolor',stem+'_base_color',stem+'_color']),None)
  if image and not bsdf.inputs['Base Color'].is_linked:
   node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=bpy.data.images.load(str(image));mat.node_tree.links.new(node.outputs['Color'],bsdf.inputs['Base Color'])
   bsdf.inputs['Base Color'].default_value=(1,1,1,1)
  if name=='couch' or name=='luggage':
   for link in list(bsdf.inputs['Base Color'].links):mat.node_tree.links.remove(link)
   bsdf.inputs['Base Color'].default_value=(.105,.20,.27,1) if name=='couch' else ((.16,.045,.065,1) if mat.name=='Material.001' else (.035,.04,.045,1))
   bsdf.inputs['Roughness'].default_value=.82 if name=='couch' else .5
   bsdf.inputs['Metallic'].default_value=0
  if name in ['coffee-table','sofa']:
   for link in list(bsdf.inputs['Alpha'].links):mat.node_tree.links.remove(link)
   bsdf.inputs['Alpha'].default_value=1
 for im in bpy.data.images:
  found=images.get(Path(im.filepath.replace('\\','/')).name.lower())
  if found and not im.packed_file:im.filepath=str(found);im.reload()
  if max(im.size)>1024:
   r=1024/max(im.size);im.scale(max(1,round(im.size[0]*r)),max(1,round(im.size[1]*r)))
  if im.size[0]>0:im.pack()
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 if name=='window':
  for obj in meshes:
   mat=bpy.data.materials.new('Restored '+obj.name);mat.use_nodes=True
   shader=mat.node_tree.nodes.get('Principled BSDF')
   if obj.name=='glass':
    mat.diffuse_color=(.66,.80,.84,.13);shader.inputs['Base Color'].default_value=mat.diffuse_color
    shader.inputs['Alpha'].default_value=.13;shader.inputs['Roughness'].default_value=.16
    if hasattr(mat,'surface_render_method'):mat.surface_render_method='DITHERED'
    elif hasattr(mat,'blend_method'):mat.blend_method='BLEND'
   else:
    shader.inputs['Base Color'].default_value=(1,1,1,1);shader.inputs['Roughness'].default_value=.55
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(images['material__8_base_color.png']))
    tex.image.pack();mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
   obj.data.materials.clear();obj.data.materials.append(mat)
   for polygon in obj.data.polygons:polygon.material_index=0
 graph=bpy.context.evaluated_depsgraph_get()
 for obj in meshes:
  mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(graph),depsgraph=graph);mesh.transform(obj.matrix_world)
  obj.modifiers.clear();obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.data=mesh
  if name=='luggage':mesh.transform(Matrix.Rotation(-math.pi/2,4,'Y'))
 for obj in list(bpy.context.scene.objects):
  if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True)
 verts=[v.co for o in meshes for v in o.data.vertices]
 lo=Vector([min(v[k] for v in verts) for k in range(3)]);hi=Vector([max(v[k] for v in verts) for k in range(3)])
 factor=size/((hi-lo).z if axis=='height' else max((hi-lo).x,(hi-lo).y));center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 total=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)
 budget=150000 if name=='chandelier' else 35000 if name in ['desk','bellhop','wooden-stairs'] else 18000
 for obj in meshes:
  for v in obj.data.vertices:v.co=(v.co-center)*factor
  if total>budget and len(obj.data.polygons)>150:
   bpy.context.view_layer.objects.active=obj
   mod=obj.modifiers.new('Runtime triangle budget','DECIMATE');mod.ratio=max(.025,budget/total)
   bpy.ops.object.modifier_apply(modifier=mod.name)
  obj.data.validate();obj.data.update()
  if name=='chandelier':
   for polygon in obj.data.polygons:polygon.use_smooth=True
 for mat in bpy.data.materials:
  if not mat.use_nodes:continue
  for n in list(mat.node_tree.nodes):
   if n.type=='TEX_IMAGE' and not any(l.to_socket.name=='Base Color' for output in n.outputs for l in output.links):mat.node_tree.nodes.remove(n)
 out=ROOT/'hotel146'/'assets';out.mkdir(exist_ok=True)
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False,export_apply=True)
 converted=WORK/'converted';converted.mkdir(exist_ok=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(converted/(name+'.blend')))
 verts=[v.co for o in meshes for v in o.data.vertices]
 record=dict(name=name,source=str(source),triangles=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons),bounds=dict(lo=[min(v[k] for v in verts) for k in range(3)],hi=[max(v[k] for v in verts) for k in range(3)]),objects=[o.name for o in meshes],materials=[m.name for m in bpy.data.materials])
 (converted/(name+'.json')).write_text(json.dumps(record,indent=2));print('HOTEL146',json.dumps(record),flush=True)
