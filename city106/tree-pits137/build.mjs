import * as T from '../../pc66/vendor/three/three.core.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import core from './core.js';

function bounds(n){
 const b=new T.Box3(),m=new T.Matrix4().fromArray(n.getWorldMatrix());
 for(const p of n.getMesh().listPrimitives()){const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++)b.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(m));}
 return {lo:b.min.toArray(),hi:b.max.toArray()};
}
export async function addTreePits137({doc,scene,original,worldBounds,hidden,mesh,geo,box,rod,material,texture}){
 const report={pits:[],retainedPlantedBeds:0,removedLegacyGrates:0,cutFloors:0};
 const originalSupports=original.getRoot().listNodes().filter(n=>n.getMesh()&&/sidewalk|foundation|apron|planter_(soil|base)|planted_bank_strip/.test(n.getName())).map(n=>({name:n.getName(),...worldBounds(n)}));
 const addedSupports=scene.listChildren().filter(n=>n.getMesh()&&(n.getExtras().surface115||/planter/i.test(n.getName())&&!n.getExtras().planterShrub115)).map(n=>({name:n.getName(),...bounds(n)}));
 const supports=[...originalSupports,...addedSupports];
 const beds=scene.listChildren().filter(n=>n.getExtras().soilBed115);
 const trees=scene.listChildren().filter(n=>n.getExtras().tree||n.getExtras().detail111==='trees');
 let seed=137;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const size=256,pixels=Buffer.alloc(size*size*4),heights=new Float32Array(size*size);
 for(let i=0;i<size*size;i++){const q=random();heights[i]=q*.35;pixels.set([35+q*18,27+q*15,20+q*10,255],i*4);}
 for(let i=0;i<1800;i++){
  const x=random()*size,y=random()*size,a=random()*Math.PI,l=1+random()*5,w=.4+random()*1.2,c=38+random()*36;
  for(let yy=-7;yy<=7;yy++)for(let xx=-7;xx<=7;xx++){
   const u=xx*Math.cos(a)+yy*Math.sin(a),v=-xx*Math.sin(a)+yy*Math.cos(a);if(Math.abs(u)>l||Math.abs(v)>w)continue;
   const k=((Math.floor(y+yy)+size)%size)*size+(Math.floor(x+xx)+size)%size;pixels.set([c,c*.74,c*.49,255],k*4);heights[k]=.65;
  }
 }
 const normal=Buffer.alloc(size*size*4),at=(x,y)=>heights[((y+size)%size)*size+(x+size)%size];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const v=new T.Vector3((at(x-1,y)-at(x+1,y))*.4,(at(x,y-1)-at(x,y+1))*.4,1).normalize();normal.set([(v.x*.5+.5)*255,(v.y*.5+.5)*255,(v.z*.5+.5)*255,255],(y*size+x)*4);}
 const soil=material('Tree137 dark soil and bark mulch',[1,1,1,1],await texture('Tree137 fine soil and mulch',await sharp(pixels,{raw:{width:size,height:size,channels:4}}).png().toBuffer()),0,.98);
 soil.setNormalTexture(await texture('Tree137 soil relief',await sharp(normal,{raw:{width:size,height:size,channels:4}}).png().toBuffer()));
 const iron=material('Tree137 charcoal cast iron',[.075,.086,.082,1],null,.35,.68),bolts=material('Tree137 weathered fasteners',[.19,.20,.19,1],null,.55,.6);
 const cache=new Map();
 function grate(w,d,opening){
  const {radius:r,hx,hz,round}=opening,key=[w,d,r,hx,hz,round].join(':');if(cache.has(key))return cache.get(key);
  const parts=[],halfW=w/2,halfD=d/2,rim=.014;
  // A real slotted two-piece grate, including a trunk opening and recessed soil.
  const shape=new T.Shape();shape.moveTo(-halfW+rim,-halfD+rim);shape.lineTo(halfW-rim,-halfD+rim);shape.lineTo(halfW-rim,halfD-rim);shape.lineTo(-halfW+rim,halfD-rim);shape.closePath();
  const hole=new T.Path();
  if(round)hole.absarc(0,0,r,0,Math.PI*2,true);
  else{
   const c=.018;hole.moveTo(-hx,-hz+c);hole.lineTo(-hx,hz-c);hole.quadraticCurveTo(-hx,hz,-hx+c,hz);hole.lineTo(hx-c,hz);hole.quadraticCurveTo(hx,hz,hx,hz-c);hole.lineTo(hx,-hz+c);hole.quadraticCurveTo(hx,-hz,hx-c,-hz);hole.lineTo(-hx+c,-hz);hole.quadraticCurveTo(-hx,-hz,-hx,-hz+c);hole.closePath();
  }
  shape.holes.push(hole);
  for(let x=-halfW+.033;x<halfW-.025;x+=.027){
   const end=round?(Math.abs(x)<r+.02?Math.sqrt(Math.max(0,(r+.015)**2-x*x)):.012):(Math.abs(x)<hx+.01?hz+.012:.012);
   for(const side of[-1,1]){
    const z0=side>0?end:-halfD+.032,z1=side>0?halfD-.032:-end;if(z1-z0<.018)continue;
    const slot=new T.Path();slot.moveTo(x-.004,z0);slot.lineTo(x-.004,z1);slot.lineTo(x+.004,z1);slot.lineTo(x+.004,z0);slot.closePath();shape.holes.push(slot);
   }
  }
  const g=new T.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:false,curveSegments:24});g.rotateX(-Math.PI/2);g.translate(0,-.007,0);parts.push(geo(g,iron));
  for(const x of[-halfW+rim/2,halfW-rim/2])parts.push(box([x,-.013,0],[rim,.030,d],iron));
  for(const z of[-halfD+rim/2,halfD-rim/2])parts.push(box([0,-.013,z],[w-2*rim,.030,rim],iron));
  parts.push(box([0,-.030,0],[w-.012,.008,d-.012],soil));
  for(const x of[-halfW+.023,halfW-.023])for(const z of[-halfD+.023,halfD-.023])parts.push(rod([x,.002,z],[x,.003,z],.004,.004,bolts,8));
  const result=mesh('Tree137 slotted grate '+key,parts);cache.set(key,result);return result;
 }
 for(const tree of trees){
  const [tx,y,tz]=tree.getTranslation(),bed=beds.find(b=>b.getExtras().soilBed115.tree===tree.getName());
  if(!bed)continue;
  const under=supports.filter(s=>tx>s.lo[0]&&tx<s.hi[0]&&tz>s.lo[2]&&tz<s.hi[2]&&s.hi[1]>y-.16&&s.hi[1]<y+.36);
  if(under.some(s=>/planter|park lawn|planted_bank/.test(s.name))||!under.length){
   for(const p of bed.getMesh().listPrimitives())p.setMaterial(soil);report.retainedPlantedBeds++;continue;
  }
  const source=under.filter(s=>!/foundation/.test(s.name)).sort((a,b)=>b.hi[1]-a.hi[1])[0]||under[0],support={...source,lo:[...source.lo],hi:[...source.hi]},top=support.hi[1];
  const matrix=new T.Matrix4().fromArray(tree.getWorldMatrix()),roots=[],rootBounds=new T.Box3();let lowest=Infinity,bark=null;
  for(const pr of tree.getMesh().listPrimitives()){
   if(pr.getMaterial().getAlphaMode()==='MASK')continue;
   const a=pr.getAttribute('POSITION');
   for(let i=0;i<a.getCount();i++){const v=new T.Vector3(...a.getElement(i,[])).applyMatrix4(matrix);if(v.y<lowest){lowest=v.y;bark=pr.getMaterial();}if(v.y<y+.2)roots.push(v);}
  }
  for(const v of roots)if(v.y<Math.max(lowest+.08,top+.04))rootBounds.expandByPoint(v);
  const center=rootBounds.isEmpty()?new T.Vector3(tx,y,tz):rootBounds.getCenter(new T.Vector3()),size=rootBounds.getSize(new T.Vector3()),x=center.x,z=center.z;
  // Some original sidewalks are adjacent strips, not separate planting limits.
  // Join their coplanar extents before fitting a pit near an authoring seam.
  if(/^City_sidewalk|continuous_sidewalk|Exterior_street_apron/.test(support.name))for(let pass=0;pass<3;pass++)for(const s of originalSupports){
   if(!/^City_sidewalk|continuous_sidewalk|Exterior_street_apron/.test(s.name)||Math.abs(s.hi[1]-top)>1e-5)continue;
   if(z>s.lo[2]&&z<s.hi[2]&&s.lo[0]<=support.hi[0]+1e-5&&s.hi[0]>=support.lo[0]-1e-5){support.lo[0]=Math.min(support.lo[0],s.lo[0]);support.hi[0]=Math.max(support.hi[0],s.hi[0]);}
   if(x>s.lo[0]&&x<s.hi[0]&&s.lo[2]<=support.hi[2]+1e-5&&s.hi[2]>=support.lo[2]-1e-5){support.lo[2]=Math.min(support.lo[2],s.lo[2]);support.hi[2]=Math.max(support.hi[2],s.hi[2]);}
  }
  let w=Math.min(.62,2*(Math.min(x-support.lo[0],support.hi[0]-x)-.035)),d=Math.min(.62,2*(Math.min(z-support.lo[2],support.hi[2]-z)-.035));
  if(d<.45)w=Math.min(.84,2*(Math.min(x-support.lo[0],support.hi[0]-x)-.035));
  if(w<.45)d=Math.min(.84,2*(Math.min(z-support.lo[2],support.hi[2]-z)-.035));
  if(w<size.x+.065)w=Math.min(.84,2*(Math.min(x-support.lo[0],support.hi[0]-x)-.008));
  if(d<size.z+.065)d=Math.min(.84,2*(Math.min(z-support.lo[2],support.hi[2]-z)-.008));
  w=Math.floor(w*50)/50;d=Math.floor(d*50)/50;
  if(w<.24||d<.24){for(const p of bed.getMesh().listPrimitives())p.setMaterial(soil);report.retainedPlantedBeds++;continue;}
  const round=Math.max(size.x,size.z)<.16,radius=Math.min(Math.min(w,d)/2-.022,Math.max(.075,Math.ceil((Math.hypot(size.x,size.z)/2+.015)*40)/40));
  const opening={round,radius:round?radius:0,hx:round?radius:Math.min(w/2-.02,Math.ceil((size.x/2+.025)*40)/40),hz:round?radius:Math.min(d/2-.02,Math.ceil((size.z/2+.025)*40)/40)};
  const pit={tree:tree.getName(),x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y:top,opening,rootBounds:{lo:rootBounds.min.toArray(),hi:rootBounds.max.toArray()},support:support.name};report.pits.push(pit);
  bed.setMesh(grate(w,d,opening)).setTranslation([x,top,z]).setScale([1,1,1]).setExtras({...bed.getExtras(),treePit137:pit});
  // Extend the root collar into the bed where a legacy tree started above paving.
  if(lowest>top-.021&&bark){const r=Math.max(size.x,size.z)/2,collar=mesh('Tree137 root collar '+report.pits.length,[rod([0,-.034,0],[0,lowest-top+.009,0],r*1.12,r,bark,12)]);scene.addChild(doc.createNode('Tree137 root collar '+report.pits.length).setMesh(collar).setTranslation([x,top,z]).setExtras({cityProp:true,vegetation115:!!tree.getExtras().vegetation115}));}
 }
 for(const n of original.getRoot().listNodes())if(n.getName()==='Exterior44_curb_tree_grate'){hidden.push(n.getName());report.removedLegacyGrates++;}
 // Newly built paved surfaces use the same subtraction as the original venue.
 // Bake their transforms before cutting so every pit stays in world coordinates.
 for(const n of scene.listChildren()){
  if(!n.getMesh()||!n.getExtras().surface115)continue;
  const old=n.getMesh(),parts=[],matrix=new T.Matrix4().fromArray(n.getWorldMatrix());let changed=false;
  for(const pr of old.listPrimitives()){
   const pos=pr.getAttribute('POSITION'),nor=pr.getAttribute('NORMAL'),uv=pr.getAttribute('TEXCOORD_0'),data=new Float32Array(pos.getCount()*6),normalMatrix=new T.Matrix3().getNormalMatrix(matrix);
   for(let i=0;i<pos.getCount();i++){data.set(new T.Vector3(...pos.getElement(i,[])).applyMatrix4(matrix).toArray(),i*6);data.set(new T.Vector3(...nor.getElement(i,[])).applyMatrix3(normalMatrix).normalize().toArray(),i*6+3);}
   const cut=core.cut(data,pr.getIndices().getArray(),uv?.getArray(),report.pits);changed ||= cut.data!==data;
   const p=[],norm=[];for(let i=0;i<cut.data.length;i+=6){p.push(...cut.data.subarray(i,i+3));norm.push(...cut.data.subarray(i+3,i+6));}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.setAttribute('uv',new T.Float32BufferAttribute(cut.uv||new Float32Array(p.length/3*2),2));g.setIndex(new T.BufferAttribute(cut.idx,1));parts.push(geo(g,pr.getMaterial()));
  }
  if(changed){n.setMesh(mesh(old.getName()+' tree recesses',parts)).setTranslation([0,0,0]).setRotation([0,0,0,1]).setScale([1,1,1]);report.cutFloors++;}
 }
 return report;
}
