import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import {buildGallery119,replaceFloor119} from './gallery119.mjs';
import {buildGallery122,checkInShift122} from './gallery122.mjs';
import {buildSign124} from './sign124.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url)),file=path.join(dir,'../venue-frame.html');
let html=fs.readFileSync(file,'utf8');
const tag=/<script id="model-data"[^>]*>([^<]+)/,old=html.match(tag)[1];
const glb=zlib.gunzipSync(Buffer.from(old.trim(),'base64'));
let json,bin;
for(let p=12;p<glb.length;){const size=glb.readUInt32LE(p),type=glb.readUInt32LE(p+4);p+=8;if(type===0x4e4f534a)json=JSON.parse(glb.subarray(p,p+size));if(type===0x004e4942)bin=glb.subarray(p,p+size);p+=size;}
// Regeneration removes only our appended data, retaining all pre-existing geometry verbatim.
const prior=json.extras?.gallery105;
const arrays=['nodes','meshes','materials','accessors','bufferViews','images','textures','samplers'];
if(prior){
 for(const key of arrays)json[key]=(json[key]||[]).slice(0,prior.counts[key]);
 json.scenes[json.scene||0].nodes=json.scenes[json.scene||0].nodes.filter(i=>i<prior.counts.nodes);
 bin=bin.subarray(0,prior.binLength);json.buffers[0].byteLength=prior.binLength;
 json.nodes.forEach((n,i)=>{if(n.extras?.gallery105HideVisual){delete n.extras.gallery105HideVisual;if(prior.hiddenNoExtras.includes(i))delete n.extras;}});
 delete json.extras.gallery105;
}
const original=structuredClone(json),originalBin=Buffer.from(bin);
const counts=Object.fromEntries(arrays.map(k=>[k,(json[k]||[]).length]));
for(const k of arrays)json[k]??=[];
const hidden=[];
function replaceVisual(n){const s=n.name||'';return (
 /^Grand_Gallery_full_length_vaulted_skylight_/.test(s)||
 /^Grand_Gallery_curved_light_/.test(s)||
 /^Entrance_(swooping_roof|left_swooping_downturn)/.test(s)||
 /^(Large_polished_curved_entry_arch|Inner_glass_arch_band|Left_arch_leg|Right_arch_leg)$/.test(s)||
 /^Exterior44_atrium_/.test(s)||/^Exterior44_entrance_fine_glass_vertical$/.test(s)||
 /^Gallery_west_column_/.test(s)||
 /^Gallery_east_column_|^Exterior44_gallery_side_upper_(clerestory|fin)/.test(s)||
 /^MiCareerQuest_banner_/.test(s)||
 replaceFloor119(s,n.extras?.kind)||
 /^Curved_arch_curtain_wall_grid_with_open_doors_.*(arch_clipped_glass|arched_vertical_mullion|arched_horizontal_mullion|lower_horizontal_mullion)/.test(s)
 );}
json.nodes.forEach((n,i)=>{if(replaceVisual(n)&&n.mesh!==undefined){n.extras={...n.extras,gallery105HideVisual:true};hidden.push(i);}});

