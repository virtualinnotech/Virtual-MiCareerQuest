import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';

// All placements are in the renderer's world units. Each prop reuses one mesh.
export async function addFurnishings({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,iron,bolt,wood,bark,leaves,bench,treePlacements}){
 let seed=107;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const concrete=material('City107 pale cast stone',[.55,.58,.56,1],null,0,.93);
 const soil=material('City107 planting soil',[.074,.06,.045,1],null,0,1);
 const grass=material('City107 grass blades',[.24,.34,.14,1],null,0,.85);
 const grassLight=material('City107 grass highlights',[.42,.48,.24,1],null,0,.88);
 const lens=material('City107 warm lamp lenses',[1,.88,.62,1],null,0,.5).setEmissiveFactor([.65,.49,.23]);
 const flowers=material('City107 perennial blossoms',[.60,.40,.65,1],null,0,.85);
 const counts={streetlights:0,lanterns:0,signs:0,addedBenches:0,planters:0,bushes:0,plants:0},placements=[];
 function place(type,model,p,yaw=0,scale=1,collider=null){
  // Keep furniture on the curb of the widened far-bank road, including T junctions.
  if(p[2]>-72.4&&p[2]<-66.8)p=[p[0],p[1],p[2]<-69.6?-72.45:-66.75];
  const name='City107 '+type+' '+(++counts[type]);
  const extras={cityProp:true,furnishing107:type,...(collider?{collider107:collider}:{})};
  scene.addChild(doc.createNode(name).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale([scale,scale,scale]).setExtras(extras));
  placements.push({name,type,p,yaw,scale});
 }
 function tube(curve,r=.024){return geo(new T.TubeGeometry(curve,12,r,6,false),iron);}
 const poleCollider={center:[0,1.3,0],size:[.16,2.6,.16]};
 const benchCollider={center:[0,.25,.025],size:[1.14,.50,.32]};
 const planterCollider={center:[0,.15,0],size:[.92,.30,.55]};
 const lampParts=[box([0,.025,0],[.20,.05,.20],iron),rod([0,.05,0],[0,.25,0],.073,.054,iron,10),rod([0,.25,0],[0,2.6,0],.04,.026,iron,10)];
 lampParts.push(tube(new T.CubicBezierCurve3(new T.Vector3(0,2.36,0),new T.Vector3(0,3.04,0),new T.Vector3(1.42,2.91,0),new T.Vector3(1.6,2.76,0))));
 lampParts.push(box([1.6,2.74,0],[.43,.055,.20],iron),box([1.6,2.706,0],[.34,.013,.15],lens));
 for(const x of[-.069,.069])for(const z of[-.069,.069])lampParts.push(rod([x,.05,z],[x,.065,z],.011,.011,bolt,6));
 const streetlamp=mesh('City107 curved LED streetlight',lampParts);
 const lanternParts=[box([0,.025,0],[.19,.05,.19],iron),rod([0,.05,0],[0,.29,0],.073,.049,iron,10),rod([0,.29,0],[0,1.87,0],.032,.022,iron,10)];
 for(const y of[.30,.42,1.72,1.88])lanternParts.push(rod([0,y-.023,0],[0,y+.023,0],.043,.043,iron,10));
 lanternParts.push(box([0,2.035,0],[.15,.27,.15],lens),box([0,1.887,0],[.22,.027,.22],iron));
 for(const x of[-.091,.091])for(const z of[-.091,.091])lanternParts.push(rod([x,1.9,z],[x,2.2,z],.009,.009,iron,5));
 const cap=new T.ConeGeometry(.175,.11,4);cap.rotateY(Math.PI/4);cap.translate(0,2.24,0);lanternParts.push(geo(cap,iron),rod([0,2.29,0],[0,2.35,0],.014,.008,iron));
 const lantern=mesh('City107 riverwalk lantern',lanternParts);

 const planterParts=[box([0,.026,0],[.85,.052,.49],concrete),box([0,.274,0],[.81,.024,.44],soil)];
 for(const z of[-.246,.246])planterParts.push(box([0,.17,z],[.92,.28,.058],concrete));
 for(const x of[-.431,.431])planterParts.push(box([x,.17,0],[.058,.28,.55],concrete));
 for(const z of[-.246,.246])planterParts.push(box([0,.316,z],[.95,.027,.075],concrete));
 for(const x of[-.441,.441])planterParts.push(box([x,.316,0],[.068,.027,.50],concrete));
 const planter=mesh('City107 cast stone planter',planterParts);
 const shrubParts=[];
 for(let i=0;i<7;i++){const a=i*2.4;shrubParts.push(rod([0,0,0],[Math.cos(a)*.23,.22+random()*.15,Math.sin(a)*.18],.011,.003,bark,5));}
 for(let i=0;i<36;i++){
  const a=i*2.399,r=.10+random()*.22,y=.13+random()*.32,s=.20+random()*.08,g=new T.PlaneGeometry(s,s);
  g.rotateX((random()-.5)*1.9);g.rotateY(a);g.rotateZ(random()*.7);g.translate(Math.cos(a)*r,y,Math.sin(a)*r*.73);
  const p=g.attributes.position,n=g.attributes.normal;
  for(let k=0;k<p.count;k++){const v=new T.Vector3(p.getX(k),.45,p.getZ(k)).normalize();n.setXYZ(k,...v.toArray());}
  shrubParts.push(geo(g,leaves));
 }
 const shrub=mesh('City107 branching leafy shrub',shrubParts);
 const plantParts=[];
 for(let i=0;i<34;i++){
  const a=i*2.399,h=.22+random()*.30,bend=.09+random()*.19,base=(random()-.5)*.11,verts=[],indices=[];
  for(let k=0;k<=4;k++){const t=k/4,r=base+bend*t*t,w=.012*(1-t)+.001;for(const sign of[-1,1])verts.push(Math.cos(a)*r-Math.sin(a)*w*sign,h*Math.sin(t*1.30),Math.sin(a)*r+Math.cos(a)*w*sign);if(k<4){const q=k*2;indices.push(q,q+1,q+2,q+1,q+3,q+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(Array(verts.length/3*2).fill(0),2));g.setIndex(indices);g.computeVertexNormals();plantParts.push(geo(g,i%3?grass:grassLight));
 }
 for(let i=0;i<7;i++){const a=i*2.399,x=Math.cos(a)*.12,z=Math.sin(a)*.12,h=.32+random()*.23;plantParts.push(rod([x,0,z],[x,h,z],.003,.002,grass,4));const g=new T.IcosahedronGeometry(.018,0);g.scale(.75,2.6,.75);g.translate(x,h,z);plantParts.push(geo(g,flowers));}
 const plant=mesh('City107 ornamental grasses and perennials',plantParts);

 const signs=[['DEVOS PLACE','MAIN ENTRANCE','#173f4a'],['RIVERWALK','PUBLIC ACCESS','#244b40'],['PEDESTRIAN','CROSSING','#d7b950']];
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768">';
 signs.forEach(([a,b,c],i)=>{const y=i*256,ink=i===2?'#202922':'#ffffff';svg+=`<rect x="0" y="${y}" width="512" height="256" fill="${c}"/><rect x="10" y="${y+10}" width="492" height="236" rx="9" fill="none" stroke="${ink}" stroke-width="4"/><path d="M58 ${y+136}v-38m-17 17 17-18 17 18" stroke="${ink}" stroke-width="7" fill="none"/><text x="290" y="${y+113}" text-anchor="middle" fill="${ink}" font-family="Arial,sans-serif" font-weight="bold" font-size="37">${a}</text><text x="290" y="${y+159}" text-anchor="middle" fill="${ink}" font-family="Arial,sans-serif" font-size="27">${b}</text>`;});svg+='</svg>';
 const signMat=material('City107 shared wayfinding atlas',[1,1,1,1],await texture('City107 directional signs',await sharp(Buffer.from(svg)).png().toBuffer()),.1,.67);
 const signModels=signs.map((_,i)=>{
  const parts=[rod([0,0,0],[0,1.19,0],.016,.016,bolt,8),box([0,1.36,0],[.69,.35,.025],iron)];
  for(const face of[-1,1]){const g=new T.PlaneGeometry(.67,.335),uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,(2+uv.getX(k)*508)/512,(i*256+2+(1-uv.getY(k))*252)/768);if(face<0)g.rotateY(Math.PI);g.translate(0,1.36,face*.014);parts.push(geo(g,signMat));}
  return mesh('City107 directional sign '+i,parts);
 });
 function plantedPair(x,y,z,yaw=0){
  for(const dx of[-1.28,1.28]){const xx=x+Math.cos(yaw)*dx,zz=z-Math.sin(yaw)*dx;place('planters',planter,[xx,y,zz],yaw,1,planterCollider);place('bushes',shrub,[xx-.17*Math.cos(yaw),y+.29,zz+.17*Math.sin(yaw)],yaw,.88);place('plants',plant,[xx+.22*Math.cos(yaw),y+.29,zz-.22*Math.sin(yaw)],yaw,.82);}
 }
 // Keep the central entrance, crossing, and river doorway unobstructed.
 for(const x of[-27,-17,-7,9.3,19.5,29.7,39.9,50.1,60.3,65])place('streetlights',streetlamp,[x,-.028,39.15],-Math.PI/2,1,poleCollider);
 for(const x of[35.5,-10,15,29,43,57]){place('addedBenches',bench,[x,-.027,36.6],0,1,benchCollider);plantedPair(x,-.027,36.6);}
 for(const x of[-23,-15,-5,6,17,28,39,50,61])place('lanterns',lantern,[x,-.018,-37.0],0,1,poleCollider);
 for(const x of[-22,-4.8,12,32,56,61]){place('addedBenches',bench,[x,-.018,-35.6],Math.PI,1,benchCollider);plantedPair(x,-.018,-35.6);}
 for(let x=-25;x<63;x+=2.4){
  if(Math.abs(x)<5||x>22&&x<28||treePlacements.some(p=>Math.hypot(p[0]-x,p[2]+38.15)<1.05))continue;
  place('bushes',shrub,[x,-.018,-38.15],x*.3,1.25);
  place('plants',plant,[x+.8,-.018,-37.75],x*.5,1.05);
 }
 for(const n of original.getRoot().listNodes()){
  if(n.getName()!=='Exterior44_river_planter_soil'||!n.getMesh())continue;
  const {lo,hi}=worldBounds(n),x=(lo[0]+hi[0])/2,z=(lo[2]+hi[2])/2;
  for(const dx of[-.61,.61]){place('bushes',shrub,[x+dx,hi[1],z],dx,1.05);place('plants',plant,[x+dx,hi[1],z+.26],dx,.72);}
 }
 const signCollider={center:[0,.74,0],size:[.065,1.48,.065]};
 for(const x of[-4.5,4.5])place('signs',signModels[0],[x,-.027,38.4],0,1,signCollider);
 for(const x of[-6.3,6.3])place('signs',signModels[1],[x,-.018,-33.0],Math.PI,1,signCollider);
 for(const x of[-5.8,5.8])place('signs',signModels[2],[x,-.028,39.25],Math.PI/2,1,signCollider);

 // Anchor neighborhood furniture to existing sidewalk slabs, not guessed roads.
 let block=0;
 for(const n of original.getRoot().listNodes()){
  const match=/^City_sidewalk_([xz])_-?\d+_(-?1)_/.exec(n.getName());
  if(!match||!n.getMesh())continue;
  const {lo,hi}=worldBounds(n),cross=match[1]==='x'?0:2,along=cross===0?2:0,side=+match[2],mid=lo.map((v,k)=>(v+hi[k])/2);
  if(hi[along]-lo[along]<10||hi[cross]-lo[cross]<.9||Math.abs(mid[0])>80||mid[2]<-85||mid[2]>65)continue;
  // The frontage and river edge above have their own coordinated furnishings.
  if(mid[0]>-29&&mid[0]<67&&mid[2]>-64&&mid[2]<40)continue;
  if(++block%2===0)continue;
  const p=[...mid];p[1]=hi[1];p[cross]=side<0?hi[cross]-.16:lo[cross]+.16;
  if(treePlacements.some(t=>Math.hypot(t[0]-p[0],t[2]-p[2])<.9))continue;
  const yaw=cross===0?(side<0?0:Math.PI):(side<0?-Math.PI/2:Math.PI/2);
  place('streetlights',streetlamp,p,yaw,1,poleCollider);
  if(block%9===1){const s=[...p];s[along]=lo[along]+1.25;place('signs',signModels[2],s,cross===0?0:Math.PI/2,1,signCollider);}
  if(block%3===1){const b=[...p];b[along]+=2.7;b[cross]+=side*.12;place('addedBenches',bench,b,yaw-Math.PI/2,.92,benchCollider);}
  if(block%3===0){const b=[...p];b[along]-=2.6;b[cross]+=side*.13;place('planters',planter,b,cross===0?Math.PI/2:0,.85,planterCollider);place('plants',plant,[b[0],b[1]+.25,b[2]],0,1);place('bushes',shrub,[b[0],b[1]+.25,b[2]],0,.85);}
 }
 return {counts,placements};
}
