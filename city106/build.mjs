import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {Document,NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import {addFurnishings} from './furnishings.mjs';
import {addTrafficSignals} from './signals.mjs';
import {upgradeMaterials} from './materials109.mjs';
import {addStreetDetails} from './details109.mjs';
import {addCityLife} from './life111.mjs';
import {addArchitecture} from './architecture112.mjs';
import {copyToDocument} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {addLandmark} from './landmark113.mjs';
import {addDistrict} from './district115/build.mjs';
import {addVenueFacade125} from './buildings125/place.mjs';
import {addBlocks126} from './blocks126/build.mjs';
import {createFacadeSkins127,originalBuildings127} from './skins127/build.mjs';
import {addBreakawayRailings} from './street128/build.mjs';
import {loadAssets130} from './assets130/load.mjs';
import {replaceAssets130} from './assets130/place.mjs';
import {addLighting131} from './lighting131/place.mjs';
import {addRiverCorner133} from './gallery133/river-corner.mjs';
import {loadDowntown134,placeDowntown134} from './downtown134/place.mjs';
import {placeSkyline135} from './skyline135/place.mjs';
import {addRiverLights136} from './riverlights136/place.mjs';
import {addTreePits137} from './tree-pits137/build.mjs';
import {addParkRoomBorder137} from './tree-pits137/park-border.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(dir,'../venue-frame.html'),'utf8');
const source=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64'));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),original=await io.readBinary(source);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('City106 detail replacements');
let seed=106;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const rgba=(r,g,b,a=1)=>[r,g,b,a];
async function texture(name,bytes){return doc.createTexture(name).setImage(bytes).setMimeType('image/png');}
function material(name,color,tex=null,metal=0,rough=.8){const m=doc.createMaterial(name).setBaseColorFactor(color).setMetallicFactor(metal).setRoughnessFactor(rough).setDoubleSided(true);if(tex)m.setBaseColorTexture(tex);return m;}
const leafTex=await texture('Photographic maple branch alpha',await sharp(path.join(dir,'maple-source.png')).resize(512,512).png().toBuffer());
const leaves=material('City106 leaves',rgba(.81,.88,.75),leafTex,0,.85).setAlphaMode('MASK').setAlphaCutoff(.42);

async function surfaceTexture(name,mode){
 const size=512,pixels=Buffer.alloc(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const grain=(random()-.5),i=(y*size+x)*4;let c;
  if(mode==='wood'){
   const rings=Math.sin(y*.61+Math.sin(x*.018)*1.5+Math.sin(x*.047)*.45)*5;
   const streak=Math.sin(y*.105+Math.sin(x*.008)*3)*8;
   c=[137+rings+streak+grain*10,100+rings+streak+grain*8,61+rings+streak+grain*7];
  }else if(mode==='bark'){
   const fissure=Math.pow(Math.max(0,Math.sin(x*.16+Math.sin(y*.03)*.55)),12)*36;
   c=[98-fissure+grain*24,88-fissure+grain*20,73-fissure+grain*16];
  }else if(mode==='asphalt'){
   const stone=grain>.4?20:grain*17;
   c=[66+stone,69+stone,71+stone];
  }else{
   const edge=Math.min(x%128,127-x%128,y%128,127-y%128),joint=edge<1?-.26:edge<3?-.08:0;
   const variation=Math.sin(Math.floor(x/128)*3+Math.floor(y/128)*5)*4;
   c=[171,171,164].map(n=>(n+variation+grain*12)*(1+joint));
  }
  for(let k=0;k<3;k++)pixels[i+k]=Math.max(0,Math.min(255,c[k]));pixels[i+3]=255;
 }
 return texture(name,await sharp(pixels,{raw:{width:size,height:size,channels:4}}).png().toBuffer());
}
const bark=material('City106 bark',rgba(.9,.87,.82),await surfaceTexture('Bark fissures','bark'));
const wood=material('City106 oiled teak',rgba(1,1,1),await surfaceTexture('Teak grain','wood'),0,.56);
const iron=material('City106 graphite cast iron',rgba(.042,.048,.047),null,.65,.43);
const bolt=material('City106 steel bolts',rgba(.36,.38,.36),null,.8,.28);
material('City106 asphalt',rgba(1,1,1),await surfaceTexture('Fine asphalt aggregate','asphalt'),0,.94);
material('City106 paving',rgba(1,1,1),await surfaceTexture('Weathered concrete pavers','paving'),0,.86);

// Baked recesses, glazing, blinds and masonry share four small mipmapped tiles.
for(let style=0;style<4;style++){
 const palettes=[['#a19a8a','#d3c8b3'],['#646c70','#a4adb0'],['#825e4f','#b19077'],['#758186','#aab5b8']],p=palettes[style];
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768"><defs><linearGradient id="glass" x2=".7" y2="1"><stop stop-color="#7c969f"/><stop offset=".43" stop-color="#38494e"/><stop offset="1" stop-color="#192b32"/></linearGradient><linearGradient id="stone" x2="0" y2="1"><stop stop-color="${p[1]}"/><stop offset="1" stop-color="${p[0]}"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="106"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".10"/></feComponentTransfer></filter></defs><rect width="512" height="768" fill="url(#stone)"/>`;
 for(let row=0;row<6;row++)for(let col=0;col<4;col++){
  const x=col*128,y=row*128,lit=random()<.12;
  for(let by=0;by<128;by+=style===2?12:32){svg+=`<path d="M${x} ${y+by}h128" stroke="#343b3b" stroke-opacity=".22"/>`;for(let bx=0;bx<128;bx+=style===2?32:64)svg+=`<path d="M${x+bx+(by%24?16:0)} ${y+by}v${style===2?12:32}" stroke="#4a4540" stroke-opacity=".18"/>`;}
  const ww=style===3?112:style===1?98:78,xx=x+(128-ww)/2;
  svg+=`<rect x="${xx-5}" y="${y+13}" width="${ww+10}" height="100" fill="#323937"/><rect x="${xx}" y="${y+17}" width="${ww}" height="91" fill="${lit?'#bca778':'url(#glass)'}"/><path d="M${xx} ${y+17}h${ww}v8h-${ww}" fill="#0c1a21" opacity=".65"/><path d="M${xx+ww/2} ${y+17}v91M${xx} ${y+64}h${ww}" stroke="#161f21" stroke-width="3"/>`;
  if(random()<.65){const bh=12+Math.floor(random()*38);svg+=`<rect x="${xx+2}" y="${y+19}" width="${ww/2-4}" height="${bh}" fill="#a3a59b" opacity=".7"/>`;for(let q=4;q<bh;q+=4)svg+=`<path d="M${xx+2} ${y+19+q}h${ww/2-4}" stroke="#464e4d" stroke-opacity=".45"/>`;}
  svg+=`<path d="M${xx-5} ${y+114}h${ww+10}" stroke="${p[1]}" stroke-width="4"/><path d="M${xx-5} ${y+117}h${ww+10}" stroke="#303635" stroke-opacity=".65" stroke-width="3"/>`;
 }
 svg+='<rect width="512" height="768" filter="url(#grain)" opacity=".6"/></svg>';
 material('City106 facade '+style,rgba(1,1,1),await texture('Facade '+style,await sharp(Buffer.from(svg)).png().toBuffer()),.12,.65);
}

await upgradeMaterials({doc,dir,material});
const geo=(g,m)=>({g,m});
function box(c,s,m,rx=0){const g=new T.BoxGeometry(...s);g.rotateX(rx);g.translate(...c);return geo(g,m);}
function rod(a,b,r0,r1,m,sides=7){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),g=new T.CylinderGeometry(r1,r0,d.length(),sides);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());return geo(g,m);}
function mesh(name,parts){
 const out=doc.createMesh(name),groups=new Map();
 for(const p of parts){if(!groups.has(p.m))groups.set(p.m,[]);groups.get(p.m).push(p.g);}
 for(const [mat,gs]of groups){const a=(data,type)=>doc.createAccessor().setBuffer(buffer).setType(type).setArray(data),attributes={position:[],normal:[],uv:[]},indices=[];let offset=0;
  for(const g of gs){for(const key of Object.keys(attributes))attributes[key].push(...g.attributes[key].array);if(g.index){for(const i of g.index.array)indices.push(i+offset);}else{for(let i=0;i<g.attributes.position.count;i++)indices.push(i+offset);}offset+=g.attributes.position.count;}
  out.addPrimitive(doc.createPrimitive().setAttribute('POSITION',a(new Float32Array(attributes.position),'VEC3')).setAttribute('NORMAL',a(new Float32Array(attributes.normal),'VEC3')).setAttribute('TEXCOORD_0',a(new Float32Array(attributes.uv),'VEC2')).setIndices(a(new Uint32Array(indices),'SCALAR')).setMaterial(mat));
 }
 return out;
}
function tree(variant){
 seed=180+variant;const parts=[];
 const trunk=[[0,0,0],[.015,.7,.01],[-.025,1.35,.035],[.03,1.95,0],[.02,2.62,.02]];
 for(let i=0;i<4;i++)parts.push(rod(trunk[i],trunk[i+1],.083*(1-i*.22),.083*(1-(i+1)*.22),bark,9));
 for(let i=0;i<14;i++){
  const a=i*2.399+variant,y=.83+i*.112,r=.62*Math.sin((i+2)/17*Math.PI),end=[Math.cos(a)*r,y+.54,Math.sin(a)*r];
  parts.push(rod([0,y,0],end,.027*(1-i*.035),.006,bark,6));
 }
 // Small intersecting leaf sprays retain depth from every viewpoint, without a solid canopy shell.
 for(let i=0;i<92;i++){
  const a=i*2.399,yy=(i+.5)/92,rr=Math.sqrt(1-Math.pow(yy*2-1,2))*(.3+.42*Math.sqrt(random())),y=1.28+yy*1.48;
  const size=.31+random()*.22,g=new T.PlaneGeometry(size,size);
  g.rotateX((random()-.5)*1.9);g.rotateY(a+random());g.rotateZ((random()-.5)*.7);g.translate(Math.cos(a)*rr,y,Math.sin(a)*rr);
  // Rounded canopy normals keep flat cards from reading as unrelated sheets of paper.
  const pos=g.attributes.position,n=g.attributes.normal;
  for(let k=0;k<pos.count;k++){const v=new T.Vector3(pos.getX(k),.55+(pos.getY(k)-1.85)*.4,pos.getZ(k)).normalize();n.setXYZ(k,...v.toArray());}
  parts.push(geo(g,leaves));
 }
 return mesh('City106 branching maple '+variant,parts);
}
const autumn=await io.read(path.join(dir,'fall113/maples.glb'));
const copied=copyToDocument(doc,autumn,autumn.getRoot().listMeshes());
const trees=autumn.getRoot().listMeshes().map((m,i)=>copied.get(m).setName('City106 branching maple '+i));
const benchParts=[];
for(let i=0;i<6;i++)benchParts.push(box([0,.235,-.105+i*.043],[1.14,.027,.035],wood));
for(let i=0;i<5;i++)benchParts.push(box([0,.305+i*.045,.128+i*.009],[1.14,.035,.028],wood,-.17));
for(const x of[-.46,.46]){
 benchParts.push(rod([x,.018,-.12],[x,.23,-.09],.022,.018,iron));
 benchParts.push(rod([x,.018,.16],[x,.485,.175],.022,.015,iron));
 benchParts.push(rod([x,.205,-.13],[x,.205,.17],.018,.018,iron));
 const c=new T.CubicBezierCurve3(new T.Vector3(x,.28,-.13),new T.Vector3(x,.43,-.14),new T.Vector3(x,.4,.12),new T.Vector3(x,.365,.15));
 benchParts.push(geo(new T.TubeGeometry(c,12,.014,6,false),iron));
 for(const z of[-.105,.11])benchParts.push(rod([x,.248,z],[x,.252,z],.008,.008,bolt,6));
}
const bench=mesh('City106 curved cast iron teak bench',benchParts);
const skins=await createFacadeSkins127({doc,material});
const architecture=await addArchitecture({doc,original,mesh,geo,box,rod,material,texture,facadeSkin:skins.apply});
function worldBounds(n){const m=n.getWorldMatrix(),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const p of n.getMesh().listPrimitives()){const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++){const v=a.getElement(i,[]);for(let k=0;k<3;k++){const c=(m[k]*v[0]+m[k+4]*v[1]+m[k+8]*v[2]+m[k+12])*.3;lo[k]=Math.min(lo[k],c);hi[k]=Math.max(hi[k],c);}}}return {lo,hi};}
const hidden=[],placements=[],nodes=original.getRoot().listNodes();let treeCount=0,benchCount=0;
const treePart=/^(?:City_tree_\d+_Procedural_maple_tree_riverwalk_\d+_|Procedural_maple_tree_riverwalk_\d+_|Exterior44_(?:river_maple_\d+|river_new_tree_\d+|entrance_tree_\d+|street_tree_\d+)_)/;
for(const n of nodes){
 const name=n.getName();if(!n.getMesh())continue;
 if(treePart.test(name))hidden.push(name);
 if(treePart.test(name)&&name.endsWith('_trunk')){
  const {lo,hi}=worldBounds(n),h=hi[1]-lo[1],scale=h/1.7;
  const p=[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2];
  const node=doc.createNode(name.replace(/_trunk$/,'_detailed')).setMesh(trees[treeCount%3]).setTranslation(p).setScale([scale,scale,scale]).setRotation([0,Math.sin(treeCount*.73),0,Math.cos(treeCount*.73)]).setExtras({cityProp:true,tree:true});scene.addChild(node);placements.push(p);treeCount++;
 }
 if(/^Procedural_bench_riverwalk_/.test(name))hidden.push(name);
 if(/^Procedural_bench_riverwalk_\d+_seat$/.test(name)){
  const {lo,hi}=worldBounds(n);scene.addChild(doc.createNode('City106 riverwalk bench '+benchCount++).setMesh(bench).setTranslation([(lo[0]+hi[0])/2,0,(lo[2]+hi[2])/2]).setRotation([0,1,0,0]).setExtras({cityProp:true}));
 }
}
const furnishings=await addFurnishings({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,iron,bolt,wood,bark,leaves,bench,treePlacements:placements});
const signals=addTrafficSignals({doc,scene,original,worldBounds,mesh,geo,box,rod,material,iron,bolt});
const details=await addStreetDetails({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,treePlacements:placements});
const supplied130=await loadAssets130(doc);
const hotel134=await loadDowntown134(doc,supplied130.fleet);
const life=await addCityLife({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,signals,fleetModels:supplied130.fleet});
const landmark=await addLandmark({doc,scene,mesh,geo,box,rod,material,texture});
const district=await addDistrict({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,bench});
const street128=addBreakawayRailings({doc,scene,original,worldBounds,mesh,box,material});
const buildings=originalBuildings127({original,worldBounds,hidden});
buildings.facade=addVenueFacade125({doc,scene,original,worldBounds,mesh,box,material});
const blocks=addBlocks126({doc,scene,original,worldBounds,buildings,mesh,geo,box,rod,material,bench,preserveBuildings:true});
const assets130=await replaceAssets130({doc,scene,original,worldBounds,hidden,mesh,geo,box,rod,material,texture,signals,...supplied130});
assets130.riverCorner133=addRiverCorner133({doc,scene,mesh,geo,box,material,signals});
const lighting131=await addLighting131({doc,scene,original,worldBounds,buildings,treePlacements:placements,mesh,box,material,signals});
assets130.downtown134=placeDowntown134({doc,scene,original,hidden,buildings,assets130,hotel:hotel134,mesh,box,rod,material,lighting:lighting131});
assets130.skyline135=await placeSkyline135({doc,scene,original,worldBounds,hidden,buildings,assets130,lighting:lighting131,mesh,box,material});
assets130.riverlights136=await addRiverLights136({doc,scene,lighting:lighting131,mesh,box,rod,material});
assets130.treePits137=await addTreePits137({doc,scene,original,worldBounds,hidden,mesh,geo,box,rod,material,texture});
assets130.parkBorder137=addParkRoomBorder137({doc,scene,mesh,box,material});
const canopyBounds=[];
for(const n of scene.listChildren())if(n.getExtras().tree||n.getExtras().detail111==='trees'||['bushes','plants'].includes(n.getExtras().furnishing107)){
 const bounds=new T.Box3(),matrix=new T.Matrix4().fromArray(n.getWorldMatrix());
 for(const pr of n.getMesh().listPrimitives())if(pr.getMaterial().getAlphaMode()==='MASK'){
  const a=pr.getAttribute('POSITION');for(let i=0;i<a.getCount();i++)bounds.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(matrix));
 }
 if(!bounds.isEmpty())canopyBounds.push({name:n.getName(),bounds});
}
const lightClearance=[];
for(const n of scene.listChildren()){
 const e=n.getExtras(),type=e.trafficSignal108?'signal':e.furnishing107;
 if(!['signal','streetlights','lanterns'].includes(type))continue;
 const local=type==='signal'?[-2.8,2.77,1.95]:type==='streetlights'?[1.6,2.706,0]:[0,2.035,0];
 const head=new T.Vector3(...local).applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix()));
 const near=canopyBounds.filter(c=>c.bounds.clone().expandByScalar(.26).containsPoint(head)).map(c=>c.name);
 lightClearance.push({name:n.getName(),type,head:head.toArray(),blockedBy:near});
}
// Drop replaced authoring textures, rather than shipping two copies of every surface.
const usedTextures=new Set(doc.getRoot().listMaterials().flatMap(m=>[m.getBaseColorTexture(),m.getNormalTexture()]).filter(Boolean));
for(const t of doc.getRoot().listTextures())if(!usedTextures.has(t))t.dispose();
doc.getRoot().setExtras({hidden:[...new Set(hidden)],treeCount:treeCount+district.counts.trees,benchCount:assets130.benches.length,furnishings107:furnishings.counts,signals108:{intersections:signals.intersections.length,signals:signals.signalCount},details109:details.counts,life111:life,landmark113:landmark,district115:district,buildings125:buildings,blocks126:blocks,skins127:skins.records,street128,assets130,lighting131,version:131});
for(const a of doc.getRoot().listAccessors())a.setBuffer(buffer);
for(const b of doc.getRoot().listBuffers())if(b!==buffer)b.dispose();
const bytes=await io.writeBinary(doc);fs.writeFileSync(path.join(dir,'city.glb'),bytes);
fs.writeFileSync(path.join(dir,'city.glb.gz'),zlib.gzipSync(bytes,{level:9}));
const uniqueTriangles=doc.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0),0);
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify({version:131,bytes:bytes.length,trees:treeCount+district.counts.trees,benches:assets130.benches.length,sharedMeshes:doc.getRoot().listMeshes().length,uniqueTriangles,hiddenVisualNames:new Set(hidden).size,treePlacements:placements,furnishings,signals,details,life,architecture,landmark,district,buildings,blocks,skins:skins.records,street128,assets130,lighting131,lightClearance},null,2)+'\n');
console.log({bytes:bytes.length,trees:treeCount,benches:benchCount+furnishings.counts.addedBenches,hidden:hidden.length,furnishings:furnishings.counts,signals:signals.signalCount,intersections:signals.intersections.length});
