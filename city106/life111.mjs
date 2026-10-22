import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import {loadFleet} from './vehicles114/fleet.mjs';
import {schoolBusPose131} from './lighting131/layout.mjs';
import {fitHeadlamps134} from './downtown134/headlamps.mjs';
import {createRequire} from 'node:module';
const RoadPose=createRequire(import.meta.url)('./road-pose117.js');

export async function addCityLife({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,signals,fleetModels=null}){
 const counts={},placements=[],vehicles=[],walks=[];
 const colors=['#edb51b','#254d64','#c2c7c6','#2d3134','#f1ece1','#ba4c39','#6e8176','#dad2be','#262b2d','#94b4c0','#d9dedd','#674735','#d6bb89','#3c6651','#efe6c1','#ac352a'];
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><linearGradient id="glass" x2=".25" y2="1"><stop stop-color="#9aafbb"/><stop offset=".32" stop-color="#384d58"/><stop offset=".36" stop-color="#6e858e"/><stop offset="1" stop-color="#192932"/></linearGradient></defs>';
 colors.forEach((c,i)=>{svg+=`<rect x="${i*64}" width="64" height="64" fill="${c}"/>`;});
 svg+='<rect y="64" width="1024" height="192" fill="#eef0e8"/><rect y="160" width="1024" height="50" fill="#255e84"/>';
 for(let i=0;i<10;i++)svg+=`<rect x="${8+i*101}" y="72" width="90" height="80" rx="4" fill="url(#glass)"/><path d="M${13+i*101} 80h80" stroke="#b9c8ca" stroke-width="3"/><path d="M${8+i*101} 137h90" stroke="#263d47" stroke-width="2"/>`;
 svg+='<text x="510" y="196" text-anchor="middle" font-size="25" fill="white" font-family="Arial">CITY TRANSIT</text><text x="76" y="239" font-size="16" fill="#23434b" font-family="Arial">HYBRID ELECTRIC</text><text x="934" y="239" font-size="16" fill="#23434b" font-family="Arial">1112</text><rect y="256" width="1024" height="96" fill="#20282a"/><text x="512" y="316" text-anchor="middle" font-family="monospace" font-size="40" fill="#f1bd58">M42  DOWNTOWN</text>';
 const shops=['HUDSON DELI','BROADWAY BOOKS','METRO COFFEE','AVENUE PHARMACY','FLOWER MARKET','CORNER PIZZA','THE DAILY','UPTOWN MARKET'];
 shops.forEach((s,i)=>{const y=352+i*56;svg+=`<rect y="${y}" width="768" height="56" fill="${['#345044','#333d48','#78533e','#e7e1cc','#405b4a','#8b3430','#273e5b','#5f6743'][i]}"/><path d="M8 ${y+5}h752v46H8Z" fill="none" stroke="#d9c79a" stroke-width="2"/><text x="384" y="${y+37}" text-anchor="middle" fill="${i===3?'#385347':'#eee5cb'}" font-family="Georgia" font-size="29">${s}</text>`;});
 svg+='<rect x="768" y="352" width="256" height="256" fill="url(#glass)"/><path d="M781 369l209 210M781 393l192 192" stroke="#d3ddd7" opacity=".28" stroke-width="10"/><rect x="768" y="608" width="256" height="192" fill="#263632"/><text x="896" y="640" text-anchor="middle" fill="#e2d8be" font-family="Georgia" font-size="20">DAILY SPECIALS</text>';
 ['ESPRESSO','FRESH BAGELS','SOUP &amp; SANDWICH','OPEN DAILY'].forEach((s,i)=>{svg+=`<text x="896" y="${670+i*31}" text-anchor="middle" fill="#d9d5bf" font-family="Arial" font-size="14">${s}</text>`;});
 svg+='<rect y="800" width="512" height="128" fill="#dabb1d"/><text x="256" y="887" text-anchor="middle" font-family="Arial" font-size="74" font-weight="bold" fill="#20282a">TAXI</text><rect x="512" y="800" width="512" height="128" fill="#263e59"/><text x="768" y="848" text-anchor="middle" font-family="Arial" font-size="27" fill="white">CITY EXPRESS</text><text x="768" y="887" text-anchor="middle" font-family="Arial" font-size="24" fill="#f0c560">LOCAL DELIVERY</text><rect y="928" width="1024" height="96" fill="#f4eee0"/><text x="150" y="971" text-anchor="middle" font-family="Georgia" font-size="30" fill="#27343d">THE DAILY</text>';
 for(let i=0;i<12;i++)svg+=`<path d="M${12+(i%3)*95} ${981+Math.floor(i/3)*9}h80" stroke="#586361" stroke-width="3"/>`;
 svg+='<circle cx="405" cy="976" r="43" fill="#1c2226" stroke="#a8afad" stroke-width="5"/><circle cx="405" cy="976" r="30" fill="#67737a"/>';
 for(let i=0;i<8;i++){const a=i*Math.PI/4;svg+=`<path d="M405 976l${Math.cos(a)*27} ${Math.sin(a)*27}" stroke="#d2d7d4" stroke-width="6"/>`;}
 svg+='<circle cx="560" cy="976" r="45" fill="#176bc0" stroke="white" stroke-width="5"/><text x="560" y="986" font-family="Arial" font-weight="bold" font-size="28" text-anchor="middle" fill="white">BUS</text><rect x="768" y="928" width="256" height="96" fill="#e6edf0"/><text x="896" y="953" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#185b90">CITY TRANSIT</text><text x="896" y="981" text-anchor="middle" font-family="Arial" font-size="18" fill="#23404e">M42 DOWNTOWN</text><text x="896" y="1008" text-anchor="middle" font-family="Arial" font-size="14" fill="#23404e">DEVOS PLACE</text></svg>';
 const atlas=material('City111 street life atlas',[1,1,1,1],await texture('City111 transit taxis shops and street furniture',await sharp(Buffer.from(svg)).png().toBuffer()),.28,.47);
 function swatch(p,i){const uv=p.g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,(i*64+32)/1024,32/1024);p.m=atlas;return p;}
 const b=(p,s,c=8,rx=0)=>swatch(box(p,s,atlas,rx),c),r=(a,z,r0,r1,c=8,n=8)=>swatch(rod(a,z,r0,r1,atlas,n),c);
 function mapped(g,rect){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(rect[0]+2+uv.getX(i)*(rect[2]-4))/1024,(rect[1]+2+(1-uv.getY(i))*(rect[3]-4))/1024);return geo(g,atlas);}
 function face(w,h,rect,p,yaw=0){const g=new T.PlaneGeometry(w,h);g.rotateY(yaw);g.translate(...p);return mapped(g,rect);}
 function ellipsoid(p,s,c){const g=new T.SphereGeometry(1,12,8);g.scale(...s);g.translate(...p);return swatch(geo(g,atlas),c);}
 function place(type,model,p,yaw=0,scale=[1,1,1],extras={}){
  counts[type]=(counts[type]||0)+1;const name='City111 '+type+' '+counts[type];
  scene.addChild(doc.createNode(name).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale(scale).setExtras({cityProp:true,detail111:type,...extras}));
  placements.push({name,type,p,yaw,scale});return name;
 }
 const models=fleetModels||await loadFleet(doc);
 fitHeadlamps134(models,{mesh,geo,material});
 let policeVariant134=0;
 const obstacles=original.getRoot().listNodes().filter(n=>n.getMesh()&&n.getExtras().kind==='schoolBusDetailed').map(n=>schoolBusPose131(n,worldBounds));
 const spawnObstacles=[...obstacles,{id:'ambulance-bay',p:[15,-.1275,45.55],width:1.35,length:3.5,yaw:Math.PI/2}];
 const brake=mesh('City111 illuminated brake lenses',[b([-.18,0,0],[.055,.034,.006],15),b([.18,0,0],[.055,.034,.006],15)]);
 // A single tiny lens material is brightened per shared braking group at runtime.
 const brakeMat=doc.createMaterial('City111 brake glow').setBaseColorFactor([1,.035,.012,1]).setEmissiveFactor([1,.025,.008]).setRoughnessFactor(.35);
 brake.listPrimitives().forEach(p=>p.setMaterial(brakeMat));
 const shadowTex=await texture('Vehicle soft tire contact',await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><radialGradient id="s"><stop stop-color="#07090b" stop-opacity=".78"/><stop offset=".65" stop-color="#07090b" stop-opacity=".48"/><stop offset="1" stop-color="#07090b" stop-opacity="0"/></radialGradient></defs><rect width="128" height="128" fill="url(#s)"/></svg>')).png().toBuffer());
 const shadowMat=material('Vehicle contact shadow',[1,1,1,.58],shadowTex,0,1).setAlphaMode('BLEND');
 const shadowGeometry=new T.PlaneGeometry(1,1);shadowGeometry.rotateX(-Math.PI/2);
 const shadow=mesh('Vehicle soft ground contact',[geo(shadowGeometry,shadowMat)]);
 const roads=original.getRoot().listNodes().filter(n=>/^City_street_/.test(n.getName())&&n.getMesh()).map(n=>({name:n.getName(),...worldBounds(n)})).filter(r=>!(/^City_street_z/.test(r.name)&&Math.abs((r.lo[2]+r.hi[2])/2+69.6)<.1));
 roads.push({name:'City_street_z_river115',lo:[-99.6,-.13,-72],hi:[131.4,-.12,-67.2]},
  {name:'City_street_x_westbridge115',lo:[-34.95,-.13,-74],hi:[-31.65,-.12,-34.7]});
 const lanes=[
  {id:'front-east',axis:0,cross:44.2,start:-90,end:122,dir:1,signal:'ew'},
  {id:'front-west',axis:0,cross:41.6,start:-90,end:122,dir:-1,signal:'ew'},
  {id:'east-north',axis:2,cross:71.2,start:-99,end:73,dir:-1,signal:'ns'},
  {id:'east-south',axis:2,cross:68.6,start:-99,end:73,dir:1,signal:'ns'},
  {id:'west-north',axis:2,cross:-75.66,start:-34,end:73,dir:-1,signal:'ns'},
  {id:'west-south',axis:2,cross:-77.32,start:-34,end:73,dir:1,signal:'ns'},
  {id:'avenue-east',axis:0,cross:63.5,start:-90,end:122,dir:1,signal:'ew'},
  {id:'avenue-west',axis:0,cross:61.9,start:-90,end:122,dir:-1,signal:'ew'},
  {id:'westbridge-north',axis:2,cross:-32.5,start:-99,end:73,dir:-1,signal:'ns'},
  {id:'westbridge-south',axis:2,cross:-34.1,start:-99,end:73,dir:1,signal:'ns'},
  {id:'river-east',axis:0,cross:-68.2,start:-90,end:122,dir:1,signal:'ew'},
  {id:'river-west',axis:0,cross:-71.0,start:-90,end:122,dir:-1,signal:'ew'},
  {id:'westlocal-north',axis:2,cross:-54.1,start:-33,end:73,dir:-1,signal:'ns'},
  {id:'westlocal-south',axis:2,cross:-55.7,start:-33,end:73,dir:1,signal:'ns'},
  {id:'eastlocal-north',axis:2,cross:92.3,start:-99,end:73,dir:-1,signal:'ns'},
  {id:'eastlocal-south',axis:2,cross:90.7,start:-99,end:73,dir:1,signal:'ns'}
 ];
 for(const lane of lanes){
  lane.length=lane.end-lane.start;
  const crossAxis=lane.axis===0?2:0,road=roads.find(r=>(lane.axis===0?/^City_street_z/:/^City_street_x/).test(r.name)&&lane.cross>r.lo[crossAxis]&&lane.cross<r.hi[crossAxis]);
  lane.edge=road?(lane.cross>(road.lo[crossAxis]+road.hi[crossAxis])/2?road.hi[crossAxis]:road.lo[crossAxis]):lane.cross+(lane.dir>0?.85:-.85);
  lane.roadCenter=road?(road.lo[crossAxis]+road.hi[crossAxis])/2:lane.cross;lane.roadHalf=road?(road.hi[crossAxis]-road.lo[crossAxis])/2:1.65;
  if(lane.id.startsWith('river-'))lane.edge=-69.6+(lane.cross>-69.6?2.4:-2.4);
  lane.junctions=roads.filter(r=>(lane.axis===0?/^City_street_x/:/^City_street_z/).test(r.name)&&lane.cross>=r.lo[crossAxis]&&lane.cross<=r.hi[crossAxis]).map(r=>({q:(r.lo[lane.axis]+r.hi[lane.axis])/2,half:(r.hi[lane.axis]-r.lo[lane.axis])/2})).filter(j=>j.q>lane.start&&j.q<lane.end);
  lane.stops=signals.intersections.filter(j=>Math.abs((lane.axis===0?j.z:j.x)-lane.cross)<2.5).map(j=>{
   const q=lane.axis===0?j.x:j.z,crossRoad=roads.find(r=>lane.axis===0?/^City_street_x_/.test(r.name)&&Math.abs((r.lo[0]+r.hi[0])/2-q)<.1:/^City_street_z_/.test(r.name)&&Math.abs((r.lo[2]+r.hi[2])/2-q)<.1);
   const half=crossRoad?(crossRoad.hi[lane.axis]-crossRoad.lo[lane.axis])/2:1.65;
   return {s:(lane.dir>0?q-lane.start:lane.end-q)-half-.27,id:j.id};
  }).filter(s=>s.s>0&&s.s<lane.length);
  for(const road of roads){
   if(!(lane.axis===0?/^City_street_x_/.test(road.name):/^City_street_z_/.test(road.name)))continue;
   const cross=lane.axis===0?2:0,q=(road.lo[lane.axis]+road.hi[lane.axis])/2;
   if(lane.cross<road.lo[cross]||lane.cross>road.hi[cross])continue;
   const s=(lane.dir>0?q-lane.start:lane.end-q)-(road.hi[lane.axis]-road.lo[lane.axis])/2-.27;
   if(s>0&&s<lane.length&&!lane.stops.some(t=>Math.abs(t.s-s)<.1))lane.stops.push({s,id:road.name,unmarked:true});
  }
 }
 function vehicle(kind,lane,s,index,parked=null){
  if(kind==='police'&&models['police-suv']&&policeVariant134++%2)kind='police-suv';
  const model=models[kind],id='vehicle-'+vehicles.length,yaw=lane?(lane.axis===0?lane.dir*Math.PI/2:lane.dir>0?0:Math.PI):parked.yaw;
  let p=parked?.p|| (lane.axis===0?[lane.dir>0?lane.start+s:lane.end-s,-.1275,lane.cross]:[lane.cross,-.1275,lane.dir>0?lane.start+s:lane.end-s]);
  let spawnClear=false;
  for(let retry=0;retry<(lane?Math.ceil(lane.length/.3):1);retry++){
   const halfX=(Math.abs(Math.sin(yaw))*model.length+Math.abs(Math.cos(yaw))*model.width)/2,halfZ=(Math.abs(Math.cos(yaw))*model.length+Math.abs(Math.sin(yaw))*model.width)/2;
   const blocked=[...vehicles,...spawnObstacles].some(v=>{
    if(lane&&v.lane===lane.id){const distance=Math.abs(v.s-s);if(Math.min(distance,lane.length-distance)<(v.length+model.length)/2+.4)return true;}
    return Math.abs(v.p[0]-p[0])<halfX+(Math.abs(Math.sin(v.yaw))*v.length+Math.abs(Math.cos(v.yaw))*v.width)/2+.18&&Math.abs(v.p[2]-p[2])<halfZ+(Math.abs(Math.cos(v.yaw))*v.length+Math.abs(Math.sin(v.yaw))*v.width)/2+.18;
   });
   if(!blocked&&(!lane||!lane.junctions.some(j=>Math.abs(p[lane.axis]-j.q)<j.half+model.length/2+.35))){spawnClear=true;break;}
   if(!lane)break;
   s=(s-.3+lane.length)%lane.length;const q=lane.dir>0?lane.start+s:lane.end-s;p=lane.axis===0?[q,-.1275,lane.cross]:[lane.cross,-.1275,q];
  }
  if(!spawnClear)return;
  const radius=model.wheels[0].radius,wheelbase=Math.max(...model.wheels.map(w=>w.offset[2]))-Math.min(...model.wheels.map(w=>w.offset[2]));
  const paint=[[.68,.72,.76,1],[.028,.11,.20,1],[.42,.018,.025,1],[.024,.03,.035,1],[.72,.73,.69,1],[.028,.15,.10,1]][index%6];
  const spec={id,kind,lane:lane?.id||null,s,length:model.length,width:model.width,height:model.height,frontZ:model.frontZ??model.length/2,radius,wheelbase,axles117:RoadPose.axles(model.wheels),articulation117:model.articulation117,maxSpeed:kind==='bus'?1.55:2.0+index%5*.17,p,yaw,parked:!!parked,turns114:kind!=='bus'&&index%3===0};vehicles.push(spec);
  const height=model.height;
  const motion111=true,part=(model,offset,role,scale=[1,1,1],wheelInfo={})=>place(parked?'parkedVehicles':'traffic',model,p,yaw,scale,{motion111,life111:{id,role,offset,paint,...wheelInfo}});
  part(model.body,[0,0,0],'body');
  if(model.rear)part(model.rear,[0,0,0],'body',[1,1,1],{section117:'rear'});
  if(model.joint)part(model.joint,[0,0,0],'joint');
  part(shadow,[0,.005,0],'shadow',[model.width*1.36,1,model.length*1.04]);
  for(const w of model.wheels)part(w.mesh,w.offset,'wheel',[1,1,1],{front:w.front,radius:w.radius,section117:model.articulation117&&w.offset[2]<model.articulation117.rearZ?'rear':'front'});
  if(model.brake)part(model.brake,[0,0,0],'brake',[1,1,1],{section117:model.articulation117?'rear':'front'});
  else part(brake,[0,model.height*.44,model.rearZ+.028],'brake',[model.width/.57,1,1]);
  if(model.headlight)part(model.headlight,[0,0,0],'headlight');
 }
 let serial=0;
 const trafficKinds=['taxi','sedan','classic','taxi','van','suv','sedan','pickup','police','delivery','taxi','bus'];
 const runningGap=Math.max(5.2,models.bus.length-models.sedan.length);
 for(const lane of lanes){
  const junctions=[...lane.junctions].sort((a,b)=>a.q-b.q);
  // A red light must be able to hold the entire bus beyond the preceding junction.
  const busFits=junctions.every((j,i)=>!i||j.q-j.half-junctions[i-1].q-junctions[i-1].half>=models.bus.length+.4);
  // Reserve at least a bus-length headway for a sedan, plus each longer vehicle's extra length.
  const seeds=[];let occupied=0;
  while(true){
   let kind=trafficKinds[(serial+seeds.length)%trafficKinds.length];
   if(kind==='bus'&&!busFits)kind='van';
   const length=models[kind].length;
   if(occupied+length+(seeds.length+1)*runningGap>lane.length)break;
   seeds.push({kind,length});occupied+=length;
  }
  const gap=(lane.length-occupied)/seeds.length;let s=gap/2;
  for(const seed of seeds){
   s+=seed.length/2;vehicle(seed.kind,lane,s,serial++);s+=seed.length/2+gap;
  }
 }
 for(const x of[-71,-63,-46,-40,79,84,103,120])for(const z of[40.07,45.72])vehicle(['taxi','classic','van','sedan','suv','pickup','police'][serial%7],null,0,serial++,{p:[x,-.1275,z],yaw:z<43?-Math.PI/2:Math.PI/2});
 for(const x of[-25,-19,-5,5,19,26,40,47,60])vehicle(x===19?'taxi':['taxi','classic','van','sedan'][serial%4],null,0,serial++,{p:[x,-.1275,45.72],yaw:Math.PI/2});
 for(const z of[-82,-75,-25,-18,0,20,52])vehicle(['van','sedan','taxi','pickup'][serial%4],null,0,serial++,{p:[72.67,-.1275,z],yaw:Math.PI});
 for(const x of[-86,-58,-50,-27,-18,-3,4,19,42,61,99])vehicle(['classic','sedan','taxi','pickup'][serial%4],null,0,serial++,{p:[x,-.1275,40.07],yaw:-Math.PI/2});
 // Two-way paths follow existing pavement. Distinct lanes keep groups readable.
 for(const w of[
  {id:'front',axis:0,start:-28,end:59,cross:38.05,y:-.0285,count:30},
  {id:'east',axis:2,start:-32,end:31,cross:65.68,y:-.0285,count:26},
  {id:'river',axis:0,start:-23,end:60,cross:-34.2,y:-.021,count:18},
  {id:'shops',axis:0,start:-29,end:64,cross:46.72,y:-.099,count:26},
  {id:'west-shops',axis:2,start:-28,end:29,cross:-78.68,y:-.099,count:18},
  {id:'east-shops',axis:2,start:-32,end:28,cross:73.71,y:-.099,count:22},
  {id:'avenue',axis:0,start:-28,end:63,cross:65.0,y:-.099,count:22},
  {id:'park',axis:2,start:-19,end:31,cross:-28.2,y:-.021,count:18},
  {id:'park-grove',axis:0,start:-26,end:-8,cross:-25,y:-.021,count:8}
 ]){
  let spans=[[w.start,w.end]];
  if(/shops|avenue/.test(w.id))for(const road of roads){
   const perpendicular=w.axis===0?/^City_street_x_/.test(road.name):/^City_street_z_/.test(road.name),cross=w.axis===0?2:0;
   if(!perpendicular||w.cross<road.lo[cross]||w.cross>road.hi[cross])continue;
   const lo=road.lo[w.axis]-.36,hi=road.hi[w.axis]+.36;
   spans=spans.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b]]:[[a,Math.min(b,lo)],[Math.max(a,hi),b]].filter(([a,b])=>b-a>1.8));
  }
  spans.forEach(([start,end],i)=>walks.push({...w,id:spans.length===1?w.id:w.id+'-block'+i,start,end,count:Math.max(3,Math.round(w.count*(end-start)/(w.end-w.start))),offset:.16}));
 }
 const leash=mesh('City111 leash',[r([0,0,0],[0,1,0],.003,.003,3,5)]);
 const dogs=[];
 for(const [pathId,index]of[['front',4],['front',18],['east',5],['east',18],['river',8],['river',14]]){
  const id='dog-'+dogs.length,personId=pathId+'-'+index;dogs.push({id,personId});
  place('dogParts',leash,[0,-100,0],0,[1,1,1],{motion111:true,life111:{id,role:'leash',offset:[0,0,0]}});
 }
 // Sidewalk furnishing meshes share the same atlas as moving traffic.
 const newspaper=mesh('City111 newsstand',[b([0,.25,0],[.26,.50,.28],1),b([0,.54,0],[.30,.065,.33],1),face(.20,.29,[0,928,300,96],[0,.31,.145]),b([.06,.08,.147],[.06,.025,.013],10)]);
 const meter=mesh('City111 parking meter',[r([0,0,0],[0,.44,0],.014,.014,10),b([0,.49,0],[.10,.16,.065],3),b([0,.515,.036],[.069,.049,.008],9),b([0,.459,.036],[.03,.006,.009],8)]);
 const trash=mesh('City111 tied refuse bags',[ellipsoid([-.06,.086,0],[.087,.084,.071],3),ellipsoid([.073,.071,.045],[.066,.072,.068],8),r([-.06,.148,0],[-.05,.194,0],.024,.01,3),r([.073,.13,.045],[.07,.16,.045],.02,.007,8)]);
 const menu=mesh('City111 cafe sidewalk menu',[b([0,.23,0],[.27,.43,.034],11,-.10),face(.23,.34,[768,608,256,192],[0,.25,.043]),r([-.105,.01,-.16],[-.105,.44,0],.014,.014,11),r([.105,.01,-.16],[.105,.44,0],.014,.014,11)]);
 const cafeParts=[r([0,.012,0],[0,.29,0],.02,.02,8),r([0,.29,0],[0,.313,0],.23,.23,11,16)];
 for(const side of[-1,1]){
  const x=side*.40;cafeParts.push(b([x,.18,0],[.23,.022,.22],11),b([x+side*.10,.31,0],[.022,.23,.23],11));
  for(const dx of[-.08,.08])for(const z of[-.08,.08])cafeParts.push(r([x+dx,0,z],[x+dx,.18,z],.012,.012,8,5));
 }const cafe=mesh('City111 cafe table and chairs',cafeParts);
 const shelterGlass=material('City128 bus shelter glass',[.37,.53,.57,.48],null,.15,.12).setAlphaMode('BLEND');
 const shelterParts=[b([0,.99,0],[1.65,.065,.62],3),box([0,.47,-.25],[1.54,.79,.025],shelterGlass),face(.54,.205,[768,928,256,96],[-.43,.76,-.23]),face(.54,.205,[768,928,256,96],[-.43,.76,-.27],Math.PI)];
 for(const x of[-.76,.76])for(const z of[-.25,.25])shelterParts.push(r([x,0,z],[x,.98,z],.019,.019,10));
 for(const side of[-1,1]){const signFace=new T.CircleGeometry(.12,32);signFace.rotateY(side<0?Math.PI:0);signFace.translate(.97,.97,.20+side*.02);shelterParts.push(mapped(signFace,[512,928,96,96]));}
 shelterParts.push(r([.97,0,.20],[.97,.86,.20],.014,.014,10));
 const shelter=mesh('City111 transit shelter',shelterParts);
 const escapeParts=[];
 for(let f=0;f<3;f++){
  const y=.6+f*.93;escapeParts.push(b([0,y,.21],[1.28,.023,.46],8),r([-.63,y+.30,.42],[.63,y+.30,.42],.009,.009,8));
  for(let i=0;i<11;i++)escapeParts.push(r([-.6+i*.12,y,.42],[-.6+i*.12,y+.30,.42],.005,.005,8,4));
  for(let i=0;i<9;i++)escapeParts.push(r([-.39,y+i*.104,.14],[-.12,y+i*.104,.14],.008,.008,8,4));
  for(const x of[-.40,-.11])escapeParts.push(r([x,y,.14],[x,y+.94,.14],.009,.009,8));
 }const escape=mesh('City111 three floor fire escape',escapeParts);
 const awnings=shops.map((name,i)=>{
  const parts=[b([0,1.17,.005],[3.26,.30,.026],8),face(1.95,.19,[0,352+i*56,768,56],[0,1.16,.04])];
  for(let s=0;s<12;s++)parts.push(b([-.99+s*.18,1.04,.23],[.18,.018,.48],s%2?14:[13,1,11,13,13,15,1,13][i],-.22),b([-.99+s*.18,.962,.463],[.18,.12,.024],s%2?14:[13,1,11,13,13,15,1,13][i]));
  return mesh('City111 '+name+' striped canopy',parts);
 });
 const kioskParts=[b([0,.25,0],[.70,.5,.52],13),b([0,.53,0],[.79,.065,.62],11),b([0,1.04,0],[.86,.045,.74],13),face(.69,.15,[0,352+4*56,768,56],[0,.44,.274])];
 for(const x of[-.37,.37])kioskParts.push(r([x,.5,-.23],[x,1.03,-.23],.015,.015,10));
 for(let x=-2;x<=2;x++)for(let z=0;z<2;z++){kioskParts.push(r([x*.13,.56,z*.17-.10],[x*.13,.67,z*.17-.10],.045,.057,11));for(let k=0;k<3;k++)kioskParts.push(ellipsoid([x*.13+Math.sin(k*2.1)*.024,.75+k*.017,z*.17-.10+Math.cos(k*2.1)*.025],[.045,.034,.038],k===0?15:k===1?14:13));}
 const kiosk=mesh('City111 flower kiosk',kioskParts);
 const bin=doc.getRoot().listMeshes().find(m=>m.getName()==='City109 ribbed litter bin');
 const bench=doc.getRoot().listMeshes().find(m=>m.getName()==='City106 curved cast iron teak bench');
 const maple=doc.getRoot().listMeshes().find(m=>m.getName()==='City106 branching maple 1');
 const planter=mesh('City111 stone planter',[b([0,.13,0],[.40,.26,.54],7),b([0,.265,0],[.35,.013,.49],11)]);
 const fixed=(type,model,p,yaw,size,center=[0,size[1]/2,0])=>place(type,model,p,yaw,[1,1,1],{collider107:{center,size}});
 for(const z of[-26,-20,-3,16,26]){
  fixed('benches',bench,[62.90,-.0765,z],Math.PI/2,[1.14,.54,.34]);
  fixed('planters',planter,[63.15,-.0765,z+1.1],0,[.4,.28,.54]);
  place('trees',maple,[63.15,.1885,z+1.1],0,[.58,.58,.58]);
  fixed('bins',bin,[62.92,-.0765,z-1],0,[.28,.47,.28]);
 }
 for(const x of[33,-16,16,29,44,57]){
  fixed('newsboxes',newspaper,[x,-.0285,36.15],0,[.3,.58,.33]);
  fixed('cafeTables',cafe,[x+1.1,-.0285,35.9],0,[1.05,.4,.50]);
 }
 // Column 7 spans X 39.69..40.11, Z 35.73..36.15. Keep the canopy off it and behind the walking corridor.
 for(const [x,z,yaw]of[[-18,35.9,0],[41.2,35.9,0],[62.95,2,Math.PI/2]])fixed('flowerKiosks',kiosk,[x,x>61?-.0765:-.0285,z],yaw,[.86,1.065,.74]);
 for(const x of[-11.2,25.8,46.2]){
  fixed('busShelters',shelter,[x,-.0285,39.02],0,[2.14,1.11,.62],[.24,.555,0]);
  place('busBenches',bench,[x,-.0285,39.04],0);
 }
 for(const v of vehicles.filter(v=>v.parked)){
  const p=[...v.p];p[1]=-.099;
  if(p[0]>72){p[0]=73.36;p[2]+=.65;}else p[2]=p[2]<43?39.2:46.36;
  fixed('parkingMeters',meter,p,0,[.11,.59,.08]);
 }
 let building=0;
 for(const n of original.getRoot().listNodes()){
  if(!n.getMesh()||n.getExtras().kind!=='cityBuildingDetailed')continue;
  const {lo,hi}=worldBounds(n),cx=(lo[0]+hi[0])/2,cz=(lo[2]+hi[2])/2;
  if(Math.hypot(Math.max(-30-cx,0,cx-74),Math.max(-33-cz,0,cz-48))>24)continue;
  const axis=Math.abs(cx-18)>Math.abs(cz-7)?0:2,side=(axis===0?cx<18:cz<7)?1:-1,along=axis===0?2:0,width=hi[along]-lo[along],yaw=axis===2?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2);
  const p=[cx,Math.max(-.101,lo[1]),cz];p[axis]=(side>0?hi[axis]:lo[axis])+side*.09;
  for(let q=-width/2+1.5;q<width/2-.7;q+=3.3){
   const s=[...p];s[along]+=q;place('shopAwnings',awnings[building%8],s,yaw);
   if(building%3===0){
    const pp=[...s];pp[axis]+=side*.44;
    // Stagger this avenue menu from the curb planter to leave a walking gap.
    if(Math.abs(pp[0]-42.011)<.05&&Math.abs(pp[2]-65.171)<.05)pp[0]+=1.1;
    fixed('menus',menu,pp,yaw,[.27,.45,.2]);
   }
   building++;
  }
  if(hi[1]-lo[1]>4.4){const s=[...p];s[1]+=1.36;place('fireEscapes',escape,s,yaw);}
  const curb=[...p];curb[along]-=width*.36;curb[axis]+=side*.42;
  fixed('bins',bin,curb,yaw,[.28,.47,.28]);const bag=[...curb];bag[along]+=.29;place('refuseBags',trash,bag,yaw);
 }
 counts.movingVehicles=vehicles.filter(v=>!v.parked).length;counts.parkedCars=vehicles.filter(v=>v.parked).length;counts.pedestrians=walks.reduce((n,w)=>n+w.count,0);counts.dogWalkers=dogs.length;
 return {counts,placements,lanes,vehicles,walks,dogs,obstacles};
}