const chunks=[bin];let length=bin.length;
function append(buffer){const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}const start=length;chunks.push(buffer);length+=buffer.length;const i=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:start,byteLength:buffer.length});return i;}
function accessor(a,type,componentType=5126){const data=Buffer.from(a.buffer,a.byteOffset,a.byteLength),view=append(data),width={SCALAR:1,VEC2:2,VEC3:3}[type],o={bufferView:view,componentType,count:a.length/width,type};if(type==='VEC3'){o.min=[Infinity,Infinity,Infinity];o.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.length;i++) {const k=i%3;o.min[k]=Math.min(o.min[k],a[i]);o.max[k]=Math.max(o.max[k],a[i]);}}json.accessors.push(o);return json.accessors.length-1;}
function material(name,color,metal=.1,rough=.5,extra={}){const i=json.materials.length;json.materials.push({name:'Gallery105 '+name,pbrMetallicRoughness:{baseColorFactor:color,metallicFactor:metal,roughnessFactor:rough},doubleSided:true,...(color[3]<1?{alphaMode:'BLEND'}:{}),...extra});return i;}
const steel=material('warm white painted structural steel',[.81,.82,.79,1],.28,.38,{extras:{surfaceType:16}});
const edge=material('flange edges and gussets',[.9,.91,.88,1],.38,.28,{extras:{surfaceType:16}});
const roof=material('pale ribbed metal soffit',[.75,.75,.69,1],.18,.58);
json.materials[roof].extras={surfaceType:16};
const silver=material('brushed aluminum',[.68,.73,.74,1],.72,.29);
const dark=material('shadow reveals and rubber gaskets',[.07,.09,.095,1],.3,.7);
const stone=material('limestone',[.65,.65,.59,1],.08,.7);
const panel=material('pearl gray rainscreen',[.59,.62,.62,1],.25,.55);
const glass=material('clear blue architectural glass',[.66,.84,.89,.16],.32,.14,{extras:{surfaceType:5}});
const lens=material('warm light lenses',[.94,.93,.83,1],0,.5,{emissiveFactor:[.24,.23,.19]});
const black=material('polished black stone plinth',[.075,.085,.09,1],.4,.22);
const invisible=material('pillar contact volume',[0,0,0,0],0,1);
const groups=new Map();
function add(name,g,mat){const key=name+'|'+mat;if(!groups.has(key))groups.set(key,{name,mat,parts:[]});groups.get(key).parts.push(g);}
function box(name,c,s,mat,rot=0){const g=new T.BoxGeometry(...s);g.rotateZ(rot);g.translate(...c);add(name,g,mat);}
function rod(name,a,b,r,mat,sides=8){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av),g=new T.CylinderGeometry(r,r,d.length(),sides);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());add(name,g,mat);}
function quad(name,a,b,c,d,mat,uv=[0,0,1,0,1,1,0,1]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...d],3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(name,g,mat);}
const v=(x,y)=>new T.Vector3(x,y,0),curve=new T.CurvePath();
curve.add(new T.CubicBezierCurve3(v(-4.42,.24),v(-4.65,2.5),v(-4.85,5.0),v(-4.69,7.1)));
curve.add(new T.CubicBezierCurve3(v(-4.69,7.1),v(-4.53,9.1),v(-3.17,10.62),v(-.75,10.58)));
curve.add(new T.CubicBezierCurve3(v(-.75,10.58),v(1.1,10.58),v(3.0,10.44),v(4.98,10.32)));
const exteriorPoints=curve.getSpacedPoints(128).map(p=>[p.x,p.y]);
// A straight inclined leg meets one continuous roof bend, without a balcony dogleg.
const galleryCurve=new T.CurvePath();
galleryCurve.add(new T.LineCurve3(v(-3.06,.24),v(-3.8146,7.1)));
galleryCurve.add(new T.CubicBezierCurve3(v(-3.8146,7.1),v(-4.0346,9.1),v(-3.17,10.62),v(-.75,10.58)));
galleryCurve.add(curve.curves[2]);
const points=galleryCurve.getSpacedPoints(128).map(p=>[p.x,p.y]);
function sections(scale=1,startY=0,interior=false){return (interior?points:exteriorPoints).filter(p=>p[1]>=startY).map((p,i,ps)=>{const a=ps[Math.max(0,i-1)],b=ps[Math.min(ps.length-1,i+1)],dx=(b[0]-a[0])*scale,dy=b[1]-a[1],len=Math.hypot(dx,dy);return {x:p[0]*scale,y:p[1],nx:-dy/len,ny:dx/len};});}
function sweep(name,ss,z,width,depth,offset,mat){
 for(let i=0;i<ss.length-1;i++){
  const a=ss[i],b=ss[i+1],p=(s,w,d)=>[s.x+s.nx*(w+offset),s.y+s.ny*(w+offset),z+d];
  const a0=p(a,-width/2,-depth/2),a1=p(a,width/2,-depth/2),a2=p(a,width/2,depth/2),a3=p(a,-width/2,depth/2),b0=p(b,-width/2,-depth/2),b1=p(b,width/2,-depth/2),b2=p(b,width/2,depth/2),b3=p(b,-width/2,depth/2);
  for(const q of [[a0,b0,b1,a1],[a3,a2,b2,b3],[a1,b1,b2,a2],[a0,a3,b3,b0]])quad(name,...q,mat);
  if(i===0)quad(name,a0,a1,a2,a3,mat);if(i===ss.length-2)quad(name,b3,b2,b1,b0,mat);
 }
}
function rib(z,scale=1,startY=.24,exterior=false){
 const ss=sections(scale,startY,!exterior),w=exterior?.72:.48,d=exterior?.7:.34,name=exterior?'Entrance boomerang steel':'Gallery boomerang steel';
 sweep(name+' web',ss,z,w,.065,0,steel);
 sweep(name+' outer flange',ss,z,.045,d,-w/2,edge);sweep(name+' inner flange',ss,z,.045,d,w/2,edge);
 for(let i=2;i<ss.length-2;i+=7){const p=ss[i],angle=Math.atan2(p.ny,p.nx);box(name+' welded stiffeners',[p.x,p.y,z],[w,.025,d],steel,angle);}
 if(startY<.5){const x=ss[0].x;if(exterior)box(name+' stone footing',[x,.1525,z],[1.05,.365,1.15],stone);box(name+' base plate',[x,exterior?.352:.261,z],[exterior?.88:.65,.042,exterior?.88:.56],exterior?silver:edge);for(const dx of[-1,1])for(const dz of[-1,1])rod(name+' anchor bolts',[x+dx*(exterior?.32:.27),exterior?.36:.282,z+dz*(exterior?.32:.22)],[x+dx*(exterior?.32:.27),exterior?.405:.31,z+dz*(exterior?.32:.22)],exterior?.023:.014,exterior?dark:steel,6);
  if(exterior)box(name+' footing contact '+z,[x,.1525,z],[1.05,.365,1.15],invisible);
  sweep(name+' contact volume '+z,ss.filter(p=>p.y<2.85),z,w,d,0,invisible);
 }
}
// Doorways now sit between full-height supports, with an aisle behind the steel.
const stations=[-29.4,-25.8,-20.4,-15,-9.6,-4.2,1.2,6.6,12,17.4,22.8,28.2,32.1];
for(const z of stations)rib(z);
rib(35.6,1.48,.24,true);rib(38.15,1.48,.24,true);

