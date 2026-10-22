import * as T from '../../pc66/vendor/three/three.core.js';
import {hull,clearance,inside,rectPoly,overlaps,segmentDistance,planPlaza} from './layout.mjs';

export function addBlocks126({doc,scene,original,worldBounds,buildings,mesh,geo,box,rod,material,bench,preserveBuildings=false}){
 const models=doc.getRoot().listMeshes().filter(m=>m.getExtras().building125),byName=new Map(scene.listChildren().map(n=>[n.getName(),n]));
 const hulls=new Map(),upgraded=[],added=[],plazas=[],props=[],retiredColliders=[];
 const mat=name=>doc.getRoot().listMaterials().find(m=>m.getName()===name),model=name=>doc.getRoot().listMeshes().find(m=>m.getName()===name);
 const roads=original.getRoot().listNodes().filter(n=>n.getMesh()&&n.getExtras().kind==='cityStreet').map(worldBounds);
 roads.push({lo:[-99.6,-.15,-72],hi:[131.4,-.1275,-67.2]});
 const restricted=[...roads,{lo:[-31,-1,-66.7],hi:[66.2,30,39.5]},{lo:[-31,-1,-87],hi:[-17,30,-72.1]},{lo:[-90.8,-2,-62.3],hi:[78.2,3,-38.5]}];
 const distanceToVenue=p=>Math.hypot(Math.max(-31-p.position[0],0,p.position[0]-66),Math.max(-66-p.position[2],0,p.position[2]-40));
 function localHull(m){
  if(!hulls.has(m)){const points=[];for(const pr of m.listPrimitives()){const a=pr.getAttribute('POSITION');for(let i=0;i<a.getCount();i++){const p=a.getElement(i,[]);points.push([p[0],p[2]]);}}hulls.set(m,hull(points));}
  return hulls.get(m);
 }
 function footprint(m,p,yaw,scale){const c=Math.cos(yaw),s=Math.sin(yaw);return localHull(m).map(v=>[p[0]+scale*(c*v[0]+s*v[1]),p[2]+scale*(-s*v[0]+c*v[1])]);}
 function apply(p,m,scale,yaw=p.yaw){
  const size=m.getExtras().size,c=Math.abs(Math.cos(yaw)),s=Math.abs(Math.sin(yaw)),w=(size[0]*c+size[2]*s)*scale,d=(size[0]*s+size[2]*c)*scale;
  Object.assign(p,{variant:m.getName(),source:m.getExtras().source,scale,yaw,size:size.map(v=>v*scale),bounds:{lo:[p.position[0]-w/2,p.position[1],p.position[2]-d/2],hi:[p.position[0]+w/2,p.position[1]+size[1]*scale,p.position[2]+d/2]}});
  p.footprint126=footprint(m,p.position,yaw,scale);
  byName.get(p.name).setMesh(m).setTranslation(p.position).setScale([scale,scale,scale]).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setExtras({cityProp:true,building125:{source:p.source,variant:p.variant}});
 }
 const baseline=buildings.placements.map(p=>({name:p.name,height:p.size[1]}));
 if(!preserveBuildings){
 // Taller variants add storeys without stretching any facade texture or window.
 for(const [i,p]of buildings.placements.entries()){
  const current=byName.get(p.name).getMesh(),old=p.size[1],w=p.lot.hi[0]-p.lot.lo[0],d=p.lot.hi[2]-p.lot.lo[2],turned=Math.abs(Math.sin(p.yaw))>.5;
  let choice;
  if(i%5===1&&old<36){
   choice=models.map(m=>{const s=m.getExtras().size,scale=Math.min(w/s[turned?2:0],d/s[turned?0:2])*.97,height=s[1]*scale;return {m,scale,height};})
    .filter(c=>c.height>old*1.3&&c.height<Math.min(58,old*2.05)&&c.height>6)
    .sort((a,b)=>Math.abs(a.height-old*1.65)-Math.abs(b.height-old*1.65))[0];
  }
  if(choice){
   const size=choice.m.getExtras().size,mw=size[turned?2:0]*choice.scale,md=size[turned?0:2]*choice.scale,axis=turned?0:2,side=(axis===0?p.position[0]<18:p.position[2]<7)?1:-1;
   p.position=[(p.lot.lo[0]+p.lot.hi[0])/2,p.position[1],(p.lot.lo[2]+p.lot.hi[2])/2];
   p.position[axis]=side>0?p.lot.hi[axis]-(axis===0?mw:md)/2-.02:p.lot.lo[axis]+(axis===0?mw:md)/2+.02;
   apply(p,choice.m,choice.scale);upgraded.push({name:p.name,before:old,after:p.size[1]});
  }else apply(p,current,p.scale);
 }
 const near=(p,b,r)=>p[0]>=b.lo[0]-r&&p[0]<=b.hi[0]+r&&p[1]>=b.lo[2]-r&&p[1]<=b.hi[2]+r;
 const clear=(p,r=0)=>restricted.every(b=>!near(p,b,r)||clearance(p,rectPoly(b))>r)&&buildings.placements.every(b=>!near(p,b.bounds,r)||clearance(p,b.footprint126)>r);
 // A few compact infill buildings occupy larger unused strips within existing lots.
 for(const p of [...buildings.placements].sort((a,b)=>distanceToVenue(a)-distanceToVenue(b))){
  if(added.length>=24)break;
  if(added.some(q=>Math.hypot(q.position[0]-p.position[0],q.position[2]-p.position[2])<13))continue;
  const {lo,hi}=p.lot,b=p.bounds,gaps=[
   {lo:[lo[0],0,lo[2]],hi:[b.lo[0]-.65,0,hi[2]]},{lo:[b.hi[0]+.65,0,lo[2]],hi:[hi[0],0,hi[2]]},
   {lo:[lo[0],0,lo[2]],hi:[hi[0],0,b.lo[2]-.65]},{lo:[lo[0],0,b.hi[2]+.65],hi:[hi[0],0,hi[2]]}
  ].filter(r=>r.hi[0]-r.lo[0]>2.8&&r.hi[2]-r.lo[2]>3.1).sort((a,b)=>(b.hi[0]-b.lo[0])*(b.hi[2]-b.lo[2])-(a.hi[0]-a.lo[0])*(a.hi[2]-a.lo[2]));
  for(const gap of gaps){
   const w=Math.min(5,gap.hi[0]-gap.lo[0]-.5),d=Math.min(6,gap.hi[2]-gap.lo[2]-.5),x=(gap.lo[0]+gap.hi[0])/2,z=(gap.lo[2]+gap.hi[2])/2;
   const rect={lo:[x-w/2,0,z-d/2],hi:[x+w/2,0,z+d/2]};
   if(restricted.some(r=>overlaps(rectPoly(rect),rectPoly(r),.3))||buildings.placements.some(p=>overlaps(rectPoly(rect),p.footprint126,.3)))continue;
   const candidates=models.filter(m=>['scene-19','scene-28','london-0','nyc-3'].includes(m.getName())).map(m=>{const s=m.getExtras().size,scale=Math.min(w/s[0],d/s[2])*.96;return {m,scale,height:s[1]*scale};}).filter(c=>c.height>=6&&c.height<24);
   if(!candidates.length)continue;
   const choice=candidates[added.length%candidates.length],name='Building126 infill '+added.length,n=doc.createNode(name);scene.addChild(n);byName.set(name,n);
   const record={name,lot:rect,position:[x,-.101,z],yaw:0,infill126:true};apply(record,choice.m,choice.scale);
   buildings.placements.push(record);added.push(record);break;
  }
 }
 // Contact prisms follow the imported silhouettes, including diagonal walls.
 const invisible=material('Block126 footprint contact',[0,0,0,0]);
 for(const p of buildings.placements){
  const shape=new T.Shape(p.footprint126.map(v=>new T.Vector2(v[0],-v[1]))),g=new T.ExtrudeGeometry(shape,{depth:4.5,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);g.translate(0,p.position[1],0);
  scene.addChild(doc.createNode(p.name+' footprint126').setMesh(mesh(p.name+' contact',[geo(g,invisible)])).setExtras({contactOnly115:true,colliderMesh126:true}));
  if(!p.infill126)retiredColliders.push(p.name.replace(/^Building125 /,'')+'_footprint_collider');
 }
 }
 const invisible=material('Block126 outer boundary contact',[0,0,0,0]);
 const neighborhoodBounds={lo:[-114,0,-116],hi:[146,0,93]};
 for(const n of original.getRoot().listNodes())if(/^Playable_campus_square_boundary_.*_boundary_collider$/.test(n.getName()))retiredColliders.push(n.getName());
 for(const [axis,side]of[[0,-1],[0,1],[2,-1],[2,1]]){
  const center=[16,2,-11.5],size=[260,5,209];center[axis]=side<0?neighborhoodBounds.lo[axis]:neighborhoodBounds.hi[axis];size[axis]=.14;
  scene.addChild(doc.createNode('Block126 neighborhood '+axis+' '+side+'_boundary_collider').setMesh(mesh('Block126 outer contact '+axis+' '+side,[box(center,size,invisible)])).setExtras({contactOnly115:true,collider107:{center,size}}));
 }
 const paving=mat('City106 paving'),iron=mat('City106 graphite cast iron'),wood=mat('City106 oiled teak'),soil=mat('District115 tree beds');
 const sandstone=material('Block126 kiosk limestone',[.40,.43,.42,1],null,0,.87),glass=mat('Building125 scene:Glass')||material('Block127 kiosk glass',[.09,.15,.18,1],null,.18,.12).setExtras({surfaceType:4}),atlas=mat('City111 street life atlas');
 function face(w,h,row,p){const g=new T.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(2+uv.getX(i)*764)/1024,(354+row*56+(1-uv.getY(i))*52)/1024);g.translate(...p);return geo(g,atlas);}
 const kiosks=[2,1,4].map((row,i)=>{
  const parts=[box([0,.08,0],[2.45,.16,1.45],sandstone),box([0,.83,-.67],[2.4,1.5,.08],wood),box([0,1.68,0],[2.65,.12,1.7],iron),box([0,1.48,.73],[2.48,.29,.06],iron),face(2.3,.22,row,[0,1.48,.768]),box([0,.55,.64],[2.3,.1,.24],wood)];
  for(const x of[-1.16,1.16])parts.push(box([x,.85,0],[.07,1.55,1.4],sandstone));
  parts.push(box([.85,.92,.69],[.50,.99,.018],glass),box([.56,.87,.72],[.025,1.25,.03],iron));
  for(const x of[-1.1,.54,1.13])parts.push(box([x,.88,.72],[.035,1.3,.035],iron));
  for(let j=0;j<6;j++){parts.push(box([-.87+j*.24,.68,-.36],[.13,.23,.12],i===1?wood:sandstone));if(i===1)parts.push(box([-.87+j*.24,1.01,-.36],[.13,.26,.12],wood));}
  for(const x of[-.82,0,.82])parts.push(rod([x,1.60,.4],[x,1.62,.4],.035,.035,mat('City107 warm lamp lenses'),12));
  return mesh('Block126 '+['coffee','book','flower'][i]+' shop pavilion',parts);
 });
 const treeModels=[model('District115 green maple'),model('District115 tree'),model('District115 yellow tree')].filter(Boolean);
 const planter=model('City107 cast stone planter'),shrub=model('City107 branching leafy shrub'),grass=model('City107 ornamental grasses and perennials'),bin=model('City109 ribbed litter bin'),cafe=model('City111 cafe table and chairs');
 const bed=mesh('Block126 circular flush tree bed',[geo(new T.CylinderGeometry(.56,.56,.018,32).translate(0,.009,0),soil)]);
 const existingFurniture=scene.listChildren().filter(n=>n.getExtras().collider107&&!n.getExtras().contactOnly115).map(n=>({p:[n.getTranslation()[0],n.getTranslation()[2]],r:Math.hypot(n.getExtras().collider107.size[0],n.getExtras().collider107.size[2])*.5*Math.max(...n.getScale())}));
 let serial=0;
 function place(type,m,p,yaw=0,size=null,scale=1){
  const name='Block126 '+type+' '+serial++,extras={cityProp:true,block126:type};
  if(size)extras.collider107={center:[0,size[1]/2,0],size};
  if(type==='tree'){extras.vegetation115=true;extras.tree=true;}
  scene.addChild(doc.createNode(name).setMesh(m).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale([scale,scale,scale]).setExtras(extras));
  return name;
 }
 const near=(p,b,r)=>p[0]>=b.lo[0]-r&&p[0]<=b.hi[0]+r&&p[1]>=b.lo[2]-r&&p[1]<=b.hi[2]+r;
 const clear=(p,r=0)=>restricted.every(b=>!near(p,b,r)||clearance(p,rectPoly(b))>r)&&buildings.placements.every(b=>!near(p,b.bounds,r)||clearance(p,b.footprint126)>r);
 function floor(name,r){
  const w=r.hi[0]-r.lo[0],d=r.hi[2]-r.lo[2],g=new T.BoxGeometry(w,.035,d);g.translate((r.lo[0]+r.hi[0])/2,-.1115,(r.lo[2]+r.hi[2])/2);
  const pos=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal;for(let i=0;i<pos.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?pos.getZ(i):pos.getX(i))/2.4,(Math.abs(n.getY(i))>.5?pos.getZ(i):pos.getY(i))/2.4);
  scene.addChild(doc.createNode(name).setMesh(mesh(name,[geo(g,paving)])).setExtras({cityProp:true,block126:'paving',surface115:true}));
 }
 function pave(name,bounds){
  let pieces=[bounds];
  for(const obstacle of restricted){
   const cut={lo:[obstacle.lo[0]-.04,0,obstacle.lo[2]-.04],hi:[obstacle.hi[0]+.04,0,obstacle.hi[2]+.04]};
   pieces=pieces.flatMap(r=>{
    const x0=Math.max(r.lo[0],cut.lo[0]),x1=Math.min(r.hi[0],cut.hi[0]),z0=Math.max(r.lo[2],cut.lo[2]),z1=Math.min(r.hi[2],cut.hi[2]);
    if(x0>=x1||z0>=z1)return[r];
    return [{lo:r.lo,hi:[x0,0,r.hi[2]]},{lo:[x1,0,r.lo[2]],hi:r.hi},{lo:[x0,0,r.lo[2]],hi:[x1,0,z0]},{lo:[x0,0,z1],hi:[x1,0,r.hi[2]]}].filter(r=>r.hi[0]-r.lo[0]>.04&&r.hi[2]-r.lo[2]>.04);
   });
  }
  pieces.forEach((r,i)=>floor(name+' '+i,r));return pieces;
 }
 for(const lot of buildings.placements.filter(p=>!p.infill126).sort((a,b)=>distanceToVenue(a)-distanceToVenue(b))){
  if(plazas.length>=64||lot.position[0]<-100||lot.position[0]>135||lot.position[2]<-106||lot.position[2]>85)continue;
  const bounds={lo:[lot.lot.lo[0]-2.4,0,lot.lot.lo[2]-2.4],hi:[lot.lot.hi[0]+2.4,0,lot.lot.hi[2]+2.4]};
  const walkClear=(p,r)=>clear(p,r)&&existingFurniture.every(o=>Math.hypot(p[0]-o.p[0],p[1]-o.p[1])>r+o.r)&&props.every(o=>Math.hypot(p[0]-o.p[0],p[1]-o.p[1])>r+(o.type==='tree'?.12:o.radius));
  const planned=planPlaza(bounds,roads,walkClear);if(!planned)continue;
  const id=plazas.length,occupied=[],route=planned.route,entry=planned.entry;
  const routeDistance=p=>Math.min(...route.slice(1).map((b,i)=>segmentDistance(p,route[i],b)));
  const nearbyProps=scene.listChildren().filter(n=>n.getExtras().collider107&&!n.getExtras().contactOnly115).map(n=>({p:[n.getTranslation()[0],n.getTranslation()[2]],r:Math.hypot(n.getExtras().collider107.size[0],n.getExtras().collider107.size[2])*.5}));
  const candidates=[...planned.cells].sort((a,b)=>routeDistance(b)-routeDistance(a));
  function find(radius){return candidates.find(p=>inside(p,bounds,radius+.08)&&clear(p,radius+.18)&&roads.every(r=>!near(p,r,radius+1.25)||clearance(p,rectPoly(r))>radius+1.25)&&routeDistance(p)>radius+.58&&occupied.every(o=>Math.hypot(p[0]-o.p[0],p[1]-o.p[1])>radius+o.r+.25)&&props.every(o=>Math.hypot(p[0]-o.p[0],p[1]-o.p[1])>radius+o.radius+.25)&&plazas.every(q=>q.route.every((b,i)=>i===0||segmentDistance(p,q.route[i-1],b)>radius+.58))&&nearbyProps.every(o=>Math.hypot(p[0]-o.p[0],p[1]-o.p[1])>radius+o.r+.2));}
  function put(type,m,size,radius,scale=1){
   const p=find(radius);if(!p)return null;
   const yaw=Math.atan2(entry[0]-p[0],entry[1]-p[1]),name=place(type,m,[p[0],-.099,p[1]],yaw,size,scale);
   occupied.push({p,r:radius});props.push({name,type,plaza:id,p,yaw,size,scale,radius});return p;
  }
  const shopCount=props.filter(p=>p.type==='shop').length;
  if(planned.area>24&&shopCount<8)put('shop',kiosks[shopCount%kiosks.length],[2.65,1.74,1.7],1.49,.9);
  const treeModel=treeModels[id%treeModels.length],treeRadius=treeModel?Math.max(...localHull(treeModel).map(p=>Math.hypot(...p)))*.70+.08:0,tree=treeModel&&find(treeRadius);if(tree){
   const name=place('tree',treeModel,[tree[0],-.099,tree[1]],id*.7,[.15,1.4,.15],.70);
   place('tree bed',bed,[tree[0],-.098,tree[1]]);props.push({name,type:'tree',plaza:id,p:tree,radius:treeRadius});occupied.push({p:tree,r:treeRadius});
  }
  put('bench',bench,[1.14,.52,.34],.63);
  put('bin',bin,[.28,.47,.28],.20);
  if(planned.area>20)put('cafe seating',cafe,[1.05,.4,.55],.62);
  for(let i=0;i<(planned.area>24?3:2);i++){
   const p=put('planter',planter,[.95,.35,.55],.55);if(p){place('shrub',shrub,[p[0]-.14,.20,p[1]],i,null,.9);place('grasses',grass,[p[0]+.25,.20,p[1]],0,null,.85);}
  }
  if(!occupied.length)continue;
  const paving=pave('Block126 courtyard paving '+id,bounds);
  const start=route[1],connector={lo:[Math.min(start[0],entry[0])-.54,0,Math.min(start[1],entry[1])-.54],hi:[Math.max(start[0],entry[0])+.54,0,Math.max(start[1],entry[1])+.54]};
  // The connector ends on the sidewalk, never on the road surface.
  pave('Block126 sidewalk connector '+id,connector);
  plazas.push({id,lot:lot.name,bounds,paving,...planned,props:props.filter(p=>p.plaza===id)});
 }
 buildings.counts={};buildings.variants={};for(const p of buildings.placements){buildings.counts[p.source]=(buildings.counts[p.source]||0)+1;buildings.variants[p.variant]=(buildings.variants[p.variant]||0)+1;}
 return {version:126,baseline,upgraded,added:added.map(p=>p.name),neighborhoodBounds,retiredColliders,plazas,counts:{buildings:buildings.placements.length,addedBuildings:added.length,tallerBuildings:upgraded.length,plazas:plazas.length,...Object.fromEntries([...new Set(props.map(p=>p.type))].map(type=>[type,props.filter(p=>p.type===type).length]))}};
}
