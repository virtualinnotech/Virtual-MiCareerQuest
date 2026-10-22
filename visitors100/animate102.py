"""Fit continuous skin weights and bake planted-foot walk/idle cycles."""
import bpy, bmesh, math, json
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'rigged102'
IDS=['student2','green','casual','stride-a','stride-b','smiling','teenage']
V=Vector

def reset():bpy.ops.wm.read_factory_settings(use_empty=True)
def short(name):return name.split(':')[-1]
def clamp(v):return max(0.,min(1.,v))
def smooth(v):v=clamp(v);return v*v*(3-2*v)

# Landmark coordinates are in metres, with -Y pointing forwards. Arms retain
# the scan's elbow/wrist locations while binding; the motion unfolds them.
ARMS={
 'casual': {'Right':[(-.16,.00,1.43),(-.34,-.015,1.49),(-.14,-.07,1.70)],'Left':[(.19,.00,1.42),(.25,.00,1.16),(.24,-.04,.91)]},
 'stride-a':{'Right':[(-.17,.00,1.42),(-.22,.00,1.12),(-.22,-.035,.82)],'Left':[(.18,.00,1.43),(.28,-.02,1.16),(.20,-.16,1.34)]},
 'stride-b':{'Right':[(-.16,.00,1.37),(-.20,-.02,1.08),(-.22,-.055,.82)],'Left':[(.17,.00,1.37),(.23,-.015,1.11),(.23,-.08,.86)]},
 'smiling':{'Right':[(-.18,.00,1.43),(-.28,.00,1.10),(-.29,-.24,1.19)],'Left':[(.19,.00,1.43),(.31,.00,1.10),(.04,-.28,1.20)]},
 'teenage':{'Right':[(-.17,.00,1.43),(-.24,.00,1.11),(-.09,-.25,1.10)],'Left':[(.18,.00,1.43),(.26,.00,1.10),(.19,-.23,1.20)]},
}

