import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';

export async function loadDowntown134(doc,fleet){
 const source=await new NodeIO().read(new URL('./models.glb',import.meta.url).pathname),meshes=source.getRoot().listMeshes(),copied=copyToDocument(doc,source,meshes),find=name=>copied.get(meshes.find(m=>m.getName()===name));
 const models=source.getRoot().getExtras().models;
 for(const spec of models.filter(m=>m.id!=='hotel'))fleet[spec.id]={...spec,body:find(spec.body),wheels:spec.wheels.map(w=>({...w,mesh:find(spec.id+' '+w.role)}))};
 const hotel=models.find(m=>m.id==='hotel');return {...hotel,mesh:find(hotel.body)};
}

export function placeDowntown134({doc,scene,original,hidden,buildings,assets130,hotel,mesh,box,rod,material,lighting}){
 const report={hotel:null,lights:[]},p=[-41.7,-.1035,-31.5],retired='City_West_070_Building-Medium-01';
 const old=buildings.placements.find(b=>b.name===retired);
 assets130.retired131??=[];
 for(const n of original.getRoot().listNodes())if(n.getName().startsWith(retired)){hidden.push(n.getName());assets130.retired131.push(n.getName());}
 if(old){
  buildings.placements=buildings.placements.filter(b=>b!==old);
  for(const n of [...scene.listChildren()]){
   const q=n.getTranslation(),e=n.getExtras();
   if(['shopAwnings','fireEscapes','menus'].includes(e.detail111)&&q[0]>old.bounds.lo[0]-.8&&q[0]<old.bounds.hi[0]+.8&&q[2]>old.bounds.lo[2]-.8&&q[2]<old.bounds.hi[2]+.8)n.dispose();
  }
 }
 const bounds={lo:[p[0]-hotel.width/2,p[1],p[2]-hotel.length/2],hi:[p[0]+hotel.width/2,p[1]+hotel.height,p[2]+hotel.length/2]};
 scene.addChild(doc.createNode('Downtown134 The H riverside hotel').setMesh(hotel.mesh).setTranslation(p).setExtras({cityProp:true,building125:true,hotel134:true,collider107:{center:[0,hotel.height/2,0],size:[hotel.width,hotel.height,hotel.length]}}));
 report.hotel={archive:hotel.archive,p,bounds,replaced:retired};buildings.placements.push({name:'Downtown134 The H riverside hotel',bounds,position:p,size:[hotel.width,hotel.height,hotel.length]});
 const aluminum=material('Downtown134 architectural light housings',[.09,.10,.10,1],null,.65,.35),lens=material('Downtown134 warm architectural lenses',[.75,.64,.44,1],null,0,.3).setExtras({surfaceType:28});
 function light(name,p,radius,power,direction=[0,-1,0],outer=-.35){
  const id='Downtown134 '+name;report.lights.push({id,p,radius,power,color:[1,.73,.40],direction,outer});
  scene.addChild(doc.createNode(id).setMesh(mesh(id,[box([0,0,0],[.24,.065,.14],aluminum),box([0,-.036,0],[.21,.009,.11],lens)])).setTranslation(p).setExtras({cityProp:true}));
 }
 // Canopy wash, visible downlights, and broad overlapping forecourt pools.
 for(const x of[-4,0,4])light('front canopy downlight '+x,[x,3.0,35.20],7.2,2.5);
 for(const x of[-4.6,4.6])light('arched facade wash '+x,[x,.18,35.5],12,4.1,[0,.92,-.39],.1);
 for(const x of[-3,0,3])light('upper gallery warm wash '+x,[x,7.7,34.55],10,2.1,[0,0,1],-.85);
 for(let x=10;x<=61;x+=6)light('front wing downlight '+x,[x,2.65,34.95],7.8,5.2);
 for(const x of[-21,-15,-9])light('west forecourt light '+x,[x,2.4,34.9],7,4.0);
 for(const [x,z]of[[-28.3,34.6],[-22.5,34.6]])light('sculpture wash '+x,[x,.12,z],6.8,2.4,[0,.6,.8],-.4);
 for(let z=-31;z<=29;z+=7.5)light('east colonnade downlight '+z,[63.4,2.8,z],7,3.8);
 for(const [x,z]of[[-46,-35.7],[-37.4,-35.7],[-46,-27.4],[-37.4,-27.4]])light('hotel entrance '+x+' '+z,[x,2.2,z],6,3.3);
 // Increase existing roadway pools; their physical positions and breakaway behavior stay intact.
 for(const l of lighting.lights)if(!l.alwaysOn){l.power*=1.65;l.radius*=1.16;}
 lighting.lights.push(...report.lights);return report;
}
