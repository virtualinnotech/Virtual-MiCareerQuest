import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {Document,NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {dedup,prune} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../../work/browser/node_modules/meshoptimizer/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import * as T from '../../pc66/vendor/three/three.core.js';

const dir=path.dirname(fileURLToPath(import.meta.url)),source=path.resolve(dir,'../../../work/traffic114');
const {values}=parseArgs({options:{'output-dir':{type:'string'}}}),outputDir=values['output-dir']?path.resolve(values['output-dir']):dir;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Optimized supplied traffic models');
await MeshoptSimplifier.ready;
const configs=[
 {id:'classic',file:'65-chevy-malibu',length:1.53,flip:true,wheel:/^(Front|Rear)_(Tires|Wheel|Lug_Nuts|Drum_Brake)/,omit:/Steering|Seat|Interior|Carpet/,paint:/Car_Paint/,budget:10000},
 {id:'taxi',file:'taxi-2',length:1.45,flip:true,wheel:/^lgnW/,omit:/lgnSteer/,paint:/^body$/,wholeWheel:/^rim$/,budget:9500},
 {id:'suv',file:'1978-chevrolet-blazer-k5-cheyenne',length:1.52,flip:true,wheel:/Wheel_/,paint:/CarPaint/,budget:11000},
 {id:'pickup',file:'2024-ford-f-150-raptor-r',length:1.88,wheel:/Ani_(Wheel_[BF][LR]82|Disc_Scale_FR)/,omit:/Caliper|Steering|Interior|Seatbelt/i,omitMaterial:/Int_T|costuras|Leather_Int|Dashb|ENG_T|METAL_ENG/,paint:/pa+int|bodypaint/i,budget:14000},
 {id:'police',file:'ford-police-car',length:1.62,wheel:/^Vert\.00[1-8]$/,omitMaterial:/^Int$/,budget:12000},
 {id:'sedan',file:'mercedes-e-class-w212',length:1.50,flip:true,wheel:/mesh_Wheel/,omit:/SteeringWheel/,omitMaterial:/salon|seats|interior/i,paint:/mat_body/,budget:12000},
 {id:'van',file:'mercedes-benz-sprinter-2006',length:2.12,wheel:/^Cylinder/,omit:/Interieur/,paint:/Carrosserie/,budget:10500},
 {id:'delivery',file:'delivery-truck-burnout-3',length:2.35,wheel:/^Car18_Wheel_000/,omit:/Wheel_(LOD|Moving)/,budget:3000},
 // Characters normalize a 1.78 m body to .72 world units; this source bus is in metres.
 {id:'bus',file:'bus',worldScale:.72/1.78,budget:18000,bus:true}
];
const bounds=positions=>{
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<positions.length;i+=3)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],positions[i+k]);hi[k]=Math.max(hi[k],positions[i+k]);}
 return {lo,hi,center:lo.map((x,k)=>(x+hi[k])/2)};
};
const manifest={version:117,models:[],sourceTriangles:0,triangles:0};
function clipZ(poly,z,sign){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[2]-z)*sign,db=(b[2]-z)*sign;if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(a.map((v,k)=>v+(b[k]-v)*da/(da-db)));}return out;}
for(const cfg of configs){
 const original=await io.read(path.join(source,'converted',cfg.file+'.glb')),records=[],worldBox=new T.Box3(),v=new T.Vector3();
 for(const node of original.getRoot().listNodes()){
  if(!node.getMesh()||cfg.omit?.test(node.getName()))continue;
  const matrix=new T.Matrix4().fromArray(node.getWorldMatrix()),normalMatrix=new T.Matrix3().getNormalMatrix(matrix);
  for(const p of node.getMesh().listPrimitives()){
   const mat=p.getMaterial();if(cfg.omitMaterial?.test(mat.getName()))continue;
   const pos=Float32Array.from(p.getAttribute('POSITION').getArray()),norm=Float32Array.from(p.getAttribute('NORMAL').getArray()),uv=Float32Array.from(p.getAttribute('TEXCOORD_0')?.getArray()||new Float32Array(pos.length/3*2));
   for(let i=0;i<pos.length;i+=3){v.fromArray(pos,i).applyMatrix4(matrix).toArray(pos,i);worldBox.expandByPoint(v);v.fromArray(norm,i).applyNormalMatrix(normalMatrix).toArray(norm,i);}
   const uvTransform=mat.getBaseColorTextureInfo()?.getExtension('KHR_texture_transform');
   if(uvTransform){const [sx,sy]=uvTransform.getScale(),[ox,oy]=uvTransform.getOffset(),a=uvTransform.getRotation();for(let i=0;i<uv.length;i+=2){const x=uv[i]*sx,y=uv[i+1]*sy;uv[i]=ox+Math.cos(a)*x-Math.sin(a)*y;uv[i+1]=oy+Math.sin(a)*x+Math.cos(a)*y;}}
   const idx=Uint32Array.from(p.getIndices()?.getArray()||Array.from({length:pos.length/3},(_,i)=>i));
   if(matrix.determinant()<0)for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];
   records.push({name:node.getName(),mat,pos,norm,uv,idx,wheel:cfg.wheel?.test(node.getName())});
  }
 }
 const sourceLength=worldBox.max.z-worldBox.min.z,scale=cfg.worldScale??cfg.length/sourceLength,length=cfg.length??sourceLength*scale;
 const center=worldBox.getCenter(new T.Vector3()),flip=cfg.flip?-1:1;
 const transformPoint=a=>[(a[0]-center.x)*scale*flip,(a[1]-worldBox.min.y)*scale,(a[2]-center.z)*scale*flip];
 const articulation117=cfg.bus?{rearZ:transformPoint([center.x,0,-11.270101])[2],frontZ:transformPoint([center.x,0,-9.670121])[2],hingeZ:transformPoint([center.x,0,-10.470111])[2],hingeY:(.462-worldBox.min.y)*scale}:null;
 const groups=new Map(),materialCache=new Map(),textureCache=new Map();
 const wheelStations=[];
 for(const r of records.filter(r=>r.wheel)){
  const b=bounds(r.pos),z=(b.center[2]-center.z)*scale*flip;
  if(!wheelStations.some(q=>Math.abs(q-z)<length*.09))wheelStations.push(z);
 }
 if(cfg.bus)wheelStations.push(...[-3.43844,-8.61691,-15.33343].map(z=>(z-center.z)*scale));
 wheelStations.sort((a,b)=>a-b);
 for(const r of records){
  for(let i=0;i<r.pos.length;i+=3){r.pos.set(transformPoint(r.pos.subarray(i,i+3)),i);r.norm[i]*=flip;r.norm[i+2]*=flip;}
  const materialName=r.mat.getName(),brake=/tailight|Glass_Red|lightred|chromered|tail_light/i.test(materialName)&&!r.wheel;
  for(let i=0;i<r.idx.length;i+=3){
   const ids=[r.idx[i],r.idx[i+1],r.idx[i+2]],p=[0,1,2].map(k=>ids.reduce((s,j)=>s+r.pos[j*3+k],0)/3);
   let role=brake?'brake':'body';
   if(!r.wheel&&/headlight|Phare|mat_lights|^Light(_glass)?$/i.test(materialName)){
    if(p[2]>length*.30)role='headlight';
    else if(p[2]<-length*.30)role='brake';
   }
   if(r.wheel)role='wheel-'+(p[0]<0?'L':'R')+'-'+wheelStations.reduce((best,z,j)=>Math.abs(z-p[2])<Math.abs(wheelStations[best]-p[2])?j:best,0);
   if(cfg.bus){
    const raw=[p[0]/scale+center.x,p[1]/scale+worldBox.min.y,p[2]/scale+center.z];
    const axle=[-3.43844,-8.61691,-15.33343].findIndex(z=>Math.hypot(raw[1]-.462,raw[2]-z)<.495);
    const wheelMat=/^(_Color_009_2|M_808080ff|_Color_003_1|M_323232ff_Visible_Black|B22222ff1)$/.test(materialName);
    if(wheelMat&&axle>=0&&Math.abs(raw[0]-center.x)>.80)role='wheel-'+(p[0]<0?'L':'R')+'-'+(2-axle);
    // The supplied bus includes a fully modeled passenger cabin. Keep the outer shell only.
    else if(!/Gaiter/.test(materialName)&&Math.abs(raw[0]-center.x)<1.12&&raw[1]>.6&&raw[1]<2.64&&raw[2]<-2.2&&raw[2]>-17.9)continue;
    if(/^Color_A0[47]$/.test(materialName)&&raw[2]<-18.6)role='brake';
   }
   const triangle=ids.map(j=>[...r.pos.subarray(j*3,j*3+3),...r.norm.subarray(j*3,j*3+3),...r.uv.subarray(j*2,j*2+2)]),pieces=[];
   if(cfg.bus&&role==='body'){
    const {rearZ,frontZ}=articulation117;
    pieces.push(['rear',clipZ(triangle,rearZ,-1)],['body',clipZ(triangle,frontZ,1)]);
    // Subdivide the bellows for continuous two-bone skinning, including any crossing trim.
    for(let q=0;q<12;q++)pieces.push(['joint',clipZ(clipZ(triangle,rearZ+(frontZ-rearZ)*q/12,1),rearZ+(frontZ-rearZ)*(q+1)/12,-1)]);
   }else pieces.push([role,triangle]);
   for(const [pieceRole,poly]of pieces){
    if(poly.length<3)continue;
    const key=pieceRole+'|'+materialName;
    if(!groups.has(key))groups.set(key,{role:pieceRole,mat:r.mat,vertices:[],indices:[],lookup:new Map()});
    const g=groups.get(key);
    for(let t=1;t+1<poly.length;t++)for(const data of[poly[0],poly[t],poly[t+1]]){
     const k=data.map(x=>Math.round(x*1e6)).join(',');let index=g.lookup.get(k);
     if(index===undefined){index=g.vertices.length/8;g.lookup.set(k,index);g.vertices.push(...data);}g.indices.push(index);
    }
   }
  }
 }
 async function material(old,role){
  const key=old.getName()+'|'+role;if(materialCache.has(key))return materialCache.get(key);
  const name=old.getName(),isWheel=role.startsWith('wheel'),glass=/glass|window|vitre/i.test(name)&&!/light|sign/i.test(name),chrome=/chrome|aluminum|steel|rim/i.test(name)&&!(isWheel&&cfg.wholeWheel?.test(name)),paint=!isWheel&&cfg.paint?.test(name);
  // wholeWheel: one material covering rim and tyre (the taxi's "rim"), shaded as a tyre, not chrome.
  const m=doc.createMaterial(cfg.id+' '+name+' '+role).setDoubleSided(true),color=[...old.getBaseColorFactor()];color[3]=1;
  m.setBaseColorFactor(color).setMetallicFactor(chrome?.75:paint?.30:0).setRoughnessFactor(glass?.12:chrome?.24:paint?.22:isWheel?.65:.48);
  const policePaint=cfg.id==='police'&&!isWheel&&/^(Body|Car|Car_white)$/.test(name);
  let surface=paint||policePaint?21:glass?22:chrome?23:0;
  if(policePaint)m.setBaseColorFactor([.88,.90,.91,1]).setMetallicFactor(.28).setRoughnessFactor(.22);
  if(glass)m.setBaseColorFactor([.048,.075,.088,1]);
  if(paint&&!old.getBaseColorTexture())m.setBaseColorFactor([.66,.69,.72,1]);
  if(role==='brake'){m.setBaseColorFactor([.26,.006,.004,1]).setEmissiveFactor([.025,.001,0]);surface=0;}
  if(role==='headlight'){m.setBaseColorFactor([.56,.64,.69,1]).setEmissiveFactor([.18,.19,.20]).setMetallicFactor(.35).setRoughnessFactor(.24);surface=23;}
  let image=old.getBaseColorTexture()?.getImage(),imageName=old.getBaseColorTexture()?.getName();
  if(cfg.id==='delivery'&&name==='Heavy18'){image=fs.readFileSync(path.join(source,'source',cfg.file,'textures/Heavy18.png'));imageName='Heavy18';}
  if(image&&!glass&&!policePaint&&role!=='brake'&&role!=='headlight'){
   if(!textureCache.has(imageName)){
    let raster=sharp(image).resize({width:cfg.bus?512:768,height:cfg.bus?512:768,fit:'inside',withoutEnlargement:true}).flatten({background:'#404348'});
    if(paint&&cfg.id!=='taxi'){const stats=await sharp(image).greyscale().stats();raster=raster.greyscale().linear(Math.min(3,200/Math.max(1,stats.channels[0].mean)));}
    const bytes=await raster.jpeg({quality:82,mozjpeg:true}).toBuffer();
    textureCache.set(imageName,doc.createTexture(cfg.id+' '+imageName).setImage(bytes).setMimeType('image/jpeg'));
   }m.setBaseColorTexture(textureCache.get(imageName));
  }
  m.setExtras({vehicleSurface114:surface,paint114:!!paint&&cfg.id!=='taxi'});materialCache.set(key,m);return m;
 }
 const roles=new Map(),rawTriangles=[...groups.values()].reduce((s,g)=>s+g.indices.length/3,0),ratio=Math.min(1,cfg.budget/rawTriangles);
 const wheels=[];let triangles=0;
 for(const role of new Set([...groups.values()].map(g=>g.role))){
  const roleGroups=[...groups.values()].filter(g=>g.role===role),allPos=roleGroups.flatMap(g=>g.vertices.filter((_,i)=>i%8<3)),b=bounds(allPos),offset=role.startsWith('wheel')?b.center:[0,0,0];
  const model=doc.createMesh(cfg.id+' '+role),far=doc.createMesh(cfg.id+' '+role+' far');roles.set(role,model);
  model.setExtras({farMesh114:far.getName(),...(role==='joint'?{joint117:articulation117}:{})});
  const roleRatio=role.startsWith('wheel')?Math.min(1,750/roleGroups.reduce((s,g)=>s+g.indices.length/3,0)):ratio;
  for(const g of roleGroups){
   const count=g.vertices.length/8,pos=new Float32Array(count*3),attr=new Float32Array(count*5);
   for(let i=0;i<count;i++){for(let k=0;k<3;k++)pos[i*3+k]=g.vertices[i*8+k]-offset[k];for(let k=0;k<5;k++)attr[i*5+k]=g.vertices[i*8+3+k];}
   let indices=new Uint32Array(g.indices),target=Math.max(24,Math.floor(indices.length*roleRatio/3)*3);
   const fine=/glass|window|vitre/i.test(g.mat.getName())?.0004:cfg.paint?.test(g.mat.getName())?.001:.004;
   if(role!=='joint'&&indices.length>target)indices=MeshoptSimplifier.simplifyWithAttributes(indices,pos,3,attr,5,[.1,.1,.1,.25,.25],null,target,cfg.bus?.0004:fine,['Permissive','Prune'])[0];
   const [remap,n]=MeshoptSimplifier.compactMesh(indices),positions=new Float32Array(n*3),normals=new Float32Array(n*3),uvs=new Float32Array(n*2);
   for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff){const j=remap[i];positions.set(pos.subarray(i*3,i*3+3),j*3);normals.set(attr.subarray(i*5,i*5+3),j*3);uvs.set(attr.subarray(i*5+3,i*5+5),j*2);}
   const accessor=(type,array)=>doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
   const primitive=doc.createPrimitive().setAttribute('POSITION',accessor('VEC3',positions)).setAttribute('NORMAL',accessor('VEC3',normals)).setAttribute('TEXCOORD_0',accessor('VEC2',uvs)).setIndices(accessor('SCALAR',indices)).setMaterial(await material(g.mat,role));
   model.addPrimitive(primitive);
   const low=role!=='joint'&&indices.length>12?MeshoptSimplifier.simplify(indices,positions,3,Math.max(12,Math.floor(indices.length*.16/3)*3),.035,['Permissive','Prune'])[0]:indices.slice();
   far.addPrimitive(primitive.clone().setIndices(accessor('SCALAR',low)));
   triangles+=indices.length/3;
  }
  scene.addChild(doc.createNode(cfg.id+' '+role).setMesh(model).setTranslation(offset));
  scene.addChild(doc.createNode(cfg.id+' '+role+' far').setMesh(far).setTranslation(offset));
  if(role.startsWith('wheel'))wheels.push({role,offset,radius:(b.hi[1]-b.lo[1])/2,front:offset[2]===Math.max(...wheelStations)||Math.abs(offset[2]-Math.max(...wheelStations))<length*.10});
 }
 const body=roles.get('body');
 if(cfg.id==='police'){
  const bytes=await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128"><rect width="512" height="128" fill="#eff1f2"/><text x="256" y="94" text-anchor="middle" fill="#10151b" font-family="Arial, sans-serif" font-weight="bold" font-size="96">POLICE</text></svg>')).png().toBuffer();
  const tex=doc.createTexture('Single POLICE door marking').setImage(bytes).setMimeType('image/png'),mat=doc.createMaterial('Police side lettering').setBaseColorTexture(tex).setMetallicFactor(.2).setRoughnessFactor(.25).setDoubleSided(true);
  const positions=[],normals=[],uvs=[],indices=[];
  const clip=(poly,axis,edge,sign)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-edge)*sign,db=(b[axis]-edge)*sign;if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(a.map((v,k)=>v+(b[k]-v)*da/(da-db)));}return out;};
  for(const r of records.filter(r=>!r.wheel&&/^(Body|Car|Car_white)$/.test(r.mat.getName())))for(let i=0;i<r.idx.length;i+=3){
   let poly=Array.from(r.idx.subarray(i,i+3),j=>[...r.pos.subarray(j*3,j*3+3),...r.norm.subarray(j*3,j*3+3)]),side=Math.sign(poly.reduce((s,v)=>s+v[0],0));
   if(poly.some(v=>Math.abs(v[0])<.27)||poly.reduce((s,v)=>s+v[3]*side,0)/3<.65)continue;
   for(const [axis,edge,sign]of[[1,.22,1],[1,.34,-1],[2,-.30,1],[2,.30,-1]])poly=clip(poly,axis,edge,sign);
   for(let k=1;k+1<poly.length;k++)for(const v of[poly[0],poly[k],poly[k+1]]){indices.push(positions.length/3);positions.push(v[0]+side*.002,v[1],v[2]);normals.push(...v.slice(3));uvs.push(.5-side*v[2]/.60,1-(v[1]-.22)/.12);}
  }
  const a=(type,array)=>doc.createAccessor().setType(type).setArray(array).setBuffer(buffer),p=doc.createPrimitive().setAttribute('POSITION',a('VEC3',new Float32Array(positions))).setAttribute('NORMAL',a('VEC3',new Float32Array(normals))).setAttribute('TEXCOORD_0',a('VEC2',new Float32Array(uvs))).setIndices(a('SCALAR',new Uint32Array(indices))).setMaterial(mat);
  body.addPrimitive(p);doc.getRoot().listMeshes().find(m=>m.getName()==='police body far').addPrimitive(p.clone());triangles+=indices.length/3;
 }
 const bb=bounds([...body.listPrimitives(),...(roles.get('rear')?.listPrimitives()||[])].flatMap(p=>Array.from(p.getAttribute('POSITION').getArray()))),spec={id:cfg.id,source:cfg.file+'.zip',length,width:(worldBox.max.x-worldBox.min.x)*scale,height:(worldBox.max.y-worldBox.min.y)*scale,rearZ:bb.lo[2],triangles,sourceTriangles:rawTriangles,wheels,body:body.getName(),brake:roles.get('brake')?.getName(),headlight:roles.get('headlight')?.getName(),rear:roles.get('rear')?.getName(),joint:roles.get('joint')?.getName(),articulation117};
 manifest.models.push(spec);manifest.sourceTriangles+=rawTriangles;manifest.triangles+=triangles;
 console.log(cfg.id,rawTriangles,'->',triangles,'triangles',wheels.map(w=>[w.role,w.offset,w.radius,w.front]));
}
await doc.transform(dedup(),prune());
fs.mkdirSync(outputDir,{recursive:true});
doc.getRoot().setExtras(manifest);await io.write(path.join(outputDir,'fleet.glb'),doc);
fs.writeFileSync(path.join(outputDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Fleet bytes',fs.statSync(path.join(outputDir,'fleet.glb')).size);