function shell(z0,z1,s0=1,s1=1,exterior=false){
 const ps=(exterior?exteriorPoints:points).filter(p=>p[1]>=6.9),outside=exteriorPoints.filter(p=>p[1]>=6.9);
 const far=i=>{if(s0===s1)return ps[i];const f=i/(ps.length-1)*(outside.length-1),j=Math.min(outside.length-2,Math.floor(f)),t=f-j;return outside[j].map((v,k)=>v+(outside[j+1][k]-v)*t);};
 for(let i=0;i<ps.length-1;i++){
  const a=ps[i],b=ps[i+1],fa=far(i),fb=far(i+1),isGlass=exterior||a[0]<-1.08||a[0]>3.28,mat=isGlass?glass:roof;
  quad('Roof '+(isGlass?'skylight glazing':'insulated panels'),[a[0]*s0,a[1]+.29,z0],[b[0]*s0,b[1]+.29,z0],[fb[0]*s1,fb[1]+.29,z1],[fa[0]*s1,fa[1]+.29,z1],mat);
  if(!isGlass){
   // Raised seams also make the solid, shallowly curved soffit readable from below.
   rod('Roof corrugated soffit ribs',[a[0]*s0,a[1]+.274,z0],[fa[0]*s1,fa[1]+.274,z1],.012,steel,4);
  }
 }
 for(let i=1;i<ps.length;i+=4){const p=ps[i],f=far(i);rod('Roof continuous glazing purlins',[p[0]*s0,p[1]+.245,z0],[f[0]*s1,f[1]+.245,z1],.032,silver,6);}
 for(let z=z0;z<z1-.01;z+=1.35){const t=(z-z0)/(z1-z0),at=i=>[ps[i][0]*s0*(1-t)+far(i)[0]*s1*t,ps[i][1]*(1-t)+far(i)[1]*t+.26,z];for(let i=0;i<ps.length-1;i++)rod('Roof skylight crossbars',at(i),at(i+1),.019,silver,4);}
}
shell(-30.3,32.1);shell(32.1,35.6,1,1.48);shell(35.6,38.15,1.48,1.48,true);
const spring=points.find(p=>p[1]>=6.9);
quad('Roof balcony skylight return',[-4.96,6.95,-30.3],[spring[0],spring[1]+.29,-30.3],[spring[0],spring[1]+.29,32.1],[-4.96,6.95,32.1],glass);
for(const z of stations)rod('Roof balcony glazing return frame',[-4.96,6.95,z],[spring[0],spring[1]+.29,z],.025,silver,6);
sweep('Entrance rolled aluminum roof edge',sections(1.48),38.15,.075,.095,-.42,silver);

