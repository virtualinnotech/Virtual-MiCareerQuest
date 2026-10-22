import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';

// Photo-guided interpretation: interlocking curved steel plates, not a solid shell.
export async function addLandmark({doc,scene,mesh,geo,box,rod,material,texture}){
 const red=material('Calder113 vermilion painted steel',[.91,.062,.018,1],null,.28,.57);
 const seam=material('Calder113 panel seams',[.48,.029,.012,1],null,.35,.7);
 const stone=material('Calder113 plaza granite',[.35,.38,.38,1],null,0,.86);
 const parts=[],p=[-25.6,-.0285,36.1];
 const bend=x=>.12*Math.sin(x*.8);
 function plate(shape,transform){
  const g=new T.ExtrudeGeometry(shape,{depth:.028,steps:1,bevelEnabled:false,curveSegments:24});
  const a=g.attributes.position;
  for(let i=0;i<a.count;i++)a.setXYZ(i,...transform(a.getX(i),a.getY(i),a.getZ(i)-.014));
  g.computeVertexNormals();parts.push(geo(g,red));
 }
 const main=new T.Shape();
 main.moveTo(-2.12,0);
 main.bezierCurveTo(-2.8,.30,-2.94,1.92,-2.35,2.63);
 main.bezierCurveTo(-1.76,3.38,-1.34,2.18,-.64,2.19);
 main.bezierCurveTo(-.26,2.21,-.29,3.68,.01,3.69);
 main.bezierCurveTo(.27,3.7,.30,3.11,.55,3.13);
 main.bezierCurveTo(1.53,3.05,1.63,4.66,2.12,4.60);
 main.bezierCurveTo(2.83,4.54,3.06,1.28,2.76,0);
 main.lineTo(2.51,0);
 main.bezierCurveTo(2.10,.17,1.93,2.11,1.40,2.13);
 main.bezierCurveTo(.70,2.19,.17,1.04,-.49,0);
 main.lineTo(-.66,0);
 main.bezierCurveTo(-.79,.61,-.96,1.60,-1.36,1.55);
 main.bezierCurveTo(-1.74,1.53,-1.78,.22,-1.91,0);
 main.closePath();
 plate(main,(x,y,z)=>[x,y,z+bend(x)]);
 // The tall rear blade and splayed fins supply the changing silhouette seen in side views.
 const wing=new T.Shape();wing.moveTo(-1.10,0);
 wing.bezierCurveTo(-1.53,.21,-1.38,.58,-.93,1.12);
 wing.bezierCurveTo(-.36,1.76,-.28,2.95,-.25,4.12);
 wing.bezierCurveTo(-.22,4.40,.11,4.38,.18,4.04);
 wing.bezierCurveTo(.46,2.94,.48,1.05,1.04,0);
 wing.lineTo(.68,0);wing.bezierCurveTo(.32,.18,.12,1.48,-.18,1.54);
 wing.bezierCurveTo(-.38,1.58,-.55,.25,-.72,0);wing.closePath();
 plate(wing,(z,y,x)=>[-1.95+x+z*.23,y,z]);
 const fan=new T.Shape();fan.moveTo(-1.18,0);fan.bezierCurveTo(-1.61,.18,-.75,1.02,-.32,2.06);
 fan.bezierCurveTo(-.08,2.70,.05,2.61,.23,1.93);fan.bezierCurveTo(.47,1.13,.57,.45,.68,0);fan.closePath();
 plate(fan,(z,y,x)=>[-1.23+x+z*.40,y,z]);
 // Raised flat ribs follow the plate, preserving the sculpture's sheet-metal construction.
 function web(points,transform,width=.037,depth=.13){
  const curve=new T.CatmullRomCurve3(points.map(q=>new T.Vector3(q[0],q[1],0))),s=new T.Shape(),a=curve.getPoints(32);
  a.forEach((v,i)=>i?s.lineTo(v.x,v.y+width):s.moveTo(v.x,v.y+width));
  for(const v of a.reverse())s.lineTo(v.x,v.y-width);s.closePath();
  const g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:false,curveSegments:1}),pos=g.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setXYZ(i,...transform(pos.getX(i),pos.getY(i),pos.getZ(i)+.012));
  g.computeVertexNormals();parts.push(geo(g,red));
 }
 const front=(x,y,z)=>[x,y,bend(x)+z];
 for(const side of[-1,1]){
  const tf=(x,y,z)=>front(x,y,z*side);
  web([[-2.43,1.05],[-1.1,1.48],[.25,2.25],[2.24,3.88]],tf);
  web([[-2.45,.56],[-1.0,1.19],[.3,1.99],[2.37,2.89]],tf,.027,.10);
  web([[-2.05,0],[-2.13,1.2],[-2.11,2.61]],tf,.021,.15);
  web([[2.65,0],[2.53,1.9],[2.12,4.33]],tf,.023,.19);
  for(const x of[-2.12,2.65])for(const dx of[-.16,.16])web([[x,0],[x+dx,.43]],tf,.022,.11);
 }
 const rear=(z,y,x)=>[-1.95-x+z*.23,y,z];
 web([[-1.07,.08],[-.56,1.13],[-.08,2.45],[-.03,4.05]],rear,.026,.16);
 web([[-1.12,.36],[-.5,.66],[.40,.66]],rear,.025,.10);
 web([[-.94,.85],[-.35,1.02],[.35,1.04]],rear,.025,.10);
 web([[-1.07,.04],[-.55,1.03],[-.08,2.34]],(z,y,x)=>[-1.23-x+z*.40,y,z],.025,.12);
 // Shallow seams and bolt rows, batched into the same two steel materials.
 for(const y of[.8,1.8,2.8,3.8]){
  const ranges=y<1?[[-2.54,-1.91],[2.5,2.86]]:y<2?[[-2.66,-1.53],[1.95,2.92]]:y<3?[[1.05,2.89]]:[[1.83,2.72]];
  for(const [a,b]of ranges){
   parts.push(rod([a,y,bend(a)+.017],[b,y,bend(b)+.017],.003,.003,seam,4));
   for(let x=a+.025;x<b;x+=.065)for(const dy of[-.022,.022])parts.push(rod([x,y+dy,bend(x)+.014],[x,y+dy,bend(x)+.025],.009,.009,red,6));
  }
 }
 const sculpture=mesh('Calder113 La Grande Vitesse',parts);
 scene.addChild(doc.createNode('Calder113 La Grande Vitesse left plaza').setMesh(sculpture).setTranslation([p[0],p[1]+.04,p[2]]).setExtras({cityProp:true,detail113:'sculpture'}));
 const base=mesh('Calder113 granite foundation',[box([0,.02,0],[6.2,.04,2.85],stone)]);
 scene.addChild(doc.createNode('Calder113 sculpture foundation').setMesh(base).setTranslation(p).setExtras({cityProp:true,detail113:'foundation',collider107:{center:[0,.20,0],size:[6.2,.40,2.85]}}));
 const plaqueImage=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="768" height="384"><rect width="768" height="384" fill="#244b45"/><rect x="14" y="14" width="740" height="356" fill="none" stroke="#b8a579" stroke-width="4"/><g fill="#e6ddba" text-anchor="middle" font-family="Arial,sans-serif"><text x="384" y="137" font-size="49" font-weight="bold">LA GRANDE VITESSE</text><text x="384" y="213" font-size="36">ALEXANDER CALDER</text><text x="384" y="281" font-size="34">1969</text></g></svg>`)).png().toBuffer();
 const plaqueMat=material('Calder113 title plaque',[1,1,1,1],await texture('La Grande Vitesse title',plaqueImage),.25,.64);
 const face=new T.PlaneGeometry(.76,.38);const uv=face.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));face.rotateX(-.65);face.translate(0,.49,.09);
 const plaque=mesh('Calder113 title pedestal',[box([0,.16,0],[.55,.32,.30],stone),box([0,.47,.075],[.82,.43,.045],stone,-.65),geo(face,plaqueMat)]);
 scene.addChild(doc.createNode('Calder113 title sign').setMesh(plaque).setTranslation([-25.6,p[1],38.04]).setExtras({cityProp:true,detail113:'plaque',collider107:{center:[0,.29,.07],size:[.82,.58,.50]}}));
 return {title:'La Grande Vitesse',artist:'Alexander Calder',year:1969,position:p,size:[6.2,4.65,2.85],triangles:sculpture.listPrimitives().reduce((n,q)=>n+q.getIndices().getCount()/3,0)};
}
