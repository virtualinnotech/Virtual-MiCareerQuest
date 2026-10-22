import fs from 'node:fs';
import * as T from '../pc66/vendor/three/three.core.js';
import {Document,NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import C from './core.js';
import {facadeFinishes,finish,projectUV} from './finishes149.mjs';
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene(C.name+' training lobby'),groups=new Map(),contacts=[];
const mat=(name,c,metal=0,rough=.65)=>doc.createMaterial(name).setBaseColorFactor(c).setMetallicFactor(metal).setRoughnessFactor(rough).setDoubleSided(true);
const plaster=mat('Ivory plaster',[.78,.77,.68,1]),wood=mat('Walnut paneling',[.13,.055,.027,1],0,.38),gold=mat('Antique brass',[.66,.44,.14,1],.65,.3),dark=mat('Bronze balustrades',[.055,.045,.027,1],.5,.35),stone=mat('Honey marble',[.56,.47,.30,1],.1,.35),cream=mat('Molding highlights',[.9,.85,.70,1]);
const wallpaper=mat('Damask silk',[.74,.67,.47,1],0,.9),leaf=mat('Vaulted gold leaf',[.60,.43,.16,1],.25,.55),carpet=mat('Victorian woven floral carpet',[.85,.85,.85,1],0,1);
const masonry=await facadeFinishes(doc),facade=finish(mat('Exterior city brick',[1,1,1,1]),masonry.brick);
carpet.setBaseColorTexture(doc.createTexture('Floral carpet').setImage(fs.readFileSync(new URL('./assets/carpet.png',import.meta.url))).setMimeType('image/png'));
async function texture(m,svg,name){m.setBaseColorTexture(doc.createTexture(name).setImage(await sharp(Buffer.from(svg)).png().toBuffer()).setMimeType('image/png'));}
await texture(wallpaper,`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#d2c5a1"/><g fill="none" stroke="#a39368" stroke-width="2" opacity=".6"><path d="M128 0 Q65 55 128 128 Q191 200 128 256 M128 0 Q191 55 128 128 Q65 200 128 256 M0 128 Q55 65 128 128 Q200 191 256 128 M0 128 Q55 191 128 128 Q200 65 256 128"/><path d="M128 25 C85 65 106 85 128 103 C150 85 171 65 128 25 M128 153 C85 193 106 213 128 231 C150 213 171 193 128 153"/></g><g fill="#a39368" opacity=".6"><circle cx="128" cy="128" r="6"/><circle cx="0" cy="0" r="6"/><circle cx="256" cy="256" r="6"/></g></svg>`,'Silk damask');
await texture(leaf,`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="4" seed="146"/><feColorMatrix type="saturate" values="0"/></filter><rect width="512" height="512" fill="#c5a13d"/><rect width="512" height="512" filter="url(#n)" opacity=".23"/><g fill="none" stroke="#8c6a25" stroke-opacity=".35">${Array.from({length:17},(_,i)=>`<path d="M${i*32} 0V512 M0 ${i*32}H512"/>`).join('')}</g></svg>`,'Gold leaf texture');
await texture(wood,`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="512"><filter id="n"><feTurbulence baseFrequency=".08 .007" numOctaves="3" seed="35"/><feColorMatrix type="saturate" values="0"/></filter><rect width="256" height="512" fill="#623621"/><rect width="256" height="512" filter="url(#n)" opacity=".3"/></svg>`,'Walnut grain');
for(const m of [wallpaper,leaf,wood,carpet]){m.getBaseColorTextureInfo().setWrapS(10497).setWrapT(10497);}
const cuts=C.windows.map(w=>{const along=2-w.axis,lo=[-4,w.y,-5.2],hi=[4,w.y+w.height,5.2];lo[along]=w.along-w.width/2;hi[along]=w.along+w.width/2;if(w.wall<0)hi[w.axis]=w.wall+.30;else lo[w.axis]=w.wall-.30;return {lo,hi};});
function split(poly,axis,value,sign){const inside=[],outside=[];for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign;(da>=0?inside:outside).push(a);if((da>=0)!==(db>=0)){const t=da/(da-db),p=a.map((v,i)=>v+(b[i]-v)*t);inside.push(p);outside.push(p);}}return[inside,outside];}
function add(g,m,clipWindows=true){
 g.computeBoundingBox();const relevant=clipWindows?cuts.filter(c=>g.boundingBox.intersectsBox(new T.Box3(new T.Vector3(...c.lo),new T.Vector3(...c.hi)))):[];
 if(relevant.length){const pos=g.attributes.position,nor=g.attributes.normal,uv=g.attributes.uv;let polys=[];
  for(let i=0;i<g.index.count;i+=3)polys.push([0,1,2].map(j=>{const k=g.index.getX(i+j);return[pos.getX(k),pos.getY(k),pos.getZ(k),nor.getX(k),nor.getY(k),nor.getZ(k),uv?.getX(k)||0,uv?.getY(k)||0];}));
  for(const cut of relevant){const kept=[];for(let p of polys){for(let axis=0;axis<3&&p.length;axis++)for(const [value,sign]of [[cut.lo[axis],1],[cut.hi[axis],-1]]){const parts=split(p,axis,value,sign);if(parts[1].length>=3)kept.push(parts[1]);p=parts[0];}}polys=kept;}
  const p=[],n=[],u=[];for(const poly of polys)for(let i=1;i<poly.length-1;i++)for(const v of[poly[0],poly[i],poly[i+1]]){p.push(...v.slice(0,3));n.push(...v.slice(3,6));u.push(...v.slice(6));}
  g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(Array.from({length:p.length/3},(_,i)=>i));
 }
 if(m===facade)g.setAttribute('uv',new T.Float32BufferAttribute(projectUV(Array.from(g.attributes.position.array),Array.from(g.attributes.normal.array),.78),2));
 if(!groups.has(m))groups.set(m,[]);groups.get(m).push(g);
}
function box(name,p,s,m,solid=false){const g=new T.BoxGeometry(...s);g.translate(...p);add(g,m);if(solid)contacts.push({name,lo:p.map((x,i)=>x-s[i]/2),hi:p.map((x,i)=>x+s[i]/2)});}
function rod(a,b,r,m){const start=new T.Vector3(...a),end=new T.Vector3(...b),g=new T.CylinderGeometry(r,r,start.distanceTo(end),8);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),end.clone().sub(start).normalize()));g.translate(...start.add(end).multiplyScalar(.5).toArray());add(g,m);}
function plane(w,h,p,m,rx=0,yaw=0,repeat=[1,1]){const g=new T.PlaneGeometry(w,h);g.rotateX(rx);g.rotateY(yaw);g.translate(...p);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*repeat[0],u.getY(i)*repeat[1]);add(g,m);}
function rail(a,b){for(const y of [2.12,2.52])rod([a[0],y,a[1]],[b[0],y,b[1]],.025,gold);const length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let i=0;i<=length/.12;i++){const t=i/(Math.ceil(length/.12));const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;rod([x,2.12,z],[x,2.51,z],.009,dark);const ring=new T.TorusGeometry(.045,.006,5,12);ring.translate(x,2.31,z);add(ring,gold);}contacts.push({name:'balcony railing',lo:[Math.min(a[0],b[0])-.03,2.1,Math.min(a[1],b[1])-.03],hi:[Math.max(a[0],b[0])+.03,2.56,Math.max(a[1],b[1])+.03]});}
box('Lobby floor',[0,-.06,0],[7.137,.12,8.304],stone,true);
plane(5.55,6.8,[0,.003,.30],carpet,-Math.PI/2,0,[3,4]);
for(const x of [-2.85,2.85])box('Marble inlay',[x,.006,0],[.035,.006,8.1],gold);
for(const z of [-3.65,3.65])box('Marble inlay',[0,.006,z],[5.73,.006,.035],gold);
// Front wall has a real opening; upper walls enclose the vaulted double-height lobby.
const entry=C.door151,wallWidth=3.33-entry.openingWidth/2,wallCenter=(3.33+entry.openingWidth/2)/2,lintelY=(5.6+entry.openingHeight)/2,lintelHeight=5.6-entry.openingHeight;
for(const side of [-1,1])box('Front wall',[side*wallCenter,2.8,entry.front],[wallWidth,5.6,.12],facade,true);
box('Entry lintel',[0,lintelY,entry.front],[entry.openingWidth,lintelHeight,.12],facade,true);
for(const side of[-1,1]){plane(wallWidth,5.6,[side*wallCenter,2.8,-3.903],wallpaper,0,0,[6,10]);box('Front interior wainscot',[side*wallCenter,.47,-3.90],[wallWidth,.94,.012],wood);}
plane(entry.openingWidth,lintelHeight,[0,lintelY,-3.903],wallpaper,0,0,[4,8]);
box('Rear wall',[0,2.8,3.76],[6.78,5.6,.12],plaster,true);
for(const x of [-3.39,3.39])box('Side wall',[x,2.8,-.105],[.12,5.6,7.85],facade,true);
// Fill the rectangular cut's upper corners to follow the supplied arched frames.
for(const w of C.windows)for(const face of[-1,1])for(let j=0;j<24;j++){
 const r=w.width/2,a=-r+j*w.width/24,b=a+w.width/24,top=w.y+w.height;
 const arch=.35*w.height/1.15,h=x=>top-arch+arch*Math.sqrt(Math.max(0,1-x*x/(r*r))),point=(u,y)=>w.axis===0?[w.wall+face*.066,y,w.along+u]:[w.along+u,y,w.wall+face*.068];
 const points=[point(a,h(a)),point(b,h(b)),point(b,top),point(a,top)],exterior=w.wall<0?face<0:face>0;
 const uv=points.flatMap(p=>w.axis===0?[(Math.sign(w.wall)*(p[2]+.1)/7.65+.5)*20,((p[1]-2.72)/3.3+.5)*8]:[((p[0]-Math.sign(w.along)*2.04)/2.58+.5)*6,((p[1]-2.8)/5.6+.5)*10]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(g,exterior?facade:wallpaper,false);
}
for(const side of [-1,1]){
 box('Walnut wainscot',[side*3.30,.48,-.1],[.06,.96,7.65],wood);
 plane(7.65,3.3,[side*3.325,2.72,-.1],wallpaper,0,-side*Math.PI/2,[20,8]);
 box('Balcony gallery floor',[side*3.05,2.04,.4],[.83,.12,7.35],cream,true);
 rail([side*2.64,-3.28],[side*2.64,2.85]);
 for(const y of [.04,.11,.92,.98,1.99,2.07,4.38,4.44,4.50])box('Layered cornice',[side*3.28,y,-.1],[y>4?.22:.11,.055,7.65],y<1?wood:cream);
 for(let z=-3.6;z<3.6;z+=.68){box('Raised walnut panels',[side*3.255,.47,z],[.04,.64,.54],wood);for(const dz of [-.255,.255])box('Panel gold edging',[side*3.227,.47,z+dz],[.007,.61,.009],gold);}
 for(const z of [-3.90,-2.59,-1.33,-.07,1.19,2.45,3.71]){
  box('Pilaster',[side*3.34,2.65,z],[.18,3.6,.18],cream);
  for(const y of [1,1.1,4.25,4.38])box('Pilaster capital',[side*3.32,y,z],[.26,.09,.29],cream);
 }
}
box('Rear balcony landing',[0,2.04,3.38],[6.65,.12,.86],cream,true);
for(const [a,b]of [[-2.64,-1.72],[1.72,2.64]])rail([a,2.95],[b,2.95]);
box('Reception walnut backdrop',[0,.48,3.66],[6.6,.96,.08],wood);
plane(6.6,3.3,[0,2.7,3.695],wallpaper,0,Math.PI,[16,8]);
for(const y of [.10,.94,2.03,2.10,4.4,4.46])box('Rear crown molding',[0,y,3.65],[6.6,.06,.12],cream);
// Curved coffer panels and ivory arch ribs, not a flat ceiling.
for(let j=0;j<48;j++){const a=-Math.PI/2+j*Math.PI/48,b=a+Math.PI/48,x1=Math.sin(a)*3.5,x2=Math.sin(b)*3.5,y1=4.47+Math.cos(a)*1.08,y2=4.47+Math.cos(b)*1.08;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([x1,y1,-4.1,x2,y2,-4.1,x2,y2,4.1,x1,y1,4.1],3));g.setAttribute('uv',new T.Float32BufferAttribute([j/8,0,(j+1)/8,0,(j+1)/8,8,j/8,8],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();add(g,leaf);}
for(const z of [-4,-2,0,2,4])for(let j=0;j<32;j++){const a=-Math.PI/2+j*Math.PI/32,b=a+Math.PI/32;rod([Math.sin(a)*3.48,4.45+Math.cos(a)*1.08,z],[Math.sin(b)*3.48,4.45+Math.cos(b)*1.08,z],.07,cream);}
box('Hotel roof',[0,5.65,0],[7.137,.1,8.304],plaster,true);
// Fixed sidelights join the facade to the curved drum; only the rotor moves.
const entryGlass=mat('Fixed entrance sidelights',[.66,.83,.86,.13],.08,.12).setAlphaMode('BLEND');
for(const side of [-1,1])box('Entry jamb',[side*(entry.openingWidth/2+.025),entry.openingHeight/2,entry.front],[.07,entry.openingHeight,.14],gold,true);
const infillWidth=entry.openingWidth/2-entry.infillInner,infillX=(entry.openingWidth/2+entry.infillInner)/2;
for(const side of [-1,1]){
 box('Fixed entrance sidelight',[side*infillX,.43,entry.front],[infillWidth,.86,.016],entryGlass,true);
 box('Sidelight drum seal',[side*entry.infillInner,.43,entry.front],[.025,.86,.025],gold);
 box('Sidelight kick plate',[side*infillX,.04,entry.front],[infillWidth,.08,.035],gold);
 box('Sidelight top infill',[side*infillX,.92,entry.front],[infillWidth,.28,.07],gold);
}
box('Fitted door header',[0,1.035,entry.front],[entry.openingWidth,.05,.14],gold,true);
box('Flush entrance sign',[0,1.27,entry.front-.08],[1.40,.27,.06],dark);
box('Door threshold',[0,-.007,entry.z],[entry.openingWidth,.02,1.05],stone,true);
// Small shaded lamps make the window seating a quiet waiting area.
const linen=mat('Warm linen lampshades',[.94,.79,.51,1],0,.9);
for(const [,p] of C.waiting154.filter(o=>o[0]==='side-table')){
 const [x,,z]=p;
 const base=new T.CylinderGeometry(.056,.066,.018,20);base.translate(x,.259,z);add(base,gold);
 rod([x,.26,z],[x,.46,z],.011,gold);
 const shade=new T.CylinderGeometry(.055,.092,.13,24,1,true);shade.translate(x,.465,z);add(shade,linen);
 for(const [radius,y] of [[.055,.53],[.092,.40]]){const rim=new T.TorusGeometry(radius,.004,6,24);rim.rotateX(Math.PI/2);rim.translate(x,y,z);add(rim,gold);}
}
const acc=(v,t)=>doc.createAccessor().setType(t).setArray(v).setBuffer(buffer);
for(const [m,parts]of groups){const p=[],n=[],u=[],idx=[];let off=0;for(const g of parts){p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);u.push(...(g.attributes.uv?.array||new Float32Array(g.attributes.position.count*2)));idx.push(...Array.from(g.index.array,k=>k+off));off+=g.attributes.position.count;}const primitive=doc.createPrimitive().setAttribute('POSITION',acc(new Float32Array(p),'VEC3')).setAttribute('NORMAL',acc(new Float32Array(n),'VEC3')).setAttribute('TEXCOORD_0',acc(new Float32Array(u),'VEC2')).setIndices(acc(new Uint32Array(idx),'SCALAR')).setMaterial(m);scene.addChild(doc.createNode(m.getName()).setMesh(doc.createMesh(m.getName()).addPrimitive(primitive)));}
doc.getRoot().setExtras({hotel146:{contacts}});await new NodeIO().write(new URL('./assets/lobby.glb',import.meta.url).pathname,doc);console.log('Hotel shell:',groups.size,'material groups;',contacts.length,'collision surfaces');