def make_scan_rig(mesh,ident):
 # Follow each leg through successive cross-sections, including posed strides.
 p=np.array([v.co[:] for v in mesh.data.vertices]);centers={}
 previous=np.array([[-.095,0],[.095,0]])
 for z in np.linspace(.86,.10,20):
  points=p[abs(p[:,2]-z)<.026,:2]
  if not len(points):continue
  c=previous.copy()
  for _ in range(12):
   labels=((points[:,None,:]-c[None,:,:])**2).sum(axis=2).argmin(axis=1)
   for k in range(2):
    if (labels==k).any():c[k]=points[labels==k].mean(axis=0)
  if np.linalg.norm(c[0]-previous[1])+np.linalg.norm(c[1]-previous[0])<np.linalg.norm(c[0]-previous[0])+np.linalg.norm(c[1]-previous[1]):c=c[::-1]
  centers[round(float(z),2)]=c.copy();previous=c
 def leg_at(z,k):
  if ident=='stride-b':
   landmarks=[[( -.075,-.05,.9),(-.024,-.172,.48),(.034,-.312,.10)],[(.085,.025,.9),(.058,.132,.48),(.035,.329,.10)]]
   return V(min(landmarks[k],key=lambda p:abs(p[2]-z)))
  key=min(centers,key=lambda a:abs(a-z));c=centers[key][k];return V((c[0],c[1],z))
 hips=(leg_at(.90,0)+leg_at(.90,1))/2
 bpy.ops.object.armature_add();rig=bpy.context.object;rig.name=ident+'_walking_rig'
 bpy.ops.object.mode_set(mode='EDIT');rig.data.edit_bones.remove(rig.data.edit_bones[0])
 def bone(name,h,t,parent=None):
  b=rig.data.edit_bones.new('visitor:'+name);b.head=h;b.tail=t
  if parent:b.parent=rig.data.edit_bones['visitor:'+parent]
  return b
 bone('Hips',hips,hips+V((0,0,.10)))
 bone('Spine',hips+V((0,0,.10)),(hips.x,hips.y,1.18),'Hips')
 bone('Spine1',(hips.x,hips.y,1.18),(hips.x,hips.y,1.34),'Spine')
 bone('Spine2',(hips.x,hips.y,1.34),(hips.x,hips.y,1.45),'Spine1')
 bone('Neck',(hips.x,hips.y,1.45),(hips.x,hips.y,1.51),'Spine2')
 bone('Head',(hips.x,hips.y,1.51),(hips.x,hips.y,1.76),'Neck')
 for side,k in [('Right',0),('Left',1)]:
  hip,knee,ankle=leg_at(.90,k),leg_at(.48,k),leg_at(.10,k)
  bone(side+'UpLeg',hip,knee,'Hips');bone(side+'Leg',knee,ankle,side+'UpLeg')
  bone(side+'Foot',ankle,ankle+V((0,-.14,-.055)),side+'Leg')
  sh,el,wr=map(V,ARMS[ident][side])
  bone(side+'Shoulder',(hips.x,hips.y,1.40),sh,'Spine2')
  bone(side+'Arm',sh,el,side+'Shoulder');bone(side+'ForeArm',el,wr,side+'Arm')
  bone(side+'Hand',wr,wr+(wr-el).normalized()*.09,side+'ForeArm')
 bpy.ops.object.mode_set(mode='OBJECT')
 groups={short(b.name):mesh.vertex_groups.new(name=b.name) for b in rig.data.bones}
 bones={short(b.name):b for b in rig.data.bones}
 def distance(p,b):
  a=b.head_local;d=b.tail_local-a;t=clamp((p-a).dot(d)/d.length_squared)
  return (p-a-t*d).length
 for vertex in mesh.data.vertices:
  x,y,z=vertex.co;p=vertex.co
  side=min(['Right','Left'],key=lambda s:distance(p,bones[s+'UpLeg']) if z>.48 else distance(p,bones[s+'Leg']))
  if z<.93:
   hip=smooth((z-.79)/.14);knee=smooth((z-.42)/.12);foot=1-smooth((z-.09)/.11)
   weights={'Hips':hip,side+'UpLeg':(1-hip)*knee,side+'Leg':(1-hip)*(1-knee)*(1-foot),side+'Foot':(1-hip)*(1-knee)*foot}
  else:
   keys=['Hips','Spine','Spine1','Spine2','Neck','Head'];j=max(0,min(4,int((z-.98)/.10)))
   if z>1.52:weights={'Head':1}
   elif z>1.43:
    t=smooth((z-1.43)/.09);weights={'Spine2':1-t,'Head':t}
   else:
    t=smooth((z-1.02)/.29);weights={'Spine':1-t,'Spine2':t}
  # Region gating prevents nearby hands/backpacks binding to thighs or faces.
  if z>.68 and (z<1.46 or (ident=='casual' and x<-.16)):
   names=[s+b for s in ['Right','Left'] for b in ['Arm','ForeArm','Hand']]
   arm=min(names,key=lambda n:distance(p,bones[n]));ad=distance(p,bones[arm])
   torso=min(distance(p,bones[n]) for n in ['Hips','Spine','Spine1','Spine2','Neck','Head'])
   influence=smooth((torso-ad-.015)/.09)
   if z<1.05:influence*=smooth((abs(x-hips.x)-.17)/.04)
   if y>.12 and abs(x-hips.x)<.20:influence=0
   if abs(x-hips.x)<.12 and z<1.44:influence=0
   if influence>0:
    side='Left' if arm.startswith('Left') else 'Right'
    # Smooth weights along connected limbs, never separate triangles.
    chain=[side+'Arm',side+'ForeArm',side+'Hand']
    scores=[1/max(.035,distance(p,bones[n]))**4 for n in chain];total=sum(scores)
    weights={n:w*(1-influence) for n,w in weights.items()}
    for n,s in zip(chain,scores):weights[n]=weights.get(n,0)+influence*s/total
  weights=sorted(weights.items(),key=lambda a:-a[1])[:4];total=sum(w for n,w in weights)
  for n,w in weights:
   if w>1e-6:groups[n].add([vertex.index],w/total,'REPLACE')
 mesh.parent=rig;mod=mesh.modifiers.new('Continuous student skin','ARMATURE');mod.object=rig
 bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);bpy.context.view_layer.objects.active=mesh
 bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
 bpy.ops.object.vertex_group_smooth(group_select_mode='ALL',factor=.65,repeat=8)
 bpy.ops.object.vertex_group_normalize_all(lock_active=False)
 bpy.ops.object.mode_set(mode='OBJECT')
 return rig

