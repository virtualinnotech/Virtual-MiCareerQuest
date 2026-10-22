import fs from 'node:fs';
import {createRequire} from 'node:module';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import {addRiverEntrance} from './entrance.mjs';
import {createParkPathGeometry,createPaverMaterial,parkBenches} from './park116.mjs';
import {restoreBlueBridge} from './bridge117.mjs';
import {replacePlanterShrubs,addTreeSoilBeds,clearHospitalTrees122} from './landscaping.mjs';
const D=createRequire(import.meta.url)('../district115.js');
export async function addDistrict({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,bench}){
 const landscape=await new NodeIO().read(new URL('./landscape.glb',import.meta.url).pathname),copied=copyToDocument(doc,landscape,landscape.getRoot().listMeshes());
 const model=n=>copied.get(landscape.getRoot().listMeshes().find(m=>m.getName()==='District115 '+n));
 const propDoc=await new NodeIO().read(new URL('./props.glb',import.meta.url).pathname),propMap=copyToDocument(doc,propDoc,propDoc.getRoot().listMeshes()),prop=name=>propMap.get(propDoc.getRoot().listMeshes().find(m=>m.getName()==='District115 supplied '+name));
 for(const n of [...scene.listChildren()]){const p=n.getTranslation();if(Math.abs(p[0]+6.3)<1.4&&p[2]<-34.4&&p[2]>-39.5)n.dispose();}
 const asphalt=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 asphalt'),paving=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 paving');
 const stone=material('District115 pale riverbank concrete',[.48,.50,.49,1]),blue=material('District115 blue pedestrian truss',[.025,.25,.40,1],null,.7,.35),iron=material('District115 railings',[.10,.13,.14,1],null,.7,.4),paint=material('District115 crossing paint',[.90,.91,.85,1]),grass=material('District115 park lawn',[.16,.28,.14,1]),mulch=material('District115 tree beds',[.19,.16,.12,1]);
 const counts={trees:0,leafPatches:0,crosswalks:0,intersections:0,parkBenches:0,bridges:3,suppliedProps:0,...addRiverEntrance({doc,scene,mesh,box,rod,geo,material})};let serial=0;
 const add=(name,m,p=[0,0,0],extras={},yaw=0,scale=[1,1,1])=>{const n=doc.createNode('District115 '+name+' '+serial++).setMesh(m).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale(scale).setExtras({cityProp:true,...extras});scene.addChild(n);return n;};
 Object.assign(counts,replacePlanterShrubs({doc,original,worldBounds,add,mesh,box,soil:mulch}));
 const surface=(name,parts,collision=false)=>add(name,mesh('District115 '+name,parts),[0,0,0],collision?{surface115:true}:{});
 const prism=(name,p,size,mat,collision=false)=>{
  if(mat!==asphalt&&mat!==paving)return surface(name,[box(p,size,mat)],collision);
  const g=new T.BoxGeometry(...size);g.translate(...p);const pos=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,k=mat===asphalt?.32:1/2.4;
  for(let i=0;i<pos.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?pos.getZ(i):pos.getX(i))*k,(Math.abs(n.getY(i))>.5?pos.getZ(i):pos.getY(i))*k);
  return surface(name,[geo(g,mat)],collision);
 };
 const roadRecords=original.getRoot().listNodes().filter(n=>/^City_street_/.test(n.getName())&&n.getMesh()).map(n=>({name:n.getName(),...worldBounds(n)}));
 roadRecords.push({name:'City_street_x_bridge115',lo:[-34.95,-.15,-74],hi:[-31.65,-.1275,-34.7]});
 roadRecords.unshift({name:'City_street_z_far115',lo:[-99.6,-.15,-72],hi:[131.4,-.1275,-67.2]});
 const xs=roadRecords.filter(r=>/^City_street_x/.test(r.name)),zs=roadRecords.filter(r=>/^City_street_z/.test(r.name)),junctions=[];
 for(const a of xs)for(const b of zs){const x=(a.lo[0]+a.hi[0])/2,z=(b.lo[2]+b.hi[2])/2;if(x<b.lo[0]-.05||x>b.hi[0]+.05||z<a.lo[2]-.05||z>a.hi[2]+.05||D.inWater(x,z))continue;if(junctions.some(j=>Math.hypot(j.x-x,j.z-z)<.2))continue;junctions.push({x,z,wx:a.hi[0]-a.lo[0],wz:b.hi[2]-b.lo[2],a,b});}
 for(const j of junctions){
  const stripes=[];
  for(const axis of[0,2])for(const side of[-1,1]){
   const road=axis===0?j.b:j.a,q=(axis===0?j.x:j.z)+side*((axis===0?j.wx:j.wz)/2+.35),across=axis===0?j.wz:j.wx;
   if(q<road.lo[axis]||q>road.hi[axis])continue;
   for(let t=-across/2+.16;t<across/2-.1;t+=.42){const p=axis===0?[q,-.124,j.z+t]:[j.x+t,-.124,q],s=axis===0?[.64,.004,.23]:[.23,.004,.64];p[1]=(D.heightAt(p[0],p[2])??-.1275)+.004;stripes.push(box(p,s,paint));}counts.crosswalks++;
  }
  surface('zebra intersection '+counts.intersections++,stripes);
 }
 // Cut the old river surfaces at runtime; these banks make the drop visible.
 prism('lowered river',[(D.river.x0+D.river.x1)/2,D.river.y-.025,(D.river.z0+D.river.z1)/2],[D.river.x1-D.river.x0,.05,D.river.z1-D.river.z0],material('District115 river water',[.12,.24,.27,1],null,.52,.17).setExtras({surfaceType:8}));
 for(const z of[D.river.z0,D.river.z1])prism('retaining bank',[(D.river.x0+D.river.x1)/2,-1.03,z],[D.river.x1-D.river.x0,1.81,.18],stone,true);
 for(const b of D.bridges){
  const parts=[],rails=[],markings=[],segments=64,railSpan=D.railingSpan(b);
  for(let i=0;i<segments;i++){
   const z0=b.start+(b.end-b.start)*i/segments,z1=b.start+(b.end-b.start)*(i+1)/segments,y0=D.elevation(b,z0),y1=D.elevation(b,z1),w0=D.width(b,z0)/2,w1=D.width(b,z1)/2;
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([b.x-w0,y0,z0,b.x+w0,y0,z0,b.x-w1,y1,z1,b.x+w1,y1,z1],3));g.setIndex([0,1,2,1,3,2]);g.setAttribute('uv',new T.Float32BufferAttribute([0,z0*.32,w0*.64,z0*.32,0,z1*.32,w1*.64,z1*.32],2));g.computeVertexNormals();parts.push(geo(g,b.foot?paving:asphalt));
   const rz0=Math.min(z0,railSpan.start),rz1=Math.max(z1,railSpan.end);
   if(rz0>rz1)for(const side of[-1,1]){
    const rw0=D.width(b,rz0)/2,rw1=D.width(b,rz1)/2,ry0=D.elevation(b,rz0),ry1=D.elevation(b,rz1);
    rails.push(rod([b.x+side*(rw0+.035),ry0-.12,rz0],[b.x+side*(rw1+.035),ry1-.12,rz1],.10,.10,stone,4));
    if(!b.foot||z0>-37.3||z1<-63.3)for(const h of b.foot?[.22,.43]:[.18,.39])rails.push(rod([b.x+side*(rw0-.06),ry0+h,rz0],[b.x+side*(rw1-.06),ry1+h,rz1],.018,.018,b.foot?blue:iron,5));
   }
   if(!b.foot&&i%4<2)markings.push(rod([b.x,y0+.003,z0],[b.x,y1+.003,z1],.022,.022,paint,4));
  }
  surface(b.id+' arched bridge deck',parts,true);surface(b.id+' edge and lane detail',[...rails,...markings]);
  for(let z=railSpan.start;z>railSpan.end;z-=1.25)if(!b.foot||z>-37.3||z<-63.3)for(const side of[-1,1]){const x=b.x+side*(D.width(b,z)/2-.06),y=D.elevation(b,z);surface(b.id+' railing post',[rod([x,y,z],[x,y+.44,z],.023,.023,b.foot?blue:iron,6)]);}
  // Thin collision walls follow the camber and leave the entire deck traversable.
  for(let z0=railSpan.start;z0>railSpan.end;z0-=1){const length=Math.min(1,z0-railSpan.end),z=z0-length/2,y=D.elevation(b,z),contactLength=b.foot?1.05:length;for(const side of[-1,1])add(b.id+' guardrail',mesh('District115 guardrail contact '+serial,[box([0,.27,0],[.055,.54,contactLength],b.foot?blue:stone)]),[b.x+side*(D.width(b,z)/2-.025),y,z],{contactOnly115:true,collider107:{center:[0,.27,0],size:[.055,.54,contactLength]}});}
  if(b.foot){
   counts.restoredBridgeMembers=restoreBlueBridge({doc,original,geo,surface,b,D});
  }else{
   const source=model('bridge').clone();source.setName('District115 adapted supplied '+b.id+' bridge');
   source.setExtras({});for(const original of source.listPrimitives()){const p=original.clone();source.removePrimitive(original).addPrimitive(p);const a=p.getAttribute('POSITION').clone(),arr=Float32Array.from(a.getArray());for(let i=0;i<arr.length;i+=3){arr[i+1]+=D.elevation(b,arr[i+2]-50.4)-.10;arr[i+2]-=50.4;arr[i]+=b.x;}a.setArray(arr);p.setAttribute('POSITION',a);}
   add(b.id+' supplied bridge structure',source);
  }
 }
 prism('far bank continuous road',[15.9,-.1475,-69.6],[231,.04,4.8],asphalt,true);
 prism('west bridge far bank approach',[-33.3,-.1475,-69.9],[3.3,.04,8.2],asphalt,true);
 const farMarkings=[];for(let x=-98;x<131;x+=2)farMarkings.push(box([x,-.124,-69.6],[.85,.004,.038],paint));surface('far bank lane markings',farMarkings);
 // The landing stops at the far road's kerb line (z -67.2); it used to run
  // 1.05 m on into the road.
  prism('footbridge far landing',[-6.3,-.067,-66.475],[2.2,.08,1.45],paving,true);
 // Park lawns leave broad, connected paths around the gallery and exhibition wing.
 for(const [x,z,w,d]of[[-27.6,23,5.8,21],[-27,-5,6.2,34],[-17.5,-26,20,9]])prism('park lawn',[x,-.050,z],[w,.035,d],grass,true);
 surface('park path joined pavers',[geo(createParkPathGeometry(),await createPaverMaterial({material,texture}))],true);
 function supplied(name,x,z,yaw=0,y=-.021){const m=prop(name),size=m.getExtras().propBounds115.size;add('supplied '+name,m,[x,y,z],{collider107:{center:[0,size[1]/2,0],size}},yaw);counts.suppliedProps++;}
 for(const [x,z,yaw]of parkBenches){supplied('ParkBenchLong',x,z,yaw);counts.parkBenches++;}
 for(const [x,z]of[[-29.8,29],[-29.8,9],[-26.2,-20],[-12,-23.8],[2,-34.5],[20,-34.5],[40,-34.5],[60,-34.5]])supplied('TrashCanCap',x,z);
 for(const [x,z]of[[-30.8,37],[63.9,36],[28,38.6]])supplied('PostBox',x,z);
 for(const x of[24,48,-43,83])supplied('FireHydrant',x,39.25,0,-.099);
 for(const x of[-43,-17,24,44,81])supplied('ParkingMeter',x,39.1,Math.PI,-.099);
 supplied('Dumpster',-37.8,16,Math.PI/2,-.099);
 let seed=115;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const leafMats=[[.65,.22,.05,1],[.86,.54,.10,1],[.55,.12,.035,1]].map((c,i)=>material('District115 fallen leaf '+i,c));
 const litterParts=[];for(let i=0;i<85;i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*.94,s=.025+random()*.035,g=new T.CircleGeometry(s,5);g.scale(1,.63,1);g.rotateZ(random()*6.28);g.rotateX(-Math.PI/2);g.translate(Math.cos(a)*r,.002+random()*.006,Math.sin(a)*r);litterParts.push(geo(g,leafMats[i%3]));}
 const litter=mesh('District115 shared scattered fallen leaves',litterParts);
 const green=model('tree').clone(),greenTextures=new Map();green.setName('District115 green maple');for(const original of green.listPrimitives()){const p=original.clone();green.removePrimitive(original).addPrimitive(p);const m=p.getMaterial().clone();if(/leaf/i.test(m.getName())){const source=m.getBaseColorTexture();if(source){if(!greenTextures.has(source))greenTextures.set(source,await texture('District115 green maple leaves',await sharp(source.getImage()).modulate({hue:75,saturation:.7}).png().toBuffer()));m.setBaseColorTexture(greenTextures.get(source));}}p.setMaterial(m);}green.setExtras({farMesh114:model('tree far').getName()});
 const occupied=scene.listChildren().filter(n=>n.getExtras().tree||n.getExtras().detail111==='trees'||n.getName().startsWith('District115 supplied')).map(n=>n.getTranslation());
 const lights=scene.listChildren().filter(n=>n.getExtras().trafficSignal108||['streetlights','lanterns'].includes(n.getExtras().furnishing107)).map(n=>n.getTranslation());
 const placements=[];
 function tree(x,z,y=-.099,park=false,red=false,bankColor=null){
  if(D.inWater(x,z)||D.bridgeAt(x,z)||lights.some(p=>Math.hypot(x-p[0],z-p[2])<3.7)||occupied.some(p=>Math.hypot(x-p[0],z-p[2])<1.55))return;
  const i=counts.trees++,scale=.76+random()*.32,m=bankColor==='green'?green:bankColor==='gold'?model('yellow tree'):bankColor==='red'||red?model('tree'):i%7===0?green:i%2?model('yellow tree'):model('tree');
  add(bankColor?'riverbank '+bankColor+' tree':red?'riverwalk red autumn tree':'sidewalk '+(i%7===0?'green':'autumn')+' tree',m,[x,y,z],{tree:true,vegetation115:true,riverwalkTree115:red,riverbankTree123:bankColor,collider107:{center:[0,.55,0],size:[.12,1.1,.12]}},random()*Math.PI*2,[scale,scale,scale]);
  add('fallen leaves',litter,[x,y+.012,z],{},random()*6.28,[1.15,1,1.15]);counts.leafPatches++;occupied.push([x,y,z]);placements.push({x,z,park,riverwalk:red});
 }
 for(const [x0,x1,z0,z1]of[[-26.2,-25,14,32],[-30,-29,-28,32],[-26,-9,-29,-21]])for(let x=x0;x<x1;x+=3.8)for(let z=z0;z<z1;z+=3.9){if(Math.abs(z-24)<1.2||Math.abs(z+25)<1.2)continue;tree(x+(random()-.5)*.35,z+(random()-.5)*.4,-.021,true);}
 for(const road of roadRecords){const axis=/^City_street_x/.test(road.name)?2:0,cross=axis===0?2:0;for(let q=road.lo[axis]+4;q<road.hi[axis]-3;q+=5.4)for(const side of[-1,1]){const c=side<0?road.lo[cross]-.65:road.hi[cross]+.65,x=axis===0?q:c,z=axis===0?c:q;
   if(x>-31&&x<65&&z>-33&&z<34)continue;if(junctions.some(j=>Math.hypot(x-j.x,z-j.z)<4.2))continue;
   // Do not plant on another roadway at a T junction.
   if(roadRecords.some(r=>x>r.lo[0]-.22&&x<r.hi[0]+.22&&z>r.lo[2]-.22&&z<r.hi[2]+.22))continue;tree(x,z);
  }}
 // Keep trunks and beds outside the river pedestrian movement band.
 for(const x of[-24,-10,7.8,21.8,36.8,44.3,53.8])tree(x,-31.35,-.021,false,true);
 // Plant behind the black rail, leaving the promenade and bridge mouths open.
 for(const [i,x]of[-19,-10,-2,2,11,22,32,44,55].entries())tree(x,-38.02,-.015,false,false,['green','gold','green','red'][i%4]);
 counts.riverbankTrees=scene.listChildren().filter(n=>n.getExtras().riverbankTree123).length;
 counts.redRiverwalkTrees=placements.filter(p=>p.riverwalk).length;
 const hospitalTreeMoves122=clearHospitalTrees122({scene,original,worldBounds,placements});
 Object.assign(counts,addTreeSoilBeds({scene,original,worldBounds,add,mesh,geo,soil:mulch}));
 return {counts,junctions:junctions.map(({x,z,wx,wz})=>({x,z,wx,wz})),bridges:D.bridges,river:D.river,placements,hospitalTreeMoves122};
}
