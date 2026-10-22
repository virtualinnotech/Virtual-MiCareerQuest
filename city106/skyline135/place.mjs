import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';

export async function placeSkyline135({doc,scene,original,worldBounds,hidden,buildings,assets130,lighting,mesh,box,material}){
 const source=await new NodeIO().read(new URL('./models.glb',import.meta.url).pathname),meshes=source.getRoot().listMeshes(),copied=copyToDocument(doc,source,meshes),records=[];
 const sites=[
  {id:'modern',road:'front',replaces:'City_Front_134_Building-Medium-01',p:[18.04,-.0285,50.10],yaw:Math.PI},
  {id:'chase',road:'west',replaces:'City_West_078_Building-Medium-01',p:[-40.0,-.0285,2.1],yaw:Math.PI/2},
  {id:'skyscraper',road:'east',replaces:'City_East_186_Building-Medium-01',p:[77.5,-.0285,-29.35],yaw:-Math.PI/2},
  {id:'beveled',road:'hospital riverbank',replaces:'City_Riverbank_101_Building-Big-Wide-01',p:[-16.45,-.0285,-76.9],yaw:0}
 ];
 const paving=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 paving');
 for(const site of sites){
  const src=meshes.find(m=>m.getExtras().id===site.id),model=copied.get(src),size=src.getExtras().size,c=Math.abs(Math.cos(site.yaw)),s=Math.abs(Math.sin(site.yaw)),w=c*size[0]+s*size[2],d=s*size[0]+c*size[2];
  const bounds={lo:[site.p[0]-w/2,site.p[1],site.p[2]-d/2],hi:[site.p[0]+w/2,site.p[1]+size[1],site.p[2]+d/2]},old=buildings.placements.find(b=>b.name===site.replaces);
  if(!old)throw Error('Missing skyline replacement lot '+site.replaces);
  const collides=(a,b,gap=0)=>a.lo[0]<b.hi[0]+gap&&a.hi[0]>b.lo[0]-gap&&a.lo[2]<b.hi[2]+gap&&a.hi[2]>b.lo[2]-gap;
  for(const b of buildings.placements)if(b!==old&&collides(bounds,b.bounds,.05))throw Error(site.id+' overlaps '+b.name);
  for(const n of original.getRoot().listNodes()){
   if(n.getName().startsWith(site.replaces)){hidden.push(n.getName());assets130.retired131.push(n.getName());}
   if(n.getMesh()&&n.getExtras().kind==='cityStreet'&&collides(bounds,worldBounds(n),.3))throw Error(site.id+' overlaps roadway');
  }
  for(const n of [...scene.listChildren()]){
   const q=n.getTranslation(),e=n.getExtras();
   const attached=e.detail109==='shopfronts'||['shopAwnings','fireEscapes','menus'].includes(e.detail111),pad=e.detail109==='shopfronts'?.10:.8;
   if(attached&&q[0]>old.bounds.lo[0]-pad&&q[0]<old.bounds.hi[0]+pad&&q[2]>old.bounds.lo[2]-pad&&q[2]<old.bounds.hi[2]+pad)n.dispose();
  }
  // The Chase plaza is walkable; only its tower footprint blocks pedestrians.
  const solidLo=[Infinity,0,Infinity],solidHi=[-Infinity,size[1],-Infinity];
  const floor=doc.createMesh('Skyline135 '+site.id+' paving');
  for(const pr of [...model.listPrimitives()]){
   const a=pr.getAttribute('POSITION');for(let i=0;i<a.getCount();i++){const p=a.getElement(i,[]);if(p[1]<2)continue;for(const k of[0,2]){solidLo[k]=Math.min(solidLo[k],p[k]);solidHi[k]=Math.max(solidHi[k],p[k]);}}
   if(pr.getExtras().ground135){model.removePrimitive(pr);floor.addPrimitive(pr.setMaterial(paving));}
  }
  const name='Skyline135 '+site.id,center=solidLo.map((v,k)=>(v+solidHi[k])/2),solidSize=solidHi.map((v,k)=>v-solidLo[k]);
  const rotation=[0,Math.sin(site.yaw/2),0,Math.cos(site.yaw/2)];
  scene.addChild(doc.createNode(name).setMesh(model).setTranslation(site.p).setRotation(rotation).setExtras({cityProp:true,building125:true,skyline135:site.id,collider107:{center,size:solidSize}}));
  if(floor.listPrimitives().length)scene.addChild(doc.createNode(name+' flush plaza').setMesh(floor).setTranslation(site.p).setRotation(rotation).setExtras({cityProp:true,surface115:true}));else floor.dispose();
  buildings.placements=buildings.placements.filter(b=>b!==old);buildings.placements.push({name,bounds,position:site.p,size:[w,size[1],d],source:site.id});
  records.push({...site,name,size:[w,size[1],d],bounds});
  const lightAxis=site.road==='front'?2:0,front=site.road==='front'?bounds.lo[2]-.18:site.road==='west'?bounds.hi[0]+.18:bounds.lo[0]-.18;
  for(const offset of[-.9,.9]){
   const p=[site.p[0],2.3,site.p[2]];p[lightAxis]=front;p[lightAxis===0?2:0]+=offset;
   const id=name+' entrance light '+offset,body=material(id+' housing',[.10,.11,.12,1],null,.6,.4),lens=material(id+' lens',[.75,.64,.44,1],null,0,.3).setExtras({surfaceType:28});
   scene.addChild(doc.createNode(id).setMesh(mesh(id,[box([0,0,0],[.20,.05,.12],body),box([0,-.028,0],[.17,.008,.10],lens)])).setTranslation(p).setExtras({cityProp:true}));
   lighting.lights.push({id,p,radius:5,power:2.2,color:[1,.73,.40],direction:[0,-1,0],outer:-.3});
  }
 }
 return {placements:records};
}
