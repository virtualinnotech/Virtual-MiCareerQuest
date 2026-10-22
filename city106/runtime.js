/* Shared city detail assets; visibility changes never alter collision geometry. */
window.City106=(()=>{
 'use strict';
 const compressed=typeof DecompressionStream!=='undefined';
 const assetURL=new URL((compressed?'city.glb.gz':'city.glb')+'?v=162b',document.currentScript.src),materials=new Map(),extraBatches=[],buildingTemplates=new Map(),buildingCache=new Map(),normalImages=new Map(),grassAreas130=new Set();
 let treePits137=[];
 const sunDirection=[-.72,.48,-.48];
 const disabled=new URLSearchParams(location.search).has('city106off');
 const culling=!new URLSearchParams(location.search).has('culling106off');
 let occlusion=!new URLSearchParams(location.search).has('occlusion106off'),drawingVenue=false;
 let occluders=[],occluderCandidates=[],framePlanes160=null;
 const detailBatches160=[];
 let ready=false,error=null,stats={};
 const trafficLenses=[],swingDoors=new Map();let doorTime=0;
 let trafficPhase=-1,trafficTime=null;
 const trafficColors={red:[1,.018,.009,1],yellow:[1,.56,.005,1],green:[.008,.86,.12,1]};
 const trafficDark={red:[.10,.006,.004,1],yellow:[.12,.065,.002,1],green:[.003,.075,.018,1]},noEmission=[0,0,0];
 const trafficEmission={red:[1,.008,.003],yellow:[1,.44,.001],green:[.002,.78,.08]};
 function trafficState(seconds){
  const t=((seconds%44)+44)%44;
  return {ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red',phase:t<18?0:t<21?1:t<22?2:t<40?3:t<43?4:5};
 }
 function updateTraffic(seconds){
  const phase=trafficState(seconds);if(phase.phase===trafficPhase)return;trafficPhase=phase.phase;
  // Only the six phase transitions change material uniforms; geometry stays shared.
  for(const b of trafficLenses){const {axis,color}=b.traffic108,active=phase[axis]===color;b.color=active?trafficColors[color]:trafficDark[color];b.emission=active?trafficEmission[color]:noEmission;}
 }
 function bounds(data,stride=6){
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<data.length;i+=stride)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],data[i+k]);hi[k]=Math.max(hi[k],data[i+k]);}
  const center=lo.map((v,k)=>(v+hi[k])/2);return {lo,hi,center,cullRadius:Math.hypot(...lo.map((v,k)=>hi[k]-v))/2+.01};
 }
 function spatialKey(data){
  if(!culling)return '';
  const b=bounds(data),[x,y,z]=b.center;
  // Small authoring objects are grouped by tile; large floors retain their full conservative bounds.
  return ':'+[Math.floor(x/32),Math.floor(y/12),Math.floor(z/32)].join(',');
 }
 function materialProps(j,images,id){
  const m=j.materials[id],p=m.pbrMetallicRoughness||{};
  if(/^Park116 staggered|^District115 park path/.test(m.name)){
   const paving=j.materials.findIndex(m=>m.name==='City106 paving');
   if(paving>=0)return {...materialProps(j,images,paving),surfaceType:19};
  }
  const detail=/^(City107 pale cast stone|District115 pale riverbank concrete|River entrance light concrete|Blue bridge stone|Block126 kiosk limestone)/.test(m.name)?26:/^City.*(wood|timber)/i.test(m.name)?13:0;
  return {color:p.baseColorFactor||[1,1,1,1],emission:m.emissiveFactor||[0,0,0],metal:p.metallicFactor??0,rough:p.roughnessFactor??.8,baseTexture:images.get(id)||null,normalTexture:normalImages.get(id)||null,normalScale:.55,alphaCutoff:m.alphaMode==='MASK'?(m.alphaCutoff??.5):-1,surfaceType:m.extras?.vehicleSurface114||m.extras?.surfaceType||detail,paint114:!!m.extras?.paint114};
 }
 async function prepareVenue(j){
  if(disabled||ready)return;
  try{
   await window.StreetProps128?.ready;
   const response=await fetch(assetURL);if(!response.ok)throw Error('City detail asset '+response.status);
   const bytes=compressed?await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():await response.arrayBuffer();
   const details150=new Map();let detailBytes150=null;
   try{
    const meta=await fetch(new URL('detail150.json',assetURL)),data=await fetch(new URL('detail150.bin',assetURL));
    if(!meta.ok||!data.ok)throw Error('Background detail files unavailable');
    const manifest=await meta.json();detailBytes150=await data.arrayBuffer();
    if(manifest.bytes!==detailBytes150.byteLength)throw Error('Background detail size mismatch');
    for(const r of manifest.records)details150.set(r.mesh+':'+r.part,r);
   }catch(e){detailBytes150=null;console.warn('Keeping original city detail:',e.message);}
   const {json:a,bin}=parseGLB(bytes),images=await loadVenueMaterialImages(a,bin),shared=new Map();
   treePits137=a.extras.assets130?.treePits137?.pits||[];
   window.CityLighting131?.configure(a.extras.lighting131);
   for(const name of a.extras.assets130?.grassAreas||[])grassAreas130.add(name);
   for(let i=0;i<a.materials.length;i++){const index=a.materials[i].normalTexture?.index;if(index!==undefined)normalImages.set(i,await embeddedGLBTexture(a,bin,index));}
   a.materials.forEach((m,i)=>materials.set(m.name,materialProps(a,images,i)));
   const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
   if(anisotropy){gl.activeTexture(gl.TEXTURE1);for(const t of new Set([...images.values(),...normalImages.values()])){gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));}gl.activeTexture(gl.TEXTURE0);}
   for(const m of a.meshes)if(m.extras?.cityBuildingTemplate){const p=m.primitives[0];buildingTemplates.set(m.extras.sourceMesh,{pos:accessor(a,bin,p.attributes.POSITION),nor:accessor(a,bin,p.attributes.NORMAL),uv:accessor(a,bin,p.attributes.TEXCOORD_0),idx:accessor(a,bin,p.indices),columns:m.extras.columns112,material:materialProps(a,images,p.material),skins:(a.extras.skins127||[]).filter(s=>s.style===m.extras.style112).map(s=>materials.get(s.material))});}
   const furnishingColliders=[];window.CityLife111?.configure(a.extras.life111);
   for(const n of a.nodes){if(n.mesh===undefined)continue;
    if(window.HotelCore146?.removeOriginal(n.name||''))continue;
    if(window.HospitalityCore140?.removeOriginal(n.name||''))continue;
    if(window.HospitalityCore140){
     const m=trs(n),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
     for(const pr of a.meshes[n.mesh].primitives){const ac=a.accessors[pr.attributes.POSITION];for(const x of[ac.min[0],ac.max[0]])for(const y of[ac.min[1],ac.max[1]])for(const z of[ac.min[2],ac.max[2]]){const p=tp(m,x,y,z);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}}}
     if(HospitalityCore140.clearsGarden(n.name,[n.extras?.asset130,n.extras?.furnishing107].filter(Boolean).join(' '),lo,hi))continue;
    }
    if((n.extras?.tree||n.extras?.furnishing107||n.extras?.trafficSignal108||n.extras?.detail109||n.extras?.detail111)&&!n.extras?.life111&&!n.extras?.vegetation115&&window.HarvestCore36?.inField(n.translation[0],n.translation[2]))continue;
    const world=trs(n),fixtureOffset=window.HospitalityCore140?.fixtureOffset(n.name||'');
    if(fixtureOffset)for(let i=0;i<3;i++)world[12+i]+=fixtureOffset[i];
    if(n.extras?.colliderMesh126)for(const pr of a.meshes[n.mesh].primitives){
     const local=accessor(a,bin,pr.attributes.POSITION),positions=new Float32Array(local.length);for(let i=0;i<local.length;i+=3)positions.set(tp(world,...local.subarray(i,i+3)),i);
     registerCollider(n.name,'cityBuildingCollider',positions,accessor(a,bin,pr.indices),true,{walktestBarrier:true});
    }
    if(n.extras?.collider107){
     const {center,size}=n.extras.collider107,positions=[];
     for(const z of[-1,1])for(const y of[-1,1])for(const x of[-1,1])positions.push(...tp(world,center[0]+x*size[0]/2,center[1]+y*size[1]/2,center[2]+z*size[2]/2));
     furnishingColliders.push({name:n.name,positions:new Float32Array(positions)});
    }
    if(n.extras?.contactOnly115)continue;
    for(const pr of a.meshes[n.mesh].primitives){
     const hotelGround=window.HotelCore146?.groundNames.has(n.name)?HotelCore146.pavingSource({pos:accessor(a,bin,pr.attributes.POSITION),nor:accessor(a,bin,pr.attributes.NORMAL),uv:pr.attributes.TEXCOORD_0===undefined?null:accessor(a,bin,pr.attributes.TEXCOORD_0),idx:accessor(a,bin,pr.indices)},world):null;
     if(hotelGround&&!hotelGround.idx.length)continue;
     if(n.extras?.surface115){const local=hotelGround?.pos||accessor(a,bin,pr.attributes.POSITION),positions=new Float32Array(local.length);for(let i=0;i<local.length;i+=3)positions.set(tp(world,...local.subarray(i,i+3)),i);registerCollider(n.name,'districtSurface115',positions,hotelGround?.idx||accessor(a,bin,pr.indices),false,{});}
     const lens=a.materials[pr.material].extras?.trafficLens108,axis=n.extras?.trafficSignal108?.axis;
     const key='city106:'+n.mesh+':'+a.meshes[n.mesh].primitives.indexOf(pr)+':'+pr.material+(lens?':'+axis:'')+(hotelGround?':hotel149:'+n.name:'');let record=shared.get(key);
     if(!record){
      const pos=hotelGround?.pos||accessor(a,bin,pr.attributes.POSITION),normal=hotelGround?.nor||accessor(a,bin,pr.attributes.NORMAL),uv=hotelGround?hotelGround.uv:pr.attributes.TEXCOORD_0===undefined?null:accessor(a,bin,pr.attributes.TEXCOORD_0),idx=hotelGround?.idx||accessor(a,bin,pr.indices),data=new Float32Array(pos.length*2);
      for(let i=0;i<pos.length;i+=3){data.set(pos.subarray(i,i+3),i*2);data.set(normal.subarray(i,i+3),i*2+3);}
      const local=bounds(pos,3),batch=uploadBatch(data,idx,{...materialProps(a,images,pr.material),uv,sharedKey:key,sceneInstance:true,cityProp:true});
      const joint=a.meshes[n.mesh].extras?.joint117;
      if(joint){
       const weights=new Float32Array(pos.length/3*8);
       for(let i=0;i<pos.length/3;i++){const t=Math.max(0,Math.min(1,(pos[i*3+2]-joint.rearZ)/(joint.frontZ-joint.rearZ)));weights.set([0,1,0,0,t,1-t,0,0],i*8);}
       gl.bindVertexArray(batch.vao);const skin=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,skin);gl.bufferData(gl.ARRAY_BUFFER,weights,gl.STATIC_DRAW);
       for(const [loc,offset]of[[7,0],[8,16]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,32,offset);}
      }
      const nearMesh=a.meshes[n.mesh],farMesh=nearMesh.extras?.farMesh114&&a.meshes.find(m=>m.name===nearMesh.extras.farMesh114);
      if(farMesh){
       const farIndices=accessor(a,bin,farMesh.primitives[nearMesh.primitives.indexOf(pr)].indices),ibo=gl.createBuffer();
       gl.bindVertexArray(batch.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,farIndices,gl.STATIC_DRAW);
       batch.lod114={near:{ibo:batch.ibo,count:batch.count},far:{ibo,count:farIndices.length}};
      }else if(detailBytes150&&!hotelGround){
       const r=details150.get(n.mesh+':'+nearMesh.primitives.indexOf(pr));
       if(r&&r.sourceCount===idx.length&&r.vertices===pos.length/3&&r.signature.every((v,i)=>v===idx[i])){
        const farIndices=new Uint32Array(detailBytes150,r.offset,r.count),ibo=gl.createBuffer();
        gl.bindVertexArray(batch.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,farIndices,gl.STATIC_DRAW);
        batch.lod114={near:{ibo:batch.ibo,count:batch.count},far:{ibo,count:r.count}};batch.detailLOD150=true;
       }
      }
      record={batch,local};shared.set(key,record);
     }
     const scale=Math.max(Math.hypot(...world.slice(0,3)),Math.hypot(...world.slice(4,7)),Math.hypot(...world.slice(8,11)));
     const batch={...record.batch,transparent:a.materials[pr.material].alphaMode==='BLEND',name:n.name,modelMatrix:new Float32Array(world),center:tp(world,...record.local.center),cullRadius:record.local.cullRadius*scale,vegetation115:!!n.extras?.vegetation115,building125:!!n.extras?.building125,lodKey115:key};
     if(n.extras?.swingDoor115){if(!swingDoors.has(n.name))swingDoors.set(n.name,{...n.extras.swingDoor115,id:n.name,angle:0,parts:[]});swingDoors.get(n.name).parts.push({batch,center:record.local.center});batch.animated=true;}
     window.CityLife111?.attach(n,batch);
     window.StreetProps128?.attach(n,batch,record.local,a.materials[pr.material].name||'');
     if(lens){batch.traffic108={axis,color:lens};trafficLenses.push(batch);}
     extraBatches.push(batch);
     if(!batch.life111&&(batch.vegetation115||batch.building125||batch.detailLOD150)&&batch.lod114)detailBatches160.push(batch);
    }
   }
   window.CityLife111?.settle();
   const hidden=new Set(a.extras.hidden);for(const n of j.nodes)if(hidden.has(n.name))n.extras={...n.extras,city106HideVisual:true};
   const retired=new Set([...(a.extras.blocks126?.retiredColliders||[]),...(a.extras.assets130?.retired131||[])]);for(const n of j.nodes)if(retired.has(n.name))n.extras={...n.extras,city126RetireContact:true};
   const boxIndices=new Uint32Array([0,2,1,1,2,3,4,5,6,5,7,6,0,4,2,4,6,2,1,3,5,3,7,5,2,6,3,3,6,7,0,1,4,1,5,4]);
   for(const c of furnishingColliders)registerCollider(c.name,'cityFurniture',c.positions,boxIndices,true,{walktestBarrier:true});
   stats={trees:a.extras.treeCount,benches:a.extras.benchCount,blocks:a.extras.blocks126?.counts,skins:a.extras.skins127?.length,district:a.extras.district115,furnishings:a.extras.furnishings107,details:a.extras.details109,streetLife:a.extras.life111?.counts,normalMaps:normalImages.size,sky:!!materials.get('City109 sky')?.baseTexture,signals:a.extras.signals108,activeSignals:trafficLenses.length/3,propColliders:furnishingColliders.length,uniquePropBatches:shared.size,propInstances:extraBatches.length,assetBytes:response.headers.get('content-length')};ready=true;
  }catch(e){error=e.message;console.warn('City detail unavailable; retaining original scenery.',e);}
 }
 function buildingGeometry(g,meshID){
  if(buildingCache.has(meshID))return buildingCache.get(meshID);
  const t=buildingTemplates.get(meshID);if(!ready||!t)return g;
  const b=bounds(g.pos,3),tb=bounds(t.pos,3),size=b.hi.map((v,i)=>Math.max(.001,v-b.lo[i])),uv=new Float32Array(t.uv),pos=new Float32Array(t.pos.length);
  const width=Math.max(size[0],size[2]),columns=t.columns||8,floors=Math.max(3,Math.round(size[1]/width*columns));
  for(let i=0;i<t.pos.length/3;i++){
   const k=i*3;for(let axis=0;axis<3;axis++)pos[k+axis]=(t.pos[k+axis]-tb.lo[axis])/(tb.hi[axis]-tb.lo[axis])*size[axis]+b.lo[axis];
   if(Math.abs(t.uv[i*2]-.008)>1e-5||Math.abs(t.uv[i*2+1]-.004)>1e-5){uv[i*2]*=columns/4;uv[i*2+1]*=-floors/4;}
  }
  const result={...g,pos,nor:t.nor,idx:t.idx,uv};buildingCache.set(meshID,result);return result;
 }
 function buildingSkin(meshID,name=''){
  const count=buildingTemplates.get(meshID)?.skins?.length||1;let hash=0;for(let i=0;i<name.length;i++)hash=(Math.imul(hash,31)+name.charCodeAt(i))>>>0;return hash%count;
 }
 function building(g,meshID,name){
  const t=buildingTemplates.get(meshID);return ready?{...(t?.skins?.[buildingSkin(meshID,name)]||t?.material),uv:g.uv,surfaceType:17}:{};
 }
 function surface(name,kind,data){
  if(!ready)return {};
  if(grassAreas130.has(name)){
   const uv=new Float32Array(data.length/3);for(let i=0;i<data.length;i+=6){uv[i/3]=data[i]/1.2;uv[i/3+1]=data[i+2]/1.2;}
   return {...materials.get('Supplied130 lawn'),uv,citySurface106:'suppliedGrass'};
  }
  if(/^City_(lane_marking|crosswalk)/.test(name))return {surfaceType:20,citySurface106:'roadPaint'};
  const painted=/continuous_curved_exterior_inlay|stripes_continued_to_front_curb/.test(name);
  const asphalt=kind==='cityStreet'||name==='Front_east_corner_asphalt',paving=painted||kind==='citySidewalk'||/^(Exterior_street_apron|Front_continuous_sidewalk|East_continuous_sidewalk|Front_east_rounded_sidewalk|Full_venue_foundation_slab|Riverfront_sidewalk_promenade|Surrounding_city_ground_plane|Right_front_facade_connector_floor)$/.test(name);
  if(!asphalt&&!paving)return {};
  const uv=new Float32Array(data.length/3),scale=asphalt?.32:1/2.4;
  for(let i=0;i<data.length;i+=6){uv[i/3]=data[i]*scale;uv[i/3+1]=data[i+2]*scale;}
  const material={...materials.get('City106 '+(asphalt?'asphalt':'paving'))};if(painted)delete material.color;
  return {...material,uv,surfaceType:asphalt?18:19,citySurface106:painted?'paintedPaving':asphalt?'asphalt':'paving'};
 }
 function curbGeometry(name,kind,data,idx,uv){
  const g=curbFaces(name,kind,data,idx,uv);
  const paving=kind==='citySidewalk'||/sidewalk|foundation|apron|ground_plane|exterior_inlay|stripes_continued_to_front_curb/.test(name);
  return paving&&window.CityTreePits137?CityTreePits137.cut(g.data,g.idx,g.uv,treePits137):g;
 }
 function curbFaces(name,kind,data,idx,uv){
  // The apron is entirely covered by the continuous sidewalk. A Y lift cannot
  // resolve their coincident vertical faces, so omit this redundant visual.
  if(name==='Exterior_street_apron')return {data,idx:new Uint32Array(0),uv};
  if(kind!=='citySidewalk'&&!/^(Front|East)_continuous_sidewalk$/.test(name))return {data,idx,uv};
  // Authoritative curb faces in scaled venue coordinates. Subtract only the
  // covered face area, retaining exposed sidewalk ends and original colliders.
  const faces=[{axis:2,plane:39.6,u:0,lo:-31.5,hi:61.05},{axis:0,plane:66.6,u:2,lo:-36.9,hi:34.05}];
  let vertices=null,texcoords=null;const indices=[];
  function clip(poly,axis,edge,sign){
   const out=[];
   for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-edge)*sign,db=(b[axis]-edge)*sign;
    if(da>=0)out.push(a);
    if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,k)=>v+(b[k]-v)*t));}
   }return out;
  }
  function append(poly){
   for(let i=1;i+1<poly.length;i++)for(const p of[poly[0],poly[i],poly[i+1]]){
    indices.push(vertices.length/6);vertices.push(...p.slice(0,6));if(texcoords)texcoords.push(...p.slice(6));
   }
  }
  for(let i=0;i<idx.length;i+=3){
   const ids=[idx[i],idx[i+1],idx[i+2]];
   const face=faces.find(f=>ids.every(v=>Math.abs(data[v*6+f.axis]-f.plane)<1e-5)&&
    Math.max(...ids.map(v=>data[v*6+f.u]))>f.lo&&Math.min(...ids.map(v=>data[v*6+f.u]))<f.hi&&
    Math.max(...ids.map(v=>data[v*6+1]))>-.1299&&Math.min(...ids.map(v=>data[v*6+1]))<-.0249);
   if(!face){indices.push(...ids);continue;}
   if(!vertices){vertices=Array.from(data);texcoords=uv?Array.from(uv):null;}
   let covered=ids.map(v=>[...data.subarray(v*6,v*6+6),...(uv?uv.subarray(v*2,v*2+2):[])]);
   for(const [axis,edge,sign]of[[face.u,face.lo,1],[face.u,face.hi,-1],[1,-.1299,1],[1,-.0249,-1]]){
    append(clip(covered,axis,edge,-sign));covered=clip(covered,axis,edge,sign);
    if(!covered.length)break;
   }
  }
  return vertices?{data:new Float32Array(vertices),idx:new Uint32Array(indices),uv:texcoords?new Float32Array(texcoords):null}:{data,idx,uv};
 }
 function bindAtmosphere(){
  updateDoors();
  for(const b of detailBatches160){
   const distance=b.detailLOD150?20:b.building125?30:15,dx=b.center[0]-camera[0],dz=b.center[2]-camera[2],far=dx*dx+dz*dz>distance*distance;
   if(b.far160===far)continue;
   b.far160=far;Object.assign(b,b.lod114[far?'far':'near']);b.sharedKey=b.lodKey115+(far?':far':':near');
  }
  const sky=materials.get('City109 sky')?.baseTexture,enabled=!!sky&&!window.FarmScene63?.active;
  gl.uniform1f(uniforms.uCityAtmosphere??=gl.getUniformLocation(program,'uCityAtmosphere'),enabled?1:0);
  gl.uniform3fv(uniforms.uSunDirection??=gl.getUniformLocation(program,'uSunDirection'),sunDirection);
  gl.uniform1f(uniforms.uCityTime??=gl.getUniformLocation(program,'uCityTime'),((window.frameNow164?.()??performance.now())/1000)%3600);
  gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,sky||whiteBaseMap);gl.uniform1i(uniforms.uSkyMap??=gl.getUniformLocation(program,'uSkyMap'),6);gl.activeTexture(gl.TEXTURE0);
  window.CityLighting131?.bind();
 }
 function updateDoors(){
  const now=(window.frameNow164?.()??performance.now())/1000,dt=Math.min(.05,Math.max(0,now-doorTime));doorTime=now;
  for(const door of swingDoors.values()){
   const [x,y,z]=door.hinge,near=Math.abs(player.position[0]-x)<1.9&&Math.abs(player.position[2]-z)<1.7,desired=near?door.direction*1.42:0;
   door.angle+=Math.max(-dt*2.1,Math.min(dt*2.1,desired-door.angle));
   const m=transform(door.hinge,[1,1,1],0,door.angle),center=tp(m,door.direction*door.width/2,0,0);door.p=center;door.yaw=door.angle;door.length=.048;
   for(const {batch,center} of door.parts){batch.modelMatrix.set(m);batch.center=tp(m,...center);}
  }
 }
 function resolveDoors(p,previous,r,contacts){if(typeof CityLifeCore111!=='undefined')CityLifeCore111.resolveVehiclePoint(p,previous,r,[...swingDoors.values()].filter(d=>d.p),contacts);}
 function collectOccluders(name,data,idx){
  if(!occlusion||!/wall|panel|cladding|stone facing/i.test(name)||/door|glass|window|curtain|contact/i.test(name))return;
  for(let i=0;i+5<idx.length;i+=6){
   const points=Array.from({length:6},(_,k)=>Array.from(data.subarray(idx[i+k]*6,idx[i+k]*6+3)));
   if(new Set(points.map(p=>p.map(x=>x.toFixed(5)).join(','))).size!==4)continue;
   const lo=[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...points.map(p=>p[k])));
   const axis=hi[0]-lo[0]<1e-5?0:hi[2]-lo[2]<1e-5?2:-1;if(axis<0)continue;
   const u=axis===0?2:0,area=(hi[u]-lo[u])*(hi[1]-lo[1]);if(area<6||hi[1]-lo[1]<1)continue;
   const same=(a,b)=>a.every((v,k)=>Math.abs(v-b[k])<1e-5),shared=points.slice(0,3).filter(p=>points.slice(3).some(q=>same(p,q)));
   if(shared.length!==2||Math.abs(shared[0][u]-shared[1][u])<.01||Math.abs(shared[0][1]-shared[1][1])<.01)continue;
   const triangleArea=(a,b,c)=>Math.abs((b[u]-a[u])*(c[1]-a[1])-(b[1]-a[1])*(c[u]-a[u]))/2;
   if(Math.abs(triangleArea(...points.slice(0,3))+triangleArea(...points.slice(3))-area)>area*1e-5)continue;
   occluderCandidates.push({axis,u,plane:lo[axis],low:[lo[u]+.025,lo[1]+.025],high:[hi[u]-.025,hi[1]-.025],area});
  }
 }
 function finishOccluders(){
  occluders=[];
  for(const o of occluderCandidates.sort((a,b)=>b.area-a.area)){
   if(occluders.some(p=>p.axis===o.axis&&Math.abs(p.plane-o.plane)<.2&&p.low.every((v,i)=>v<=o.low[i]+.05)&&p.high.every((v,i)=>v>=o.high[i]-.05)))continue;
   occluders.push(o);if(occluders.length>=64)break;
  }occluderCandidates=[];
 }
 function hiddenBox(lo,hi,eye=camera){
  if(!occlusion)return false;
  if(window.HotelScene146?.ready&&window.HotelCore146?.lobbyOccludes150(lo,hi,eye))return true;
  for(const o of occluders){
   const near=eye[o.axis]<o.plane?lo[o.axis]:hi[o.axis];
   if((eye[o.axis]-o.plane)*(near-o.plane)>=-.001)continue;
   const t0=(o.plane-eye[o.axis])/(lo[o.axis]-eye[o.axis]),t1=(o.plane-eye[o.axis])/(hi[o.axis]-eye[o.axis]);
   if(t0<=0||t1<=0||t0>=1||t1>=1)continue;
   const eu=eye[o.u],u0=eu+t0*(lo[o.u]-eu),u1=eu+t0*(hi[o.u]-eu),u2=eu+t1*(lo[o.u]-eu),u3=eu+t1*(hi[o.u]-eu);
   if(Math.min(u0,u1,u2,u3)<o.low[0]||Math.max(u0,u1,u2,u3)>o.high[0])continue;
   const ey=eye[1],v0=ey+t0*(lo[1]-ey),v1=ey+t0*(hi[1]-ey),v2=ey+t1*(lo[1]-ey),v3=ey+t1*(hi[1]-ey);
   if(Math.min(v0,v1,v2,v3)>=o.low[1]&&Math.max(v0,v1,v2,v3)<=o.high[1])return true;
  }return false;
 }
 function actorVisible(x,y,z){return !hiddenBox([x-.6,y-.15,z-.6],[x+.6,y+1.45,z+.6]);}
 // Plane tests as plain loops (no function per call); "is the camera in the
 // hotel lobby" is the same for every piece in a frame, so it is asked once.
 function boxInPlanes164(planes,lo,hi){for(let i=0;i<planes.length;i++){const p=planes[i];if(!(p[0]*(p[0]>=0?hi[0]:lo[0])+p[1]*(p[1]>=0?hi[1]:lo[1])+p[2]*(p[2]>=0?hi[2]:lo[2])+p[3]>=-.01))return false;}return true;}
 let lobbyPlanes164=null,lobby164=false;
 function insideLobby164(planes){const ask=()=>!!(window.HotelScene146?.ready&&window.HotelCore146?.insideLobby150(camera));if(!planes||planes!==framePlanes160)return ask();if(lobbyPlanes164!==planes){lobbyPlanes164=planes;lobby164=ask();}return lobby164;}
 function visible(b,planes){
  if(occlusion&&!b.sky&&b.localBounds106&&insideLobby164(planes)){
   const box=worldBounds150(b,b.modelMatrix);if(HotelCore146.lobbyOccludes150(box.lo,box.hi,camera))return false;
  }
  if(!b.cullBounds106)return true;const {lo,hi}=b.cullBounds106;return boxInPlanes164(planes,lo,hi)&&!hiddenBox(lo,hi);
 }
 function drawVisible(b,matrix){
  if(window.CityMaterials129?.pass)return true;
  if(!drawingVenue||!b.localBounds106||b.spatial106||b.boneTexture||b.activeOutfit||b.sky)return true;
  const box=worldBounds150(b,matrix||b.modelMatrix),{lo,hi}=box;
  // Custom exhibits/furniture use drawBatch directly, outside the main batch
  // filter. Bind-pose bounds are deliberately never used for animated actors.
  if(culling&&framePlanes160&&!boxInPlanes164(framePlanes160,lo,hi))return false;
  return !hiddenBox(lo,hi);
 }
 function worldBounds150(b,m){
  if(!m)return b.localBounds106;
  let cached=b.worldBounds106;
  let stale=!cached;if(cached){const c=cached.matrix;for(let i=0;i<c.length;i++)if(c[i]!==m[i]){stale=true;break;}}
  if(stale){
   const {lo,hi}=b.localBounds106,a=[Infinity,Infinity,Infinity],z=[-Infinity,-Infinity,-Infinity];
   for(const x of[lo[0],hi[0]])for(const y of[lo[1],hi[1]])for(const zz of[lo[2],hi[2]]){const p=tp(m,x,y,zz);for(let k=0;k<3;k++){a[k]=Math.min(a[k],p[k]);z[k]=Math.max(z[k],p[k]);}}
   cached=b.worldBounds106={matrix:Array.from(m),lo:a,hi:z};
  }return cached;
 }
 return {prepareVenue,buildingGeometry,building,buildingSkin,surface,curbGeometry,spatialKey,bounds,visible,collectOccluders,finishOccluders,actorVisible,hiddenBox,drawVisible,trafficState,sunDirection,bindAtmosphere,resolveDoors,trafficSeconds:()=>trafficTime??(window.frameNow164?.()??performance.now())/1000,setTrafficTime(seconds){trafficTime=Number.isFinite(seconds)?seconds:null;trafficPhase=-1;},beginFrame(planes=null){framePlanes160=planes;drawingVenue=!window.FarmScene63?.active;bindAtmosphere();if(drawingVenue)updateTraffic(trafficTime??(window.frameNow164?.()??performance.now())/1000);},endFrame(){drawingVenue=false;framePlanes160=null;},setOcclusion(enabled){occlusion=!!enabled;},get batches(){return extraBatches;},get culling(){return culling;},snapshot:()=>({ready,error,occluders:occluders.length,trafficPhase,doors:[...swingDoors.values()].map(d=>({id:d.id,angle:d.angle})),...stats})};
})();
