export function addParkRoomBorder137({doc,scene,mesh,box,material}){
 // Network40's annex floor is at .24, above the park's -.0765 foundation.
 // The solid skirt overlaps its three exterior walls, never the IT doorway.
 const footprint={x0:-20.84,x1:-15.16,z0:-18.84,z1:-13.2},bottom=-.12,top=.265;
 const stone=material('Park137 limestone foundation',[.34,.36,.34,1],null,0,.9).setExtras({surfaceType:26});
 const cap=material('Park137 stone planter coping',[.43,.45,.42,1],null,0,.85).setExtras({surfaceType:26});
 const soil=doc.getRoot().listMaterials().find(m=>m.getName()==='Tree137 dark soil and bark mulch');
 const shrub=doc.getRoot().listMeshes().find(m=>m.getName()==='City107 branching leafy shrub');
 const grass=doc.getRoot().listMeshes().find(m=>m.getName()==='City107 ornamental grasses and perennials');
 const report={footprint,base:{bottom,top},beds:[],plants:0,colliders:[]};
 function solid(name,p,size,mat){
  scene.addChild(doc.createNode(name).setMesh(mesh(name,[box([0,0,0],size,mat)])).setTranslation(p).setExtras({cityProp:true,parkBorder137:true,collider107:{center:[0,0,0],size}}));report.colliders.push({name,p,size});
 }
 const slabTop=.22;
 solid('Park137 server room solid foundation',[-18,(bottom+slabTop)/2,-16.02],[5.68,slabTop-bottom,5.64],stone);
 for(const x of[footprint.x0+.04,footprint.x1-.04])solid('Park137 server room side skirt '+x,[x,(bottom+top)/2,-16.02],[.08,top-bottom,5.64],stone);
 solid('Park137 server room rear skirt',[-18,(bottom+top)/2,footprint.z0+.04],[5.52,top-bottom,.08],stone);
 const beds=[{x0:-21.42,x1:footprint.x0,z0:-19.42,z1:-13.34},{x0:footprint.x1,x1:-14.58,z0:-19.42,z1:-13.34},{x0:footprint.x0,x1:footprint.x1,z0:-19.42,z1:footprint.z0}];
 for(const [i,b]of beds.entries()){
  const x=(b.x0+b.x1)/2,z=(b.z0+b.z1)/2,w=b.x1-b.x0,d=b.z1-b.z0;
  const parts=[box([0,.035,0],[w-.104,.10,d-.104],soil)];
  // Soil is retained behind the low stone edge instead of floating on a slab.
  for(const sx of[-1,1])parts.push(box([sx*(w/2-.026),.045,0],[.052,.15,d],stone),box([sx*(w/2-.026),.125,0],[.07,.025,d+.016],cap));
  for(const sz of[-1,1])parts.push(box([0,.045,sz*(d/2-.026)],[w-.052,.15,.052],stone),box([0,.125,sz*(d/2-.026)],[w-.052,.025,.07],cap));
  const name='Park137 planted room border '+i;scene.addChild(doc.createNode(name).setMesh(mesh(name,parts)).setTranslation([x,0,z]).setExtras({cityProp:true,parkBorder137:true,collider107:{center:[0,.04,0],size:[w,.19,d]}}));report.beds.push(b);
  const along=d>w?2:0,start=along===2?b.z0:b.x0,end=along===2?b.z1:b.x1;
  for(let q=start+.32,j=0;q<end-.2;q+=.46,j++){
   const p=along===2?[x,.09,q]:[q,.09,z],scale=.64+(j%3)*.045,name='Park137 border '+i+' plant '+j;
   scene.addChild(doc.createNode(name).setMesh(j%3===1?grass:shrub).setTranslation(p).setScale([scale,scale,scale]).setRotation([0,Math.sin(j*.67),0,Math.cos(j*.67)]).setExtras({cityProp:true,furnishing107:j%3===1?'plants':'bushes',parkBorder137:true}));report.plants++;
  }
 }
 return report;
}
