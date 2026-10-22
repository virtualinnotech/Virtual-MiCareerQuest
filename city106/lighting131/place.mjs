import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';

export async function addLighting131({doc,scene,original,worldBounds,buildings,treePlacements,mesh,box,material,signals}){
 const source=await new NodeIO().read(new URL('./light.glb',import.meta.url).pathname),model=copyToDocument(doc,source,source.getRoot().listMeshes()).get(source.getRoot().listMeshes()[0]),head=source.getRoot().getExtras().head;
 const report={archive:'city-street-light-3.zip',lights:[],replaced:0,roads:0,park:0,entry:0,buriedFootings:0},occupied=[];
 const collider={center:[0,1.5,0],size:[.14,3,.14]};
 function light(n,local,radius=5.8,power=2.5,color=[1,.78,.49]){
  const p=new T.Vector3(...local).applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix())).toArray();
  report.lights.push({id:n.getName(),p,radius,power,color});occupied.push(n.getTranslation());n.setExtras({...n.getExtras(),lamp131:true});
 }
 const existing=[...scene.listChildren()],trees=existing.filter(n=>n.getExtras().tree||n.getExtras().vegetation115&&/tree/i.test(n.getName())).map(n=>n.getTranslation());
 for(const n of existing)if(n.getExtras().interiorLight133)report.lights.push({id:n.getName(),...n.getExtras().interiorLight133});
 for(const n of existing){
  const e=n.getExtras();
  if(e.furnishing107==='streetlights'){
   n.setMesh(model).setScale([1,1,1]).setExtras({...e,asset131:true,collider107:collider});light(n,head);report.replaced++;
  }else if(e.furnishing107==='lanterns'){light(n,[0,2.035,0],4.1,1.8);}
  if(n.getName().startsWith('Supplied130 fixed concrete footing')){
   let top=0;for(const p of n.getMesh().listPrimitives())top=Math.max(top,p.getAttribute('POSITION').getMax([])[1]);
   const position=n.getTranslation();n.setTranslation([position[0],position[1]-top-.003,position[2]]);report.buriedFootings++;
   const signal=signals.placements[Number(n.getName().split(' ').at(-1))],pole=scene.listChildren().find(node=>node.getName()===signal?.name);
   if(pole){const p=pole.getTranslation();p[1]-=top+.003;pole.setTranslation(p);signal.p=p;}
  }
 }
 for(const m of doc.getRoot().listMaterials())if(m.getName()==='City107 warm lamp lenses')m.setExtras({...m.getExtras(),surfaceType:28}).setEmissiveFactor([0,0,0]);
 const blockers=existing.filter(n=>n.getExtras().collider107&&!n.getExtras().life111).map(n=>{const c=n.getExtras().collider107;return {p:n.getTranslation(),radius:Math.min(1,Math.hypot(c.size[0],c.size[2])/2)};});
 function clear(p){
  if(occupied.some(q=>Math.hypot(q[0]-p[0],q[2]-p[2])<5.2))return false;
  if([...trees,...treePlacements].some(q=>Math.hypot(q[0]-p[0],q[2]-p[2])<.65))return false;
  if(blockers.some(q=>Math.hypot(q.p[0]-p[0],q.p[2]-p[2])<q.radius+.18))return false;
  return !buildings.placements.some(b=>p[0]>b.bounds.lo[0]-.12&&p[0]<b.bounds.hi[0]+.12&&p[2]>b.bounds.lo[2]-.12&&p[2]<b.bounds.hi[2]+.12);
 }
 function place(p,yaw=0,scale=1,kind='roads'){
  const n=doc.createNode('City131 '+kind+' streetlight '+report[kind]++).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale([scale,scale,scale]).setExtras({cityProp:true,street128:'streetlights',asset131:true,collider107:collider});scene.addChild(n);light(n,head,kind==='park'?5.2:5.8*scale,kind==='park'?2.1:2.5);
 }
 // Authoritative sidewalk slabs already exclude road junctions and building lots.
 for(const n of original.getRoot().listNodes()){
  const match=/^City_sidewalk_([xz])_-?\d+_(-?1)_/.exec(n.getName());if(!match||!n.getMesh())continue;
  const {lo,hi}=worldBounds(n),cross=match[1]==='x'?0:2,along=cross===0?2:0,side=+match[2],length=hi[along]-lo[along];
  if(length<2.4||hi[cross]-lo[cross]<.35)continue;
  const count=Math.max(1,Math.ceil(length/7.8)),yaw=cross===0?(side<0?0:Math.PI):(side<0?-Math.PI/2:Math.PI/2);
  for(let i=0;i<count;i++){
   const p=[(lo[0]+hi[0])/2,hi[1],(lo[2]+hi[2])/2];p[cross]=side<0?hi[cross]-.20:lo[cross]+.20;p[along]=lo[along]+length*(i+.5)/count;
   // Far-bank carriageway was widened after the original sidewalk subdivision.
   if(p[2]>-72.4&&p[2]<-66.8)p[2]=p[2]<-69.6?-72.55:-66.65;
   if(clear(p))place(p,yaw);
  }
 }
 for(const z of[-29,-21,-13,-5,3,11,19,27,34]){const p=[-28.9,-.021,z];if(clear(p))place(p,0,.67,'park');}
 for(const x of[-22,-14,-6]){const p=[x,-.021,-26];if(clear(p))place(p,-Math.PI/2,.67,'park');}
 // Compact wall sconces illuminate the entrance and rear stairs, away from traffic.
 const dark=material('City131 sconce aluminum',[.055,.061,.065,1],null,.7,.4),lens=material('City131 sconce glass lens',[.7,.78,.82,1],null,0,.3).setExtras({surfaceType:28});
 const sconce=mesh('City131 entrance wall sconce',[box([0,0,0],[.18,.12,.10],dark),box([0,-.064,.01],[.14,.012,.075],lens)]);
 for(const [x,y,z]of[[-4,2.2,34.65],[4,2.2,34.65],[-3,2.1,-31],[3,2.1,-31]]){
  const n=doc.createNode('City131 entry sconce '+report.entry++).setMesh(sconce).setTranslation([x,y,z]).setExtras({cityProp:true,street128:'streetlights'});scene.addChild(n);light(n,[0,-.08,.03],4.4,2.2,[1,.85,.66]);
 }
 for(const m of doc.getRoot().listMaterials())if(/Park116 staggered|District115 park path|Block126.*pav|District115.*pav/i.test(m.getName()))m.setExtras({...m.getExtras(),surfaceType:/Park116 staggered|District115 park path/i.test(m.getName())?19:29});
 return report;
}
