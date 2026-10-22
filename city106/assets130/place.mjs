import fs from 'node:fs';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';
import {addInterior130} from './interior.mjs';
import {schoolBusPose131,squareCorner131} from '../lighting131/layout.mjs';

export async function replaceAssets130(ctx){
 const {doc,scene,original,worldBounds,hidden,assets,manifest,signals,mesh,geo,box,rod,material,texture}=ctx;
 const report={sources:[...manifest,{name:'cobblestone-surface',archive:'cobblestone-floor-texture.zip'}],benches:[],bins:[],schoolBuses:[],signals:[],grassAreas:[],grassTufts:0,flowers:0,streetNames:0,sidewalkModules:0,retired131:squareCorner131(ctx),streetBoards131:[]};
 const buffer=doc.getRoot().listBuffers()[0],acc=(v,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(v);
 function bounds(m){const b=new T.Box3();for(const p of m.listPrimitives()){const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++)b.expandByPoint(new T.Vector3(...a.getElement(i,[])));}return b;}
 function transformMesh(m,transform,name=m.getName()){
  const out=doc.createMesh(name).setExtras(m.getExtras()),normal=new T.Matrix3().getNormalMatrix(transform);
  for(const p of m.listPrimitives()){const g=p.clone();for(const [attr,size]of[['POSITION',3],['NORMAL',3]]){const a=p.getAttribute(attr),arr=new Float32Array(a.getArray());for(let i=0;i<a.getCount();i++){const v=new T.Vector3(...a.getElement(i,[]));attr==='POSITION'?v.applyMatrix4(transform):v.applyNormalMatrix(normal);arr.set(v.toArray(),i*size);}g.setAttribute(attr,acc(arr,'VEC3'));}out.addPrimitive(g);}return out;
 }
 function put(name,model,p,yaw=0,extra={},scale=[1,1,1]){const n=doc.createNode(name).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale(scale).setExtras({cityProp:true,asset130:model.getName(),...extra});scene.addChild(n);return n;}
 function replace(n,key){const m=assets[key],b=bounds(m),s=b.getSize(new T.Vector3()).toArray(),c=b.getCenter(new T.Vector3()).toArray();n.setMesh(m).setScale([1,1,1]).setExtras({...n.getExtras(),asset130:key,collider107:{center:c,size:s}});return {name:n.getName(),asset:key,p:n.getTranslation()};}
 const existing=[...scene.listChildren()];let benchSerial=0,binSerial=0;
 for(const n of existing){
  if(!n.getMesh()||n.getExtras().life111||n.getExtras().contactOnly115)continue;
  const e=n.getExtras(),type=e.furnishing107||e.detail109||e.detail111||e.block126||'',name=n.getName();
  if(/bench/i.test(type)||/^City106 riverwalk bench|District115 supplied ParkBenchLong/.test(name))report.benches.push(replace(n,['bench-metro','bench-soviet','bench-002'][benchSerial++%3]));
  if(/^(bins|bin)$/.test(type)||/District115 supplied TrashCanCap/.test(name))report.bins.push(replace(n,['street-bin','wood-bin','recycle-blue','recycle-green'][binSerial++%4]));
  if(/District115 supplied Dumpster/.test(name))replace(n,'dumpster');
  if(type==='flowerKiosks'){replace(n,'flowers');report.flowers++;}
  if(e.furnishing107==='plants'||e.block126==='grasses'){n.setMesh(assets['grass-tuft']).setScale([2.2,2.2,2.2]).setExtras({...e,asset130:'grass-tuft',vegetation115:true});}
 }
 // The supplied model faces -Z; traffic yaw describes the forward +Z axis.
 for(const n of original.getRoot().listNodes())if(n.getMesh()&&n.getExtras().kind==='schoolBusDetailed'){
  const pose=schoolBusPose131(n,worldBounds),{scale,p,modelYaw}=pose,b=bounds(assets['school-bus']);
  hidden.push(n.getName());report.retired131.push(n.getName()+'_body_collider',n.getName()+'_contact_patch');
  put('Supplied130 '+n.getName(),assets['school-bus'],p,modelYaw,{schoolBus130:true,collider107:{center:b.getCenter(new T.Vector3()).toArray(),size:b.getSize(new T.Vector3()).toArray()}},[scale,scale,scale]);report.schoolBuses.push({original:n.getName(),...pose});
 }
 const signalModels=[],signalFootings=[];
 for(const key of['signal-american','signal-sinowatcher']){
  const source=assets[key],low=[];
  for(const p of source.listPrimitives()){const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++){const v=a.getElement(i,[]);if(v[1]<.035)low.push(v);}}
  const anchor=[0,2].map(k=>low.reduce((s,v)=>s+v[k],0)/low.length),m=transformMesh(source,new T.Matrix4().makeTranslation(-anchor[0],0,-anchor[1]),key+' anchored');
  const footing=doc.createMesh(key+' fixed footing');
  for(const p of [...m.listPrimitives()]){
   const name=p.getMaterial().getName();
   if(/concrete$/.test(name)){m.removePrimitive(p);footing.addPrimitive(p);continue;}
   if(key==='signal-sinowatcher'&&/Material\.013$/.test(name)){
    const y=p.getAttribute('POSITION').getMin([])[1],color=y>1.5?'red':y>1.3?'yellow':'green';
    p.setMaterial(p.getMaterial().clone().setName('Supplied130 '+color+' signal lens').setBaseColorTexture(null).setExtras({trafficLens108:color}));
   }else if(key==='signal-american'&&/phong1$/.test(name)){
    const a=p.getAttribute('POSITION'),ids=p.getIndices().getArray();m.removePrimitive(p);
    for(const [i,color]of['green','yellow','red'].entries()){
     const selected=[];for(let t=0;t<ids.length;t+=3){const y=(a.getElement(ids[t],[])[1]+a.getElement(ids[t+1],[])[1]+a.getElement(ids[t+2],[])[1])/3;if(Math.max(0,Math.min(2,Math.floor((y-2.43)/.12)))===i)selected.push(...ids.slice(t,t+3));}
     if(selected.length)m.addPrimitive(p.clone().setIndices(acc(new Uint32Array(selected),'SCALAR')).setMaterial(p.getMaterial().clone().setName('Supplied130 '+color+' signal lens').setBaseColorTexture(null).setExtras({trafficLens108:color})));
    }
   }
  }
  // The pedestrian button moves with the pole if it is knocked over.
  const polara=transformMesh(assets.polara,new T.Matrix4().makeTranslation(0,.38,.095));for(const p of polara.listPrimitives())m.addPrimitive(p.clone());
  signalModels.push(m);signalFootings.push(footing);
 }
 for(const [i,s]of signals.placements.entries()){
  const n=scene.listChildren().find(n=>n.getName()===s.name);n.setMesh(signalModels[i%2]).setExtras({...n.getExtras(),asset130:i%2?'signal-sinowatcher':'signal-american'});report.signals.push({name:s.name,asset:n.getExtras().asset130});
  if(signalFootings[i%2].listPrimitives().length)put('Supplied130 fixed concrete footing '+i,signalFootings[i%2],s.p,s.yaw,{fixed130:true});
 }
 const sourceFile=(id,name)=>new URL('../../../work/assets130/source/'+id+'/textures/'+name,import.meta.url).pathname;
 const paving=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 paving');
 const crop={left:900,top:1400,width:600,height:450};
 paving.setBaseColorTexture(await texture('Supplied130 concrete surface',await sharp(sourceFile('sidewalks','SidewalkMat_albedo.jpg')).extract(crop).resize(1024,1024).png().toBuffer())).setNormalTexture(await texture('Supplied130 concrete normal',await sharp(sourceFile('sidewalks','SidewalkMat_normal.png')).extract(crop).resize(1024,1024).png().toBuffer())).setBaseColorFactor([1,1,1,1]).setExtras({surfaceType:19});
 const cobble=material('Supplied130 cobblestone',[1,1,1,1],await texture('Supplied130 scanned cobblestone',await sharp(sourceFile('cobblestone-floor-texture','scan_cobble_basecolor.jpg')).resize(1024,1024).png().toBuffer()),0,.86).setNormalTexture(await texture('Supplied130 scanned cobblestone normal',await sharp(sourceFile('cobblestone-floor-texture','scan_cobble_normal.jpg')).resize(1024,1024).png().toBuffer()));
 for(const m of doc.getRoot().listMaterials()){
  if(/Park116 staggered|District115 park path/i.test(m.getName()))m.setBaseColorTexture(paving.getBaseColorTexture()).setNormalTexture(paving.getNormalTexture()).setBaseColorFactor([1,1,1,1]).setMetallicFactor(0).setRoughnessFactor(.81).setExtras({...m.getExtras(),surfaceType:19});
  else if(/Block126.*pav|District115.*pav/i.test(m.getName()))m.setBaseColorTexture(cobble.getBaseColorTexture()).setNormalTexture(cobble.getNormalTexture()).setBaseColorFactor([1,1,1,1]).setExtras({...m.getExtras(),surfaceType:0});
 }
 const lawnFile=new URL('./lawn.png',import.meta.url).pathname;
 const grass=material('Supplied130 lawn',[.78,.93,.62,1],await texture('Supplied130 grass overhead',fs.readFileSync(lawnFile)),0,.96).setExtras({surfaceType:9});
 const lawnAreas=[];
 for(const n of original.getRoot().listNodes())if(n.getMesh()&&(n.getExtras().kind==='cityLandscape'||/^Riverfront_planted_bank_strip$|^City_pocket_park_/.test(n.getName()))){
  const b=worldBounds(n);if(b.hi[1]-b.lo[1]<.35&&b.hi[0]-b.lo[0]>.5&&b.hi[2]-b.lo[2]>.5){report.grassAreas.push(n.getName());lawnAreas.push({name:n.getName(),...b});}
 }
 for(const n of existing)if(n.getMesh()&&/park lawn/.test(n.getName())){
  const world=new T.Matrix4().fromArray(n.getWorldMatrix());
  for(const p of n.getMesh().listPrimitives()){
   const positions=p.getAttribute('POSITION'),uv=new Float32Array(positions.getCount()*2);
   for(let i=0;i<positions.getCount();i++){const v=new T.Vector3(...positions.getElement(i,[])).applyMatrix4(world);uv.set([v.x/1.2,v.z/1.2],i*2);}
   p.setMaterial(grass).setAttribute('TEXCOORD_0',acc(uv,'VEC2'));
  }
  const b=bounds(n.getMesh()).applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix()));lawnAreas.push({name:n.getName(),lo:b.min.toArray(),hi:b.max.toArray()});
 }
 let seed=130;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 for(const area of lawnAreas){
  const [lo,hi]=[area.lo,area.hi],areaSize=(hi[0]-lo[0])*(hi[2]-lo[2]),count=Math.min(50,Math.ceil(areaSize*.5));
  for(let i=0;i<count;i++){
   const x=lo[0]+.12+rand()*Math.max(0,hi[0]-lo[0]-.24),z=lo[2]+.12+rand()*Math.max(0,hi[2]-lo[2]-.24),p=[x,hi[1]+.002,z];
   if(x>-30&&x<-24&&Math.abs(z-23)<.75||x>-30&&x<-24&&Math.abs(z+5)<.75)continue;
   put('Supplied130 lawn tuft '+report.grassTufts++,assets['grass-small'],p,rand()*Math.PI*2,{vegetation115:true},[1.5,.65+rand()*.25,1.5]);
  }
 }
 // Small forecourts use the source sidewalk geometry and its authored edge UVs.
 for(const [x,z]of[[-27.3,17.6],[-27.3,10],[-26.8,-12.1]]){put('Supplied130 sidewalk approach '+report.sidewalkModules++,assets['sidewalk-module'],[x,-.083,z],0,{surface115:true});}
 const signMetal=material('Supplied130 sign aluminum',[.3,.34,.35,1],null,.8,.4);
 for(const [i,j]of signals.intersections.entries()){
  const eastWest=j.z>50?'MICHIGAN ST':j.z>30?'LYON ST':j.z<-50?'BRIDGE ST':'PEARL ST',northSouth=j.x>65?'MONROE AVE':j.x<-60?'SCRIBNER AVE':'FRONT AVE';
  const s=signals.placements.find(s=>s.intersection===j.id);if(!s)continue;
  for(const [k,text]of[eastWest,northSouth].entries()){
   const bytes=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="192"><rect width="1024" height="192" rx="16" fill="#1d573d"/><rect x="8" y="8" width="1008" height="176" rx="14" stroke="#e4eadc" stroke-width="7" fill="none"/><text x="512" y="128" font-family="Arial" font-size="99" font-weight="bold" text-anchor="middle" fill="#f4f5ed">${text}</text></svg>`)).flip().png().toBuffer();
   const mat=material('Supplied130 street name '+i+' '+k,[1,1,1,1],await texture(text,bytes),.3,.45),parts=[box([0,0,0],[.92,.175,.016],signMetal)];
   for(const side of[-1,1]){const g=new T.PlaneGeometry(.90,.167);if(side<0)g.rotateY(Math.PI);g.translate(0,0,side*.009);parts.push(geo(g,mat));}
   const node=scene.listChildren().find(n=>n.getName()===s.name),assembly=node.getMesh().clone().setName('Supplied130 named signal '+i+' '+k);
   const center=k?[.08,3.25,.53]:[.53,3.02,.08];
   parts.push(rod([-.52,0,-.08],[-.52,.12,-.08],.015,.015,signMetal));
   const board=transformMesh(mesh(text,parts),new T.Matrix4().makeTranslation(...center).multiply(new T.Matrix4().makeRotationY(-k*Math.PI/2)));
   if(k===0){const extension=mesh('Street sign mounting extension',[rod([0,1.85,0],[0,3.36,0],.018,.018,signMetal)]);for(const p of extension.listPrimitives())assembly.addPrimitive(p.clone());}
   for(const p of board.listPrimitives())assembly.addPrimitive(p.clone());node.setMesh(assembly);report.streetNames++;
   report.streetBoards131.push({signal:s.name,text,center,yaw:-k*Math.PI/2});
  }
 }
 // Use the supplied stop-sign model only on local, unsignalized side streets.
 for(const [x,z,yaw]of[[-55,58.8,0],[91.5,58.8,0]])put('Supplied130 local stop '+x,assets['street-signal'],[x,-.099,z],yaw,{street128:'signs',collider107:{center:[0,.7,0],size:[.08,1.4,.08]}});
 report.interior=await addInterior130(ctx);
 return report;
}
