# Samples a Mixamo FBX: per frame, each bone's world rotation and the hips'
# world position (Blender world, Z up), plus the rest pose. Bone names are
# written without their "mixamorigN:" prefix.
import bpy,sys,json
argv=sys.argv[sys.argv.index('--')+1:];src,out=argv
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=src)
a=[o for o in bpy.data.objects if o.type=='ARMATURE'][0];act=a.animation_data.action
f0,f1=[int(v) for v in act.frame_range];sc=bpy.context.scene;W=a.matrix_world
short=lambda n:n.split(':')[-1]
q=lambda m:[round(v,6) for v in (m.to_3x3().normalized().to_quaternion())]  # w,x,y,z
rest={short(b.name):{'q':q(W@b.matrix_local),'p':[round(v,5) for v in (W@b.head_local)]} for b in a.data.bones}
frames=[]
for f in range(f0,f1+1):
    sc.frame_set(f)
    frames.append({'f':f,'q':{short(p.name):q(W@p.matrix) for p in a.pose.bones},'hips':[round(v,5) for v in (W@a.pose.bones[[p.name for p in a.pose.bones if short(p.name)=='Hips'][0]].head)]})
json.dump({'fps':sc.render.fps/sc.render.fps_base,'rest':rest,'frames':frames},open(out,'w'))
print('wrote',out,len(frames),'frames')
