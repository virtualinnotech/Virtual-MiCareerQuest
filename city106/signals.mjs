import * as T from '../pc66/vendor/three/three.core.js';

export function addTrafficSignals({doc,scene,original,worldBounds,mesh,geo,box,rod,material,iron,bolt}){
 const yellow=material('City108 signal housing',[.72,.47,.055,1],null,.35,.52);
 const black=material('City108 signal visors',[.017,.021,.019,1],null,.15,.71);
 const lensMaterials=['red','yellow','green'].map((color,i)=>material('City108 '+color+' lens',[[.10,.006,.004,1],[.12,.065,.002,1],[.003,.075,.018,1]][i],null,0,.4).setExtras({trafficLens108:color}));
 const parts=[box([0,.026,0],[.24,.052,.24],iron),rod([0,.05,0],[0,.24,0],.081,.055,iron,10),rod([0,.24,0],[0,3.24,0],.048,.029,iron,10)];
 const reach=2.8,overRoad=1.8;
 parts.push(rod([0,3.18,0],[-reach-.18,3.18,overRoad],.035,.025,iron,8),rod([-.05,2.74,0],[-1.6,3.18,overRoad*.54],.02,.02,iron,6));
 parts.push(rod([-reach,3.18,overRoad],[-reach,3.05,overRoad],.018,.018,iron,6));
 parts.push(box([-reach,2.77,overRoad],[.31,.76,.035],black),box([-reach,2.77,overRoad+.047],[.25,.68,.105],yellow));
 for(const x of[-.081,.081])for(const z of[-.081,.081])parts.push(rod([x,.052,z],[x,.065,z],.012,.012,bolt,6));
 for(let i=0;i<3;i++){
  const y=2.98-i*.21;
  const rim=new T.TorusGeometry(.077,.011,4,12);rim.translate(-reach,y,overRoad+.112);parts.push(geo(rim,black));
  const visor=new T.CylinderGeometry(.088,.088,.12,10,1,true,Math.PI/2,Math.PI);visor.rotateX(Math.PI/2);visor.translate(-reach,y,overRoad+.167);parts.push(geo(visor,black));
  const lens=new T.CircleGeometry(.067,16);lens.translate(-reach,y,overRoad+.116);parts.push(geo(lens,lensMaterials[i]));
 }
 const signal=mesh('City108 three-aspect mast-arm traffic signal',parts),roads=[];
 for(const n of original.getRoot().listNodes()){
  const match=/^City_street_([xz])_/.exec(n.getName());if(!match||!n.getMesh())continue;
  roads.push({axis:match[1],...worldBounds(n)});
 }
 const intersections=[],placements=[];
 for(const v of roads.filter(r=>r.axis==='x'))for(const h of roads.filter(r=>r.axis==='z')){
  const x=(v.lo[0]+v.hi[0])/2,z=(h.lo[2]+h.hi[2])/2;
  if(x<h.lo[0]||x>h.hi[0]||z<v.lo[2]||z>v.hi[2])continue;
  const distance=Math.hypot(Math.max(-27-x,0,x-65),Math.max(-31-z,0,z-39));
  if(distance>18)continue;
  const approaches=[
   {from:'south',axis:'ns',present:v.hi[2]>h.hi[2]+1.2,p:[v.hi[0]+.38,h.lo[2]-.38],yaw:0},
   {from:'north',axis:'ns',present:v.lo[2]<h.lo[2]-1.2,p:[v.lo[0]-.38,h.hi[2]+.38],yaw:Math.PI},
   {from:'east',axis:'ew',present:h.hi[0]>v.hi[0]+1.2,p:[v.lo[0]-.38,h.lo[2]-.38],yaw:Math.PI/2},
   {from:'west',axis:'ew',present:h.lo[0]<v.lo[0]-1.2,p:[v.hi[0]+.38,h.hi[2]+.38],yaw:-Math.PI/2}
  ].filter(a=>a.present);
  if(approaches.length<3)continue;
  const id='junction-'+intersections.length;
  intersections.push({id,x,z,approaches:approaches.map(a=>a.from)});
  for(const a of approaches){
   const y=a.p[0]>-31.5&&a.p[0]<66.6&&a.p[1]>33.9&&a.p[1]<39.6?-.028:-.099;
   const p=[a.p[0],y,a.p[1]],name='City108 '+id+' '+a.from+' signal';
   scene.addChild(doc.createNode(name).setMesh(signal).setTranslation(p).setRotation([0,Math.sin(a.yaw/2),0,Math.cos(a.yaw/2)]).setExtras({cityProp:true,trafficSignal108:{axis:a.axis,intersection:id},collider107:{center:[0,1.60,0],size:[.17,3.20,.17]}}));
   placements.push({name,intersection:id,axis:a.axis,from:a.from,p,yaw:a.yaw});
  }
 }
 return {intersections,placements,signalCount:placements.length};
}
