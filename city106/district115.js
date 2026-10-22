/* Shared district coordinates keep rendered bridges, walkers and traffic aligned. */
const District115=(()=>{
 const river={x0:-90.6,x1:78,z0:-62.1,z1:-38.7,y:-1.8};
 const bridges=[{id:'riverwalk',x:-6.3,width:1.9,start:-34.8,end:-65.8,rise:.62,base:-.021,foot:true},
  {id:'west',x:-33.3,width:6.2,start:-34.7,end:-65.8,rise:.85,base:-.1275},
  {id:'east',x:69.9,width:6.6,start:-34.7,end:-65.8,rise:.85,base:-.1275}];
 const parkCorner={x0:-30.9,x1:-5.1,z0:-33.2,z1:-30.6};
 function elevation(b,z){const t=Math.max(0,Math.min(1,(z-b.start)/(b.end-b.start)));return b.base+b.rise*Math.sin(Math.PI*t)**2;}
 function width(b,z){if(b.id!=='west')return b.width;const t=Math.min(Math.abs(z-b.start),Math.abs(z-b.end));return 3.3+2.9*Math.min(1,t/5);}
 function railingSpan(b){return b.foot?{start:b.start,end:b.end}:{start:Math.min(b.start,river.z1+.65),end:Math.max(b.end,river.z0-.65)};}
 function bridgeAt(x,z){return bridges.find(b=>z<=b.start+.05&&z>=b.end-.05&&Math.abs(x-b.x)<=width(b,z)/2+.04);}
 function heightAt(x,z){const b=bridgeAt(x,z);if(b)return elevation(b,z);return null;}
 function inWater(x,z){return x>river.x0&&x<river.x1&&z>river.z0&&z<river.z1&&!bridgeAt(x,z);}
 function remove(name){return name==='Exterior44_shrub'||/^(Front|East)_sidewalk_joint_|^Procedural_bench_riverwalk_|^Riverfront_concrete_retaining_wall|^Riverfront_black_railing_|^Blue_Bridge_|^City_crosswalk|^City_.*crossing_stripe|^Grand_River_water|^V9_rear gallery level transition_|^Grand_Gallery_back_glass_stairs_to_second_level_/.test(name);}
 function safeWalk(x,z,r=.16){
  if(x<=river.x0-r||x>=river.x1+r||z<=river.z0-r||z>=river.z1+r)return true;
  const b=bridgeAt(x,z);return !!b&&Math.abs(x-b.x)<width(b,z)/2-r-.04;
 }
 function constrainWalk(p,previous,r=.16){
  let x=previous[0],z=previous[2];
  if(!safeWalk(x,z,r)){
   const b=bridgeAt(x,z);
   if(b)x=b.x+Math.max(-width(b,z)/2+r+.06,Math.min(width(b,z)/2-r-.06,x-b.x));
   else z=Math.abs(z-river.z0)<Math.abs(z-river.z1)?river.z0-r-.02:river.z1+r+.02;
  }
  const steps=Math.max(1,Math.ceil(Math.hypot(p[0]-x,p[2]-z)/.08)),dx=(p[0]-x)/steps,dz=(p[2]-z)/steps;
  for(let i=0;i<steps;i++){
   if(safeWalk(x+dx,z+dz,r)){x+=dx;z+=dz;}
   else if(safeWalk(x+dx,z,r))x+=dx;
   else if(safeWalk(x,z+dz,r))z+=dz;
  }
  p[0]=x;p[2]=z;return p;
 }
 function clip(poly,axis,edge,sign,slope=0){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-edge-slope*a[2])*sign,db=(b[axis]-edge-slope*b[2])*sign;if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}return out;}
 const rectangle=(x0,x1,z0,z1)=>[[0,x0,1],[0,x1,-1],[2,z0,1],[2,z1,-1]];
 // Match the tapered west deck, including both banks, without opening gaps
 // beside its narrow approaches. Existing bridge side rails remain in place.
 const railOpenings=bridges.flatMap(b=>{
  const zs=b.id==='west'?[b.end-.15,b.end,b.end+5,b.start-5,b.start,b.start+.15]:[b.end-.15,b.start+.15];
  return zs.slice(1).map((z1,i)=>{
   const z0=zs[i],half=z=>width(b,Math.max(b.end,Math.min(b.start,z)))/2+.15,w0=half(z0),s=(half(z1)-w0)/(z1-z0);
   return [[0,b.x-w0+s*z0,1,-s],[0,b.x+w0-s*z0,-1,s],[2,z0,1],[2,z1,-1]];
  });
 });
 function geometry(name,kind,data,idx,uv){
  const ground=/ground|foundation|street|sidewalk|lane_marking|water/i.test(name+' '+kind),rail=/river.*rail|^Riverfront_concrete_retaining_wall/i.test(name),door=/^Grand_Gallery_riverfront_(window_wall|low_sill)/.test(name),corner=/^Riverfront_(sidewalk_promenade|building_apron)$/.test(name);
  if(!ground&&!rail&&!door&&!corner)return {data,idx,uv};
  const farRoad=name==='@farRoad115',verts=[],indices=[],tex=[];
  const regions=rail?railOpenings:door?[[[0,-1.66,1],[0,1.66,-1],[1,.23,1],[1,1.43,-1]]]:farRoad?[rectangle(-99.6,131.4,-72,-67.2)]:[...(ground?[rectangle(river.x0,river.x1,river.z0,river.z1)]:[]),...(corner?[rectangle(parkCorner.x0,parkCorner.x1,parkCorner.z0,parkCorner.z1)]:[])];
  function emit(poly){for(let i=1;i+1<poly.length;i++){
   const a=poly[0],b=poly[i],c=poly[i+1],u=b.slice(0,3).map((v,k)=>v-a[k]),v=c.slice(0,3).map((v,k)=>v-a[k]);
   if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])<1e-12)continue;
   for(const p of[a,b,c]){indices.push(verts.length/6);verts.push(...p.slice(0,6));if(uv)tex.push(...p.slice(6));}
  }}
  for(let i=0;i<idx.length;i+=3){const p=[idx[i],idx[i+1],idx[i+2]].map(v=>[...data.subarray(v*6,v*6+6),...(uv?uv.subarray(v*2,v*2+2):[])]);
   if(!rail&&!door&&Math.min(...p.map(v=>v[1]))>.05){emit(p);continue;}
   let remaining=[p];
   for(const planes of regions)remaining=remaining.flatMap(poly=>{
    if(planes.some(([axis,edge,sign,slope=0])=>poly.every(v=>(v[axis]-edge-slope*v[2])*sign<0)))return [poly];
    const outside=[];for(const [axis,edge,sign,slope]of planes){const part=clip(poly,axis,edge,-sign,slope);if(part.length>=3)outside.push(part);poly=clip(poly,axis,edge,sign,slope);if(!poly.length)break;}return outside;
   });
   remaining.forEach(emit);
  }
  const result={data:new Float32Array(verts),idx:new Uint32Array(indices),uv:uv?new Float32Array(tex):null};
  return !farRoad&&/citySidewalk|cityStreet|lane_marking/.test(kind+' '+name)?geometry('@farRoad115','street',result.data,result.idx,result.uv):result;
 }
 return {river,bridges,parkCorner,elevation,width,railingSpan,bridgeAt,heightAt,inWater,safeWalk,constrainWalk,remove,geometry};
})();
if(typeof module!=='undefined')module.exports=District115;
if(typeof window!=='undefined')window.District115=District115;
