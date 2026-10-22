(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.HospitalityCore140=api;})(globalThis,()=>{
 'use strict';
 const floor=.3*10.09,ground=.24,ceiling=6.90,footprint=[-30.4,-30.3,-5.1,-13.35];
 const capacity=25,laneWidth=.72,hole=[-14.05,-15.43,-6.80,-13.47];
 const escalators=[{z:-13.99,direction:-1},{z:-14.91,direction:1}];
 const bottom=-6.9,top=-14.2,rampStart=-7.5,rampEnd=-13.7;
 // Flights run west along the IT wall; local cross-flight +X rotates toward -Z.
 const point=(e,along,y,cross=0)=>[along,y,e.z-cross];
 const lowLanding=e=>[bottom+.35,e.z],highLanding=e=>[top-.70,e.z];
 const inHole=(x,z,pad=0)=>x>hole[0]-pad&&x<hole[2]+pad&&z>hole[1]-pad&&z<hole[3]+pad;
 const inside=(x,z,pad=0)=>x>=footprint[0]+pad&&x<=footprint[2]-pad&&z>=footprint[1]+pad&&z<=footprint[3]-pad;
 function height(z){return ground+(floor-ground)*Math.max(0,Math.min(1,(z-rampStart)/(rampEnd-rampStart)));}
 function sector(){
  const slots=[],court=[[-1.55,-1.7,0],[1.55,-1.7,0],[-3.25,1.05,Math.PI/2],[3.25,1.05,-Math.PI/2],[0,2.4,Math.PI]];
  for(const [x,z]of [[-25.3,-25.7],[-15.9,-25.7],[-25.3,-17.45],[-15.9,-19.22]])for(const [dx,dz,yaw]of court)slots.push({x:x+dx,z:z+dz,yaw,group:'court'});
  for(const z of [-28.45,-25.35,-22.25,-19.15])slots.push({x:-10.25,z,yaw:Math.PI/2,group:'arrival'});
  slots.push({x:-6.8,z:-18.3,yaw:-Math.PI/2,group:'arrival'});
  slots.forEach((s,i)=>s.anchorId='discovery-hospitality-142-'+i);
  return {industry:'Hospitality',min:[-30.25,-30.12],max:[-5.22,-13.48],center:[-17.735,-21.8],floorY:floor,minCapacity:capacity,capacity,boothScale:.34,visualScale:1,entry:[-15.1,-14.2],pods:[],slots};
 }
 function removeOriginal(name){return /^District115 River entrance gallery stair |^District115 River entrance sealed side return -1 21$|^Grand_Gallery_back_glass_stairs_to_second_level_|^Grand_Gallery_second_level_back_inner_glass_railing_(west|east)_of_stairs_|^Park137 (planted room border |border \d+ plant )/.test(name);}
 // Migrate the existing city asset without moving the other wall equipment.
 function fixtureOffset(name){return /^DeVos130 (wall safety equipment|supplied fire extinguisher|FIRE sign) -16$/.test(name)?[0,0,3.55]:null;}
 function clearsGarden(name,kind,lo,hi){
  if(/trash|litter|recycl|\bbins?\b|street.?lamp|lamp post|bollard|bicycle rack/i.test(name+' '+kind)&&inside((lo[0]+hi[0])/2,(lo[2]+hi[2])/2,-.2))return true;
  if(/tree|foliage|leaf|leaves|shrub|bush|plant|bench/i.test(name+' '+kind)&&inside((lo[0]+hi[0])/2,(lo[2]+hi[2])/2,-.2))return true;
  return /tree|foliage|leaf|leaves|shrub|bush|grass|lawn|garden|planter|bench|mulch|tree.?pit|park path|park border/i.test(name+' '+kind)&&lo[0]>=footprint[0]-.2&&hi[0]<=footprint[2]+.1&&lo[2]>=footprint[1]-.4&&hi[2]<=footprint[3]+.2;
 }
 function gardenPoint(x,z){return inside(x,z,-.2);}
 function opensWall(name,lo,hi){return lo[0]>-5.35&&hi[0]<-4.70&&lo[2]<-13.35&&hi[2]>-30.4&&/wall|side return|rainscreen|cassettes|stone facing|stone bed|stone vertical|dark base|^Gallery_side_clerestory_band_/i.test(name);}
 // Subtract the addition volume from the descending west edge of the vaulted
 // glass shell. Retain the roof above it and the rest of the original gallery.
 function clipShell(data,idx,uv){
  const v=[],u=[],indices=[],planes=[p=>-p[0],p=>ceiling-p[1],p=>p[2]-footprint[1],p=>footprint[3]-p[2]];
  function half(poly,plane,inside){const out=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],da=plane(a),db=plane(b),ka=inside?da>=0:da<0,kb=inside?db>=0:db<0;if(ka)out.push(a);if(ka!==kb){const t=da/(da-db);out.push(a.map((n,k)=>n+(b[k]-n)*t));}}return out;}
  function emit(poly){if(poly.length<3)return;const start=v.length/6;for(const p of poly){v.push(...p.slice(0,6));if(uv)u.push(...p.slice(6));}for(let j=1;j<poly.length-1;j++)indices.push(start,start+j,start+j+1);}
  for(let i=0;i<idx.length;i+=3){let poly=[idx[i],idx[i+1],idx[i+2]].map(k=>[...data.subarray(k*6,k*6+6),...(uv?uv.subarray(k*2,k*2+2):[])]);for(const plane of planes){if(poly.length<3)break;emit(half(poly,plane,false));poly=half(poly,plane,true);}}
  return {data:new Float32Array(v),idx:new Uint32Array(indices),uv:uv?new Float32Array(u):null};
 }
 // The old wall skins are batched across the full gallery. Clip triangles at
 // the addition boundary, interpolating their normals/UVs, not the whole batch.
 function clipWall(data,idx,uv,edge=-13.35){
  const v=[],u=[],indices=[];
  for(let i=0;i<idx.length;i+=3){let poly=[idx[i],idx[i+1],idx[i+2]].map(k=>[...data.subarray(k*6,k*6+6),...(uv?uv.subarray(k*2,k*2+2):[])]),out=[];
   for(let j=0;j<3;j++){const a=poly[j],b=poly[(j+1)%3],da=a[2]-edge,db=b[2]-edge;if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((n,k)=>n+(b[k]-n)*t));}}
   if(out.length<3)continue;const start=v.length/6;for(const p of out){v.push(...p.slice(0,6));if(uv)u.push(...p.slice(6));}for(let j=1;j<out.length-1;j++)indices.push(start,start+j,start+j+1);
  }return {data:new Float32Array(v),idx:new Uint32Array(indices),uv:uv?new Float32Array(u):null};
 }
 return {floor,ground,ceiling,footprint,capacity,laneWidth,hole,inHole,point,lowLanding,highLanding,escalators,bottom,top,rampStart,rampEnd,inside,height,sector,removeOriginal,fixtureOffset,clearsGarden,gardenPoint,opensWall,clipWall,clipShell};
});
