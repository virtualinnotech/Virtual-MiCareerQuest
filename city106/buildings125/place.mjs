import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';

const dir=path.dirname(fileURLToPath(import.meta.url));
export async function addBuildings125({doc,scene,original,worldBounds,hidden,mesh,box,material}){
 const library=await new NodeIO().read(path.join(dir,'buildings.glb'));
 const selected=new Set(['london-0','chicago-0','chicago-1','nyc-0','nyc-1','nyc-2','nyc-3','pbr-0','scene-1','scene-3','scene-6','scene-13','scene-16','scene-17','scene-19','scene-28','procedural-1','procedural-2','procedural-5']);
 const sourceMeshes=library.getRoot().listMeshes().filter(m=>selected.has(m.getName())||selected.has(m.getName().replace(/ far$/,'')));
 const copies=copyToDocument(doc,library,sourceMeshes),models=sourceMeshes.filter(m=>selected.has(m.getName())).map(m=>copies.get(m));
 const placements=[],counts={},variants={},nodes=original.getRoot().listNodes();
 const groups={street:['chicago','nyc','pbr','procedural','scene','nyc','chicago','scene'],back:['scene','london','scene','procedural','nyc','scene','chicago']};
 let i=0;
 for(const n of nodes){
  const kind=n.getExtras().kind;if(!n.getMesh()||!['cityBuildingDetailed','distantCityBackdropDetailed'].includes(kind))continue;
  if(n.getName()==='City_Riverbank_100_Building-Medium-01'){hidden.push(n.getName());continue;}
  const {lo,hi}=worldBounds(n),cx=(lo[0]+hi[0])/2,cz=(lo[2]+hi[2])/2,w=hi[0]-lo[0],d=hi[2]-lo[2];
  const back=kind==='distantCityBackdropDetailed',pool=groups[back?'back':'street'],source=pool[i%pool.length];
  const axis=Math.abs(cx-18)>Math.abs(cz-7)?0:2,side=(axis===0?cx<18:cz<7)?1:-1;
  const yaw=axis===2?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2),turned=axis===0;
  const candidates=models.filter(m=>m.getExtras().source===source).map(m=>{
   const size=m.getExtras().size,mw=size[turned?2:0],md=size[turned?0:2],scale=Math.min(w/mw,d/md)*.97;
   return {m,size,scale,mw,md,score:Math.abs(Math.log((w/d)/(mw/md)))+(variants[m.getName()]||0)*.025};
  }).sort((a,b)=>a.score-b.score);
  const chosen=candidates[(i%5===0&&candidates.length>1)?1:0],{m,size,scale,mw,md}=chosen;
  const p=[cx,Math.max(-.101,lo[1]),cz];
  // Align the street-facing edge; uniform scale keeps doors and windows in proportion.
  p[axis]=side>0?hi[axis]-(axis===0?mw:md)*scale/2-.02:lo[axis]+(axis===0?mw:md)*scale/2+.02;
  const name='Building125 '+n.getName();
  scene.addChild(doc.createNode(name).setMesh(m).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale([scale,scale,scale]).setExtras({cityProp:true,building125:{source,variant:m.getName()}}));
  hidden.push(n.getName());counts[source]=(counts[source]||0)+1;variants[m.getName()]=(variants[m.getName()]||0)+1;
  placements.push({name,source,variant:m.getName(),lot:{lo,hi},position:p,yaw,scale,size:size.map(x=>x*scale),bounds:{lo:[p[0]-mw*scale/2,p[1],p[2]-md*scale/2],hi:[p[0]+mw*scale/2,p[1]+size[1]*scale,p[2]+md*scale/2]}});i++;
 }
 for(const n of scene.listChildren())if(n.getExtras().detail109==='shopfronts'||['shopAwnings','fireEscapes'].includes(n.getExtras().detail111))n.dispose();
 const facade=addVenueFacade125({scene,original,worldBounds,doc,mesh,box,material});
 return {counts,variants,placements,facade};
}

export function addVenueFacade125({scene,original,worldBounds,doc,mesh,box,material}){
 const nodes=original.getRoot().listNodes();
 // The recessed facade is decorative glass. Give it a continuous physical wall,
 // stopping short of the entrance vestibule so the usable doors remain open.
 const glazing=nodes.filter(n=>/^Exterior44_front_recessed_glazing_\d+$/.test(n.getName())),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const n of glazing){const b=worldBounds(n);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],b.lo[k]);hi[k]=Math.max(hi[k],b.hi[k]);}}
 if(!glazing.length)throw Error('Front facade panels missing');
 const center=[(lo[0]+hi[0])/2,1.6,(lo[2]+hi[2])/2],size=[hi[0]-lo[0]+.18,3.5,.16];
 const invisible=material('Building125 facade collision',[0,0,0,0]);
 scene.addChild(doc.createNode('DeVos125 front glass wall').setMesh(mesh('DeVos125 physical facade',[box(center,size,invisible)])).setExtras({contactOnly115:true,collider107:{center,size}}));
 return {panels:glazing.length,center,size};
}