// Extend the existing river-end window wall to the new roof, preserving its stair.
const rearTop=points.filter(p=>p[1]>7.1);
function rearHeight(x){if(x>=rearTop.at(-1)[0]-.001)return rearTop.at(-1)[1];for(let i=1;i<rearTop.length;i++)if(rearTop[i-1][0]<=x&&rearTop[i][0]>=x){const a=rearTop[i-1],b=rearTop[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 7.24;}
for(let x=-4.65;x<4.98;x+=.68){const x1=Math.min(x+.68,4.98),a=rearHeight(x),b=rearHeight(x1),top=Math.min(a,b);if(top<7.26)continue;
 quad('Gallery river end upper glass',[x,7.24,-30.295],[x1,7.24,-30.295],[x1,b,-30.295],[x,a,-30.295],glass);
 box('Gallery river end upper vertical frames',[x,(a+7.24)/2,-30.275],[.038,a-7.24,.075],silver);
 for(let y=7.8;y<top;y+=.66)box('Gallery river end upper transoms',[(x+x1)/2,y,-30.265],[x1-x,.03,.075],silver);
}

// The new curtain wall stops over the original open-door band, never across it.
const front=sections(1.48).filter(p=>p.y>2.52);
function frontTop(x){const ps=front.filter(p=>p.y>6.9);for(let i=1;i<ps.length;i++)if(ps[i-1].x<=x&&ps[i].x>=x){const a=ps[i-1],b=ps[i];return a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x);}return x<ps[0].x?6.9:10.32;}
const glassBays=[...new Set([-7.28,-3.9,3.9,7.38,...Array.from({length:22},(_,i)=>-7.28+i*.665)])].sort((a,b)=>a-b);
for(let i=0;i<glassBays.length-1;i++){const x=glassBays[i],x1=glassBays[i+1],top=Math.min(frontTop(x),frontTop(x1)),bottom=x>=-3.9&&x1<=3.9?2.52:.03;
 quad('Entrance curtain glass',[x,bottom,34.795],[x1,bottom,34.795],[x1,top,34.795],[x,top,34.795],glass);
 box('Entrance glazing vertical caps',[x,(top+bottom)/2,34.86],[.043,top-bottom,.095],silver);
 box('Entrance glazing shadow gaskets',[x,(top+bottom)/2,34.805],[.069,top-bottom,.05],dark);
 for(let y=2.52;y<top-.05;y+=.66)box('Entrance glazing horizontal caps',[(x+x1)/2,y,34.858],[x1-x,.032,.078],silver);
}
// A silver folded cheek panel replaces the visual symmetry of the old entrance arch.
quad('Entrance angled silver cheek',[5.25,4.3,35],[7.65,4.3,35],[7.65,10.34,35],[6.12,10.48,35],panel);
for(let y=4.45;y<10.25;y+=.55)rod('Entrance silver panel joints',[5.25+(y-4.3)*.14,y,35.01],[7.65,y,35.01],.006,dark,4);
box('Entrance black fascia',[6.4,4.27,35.045],[2.48,.3,.11],dark);

// Recessed gray upper-wall cassettes and glass balustrades follow the original balconies.
for(const side of[-1]){
 const x=side>0?4.975:-4.94,y0=side>0?3.9:3.74,y1=side>0?10.35:6.95;
 for(let z=-29.1;z<30;z+=2.7){
  box('Gallery upper wall backing '+side,[x,(y0+y1)/2,z+1.34],[.055,y1-y0,2.7],dark);
  for(let y=y0;y<y1-.01;y+=.8){const h=Math.min(.8,y1-y);box('Gallery upper rainscreen cassettes '+side,[x-side*.033,y+h/2,z+1.34],[.045,h-.012,2.676],panel);}
 }
 for(let z=-28.8;z<30;z+=2.7){box('Gallery balcony white fascia '+side,[side*3.825,2.918,z+1.33],[.045,.195,2.67],steel);box('Gallery recessed balcony reveal '+side,[side*3.827,2.795,z+1.33],[.042,.045,2.67],dark);}
 rod('Gallery continuous stainless handrail '+side,[side*3.81,3.505,-29.1],[side*3.81,3.505,31.15],.025,silver,10);
}

// Small-scale tan brick is limited to the gallery-facing wall skin.
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#a3916e"/>';
for(let row=0;row<16;row++)for(let col=-1;col<5;col++){const q=(row*29+col*17+81)%13;svg+=`<rect x="${col*128+(row%2)*64+1}" y="${row*32+1}" width="126" height="30" fill="rgb(${180+q},${153+q},${105+q})"/>`;}
svg+='</svg>';
const brickBytes=await sharp(Buffer.from(svg)).png().toBuffer(),view=append(brickBytes),imageId=json.images.length;json.images.push({name:'Gallery105 tan brick',bufferView:view,mimeType:'image/png'});const samplerId=json.samplers.length;json.samplers.push({wrapS:10497,wrapT:10497,minFilter:9987,magFilter:9729});const tex=json.textures.length;json.textures.push({source:imageId,sampler:samplerId});
const brick=material('tan brick facing',[1,1,1,1],0,.78);json.materials[brick].pbrMetallicRoughness.baseColorTexture={index:tex};
buildGallery122({box,rod,quad,material,brick,steel,silver,dark,black,lens,invisible});
const volunteerSign124=buildSign124({html,json,append,material,quad});
// Left-side pale stone faces keep all IT openings and the hall-side wall materials intact.
for(const [a,b]of [[-28.8,-10.35],[-6.45,6.45],[10.35,28.8]]){
 box('Gallery left stone facing',[-4.935,1.507,(a+b)/2],[.01,2.566,b-a],stone);
 box('Gallery left dark base',[-4.922,.33,(a+b)/2],[.024,.18,b-a],black);
 for(let y=.88;y<2.7;y+=.65)box('Gallery left stone bed joints',[-4.927,y,(a+b)/2],[.005,.008,b-a],panel);
 for(let z=a+.95;z<b;z+=1.35)box('Gallery left stone vertical joints',[-4.927,1.51,z],[.005,2.55,.006],panel);
}
for(const [a,b]of [[-10.35,-6.45],[6.45,10.35]])box('Gallery left stone door lintels',[-4.935,2.426,(a+b)/2],[.01,.756,b-a],stone);
await buildGallery119({add,box,rod,quad,material,append,json,stone,steel,edge,silver,black,lens,invisible});

// A continuous S-shaped airfoil, swept in plan rather than a row of straight trays.
const lightPath=z=>{const phase=(z+29)/20*Math.PI;return {x:-1.05+1.48*Math.sin(phase),z,dx:1.48*Math.PI/20*Math.cos(phase)};};
function lightRibbon(name,width,depth,lateral,y,mat){
 const ps=Array.from({length:281},(_,i)=>lightPath(-28+i*56/280));
 for(let i=0;i<ps.length-1;i++){
  const at=(p,side,h)=>{const n=1/Math.hypot(1,p.dx),d=lateral+side*width/2;return [p.x+d*n,y+h*depth/2,p.z-d*p.dx*n];};
  const a=ps[i],b=ps[i+1],a0=at(a,-1,-1),a1=at(a,1,-1),a2=at(a,1,1),a3=at(a,-1,1),b0=at(b,-1,-1),b1=at(b,1,-1),b2=at(b,1,1),b3=at(b,-1,1);
  for(const q of [[a0,b0,b1,a1],[a3,a2,b2,b3],[a1,b1,b2,a2],[a0,a3,b3,b0]])quad(name,...q,mat);
  if(i===0)quad(name,a0,a1,a2,a3,mat);if(i===ps.length-2)quad(name,b3,b2,b1,b0,mat);
 }
}
lightRibbon('Gallery suspended serpentine airfoil tray',1.06,.10,0,8.12,silver);
lightRibbon('Gallery suspended serpentine warm diffuser',.93,.014,0,8.062,lens);
lightRibbon('Gallery suspended serpentine service channel',.09,.035,0,8.033,steel);
for(const side of[-1,1])lightRibbon('Gallery serpentine folded rim',.035,.19,side*.525,8.145,edge);
for(let z=-27;z<=27;z+=2.7){
 const p=lightPath(z),n=1/Math.hypot(1,p.dx);
 for(const side of[-1,1]){const x=p.x+side*.43*n,zz=z-side*.43*p.dx*n;rod('Gallery light suspension cables',[x,8.23,zz],[x,10.4,zz],.007,silver,5);}
 rod('Gallery airfoil black downlights',[p.x,8.035,z],[p.x,8.002,z],.052,dark,10);
}
// Entry bridge soffit grid and flush downlights, above the existing stairs.
box('Entrance bridge white fascia',[0,2.946,32.194],[7.6,.155,.023],steel);
box('Entrance bridge pale soffit',[0,2.877,32.82],[7.6,.006,1.16],steel);
for(let x=-3.6;x<3.61;x+=.6)box('Entrance bridge soffit seams',[x,2.88,32.82],[.009,.008,1.16],panel);
for(let z=32.28;z<33.42;z+=.57)box('Entrance bridge soffit seams',[0,2.88,z],[7.6,.008,.009],panel);
for(const x of[-3,-1.5,0,1.5,3])rod('Entrance bridge recessed lights',[x,2.885,32.8],[x,2.867,32.8],.053,lens,12);

// Small blue hanging banners echo the gallery's vertical textile rhythm.
const banner=material('blue gallery banners',[.12,.33,.46,1],0,.95);
const bannerAccent=material('banner aqua ribbons',[.26,.55,.6,1],0,.88);
for(const z of[-18,0,18]){
 box('Gallery hanging blue banner',[4.86,7.65,z],[.035,2.55,.72],banner);
 for(let k=0;k<5;k++)quad('Gallery banner diagonal inlays',[4.834,6.45+k*.48,z-.36],[4.834,6.72+k*.48,z+.36],[4.834,6.8+k*.48,z+.36],[4.834,6.53+k*.48,z-.36],bannerAccent);
 rod('Gallery banner top rod',[4.82,8.98,z-.4],[4.82,8.98,z+.4],.016,silver);
}

let triangleCount=0;
for(const {name,mat,parts}of groups.values()){
 const positions=[],normals=[],uvs=[],indices=[];
 for(const g of parts){const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,offset=positions.length/3;for(let i=0;i<p.count;i++){positions.push(p.getX(i)/.3,p.getY(i)/.3,p.getZ(i)/.3);normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(u?u.getX(i):0,u?u.getY(i):0);}for(const i of g.index?g.index.array:Array.from({length:p.count},(_,i)=>i))indices.push(i+offset);g.dispose();}
 triangleCount+=indices.length/3;
 const primitive={attributes:{POSITION:accessor(new Float32Array(positions),'VEC3'),NORMAL:accessor(new Float32Array(normals),'VEC3'),TEXCOORD_0:accessor(new Float32Array(uvs),'VEC2')},indices:accessor(new Uint32Array(indices),'SCALAR',5125),material:mat};
 const mesh=json.meshes.length;json.meshes.push({name:'Gallery105 '+name,primitives:[primitive]});const node=json.nodes.length;
 const contact=mat===invisible;
 json.nodes.push({name:'Gallery105 '+name,mesh,extras:{kind:contact?'solidCollider':'galleryArchitecturalDetail',walktestCollide:contact,walktestBarrier:contact&&/119 |122 /.test(name),walktestRoof:/Roof /.test(name)}});json.scenes[json.scene||0].nodes.push(node);
}
// Only the named architectural visuals differ. The complete original binary and all other nodes remain identical.
for(let i=0;i<counts.nodes;i++){const current=structuredClone(json.nodes[i]);if(hidden.includes(i)){delete current.extras.gallery105HideVisual;if(original.nodes[i].extras===undefined)delete current.extras;}assert.deepEqual(current,original.nodes[i]);}
for(const key of arrays.filter(k=>k!=='nodes'))assert.deepEqual(json[key].slice(0,counts[key]),original[key]||[]);
assert(Buffer.concat(chunks).subarray(0,originalBin.length).equals(originalBin));
const report={counts,binLength:originalBin.length,hiddenNoExtras:hidden.filter(i=>original.nodes[i].extras===undefined),hiddenVisuals:hidden.length,newBatches:groups.size,newTriangles:triangleCount,sourceGeometrySHA256:crypto.createHash('sha256').update(originalBin).digest('hex'),originalGeometryUnchanged:true,exhibitInteriorsUnchanged:true,version:124,rightWing122:{bays:3,checkInShift:checkInShift122,checkInWallX:3.5},volunteerSign124};
json.extras={...json.extras,gallery105:report};json.buffers[0].byteLength=length;
let jb=Buffer.from(JSON.stringify(json));jb=Buffer.concat([jb,Buffer.alloc((4-jb.length%4)%4,32)]);let bb=Buffer.concat(chunks);bb=Buffer.concat([bb,Buffer.alloc((4-bb.length%4)%4)]);
const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jb.length+bb.length,8);header.writeUInt32LE(jb.length,12);header.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(bb.length);bh.writeUInt32LE(0x004e4942,4);
const result=Buffer.concat([header,jb,bh,bb]),encoded=zlib.gzipSync(result,{level:9}).toString('base64');
html=html.replace(old,'\n'+encoded+'\n');fs.writeFileSync(file,html);
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
