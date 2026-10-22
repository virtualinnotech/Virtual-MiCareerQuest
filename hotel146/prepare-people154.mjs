import {io,bake,compactTextures} from '../rivian147/prepare.mjs';
import * as T from '../pc66/vendor/three/three.core.js';
import {weld,simplify,prune} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../work/browser/node_modules/meshoptimizer/index.js';
import {fileURLToPath} from 'node:url';

const path=p=>fileURLToPath(new URL(p,import.meta.url));
const smooth=(a,b,v)=>{const t=T.MathUtils.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const acc=(doc,data,type,Kind=Float32Array)=>doc.createAccessor().setType(type).setArray(new Kind(data)).setBuffer(doc.getRoot().listBuffers()[0]);
function bounds(doc){
 const box=new T.Box3();
 for(const n of doc.getRoot().listNodes())for(const p of n.getMesh()?.listPrimitives()||[]){
  const a=p.getAttribute('POSITION'),m=new T.Matrix4().fromArray(n.getWorldMatrix());
  for(let i=0;i<a.getCount();i++)box.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(m));
 }return box;
}
function idle(doc,tracks){
 const clip=doc.createAnimation('Idle'),times=Array.from({length:61},(_,i)=>i*4/60),input=acc(doc,times,'SCALAR');
 for(const [node,rotation,amplitude,axis] of tracks){
  node.setRotation(rotation.toArray());
  const values=times.flatMap(t=>rotation.clone().multiply(new T.Quaternion().setFromAxisAngle(axis,Math.sin(t*Math.PI/2)*amplitude)).toArray());
  const sampler=doc.createAnimationSampler().setInput(input).setOutput(acc(doc,values,'VEC4')).setInterpolation('LINEAR');
  clip.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath('rotation').setSampler(sampler));
 }
}
async function optimize(doc,name,target){
 await MeshoptSimplifier.ready;
 const count=doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0);
 await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:Math.min(1,target/count),error:.001}));
 for(const m of doc.getRoot().listMaterials())m.setEmissiveFactor([0,0,0]).setEmissiveTexture(null).setMetallicFactor(0).setRoughnessFactor(.82).setMetallicRoughnessTexture(null).setOcclusionTexture(null);
 await doc.transform(prune());await compactTextures(doc,1024);
 await io.write(path('./assets/'+name+'.glb'),doc);
 console.log(name,{sourceTriangles:count,triangles:doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0),skins:doc.getRoot().listSkins().length});
}

