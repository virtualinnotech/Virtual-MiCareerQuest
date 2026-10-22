import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as T from '../pc66/vendor/three/three.core.js';
import {Document,NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import C from './core.js';
const dir=path.dirname(fileURLToPath(import.meta.url)),doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Hospitality second-floor gallery');
const groups=new Map(),contacts=[],lights=[];
function mat(name,color,metal=0,rough=.7,emission){const m=doc.createMaterial(name).setBaseColorFactor(color).setMetallicFactor(metal).setRoughnessFactor(rough).setDoubleSided(true);if(color[3]<1)m.setAlphaMode('BLEND');if(emission)m.setEmissiveFactor(emission);return m;}
const white=mat('Pearl white structural panels',[.78,.79,.77,1]),stone=mat('Pale limestone fascia',[.61,.60,.53,1]),silver=mat('Brushed stainless steel',[.48,.53,.55,1],.65,.36),black=mat('Black escalator handrail rubber',[.019,.024,.025,1],.1,.75),glass=mat('Clear exterior glazing',[.66,.82,.86,.11],.15,.2),gold=mat('Hospitality orange wayfinding',[.83,.27,.065,1]),lens=mat('Warm white recessed lenses',[1,.89,.67,1],0,.4,[1.25,1.04,.70]),carpet=mat('Slate woven patterned carpet',[.37,.43,.44,1],0,.96),terrazzo=mat('Lower gallery terrazzo',[.60,.62,.60,1],0,.82),tread=mat('Escalator ribbed aluminum',[.25,.29,.30,1],.55,.55),yellow=mat('Step safety edges',[.96,.66,.12,1]);
const size=256,pixels=Buffer.alloc(size*size*3);let seed=140;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){const ring=Math.abs(Math.hypot(x%64-32,y%64-32)-21)<3?-.10:0,grain=(rand()-.5)*.16,w=(x+y)%2?.02:-.02;for(let k=0;k<3;k++)pixels[(y*size+x)*3+k]=Math.round((.72+ring+grain+w)*255);}
const tex=doc.createTexture('Woven loop carpet').setImage(await sharp(pixels,{raw:{width:size,height:size,channels:3}}).png().toBuffer()).setMimeType('image/png');carpet.setBaseColorTexture(tex);carpet.getBaseColorTextureInfo().setWrapS(10497).setWrapT(10497);
function add(name,g,m,roof=false){const key=m.getName()+':'+roof;if(!groups.has(key))groups.set(key,{name,m,roof,parts:[]});groups.get(key).parts.push(g);}
function box(name,c,s,m,solid=false,roof=false){const g=new T.BoxGeometry(...s);g.translate(...c);if(m===carpet){const pos=g.getAttribute('position'),uv=g.getAttribute('uv');for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/1.2,pos.getZ(i)/1.2);}add(name,g,m,roof);if(solid)contacts.push({name,lo:c.map((n,i)=>n-s[i]/2),hi:c.map((n,i)=>n+s[i]/2)});}
function quad(name,a,b,c,d,m){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...d],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(name,g,m);}
function rod(name,a,b,r,m){const av=new T.Vector3(...a),bv=new T.Vector3(...b),g=new T.CylinderGeometry(r,r,av.distanceTo(bv),12);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),bv.clone().sub(av).normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());add(name,g,m);}
const [x0,z0,x1,z1]=C.footprint,Y=C.floor,H=C.ceiling;
// Leave the existing network-room floor intact underneath the new balcony.
for(const [a,b,c,d]of [[x0,z0,x1,-18.8],[x0,-18.8,-20.8,z1],[-15.2,-18.8,x1,z1]])box('Lower gallery floor',[(a+c)/2,.03,(b+d)/2],[c-a,.42,d-b],terrazzo,true);
function floorSlab(name,a,b,c,d){
 box(name,[(a+c)/2,Y-.09,(b+d)/2],[c-a,.18,d-b],white,true);
 const g=new T.PlaneGeometry(c-a,d-b);g.rotateX(-Math.PI/2);g.translate((a+c)/2,Y+.001,(b+d)/2);
 const pos=g.getAttribute('position'),uv=g.getAttribute('uv');for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/1.2,pos.getZ(i)/1.2);add('Hospitality carpet surface',g,carpet);
}
const [hx0,hz0,hx1,hz1]=C.hole;
for(const [a,b,c,d]of [[x0,z0,hx0,z1],[hx1,z0,x1,z1],[hx0,z0,hx1,hz0],[hx0,hz1,hx1,z1]])floorSlab('Hospitality balcony floor',a,b,c,d);
box('Hospitality roof',[(x0+x1)/2,H+.08,(z0+z1)/2],[x1-x0+.2,.16,z1-z0+.2],white,true,true);
floorSlab('Restored gallery landing floor',-3.35,-29.415,-.75,-28.765);
function glazing(axis,fixed,start,end,base,top){
 const along=end-start,n=Math.ceil(along/1.6);
 for(let i=0;i<n;i++){const a=start+i*along/n,b=start+(i+1)*along/n,c=(a+b)/2;
  box('Exterior window wall',axis==='x'?[fixed,(base+top)/2,c]:[c,(base+top)/2,fixed],axis==='x'?[.028,top-base,b-a]:[b-a,top-base,.028],glass,true);
  box('Window mullion',axis==='x'?[fixed,(base+top)/2,a]:[a,(base+top)/2,fixed],axis==='x'?[.075,top-base,.045]:[.045,top-base,.075],silver);
 }
 for(const y of [base,base+(top-base)*.5,top])box('Window transom',axis==='x'?[fixed,y,(start+end)/2]:[(start+end)/2,y,fixed],axis==='x'?[.075,.04,along]:[along,.04,.075],silver);
}
// North and west face the river/city; the short south return is also glazed.
for(const [axis,fixed,a,b]of [['x',x0,z0,z1],['z',z0,x0,x1],['z',z1,x0,-21.98]]){
 glazing(axis,fixed,a,b,Y+.12,H-.12);glazing(axis,fixed,a,b,.50,2.77);
 box('Continuous stone floor fascia',axis==='x'?[fixed,Y-.09,(a+b)/2]:[(a+b)/2,Y-.09,fixed],axis==='x'?[.20,.26,b-a]:[b-a,.26,.20],stone);
 box('Perimeter lower plinth',axis==='x'?[fixed,.22,(a+b)/2]:[(a+b)/2,.22,fixed],axis==='x'?[.16,.56,b-a]:[b-a,.56,.16],stone,true);
}
// Columns sit along perimeter/landing strips, away from the booth courts.
for(const [x,z]of [[-29.95,-29.85],[-22,-29.85],[-14,-29.85],[-6,-29.85],[-29.95,-13.85],[-22.3,-13.85],[-16.2,-13.85],[-5.55,-13.85]]){
 rod('Round gallery column',[x,.24,z],[x,H,z],.105,white);contacts.push({name:'perimeter column',lo:[x-.11,.24,z-.11],hi:[x+.11,H,z+.11]});
 rod('Column brushed foot',[x,.24,z],[x,.32,z],.112,silver);
}
for(let x=-28;x<=-7;x+=3.5)for(let z=-28.7;z<=-14.7;z+=3.5){
 for(const y of [Y-.20,H-.03]){if(y<Y&&C.inHole(x,z,.15))continue;box('Recessed ceiling fixture',[x,y,z],[.19,.015,.19],lens,false,y>H-.1);lights.push({id:`hospitality140:${x}:${y}:${z}`,p:[x,y-.08,z],radius:6.5,color:[1,.86,.65],power:3.5,direction:[0,-1,0],outer:.12,alwaysOn:true});}
}
// Low-profile acoustic ceiling grid, warm downlights and glass guard rails echo the reference nook.
for(let x=x0+.6;x<x1;x+=.6)box('Ceiling panel grid',[x,H-.012,(z0+z1)/2],[.008,.008,z1-z0],silver,false,true);
for(let z=z0+.6;z<z1;z+=.6)box('Ceiling panel grid',[(x0+x1)/2,H-.012,z],[x1-x0,.008,.008],silver,false,true);
function guard(a,b){rod('Glass guard handrail',[a[0],Y+.48,a[1]],[b[0],Y+.48,b[1]],.022,silver);const dx=b[0]-a[0],dz=b[1]-a[1];box('Glass guard panel',[(a[0]+b[0])/2,Y+.25,(a[1]+b[1])/2],[Math.max(.025,Math.abs(dx)),.46,Math.max(.025,Math.abs(dz))],glass,true);}
guard([-3.81,-29.13],[3.81,-29.13]);
guard([hx0,hz0],[hx1,hz0]);guard([hx0,hz1],[hx1,hz1]);guard([hx1,hz0],[hx1,hz1]);
for(const z of [hz0,hz1])box('Escalator opening fascia',[(hx0+hx1)/2,Y-.09,z],[hx1-hx0,.18,.055],silver);
box('Escalator opening end fascia',[hx1,Y-.09,(hz0+hz1)/2],[.055,.18,hz1-hz0],silver);
for(const e of C.escalators){
 const p=(cross,y,along)=>C.point(e,along,y,cross);
 for(const side of[-1,1]){
  const xx=side*(C.laneWidth/2+.045);
  quad('Escalator side skirt',p(xx,C.ground-.05,C.bottom),p(xx,C.floor-.10,C.top),p(xx,C.floor-.32,C.top),p(xx,C.ground-.23,C.bottom),silver);
  for(const [a,b]of [[C.bottom,C.rampStart],[C.rampStart,C.rampEnd],[C.rampEnd,C.top]]){
   quad('Escalator glass balustrade',p(xx,C.height(a)+.09,a),p(xx,C.height(b)+.09,b),p(xx,C.height(b)+.44,b),p(xx,C.height(a)+.44,a),glass);
   rod('Escalator black moving handrail',p(xx,C.height(a)+.46,a),p(xx,C.height(b)+.46,b),.035,black);
   contacts.push({name:'escalator guard',ramp:{x:xx,laneZ:e.z,width:.035,z0:a,z1:b,y0:C.height(a)+.07,y1:C.height(b)+.07,height:.42}});
  }
 }
 for(const t of [C.bottom-.04,C.top+.04])box('Escalator comb plate',p(0,C.height(t)+.003,t),[.18,.018,C.laneWidth+.02],yellow);
 contacts.push({name:'Escalator moving floor ramp',ramp:{x:0,laneZ:e.z,width:C.laneWidth+.04,z0:C.bottom,z1:C.rampStart,y0:C.ground,y1:C.ground,height:.08}});
 contacts.push({name:'Escalator moving floor ramp',ramp:{x:0,laneZ:e.z,width:C.laneWidth+.04,z0:C.rampStart,z1:C.rampEnd,y0:C.ground,y1:C.floor,height:.08}});
 contacts.push({name:'Escalator moving floor landing',ramp:{x:0,laneZ:e.z,width:C.laneWidth+.04,z0:C.rampEnd,z1:C.top,y0:C.floor,y1:C.floor,height:.08}});
}
// A small welcome counter leaves the rest of the lower level flexible.
box('Lower welcome counter',[-10.5,.59,-15.0],[1.5,.70,.55],white,true);box('Countertop',[-10.5,.96,-15.0],[1.56,.04,.61],silver);
for(const [x,z]of [[-25.5,-29.5],[-18,-29.5],[-10.5,-29.5]]){box('Window lounge bench',[x,Y+.21,z],[1.5,.06,.32],stone,true);for(const dx of[-.55,.55])rod('Lounge bench foot',[x+dx,Y,z],[x+dx,Y+.20,z],.03,silver);}
function accessor(array,type){return doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);}
for(const {name,m,roof,parts}of groups.values()){
 const pos=[],nor=[],uv=[],idx=[];let offset=0;
 for(const g of parts){pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);uv.push(...(g.attributes.uv?.array||new Float32Array(g.attributes.position.count*2)));idx.push(...Array.from(g.index.array,n=>n+offset));offset+=g.attributes.position.count;}
 const pr=doc.createPrimitive().setAttribute('POSITION',accessor(new Float32Array(pos),'VEC3')).setAttribute('NORMAL',accessor(new Float32Array(nor),'VEC3')).setAttribute('TEXCOORD_0',accessor(new Float32Array(uv),'VEC2')).setIndices(accessor(new Uint32Array(idx),'SCALAR')).setMaterial(m);
 scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(pr)).setExtras({roof}));
}
doc.getRoot().setExtras({hospitality140:{floor:Y,footprint:C.footprint,contacts,lights,capacity:C.capacity,hole:C.hole}});
await new NodeIO().write(path.join(dir,'addition.glb'),doc);
console.log('Hospitality addition built:',groups.size,'render groups,',contacts.length,'contact surfaces,',C.capacity,'upstairs booth positions.');
