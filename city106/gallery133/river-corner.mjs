import * as T from '../../pc66/vendor/three/three.core.js';

export function addRiverCorner133({doc,scene,mesh,geo,box,material,signals}){
 const paving=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 paving');
 const iron=doc.getRoot().listMaterials().find(m=>m.getName()==='Street128 riverwalk black railing');
 const top=z=>-.021-.0075*Math.max(0,Math.min(1,(z+30.6)/.8)),parts=[];
 // Cover the exposed foundation and lower isolated slabs with one connected
 // promenade corner. A shallow grade meets the east sidewalk with no riser.
 for(const [a,b]of[[-38.7,-30.6],[-30.6,-29.8]]){
  const g=new T.BoxGeometry(3.3,.12,b-a);g.translate(64.95,-.081,(a+b)/2);
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   p.setY(i,p.getY(i)+top(p.getZ(i))+.021);
   uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/2.4,(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))/2.4);
  }
  g.computeVertexNormals();parts.push(geo(g,paving));
 }
 const name='City133 joined riverwalk sidewalk corner';
 scene.addChild(doc.createNode(name).setMesh(mesh(name,parts)).setExtras({cityProp:true,surface115:true,riverCorner133:true}));
 const points=[[63.3,-36.66],[64.375,-36.66],[65.45,-36.66],[65.45,-38.05],[66.66,-38.05]],fences=[];
 for(let i=1;i<points.length;i++){
  const [a,b]=[points[i-1],points[i]],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),center=[(a[0]+b[0])/2,0,(a[1]+b[1])/2],yaw=-Math.atan2(dz,dx);
  const pieces=[box([0,.426,0],[length,.027,.03],iron),box([0,.246,0],[length,.018,.024],iron)];
  for(const x of[-length/2,length/2])pieces.push(box([x,.206,0],[.04,.454,.042],iron));
  const id='Street128 riverwalk corner133 railing '+i;
  scene.addChild(doc.createNode(id).setMesh(mesh(id,pieces)).setTranslation(center).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setExtras({cityProp:true,street128:'railing',collider107:{center:[0,.21,0],size:[length+.04,.46,.042]}}));
  fences.push({id,a,b});
 }
 // Raise the existing crossing button with its landing, without moving the road.
 const signal=signals.placements.find(s=>s.p[0]===66.22&&Math.abs(s.p[2]+38.03)<.01);
 if(signal){const n=scene.listChildren().find(n=>n.getName()===signal.name),p=n.getTranslation();p[1]+=.078;n.setTranslation(p);signal.p=p;}
 return {bounds:{lo:[63.3,-.141,-38.7],hi:[66.6,-.021,-29.8]},heightNorth:-.021,heightSouth:-.0285,fences};
}
