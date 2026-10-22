import * as T from '../../pc66/vendor/three/three.core.js';

export function replacePlanterShrubs({doc,original,worldBounds,add,mesh,box,soil}){
 const shrub=doc.getRoot().listMeshes().find(m=>m.getName()==='City107 branching leafy shrub');
 if(!shrub)throw Error('District115 requires the existing City107 textured shrub');
 let beds=0,shrubs=0;
 for(const n of original.getRoot().listNodes())if(n.getName()==='Exterior44_shrub_bed'&&n.getMesh()){
  const {lo,hi}=worldBounds(n),x=(lo[0]+hi[0])/2,z=(lo[2]+hi[2])/2;
  add('riverwalk planter soil',mesh('District115 planter soil '+beds,[box([0,0,0],[hi[0]-lo[0]-.14,.008,hi[2]-lo[2]-.14],soil)]),[x,hi[1]+.002,z]);
  for(let i=0;i<5;i++){
   const scale=.94+(i%3)*.04;
   add('riverwalk textured shrub',shrub,[lo[0]+.36+(hi[0]-lo[0]-.72)*i/4,hi[1]+.006,z],{furnishing107:'bushes',planterShrub115:true},i%2?Math.PI:0,[scale,1.05,scale]);shrubs++;
  }
  beds++;
 }
 return {refreshedPlanters:beds,replacedShrubs:shrubs};
}

function sceneBounds(node){
 const bounds=new T.Box3(),matrix=new T.Matrix4().fromArray(node.getWorldMatrix());
 for(const p of node.getMesh().listPrimitives()){
  const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++)bounds.expandByPoint(new T.Vector3(...a.getElement(i,[])).applyMatrix4(matrix));
 }
 return {lo:bounds.min.toArray(),hi:bounds.max.toArray()};
}

export function clearHospitalTrees122({scene,original,worldBounds,placements}){
 const hospital=original.getRoot().listNodes().find(n=>n.getName()==='City_Riverbank_100_Building-Medium-01');
 if(!hospital)throw Error('Hospital building missing from landscaping source');
 const building=worldBounds(hospital),moves=[],destinations=[[-15.5,-.021,-31.35],[27.5,-.021,-31.35]];
 for(const tree of scene.listChildren().filter(n=>n.getExtras().vegetation115&&n.getExtras().tree)){
  const b=sceneBounds(tree);
  if(![0,1,2].every(k=>b.hi[k]>building.lo[k]-.12&&b.lo[k]<building.hi[k]+.12))continue;
  const from=tree.getTranslation(),to=destinations[moves.length];
  if(!to)throw Error('Hospital planting needs another checked relocation site');
  tree.setTranslation(to).setExtras({...tree.getExtras(),relocated122:{from}});
  for(const leaf of scene.listChildren())if(/^District115 fallen leaves /.test(leaf.getName())){
   const p=leaf.getTranslation();if(Math.hypot(p[0]-from[0],p[2]-from[2])<.001)leaf.setTranslation([to[0],to[1]+.012,to[2]]);
  }
  const placement=placements.find(p=>Math.hypot(p.x-from[0],p.z-from[2])<.001);
  if(placement){placement.x=to[0];placement.z=to[2];}
  moves.push({tree:tree.getName(),from,to});
 }
 return moves;
}

export function addTreeSoilBeds({scene,original,worldBounds,add,mesh,geo,soil}){
 const grates=scene.listChildren().filter(n=>n.getExtras().detail109==='treeGrates');
 for(const n of grates)n.dispose();
 const supports=original.getRoot().listNodes().filter(n=>n.getMesh()&&/sidewalk|foundation|apron|planter_(soil|base)|planted_bank_strip/.test(n.getName())).map(n=>({...worldBounds(n),planter:/planter/.test(n.getName())}));
 for(const n of scene.listChildren())if(n.getMesh()&&(/planter/i.test(n.getName())&&!n.getExtras().planterShrub115))supports.push({...sceneBounds(n),planter:true});
 const bed=mesh('District115 circular soil bed',[geo(new T.CylinderGeometry(.35,.35,.008,40).translate(0,-.002,0),soil)]);
 const trees=scene.listChildren().filter(n=>n.getExtras().tree||n.getExtras().detail111==='trees');
 for(const n of trees){
  const [x,y,z]=n.getTranslation();let top=y,radius=.35;
  // Original and City111 trees can sit in raised planters; fit the circular
  // soil patch inside the planter and above its cap instead of burying it.
  const under=supports.filter(s=>x>s.lo[0]&&x<s.hi[0]&&z>s.lo[2]&&z<s.hi[2]&&s.hi[1]>=y-.12&&s.hi[1]<=y+.35);
  for(const s of under){top=Math.max(top,s.hi[1]);if(s.planter)radius=Math.min(radius,x-s.lo[0]-.025,s.hi[0]-x-.025,z-s.lo[2]-.025,s.hi[2]-z-.025);}
  radius=Math.max(.10,radius);
  add('tree soil',bed,[x,top+.002,z],{detail111:'treeBeds',vegetation115:!!n.getExtras().vegetation115,soilBed115:{tree:n.getName(),radius}},0,[radius/.35,1,radius/.35]);
 }
 return {treeBeds:trees.length,replacedTreeGrates:grates.length};
}