report={}
for ident in IDS:
 reset();bpy.ops.import_scene.gltf(filepath=str(ROOT.parent.parent/'work'/'visitors102-bind'/(ident+'.glb')))
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
 scanned=not rigs
 if scanned:
  mesh=meshes[0];mesh.data.transform(mesh.matrix_world);mesh.parent=None;mesh.matrix_world=Matrix.Identity(4)
  # glTF splits UV seams into duplicate vertices on import. Rejoin them before
  # smoothing weights, otherwise the two sides acquire different deformation.
  bm=bmesh.new();bm.from_mesh(mesh.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00008);bm.to_mesh(mesh.data);bm.free()
  for poly in mesh.data.polygons:poly.use_smooth=True
  rig=make_scan_rig(mesh,ident)
 else:rig=rigs[0]
 rig.animation_data_clear();rig.animation_data_create()
 target_rest={short(b.name):b.matrix_local.copy() for b in rig.data.bones}
 bone_names={short(b.name):b.name for b in rig.data.bones}
 for b in rig.pose.bones:b.rotation_mode='QUATERNION';b.matrix_basis=Matrix.Identity(4)
 bpy.context.view_layer.update()
 scene=bpy.context.scene;scene.render.fps=30
 for label in ['Walk','Idle']:
  action=bpy.data.actions.new(label);rig.animation_data.action=action
  count=33 if label=='Walk' else 61
  for f in range(count):
   scene.frame_set(f+1)
   phase=f/(count-1)*math.tau
   desired_matrices={};leg_targets={}
   drop=0
   for side in ['Left','Right']:
    up=rig.data.bones[bone_names[side+'UpLeg']];low=rig.data.bones[bone_names[side+'Leg']]
    reach=math.sqrt(max(.1,(up.length+low.length-.006)**2-.27**2))
    drop=max(drop,up.head_local.z-.10-reach)
   for side,offset in [('Left',0),('Right',math.pi)]:
    upper=rig.data.bones[bone_names[side+'UpLeg']];lower=rig.data.bones[bone_names[side+'Leg']]
    hip=upper.head_local.copy();hip.z-=drop
    length1=upper.length;length2=lower.length
    t=((phase+offset)/math.tau)%1
    if label=='Walk':
     if t<.6:forward=.27-.54*t/.6;lift=0
     else:
      swing=(t-.6)/.4;forward=-.27+.54*smooth(swing);lift=.085*math.sin(swing*math.pi)
    else:forward=0;lift=0
    ankle=V((hip.x,hip.y-forward,.10+lift))
    # Two-bone IK with a forward knee pole keeps knees and feet anatomical.
    delta=ankle-hip;length=min(delta.length,length1+length2-.002);direction=delta.normalized()
    along=(length1*length1-length2*length2+length*length)/(2*length)
    height=math.sqrt(max(0,length1*length1-along*along))
    pole=V((0,-1,0));pole=(pole-direction*pole.dot(direction)).normalized()
    knee=hip+direction*along+pole*height
    leg_targets[side+'UpLeg']=(hip,knee)
    leg_targets[side+'Leg']=(knee,ankle)
    foot=rig.data.bones[bone_names[side+'Foot']]
    # Preserve the source shoe's bind orientation; no ankle twisting.
    leg_targets[side+'Foot']=(ankle,ankle+foot.tail_local-foot.head_local)
   for pb in rig.pose.bones:
    name=short(pb.name);rest=target_rest[name]
    if pb.parent:
     parent_name=short(pb.parent.name);pr=target_rest[parent_name];parent=desired_matrices[parent_name]
     matrix=parent@pr.inverted()@rest
    else:matrix=rest.copy();matrix.translation.z-=drop
    if name in leg_targets:
     head,tail=leg_targets[name];rotation=(pb.bone.tail_local-pb.bone.head_local).rotation_difference(tail-head)@rest.to_quaternion()
     matrix=Matrix.Translation(head)@rotation.to_matrix().to_4x4()
    elif name.endswith('Arm') and not name.endswith('ForeArm'):
     sign=1 if name.startswith('Left') else -1
     angle=(.13*math.sin(phase+sign*math.pi/2) if label=='Walk' else 0)
     if scanned:
      # Keep scanned bent elbows natural instead of forcing a T-pose onto them.
      rotation=Quaternion((1,0,0),angle*.6)@matrix.to_quaternion()
     else:
      direction=V((sign*.08,math.sin(angle),-1)).normalized()
      rotation=(pb.bone.tail_local-pb.bone.head_local).rotation_difference(direction)@rest.to_quaternion()
     matrix=Matrix.Translation(matrix.translation)@rotation.to_matrix().to_4x4()
    elif not scanned and name.endswith('ForeArm'):
     direction=V((0,-.12,-1)).normalized()
     rotation=(pb.bone.tail_local-pb.bone.head_local).rotation_difference(direction)@rest.to_quaternion()
     matrix=Matrix.Translation(matrix.translation)@rotation.to_matrix().to_4x4()
    desired_matrices[name]=matrix
    kwargs={'parent_matrix':desired_matrices[short(pb.parent.name)],'parent_matrix_local':pb.parent.bone.matrix_local} if pb.parent else {}
    pb.matrix_basis=pb.bone.convert_local_to_pose(matrix,pb.bone.matrix_local,invert=True,**kwargs)
    pb.keyframe_insert('rotation_quaternion',frame=f+1,group=pb.name)
    pb.keyframe_insert('location',frame=f+1,group=pb.name)
   bpy.context.view_layer.update()
   # Ground the stance shoe exactly; preserve the swing foot's clearance.
   deps=bpy.context.evaluated_depsgraph_get();minimum=min((o.matrix_world@v.co).z for o in meshes for v in o.evaluated_get(deps).data.vertices)
   root=next(b for b in rig.pose.bones if not b.parent)
   # Authored rigs include hidden inner-body geometry; use the visible soles.
   if ident=='student2':minimum=.0017
   elif ident=='green':minimum=-.04
   else:minimum=max(-.06,min(.06,minimum))
   grounded=desired_matrices[short(root.name)].copy();grounded.translation+=rig.matrix_world.to_3x3().inverted()@V((0,0,-minimum))
   root.matrix_basis=root.bone.convert_local_to_pose(grounded,root.bone.matrix_local,invert=True)
   root.keyframe_insert('location',frame=f+1,group=root.name)
  track=rig.animation_data.nla_tracks.new();track.name=label
  strip=track.strips.new(label,1,action);strip.action_frame_start=1;strip.action_frame_end=count
  track.mute=True
 rig.animation_data.action=None
 for t in rig.animation_data.nla_tracks:t.mute=False
 scene.frame_start=1;scene.frame_end=61
 bpy.ops.export_scene.gltf(filepath=str(OUT/(ident+'.glb')),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_yup=True)
 report[ident]={'sourceRigPreserved':not scanned,'bones':len(rig.data.bones),'clips':['Walk','Idle']}
(ROOT/'animation102.json').write_text(json.dumps(report,indent=2))
print('ANIMATED',report)
