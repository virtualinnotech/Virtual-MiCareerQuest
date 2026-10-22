import * as T from '../../pc66/vendor/three/three.core.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {copyToDocument} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {addBoxOffice133} from '../gallery133/box-office.mjs';

export async function addInterior130({doc,scene,assets,mesh,geo,box,rod,material,texture}){
 const counts={drapes:0,hallLetters:0,queuePosts:0,wasteStations:0,restrooms:1,safetyPanels:0},floor=.24;
 const black=material('DeVos130 black metal',[.026,.031,.032,1],null,.55,.4),steel=material('DeVos130 brushed stainless steel',[.48,.51,.52,1],null,.85,.26),pale=material('DeVos130 warm wall panels',[.83,.84,.81,1],null,0,.7),oak=material('DeVos130 restroom oak',[.29,.23,.15,1],null,0,.6),red=material('DeVos130 safety red',[.58,.014,.008,1],null,.22,.36);
 const place=(name,model,p=[0,0,0],yaw=0,extra={})=>{const n=doc.createNode('DeVos130 '+name).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setExtras({cityProp:true,interior130:true,...extra});scene.addChild(n);return n;};
 const source=await new NodeIO().read(new URL('../gallery133/fixtures.glb',import.meta.url).pathname),copied=copyToDocument(doc,source,source.getRoot().listMeshes());
 const fixtures=Object.fromEntries(source.getRoot().listMeshes().map(m=>[m.getName(),copied.get(m)]));
 counts.fixtures133=source.getRoot().getExtras().manifest;
 async function print(name,svg){return material('DeVos130 '+name,[1,1,1,1],await texture(name,await sharp(Buffer.from(svg)).flip().png().toBuffer()),.1,.72);}
 const label=async(name,text,w,h,bg='#163d47',fg='white')=>{const size=Math.min(93,Math.floor(1500/text.replace(/&amp;/g,'&').length)),mat=await print(name,`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="256"><rect width="1024" height="256" fill="${bg}"/><rect x="10" y="10" width="1004" height="236" rx="6" fill="none" stroke="${fg}" stroke-width="5"/><text x="512" y="${128+size*.35}" text-anchor="middle" font-family="Arial" font-size="${size}" font-weight="bold" fill="${fg}">${text}</text></svg>`);return mesh(name,[geo(new T.PlaneGeometry(w,h).rotateY(Math.PI/2),mat)]);};
 const station=assets['waste-station'].clone().setName('DeVos130 three-stream station'),stationColors={Blue:[.22,.24,.24,1],Yellow:[.025,.24,.5,1],Red:[.045,.21,.12,1],Metal:[.28,.17,.075,1],Metal_Light:[.3,.29,.25,1]};
 for(const p of [...station.listPrimitives()]){station.removePrimitive(p);const color=stationColors[p.getMaterial().getName().replace('waste-bins ','')];station.addPrimitive(p.clone().setMaterial(color?p.getMaterial().clone().setName('DeVos130 '+p.getMaterial().getName()).setBaseColorFactor(color):p.getMaterial()));}
 // Every hall has a pair of stations outside the swing/approach area.
 for(const [letter,z,colors]of[['A',18,['#e2c62a']],['B',0,['#bd281e','#243b7b']],['C',-18,['#39834b']]]){
  const emblem=await print('Hall '+letter,`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="238" fill="#161f24"/><circle cx="256" cy="256" r="223" fill="#7dabbc" stroke="#b8c3c5" stroke-width="14"/><text x="255" y="412" text-anchor="middle" font-family="Georgia" font-size="454" font-weight="bold" fill="#14191c">${letter}</text><text x="239" y="394" text-anchor="middle" font-family="Georgia" font-size="454" font-weight="bold" fill="#b52414">${letter}</text></svg>`);
  place('Hall '+letter+' medallion',mesh('Hall '+letter+' medallion',[geo(new T.CircleGeometry(.43,64).rotateY(-Math.PI/2),emblem)]),[4.93,5.15,z]);counts.hallLetters++;
  for(let i=0;i<colors.length;i++){
   const color=new T.Color(colors[i]),cloth=material('DeVos130 '+letter+' woven drape '+i,[color.r,color.g,color.b,1],null,0,.93).setExtras({surfaceType:27}),g=new T.PlaneGeometry(1.43,1.58,24,32),p=g.attributes.position;
   for(let k=0;k<p.count;k++){const u=p.getX(k),v=p.getY(k),drop=(.79-v)/1.58;p.setXYZ(k,3.69-.024*Math.sin(u*22+drop*2)-.035*drop*drop,3.51-(.79-v),z+(i-(colors.length-1)/2)*1.49+u);}
   g.computeVertexNormals();place('Hall '+letter+' drape '+i,mesh('DeVos130 draped cloth',[geo(g,cloth)]));counts.drapes++;
  }
  for(const side of[-1,1]){
   const at=z+side*2.55;place('Hall '+letter+' waste and recycling '+side,station,[3.31,floor,at],-Math.PI/2,{street128:'bins',collider107:{center:[0,.23,0],size:[.694,.46,.23]}});
   const sign=await label('Hall '+letter+' sorting '+side,'LANDFILL | BOTTLES &amp; CANS | PAPER',.70,.13,'#253b41');place('Hall '+letter+' sorting labels '+side,sign,[3.18,.83,at],Math.PI);counts.wasteStations++;
  }
 }
 const post=mesh('DeVos130 chrome queue stanchion',[rod([0,0,0],[0,.018,0],.102,.102,steel,24),rod([0,.018,0],[0,.422,0],.014,.014,steel,12),rod([0,.422,0],[0,.46,0],.023,.023,black,12)]);
 function queue(name,points){
  for(let i=0;i<points.length;i++){const [x,z]=points[i];place(name+' post '+i,post,[x,floor,z],0,{collider107:{center:[0,.23,0],size:[.12,.46,.12]}});counts.queuePosts++;
   if(!i)continue;const[a,b]=[points[i-1],points[i]],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),belt=box([0,.412,0],[length,.032,.009],black);belt.g.rotateY(-Math.atan2(dz,dx));
   place(name+' belt '+i,mesh(name+' belt '+i,[belt]),[(a[0]+b[0])/2,floor,(a[1]+b[1])/2],0,{collider107:{center:[0,.40,0],size:[Math.max(.03,Math.abs(dx)),.08,Math.max(.03,Math.abs(dz))]}});
  }
 }
 queue('volunteer check-in outer line',[[1.36,29.6],[1.36,27.4],[1.36,25.2],[1.36,23],[1.36,20.8]]);
 queue('volunteer check-in return',[[2.12,29.6],[2.12,27.4],[2.12,25.2],[2.12,23]]);
 for(const [a,b]of[[-15.1,-3],[3,15.1]])queue('hall circulation '+a,[[2.8,a],[2.8,a+3],[2.8,a+6],[2.8,a+9],[2.8,b]]);
 // Closed restroom entrances sit next to the front IT portal without cutting its collision wall.
 const rz=12.65,parts=[];
 for(const dz of[-.25,.25]){
  parts.push(box([-4.895,.66,rz+dz],[.035,.84,.39],oak),box([-4.873,.305,rz+dz],[.008,.13,.36],steel));
  parts.push(rod([-4.858,.58,rz+dz-.12],[-4.858,.65,rz+dz-.12],.005,.005,steel,10));
 }
 for(const dz of[-.47,0,.47])parts.push(box([-4.875,.68,rz+dz],[.075,.88,.028],steel));
 parts.push(box([-4.88,1.115,rz],[.08,.06,.97],pale));place('restroom entrances',mesh('DeVos130 restroom doors',parts));
 place('RESTROOMS',await label('restroom sign','RESTROOMS',.56,.13),[-4.82,1.24,rz]);
 for(const [dz,text]of[[-.25,'WOMEN'],[.25,'MEN']])place(text,await label(text,text,.19,.065,'#1e2426'),[-4.866,.88,rz+dz]);
 const fountain=fixtures['bottle-fountain'],fountainSize=fountain.getExtras().size;
 place('restroom bottle filler',fountain,[-4.91+fountainSize[2]/2,floor+.14,13.64],Math.PI/2,{fixture133:'bottle-fountain',collider107:{center:[0,fountainSize[1]/2,0],size:fountainSize}});
 const safetyLabel=await label('fire extinguisher label','FIRE',.16,.075,'#a71710');
 for(const z of[16,2,-12.45]){
  const parts=[box([-.045,.44,0],[.025,.24,.10],black),box([-.035,.23,.30],[.035,.24,.17],steel),box([-.013,.23,.30],[.005,.21,.14],steel)];
  place('wall safety equipment '+z,mesh('DeVos130 electrical access and extinguisher bracket '+z,parts),[-4.86,floor,z]);
  place('supplied fire extinguisher '+z,fixtures['fire-extinguisher'],[-4.83,floor+.33,z],Math.PI/2,{fixture133:'fire-extinguisher'});
  place('FIRE sign '+z,safetyLabel,[-4.88,.91,z]);counts.safetyPanels++;
 }
 const aed=mesh('DeVos130 AED cabinet',[box([0,0,0],[.095,.27,.25],pale),box([.052,0,0],[.006,.17,.15],red),box([.02,.15,0],[.065,.03,.08],red)]);place('AED cabinet',aed,[-4.83,1.02,15]);place('AED sign',await label('AED','AED',.20,.09,'#f0f1ed','#a71c17'),[-4.75,1.30,15]);
 counts.boxOffice133=await addBoxOffice133({mesh,geo,box,rod,material,print,place,queue,pale,black,steel,floor});
 return counts;
}