// Match the existing student's neutral Idle arm directions without changing
// the supplied doorman's joint lengths, skin weights, or facial geometry.
const reference=await io.read(path('../visitors100/rigged102/green.glb'));
for(const c of reference.getRoot().listAnimations().find(a=>a.getName()==='Idle').listChannels()){
 const node=c.getTargetNode(),v=c.getSampler().getOutput().getElement(0,[]);
 if(c.getTargetPath()==='rotation')node.setRotation(v);
 if(c.getTargetPath()==='translation')node.setTranslation(v);
}
function direction(from,to){
 const nodes=reference.getRoot().listNodes(),a=nodes.find(n=>n.getName()==='mixamorig:'+from),b=nodes.find(n=>n.getName()==='mixamorig:'+to);
 return new T.Vector3().fromArray(b.getWorldTranslation()).sub(new T.Vector3().fromArray(a.getWorldTranslation())).normalize();
}
const doorman=await io.read(path('../../work/hotel146/source/doorman154/source/Man in Gray Trench Coat (Gray Hair).glb'));
const joints=doorman.getRoot().listNodes(),tracks=[];
// The recovered source assigns some coat/leg vertices to distant arm helpers.
// Rebind those surfaces continuously before applying the neutral NPC pose.
for(const mesh of doorman.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
 const a=p.getAttribute('POSITION'),indices=[],weights=[];
 for(let i=0;i<a.getCount();i++){
  const v=new T.Vector3(...a.getElement(i,[])),side=v.x<0?[18,19,20]:[45,46,47];
  const [s,e,w]=side.map(k=>new T.Vector3(...joints[k].getWorldTranslation()));
  const du=v.distanceTo(new T.Line3(s,e).closestPointToPoint(v,true,new T.Vector3()));
  const df=v.distanceTo(new T.Line3(e,w).closestPointToPoint(v,true,new T.Vector3()));
  const arm=smooth(.14,.24,Math.abs(v.x))*smooth(.84,.94,v.y),fore=smooth(-.035,.035,du-df);
  const head=smooth(1.43,1.53,v.y),torso=smooth(.8,1.15,v.y);
  const pairs=[[0,(1-arm)*(1-torso)],[5,(1-arm)*torso*(1-head)],[7,(1-arm)*torso*head],[side[0]-1,arm*(1-fore)],[side[1]-1,arm*fore]].filter(p=>p[1]>.00001).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const sum=pairs.reduce((n,p)=>n+p[1],0);while(pairs.length<4)pairs.push([0,0]);
  indices.push(...pairs.map(p=>p[0]));weights.push(...pairs.map(p=>p[1]/sum));
 }
 p.setAttribute('JOINTS_0',acc(doorman,indices,'VEC4',Uint16Array)).setAttribute('WEIGHTS_0',acc(doorman,weights,'VEC4'));
}
for(const [arm,elbow,wrist,side] of [[18,19,20,'Right'],[45,46,47,'Left']]){
 const upper=joints[arm],fore=joints[elbow],hand=joints[wrist];
 const qUpper=new T.Quaternion().setFromUnitVectors(new T.Vector3(...fore.getTranslation()).normalize(),direction(side+'Arm',side+'ForeArm'));
 const qForeWorld=new T.Quaternion().setFromUnitVectors(new T.Vector3(...hand.getTranslation()).normalize(),direction(side+'ForeArm',side+'Hand'));
 tracks.push([upper,qUpper,.007,new T.Vector3(1,0,0)],[fore,qUpper.clone().invert().multiply(qForeWorld),0,new T.Vector3(1,0,0)]);
}
tracks.push([joints[6],new T.Quaternion(),.006,new T.Vector3(1,0,0)],[joints[8],new T.Quaternion(),.015,new T.Vector3(0,1,0)]);
const box=bounds(doorman),scale=.74/box.getSize(new T.Vector3()).y,scene=doorman.getRoot().getDefaultScene(),roots=scene.listChildren();
const root=doorman.createNode('Hotel doorman scale').setScale([scale,scale,scale]).setTranslation([0,-box.min.y*scale,0]);
for(const n of roots)root.addChild(n);scene.addChild(root);
idle(doorman,tracks);
doorman.getRoot().setExtras({hotel154:{source:'man-in-gray-trench-coat-gray-hair.zip',stance:'visitors100/rigged102/green.glb Idle',height:.74}});
await optimize(doorman,'doorman-idle',20000);

// The scan already has relaxed arms. A small continuous torso/head rig adds
// breathing and a gentle glance while keeping both shoes planted.
const staff=await io.read(path('../../work/hotel146/source/staff154/source/model.glb'));
await bake(staff);
const sb=bounds(staff),ss=.74/sb.getSize(new T.Vector3()).y,center=sb.getCenter(new T.Vector3());
for(const mesh of staff.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
 const pos=p.getAttribute('POSITION');
 for(let i=0;i<pos.getCount();i++){const v=pos.getElement(i,[]);pos.setElement(i,[(v[0]-center.x)*ss,(v[1]-sb.min.y)*ss,(v[2]-center.z)*ss]);}
}
const base=staff.createNode('IdleRoot'),spine=staff.createNode('IdleSpine').setTranslation([0,.37,0]),head=staff.createNode('IdleHead').setTranslation([0,.24,0]);
base.addChild(spine);spine.addChild(head);staff.getRoot().getDefaultScene().addChild(base);
const bones=[base,spine,head],skin=staff.createSkin('Hotel staff idle').setSkeleton(base).setInverseBindMatrices(acc(staff,bones.flatMap(n=>new T.Matrix4().fromArray(n.getWorldMatrix()).invert().toArray()),'MAT4'));
for(const bone of bones)skin.addJoint(bone);
for(const node of staff.getRoot().listNodes()){
 if(!node.getMesh())continue;node.setSkin(skin);
 for(const p of node.getMesh().listPrimitives()){
  const pos=p.getAttribute('POSITION'),indices=[],weights=[];
  for(let i=0;i<pos.getCount();i++){
   const y=pos.getElement(i,[])[1],torso=smooth(.30,.53,y),headWeight=smooth(.60,.66,y);
   indices.push(0,1,2,0);weights.push(1-torso,torso*(1-headWeight),torso*headWeight,0);
  }
  p.setAttribute('JOINTS_0',acc(staff,indices,'VEC4',Uint16Array)).setAttribute('WEIGHTS_0',acc(staff,weights,'VEC4'));
 }
}
idle(staff,[[spine,new T.Quaternion(),.007,new T.Vector3(1,0,0)],[head,new T.Quaternion(),.018,new T.Vector3(0,1,0)]]);
staff.getRoot().setExtras({hotel154:{source:'hotel-staff-in-burgundy.zip',height:.74}});
await optimize(staff,'staff-idle',20000);
