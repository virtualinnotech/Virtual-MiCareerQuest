import {createRequire} from 'node:module';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';
const D=createRequire(import.meta.url)('../district115.js');

export async function addRiverLights136({doc,scene,lighting,mesh,box,rod,material}){
 const source=await new NodeIO().read(new URL('./lamp.glb',import.meta.url).pathname),src=source.getRoot().listMeshes()[0];
 const lamp=copyToDocument(doc,source,[src]).get(src),head=source.getRoot().getExtras().head;
 const report={archive:'street-lamp.zip',lamps:[],bridge:[],uplights:[]};
 const warm=[1,.78,.49],white=[1,.88,.69];
 const dark=material('River136 graphite light housing',[.035,.045,.048,1],null,.5,.56);
 const lens=material('River136 warm light lens',[.8,.76,.65,1],null,0,.35).setExtras({surfaceType:28});
 const fixtures=scene.listChildren().filter(n=>n.getExtras().collider107||n.getExtras().tree).map(n=>({p:n.getTranslation(),c:n.getExtras().collider107}));
 function add(name,model,p,extras={},yaw=0){
  const n=doc.createNode('River136 '+name).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setExtras({cityProp:true,...extras});scene.addChild(n);return n;
 }
 function light(n,p,radius,power,color,direction,outer,group){
  const record={id:n.getName(),p,radius,power,color,direction,outer};lighting.lights.push(record);report[group].push(record);
 }
 const clear=p=>!fixtures.some(f=>Math.hypot(f.p[0]-p[0],f.p[2]-p[2])<.40+Math.min(.55,(f.c?.size[0]||.2)/2));
 function streetlamp(x,z,yaw=0){
  // Keep poles on the water-side edge, outside the through-walking band.
  let p=[x,-.021,z];for(const offset of[0,.55,-.55,1,-1]){p=[x+offset,-.021,z];if(clear(p))break;}
  if(!clear(p)||D.bridges.some(b=>Math.abs(p[0]-b.x)<D.width(b,z)/2+.35))return;
  const n=add('riverwalk lamp '+report.lamps.length,lamp,p,{street128:'lanterns',collider107:{center:[0,1.05,0],size:[.13,2.1,.13]}},yaw);
  const h=new T.Vector3(...head).applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix())).toArray();
  light(n,h,5.2,3.3,warm,[0,-1,0],-.3,'lamps');fixtures.push({p,c:{size:[.13,2.1,.13]}});
 }
 for(let x=-29;x<=65;x+=4.7)streetlamp(x,-36.85,-Math.PI/2);
 for(let x=-29;x<=65;x+=6.5)streetlamp(x,-64.8,Math.PI/2);
 // The bridge's small fixtures attach to its rails and upper cross-members.
 const b=D.bridges.find(b=>b.foot),down=mesh('River136 bridge downlight',[box([0,0,0],[.16,.05,.16],dark),box([0,-.028,0],[.12,.009,.12],lens)]);
 const up=mesh('River136 architectural uplight',[box([0,.035,0],[.17,.07,.14],dark),box([0,.074,0],[.13,.008,.10],lens)]);
 for(const z of[-37.3,-43.8,-50.3,-56.8,-63.3]){
  const y=D.elevation(b,z);
  for(const side of[-1,1]){
   const x=b.x+side*.87,n=add('blue bridge rail uplight '+report.bridge.length,up,[x,y+.10,z]);
   light(n,[x,y+.18,z],4.8,2.2,white,[side*.12,.98,0],-.30,'bridge');
  }
  const n=add('blue bridge walkway light '+report.bridge.length,down,[b.x,y+1.70,z]);
  light(n,[b.x,y+1.66,z],5.8,3.0,white,[0,-1,0],-.15,'bridge');
 }
 // Warm, overlapping washes climb the exterior wall instead of tinting it.
 for(let x=6.4;x<62;x+=4.25){
  const n=add('DeVos rear facade uplight '+report.uplights.length,up,[x,.035,-29.35]);
  light(n,[x,.14,-29.35],12.5,5.2,warm,[0,.95,.312],.48,'uplights');
 }
 for(const x of[-3.5,0,3.5]){
  const n=add('Grand Gallery rear uplight '+report.uplights.length,up,[x,.035,-32.1]);
  light(n,[x,.14,-32.1],12.5,5.2,warm,[0,.96,.28],.48,'uplights');
 }
 // A slim illuminated rail gives a continuous readable edge between the pools.
 const strips=[];
 for(let z=-37.35;z>-63.3;z-=.4)for(const side of[-1,1]){
  const end=Math.max(z-.4,-63.3),x=b.x+side*.88;
  strips.push(rod([x,D.elevation(b,z)+.38,z],[x,D.elevation(b,end)+.38,end],.009,.009,lens,4));
 }
 add('blue bridge concealed handrail strips',mesh('River136 bridge rail lighting',strips),[0,0,0]);
 return report;
}
