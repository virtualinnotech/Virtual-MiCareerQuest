/* DEV21: exact geometry indexing, redundant GL-state suppression and local profiling.
 * No resolution, antialiasing, population, texture, material, shader-lighting,
 * navigation, accessory or animation-detail downgrade. Nothing is sent online.
 */
const Performance21 = (() => {
 'use strict';
 const meter={stage:'startup',phase:'other',active:false,frames:[],draws:0,triangles:0,
  submitted:0,suppressed:0,last:null,pending:{},costs:{},panelAt:0,gpu:null,
  debugDirty:true,debugOwned:[],native:null,stateCaching:true,contextLost:false};
 const clock=()=>performance.now();
 const sum=a=>a.reduce((x,y)=>x+y,0);
 function indexPart(p){
  const pos=p.pos,nor=p.nor,uv=p.uv,ids=p.idx,n=pos.length/3;
  const before=pos.byteLength+nor.byteLength+uv.byteLength+ids.byteLength;
  if(n<24)return {...p,indexing21:{before,after:before,originalVertices:n,indexedVertices:n}};
  const pb=new Uint32Array(pos.buffer,pos.byteOffset,pos.length),nb=new Uint32Array(nor.buffer,nor.byteOffset,nor.length),ub=new Uint32Array(uv.buffer,uv.byteOffset,uv.length);
  let cap=1;while(cap<n*1.6)cap*=2;
  const slots=new Uint32Array(cap),remap=new Uint32Array(n),first=new Uint32Array(n),mask=cap-1;let count=0;
  const equal=(a,b)=>pb[a*3]===pb[b*3]&&pb[a*3+1]===pb[b*3+1]&&pb[a*3+2]===pb[b*3+2]&&nb[a*3]===nb[b*3]&&nb[a*3+1]===nb[b*3+1]&&nb[a*3+2]===nb[b*3+2]&&ub[a*2]===ub[b*2]&&ub[a*2+1]===ub[b*2+1];
  for(let i=0;i<n;i++){
   let h=2166136261;
   for(let k=0;k<3;k++)h=Math.imul(h^pb[i*3+k],16777619);
   for(let k=0;k<3;k++)h=Math.imul(h^nb[i*3+k],16777619);
   for(let k=0;k<2;k++)h=Math.imul(h^ub[i*2+k],16777619);
   h^=h>>>16;let slot=h&mask;
   while(slots[slot]&&!equal(i,slots[slot]-1))slot=(slot+1)&mask;
   if(!slots[slot]){slots[slot]=i+1;first[count]=i;remap[i]=count++;}else remap[i]=remap[slots[slot]-1];
  }
  if(count>=n*.985)return {...p,indexing21:{before,after:before,originalVertices:n,indexedVertices:n}};
  const outP=new Float32Array(count*3),outN=new Float32Array(count*3),outUV=new Float32Array(count*2),outI=new Uint32Array(ids.length);
  for(let i=0;i<count;i++){const src=first[i];outP.set(pos.subarray(src*3,src*3+3),i*3);outN.set(nor.subarray(src*3,src*3+3),i*3);outUV.set(uv.subarray(src*2,src*2+2),i*2);}
  for(let i=0;i<ids.length;i++)outI[i]=remap[ids[i]];
  const after=outP.byteLength+outN.byteLength+outUV.byteLength+outI.byteLength;
  return {...p,pos:outP,nor:outN,uv:outUV,idx:outI,indexing21:{before,after,originalVertices:n,indexedVertices:count}};
 }
 function groupShipmentParts(r){
  const signatures=new Map(),groups=new Map();
  for(const p of r.parts){const m=r.j.materials?.[p.mat]||{},b=m.pbrMetallicRoughness||{};
   // Use every property consumed by prepareShipmentGPU; names are not render state.
   const key=JSON.stringify([b.baseColorFactor||[1,1,1,1],b.metallicFactor??0,b.roughnessFactor??.75,m.emissiveFactor||[0,0,0],!!m.extensions?.KHR_materials_unlit,b.baseColorTexture?.index??-1,m.normalTexture?.index??-1,m.normalTexture?.scale??.5,m.alphaMode==='BLEND']);
   let id=signatures.get(key);if(id===undefined){id=p.mat;signatures.set(key,id);groups.set(id,[]);}groups.get(id).push(p);
  }return groups;
 }
 function boundsOfParts(parts){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const p of parts)for(let i=0;i<p.pos.length;i+=3)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p.pos[i+k]);hi[k]=Math.max(hi[k],p.pos[i+k]);}return {lo,hi};}
 function placeBatch(b,m,fallbackCenter,fallbackRadius){
  b.modelMatrix=new Float32Array(m);const a=b.localBounds21;if(!a){b.center=fallbackCenter;b.cullRadius=fallbackRadius;return;}
  const center=a.lo.map((x,k)=>(x+a.hi[k])*.5);b.center=tp(m,...center);
  const hx=(a.hi[0]-a.lo[0])*.5,hy=(a.hi[1]-a.lo[1])*.5,hz=(a.hi[2]-a.lo[2])*.5;
  let radius=0;for(const x of [-hx,hx])for(const y of [-hy,hy])for(const z of [-hz,hz])radius=Math.max(radius,Math.hypot(m[0]*x+m[4]*y+m[8]*z,m[1]*x+m[5]*y+m[9]*z,m[2]*x+m[6]*y+m[10]*z));
  b.cullRadius=radius+.01;
 }
 function cacheGL(native){
  meter.native=native;const funcs=new Map(),u=new Map(),textures=new Map(),caps=new Map();let program=Symbol(),vao=Symbol(),active=Symbol(),depth=Symbol();
  const clear=()=>{u.clear();textures.clear();caps.clear();program=Symbol();vao=Symbol();active=Symbol();depth=Symbol();};meter.clearState=clear;
  function submit(fn,args){if(meter.active)meter.submitted++;return fn.apply(native,args);}
  function skip(){if(meter.active)meter.suppressed++;}
  return new Proxy(native,{get(target,key){
   const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;if(funcs.has(key))return funcs.get(key);
   let fn;
   if(/^uniform(?:[1-4][fi]|[1-4][fi]v|Matrix[234]fv)$/.test(key)){
    fn=function(...a){if(a[0]===null){skip();return;}if(!meter.stateCaching)return submit(value,a);
     const matrix=key.startsWith('uniformMatrix'),array=key.endsWith('v'),values=array?a[matrix?2:1]:a.slice(1),offset=array?(a[matrix?3:2]||0):0,length=array?(a[matrix?4:3]||values.length-offset):values.length;
     let rec=u.get(a[0]),same=!!rec&&rec.key===key&&rec.program===program&&rec.length===length&&rec.transpose===(matrix?!!a[1]:false);
     if(same)for(let i=0;i<length;i++)if(rec.values[i]!==Number(values[offset+i])){same=false;break;}
     if(same){skip();return;}
     if(!rec||rec.length!==length)rec={values:new Float64Array(length)};
     rec.key=key;rec.program=program;rec.length=length;rec.transpose=matrix?!!a[1]:false;for(let i=0;i<length;i++)rec.values[i]=values[offset+i];u.set(a[0],rec);return submit(value,a);
    };
   }else if(key==='useProgram')fn=function(p){if(meter.stateCaching&&program===p){skip();return;}program=p;return submit(value,[p]);};
   else if(key==='activeTexture')fn=function(t){if(meter.stateCaching&&active===t){skip();return;}active=t;return submit(value,[t]);};
   else if(key==='bindTexture')fn=function(t,obj){const k=String(active)+':'+t;if(meter.stateCaching&&textures.has(k)&&textures.get(k)===obj){skip();return;}textures.set(k,obj);return submit(value,[t,obj]);};
   else if(key==='bindVertexArray')fn=function(obj){if(meter.stateCaching&&vao===obj){skip();return;}vao=obj;return submit(value,[obj]);};
   else if(key==='depthMask')fn=function(v){if(meter.stateCaching&&depth===v){skip();return;}depth=v;return submit(value,[v]);};
   else if(key==='enable'||key==='disable')fn=function(c){const v=key==='enable';if(meter.stateCaching&&caps.has(c)&&caps.get(c)===v){skip();return;}caps.set(c,v);return submit(value,[c]);};
   else if(key==='drawElements'||key==='drawArrays'||key==='drawElementsInstanced'||key==='drawArraysInstanced')fn=function(...a){
    if(meter.active){const n=key.includes('Elements')?a[1]:a[2],instances=key.endsWith('Instanced')?a[key.includes('Elements')?4:3]:1;meter.draws++;if(a[0]===native.TRIANGLES)meter.triangles+=n/3*instances;const g=meter.groups[meter.phase]||(meter.groups[meter.phase]={calls:0,triangles:0});g.calls++;if(a[0]===native.TRIANGLES)g.triangles+=n/3*instances;}
    return value.apply(native,a);
   };
   else if(key==='deleteTexture'||key==='deleteProgram'||key==='deleteVertexArray'||key==='linkProgram')fn=function(...a){clear();return value.apply(native,a);};
   else fn=value.bind(native);
   funcs.set(key,fn);return fn;
  }});
 }
 function invalidateDebug(){meter.debugDirty=true;if(meter.debugOwned.length){for(const b of meter.debugOwned)freeBatch(b);meter.debugOwned=[];}}
 function ensureDebug(){if(!meter.debugDirty)return;invalidateDebug();const groups=new Map();for(const o of colliders){const verts=new Float32Array(o.triangles.length*18),ids=new Uint32Array(o.triangles.length*3);let at=0,i=0;for(const t of o.triangles)for(const p of [t.a,t.b,t.c]){verts.set([...p,...t.normal],at);at+=6;ids[i]=i;i++;}batchAdd(groups,o.boundary?'boundary':'structure',verts,ids,{boundary:o.boundary,unlit:true});}meter.debugOwned=finishBatches(groups);debugBatches=meter.debugOwned;meter.debugDirty=false;}
 function timed(name,fn,that,args){const t=clock(),previous=meter.phase;meter.phase=name;try{return fn.apply(that,args);}finally{const dest=meter.active?meter.costs:meter.pending;dest[name]=(dest[name]||0)+(clock()-t);meter.phase=previous;}}
 function decorate(obj,key,name){const old=obj?.[key];if(typeof old==='function')obj[key]=function(...args){return timed(name,old,this,args);};}
 function beforeFrame(){meter.active=true;meter.draws=0;meter.triangles=0;meter.submitted=0;meter.suppressed=0;meter.groups={};meter.costs={};meter.phase='venue';meter.start=clock();}
 function afterFrame(){const end=clock();meter.active=false;const f={at:end,interval:meter.frameAt?end-meter.frameAt:null,renderCPU:end-meter.start,draws:meter.draws,triangles:meter.triangles,stateCalls:meter.submitted,redundantCallsAvoided:meter.suppressed,groups:meter.groups,ms:{...meter.pending,...meter.costs}};meter.pending={};meter.frameAt=end;meter.last=f;meter.frames.push(f);if(meter.frames.length>180)meter.frames.shift();if(end-meter.panelAt>700){meter.panelAt=end;refreshPanel();}}
 function geometryStats(){let before=0,after=0,oldVertices=0,newVertices=0,batches=0,originalMaterials=0;for(const r of shippedBooths.values()){batches+=r.batches.length;originalMaterials+=new Set(r.parts.map(p=>p.mat)).size;for(const p of r.parts){const i=p.indexing21;if(i){before+=i.before;after+=i.after;oldVertices+=i.originalVertices;newVertices+=i.indexedVertices;}}}return {loadedBooths:shippedBooths.size,geometryAttributeBytesBefore:before,geometryAttributeBytesAfter:after,originalVertices:oldVertices,indexedVertices:newVertices,materialsBefore:originalMaterials,drawBatchesAfter:batches,note:'Attribute/index-buffer estimates only; excludes textures, driver allocations, source GLBs and collision objects.'};}
 function report(){
  let gpu=null;try{if(gl&&!gl.isContextLost()){const e=gl.getExtension('WEBGL_debug_renderer_info');gpu={renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:e?gl.getParameter(e.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),context:gl.getContextAttributes(),drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE)};}}catch(e){gpu={error:e.message};}
  const rows=meter.frames.slice(-120),avg=k=>rows.length?sum(rows.map(f=>f[k]||0))/rows.length:0;
  return {format:'micareerquest-performance-report',version:21,time:new Date().toISOString(),browser:navigator.userAgent,gpu,summary:{fpsDisplayed:state.fps,averageFrameIntervalMs:avg('interval'),averageRenderSubmissionMs:avg('renderCPU'),averageDrawCalls:avg('draws'),averageTrianglesSubmitted:avg('triangles'),averageRedundantStateCallsAvoided:avg('redundantCallsAvoided'),stateCacheEnabled:meter.stateCaching},geometry:geometryStats(),settings:{quality:state.quality,sunShadows:state.sunShadows,roofs:roofsVisible(),debug:state.debug,firstPerson:state.firstPerson},player:{position:[...player.position],camera:[...camera]},booths:[...shippedBooths.values()].map(r=>({industry:r.industry,triangles:r.triangles,batches:r.batches.length})),crowd:window.Crowd?.snapshot(),robots:window.RobotExhibit20?.snapshot(),frames:rows,notes:['JavaScript timings are CPU/submission time, NOT GPU duration.','No company contact information, logos or source files are included. Nothing is uploaded automatically.','Current settings and view matter. Compare the same place and population after loading completes.']};
 }
 function refreshPanel(){const box=$('perfSummary21');if(!box||!meter.last)return;const f=meter.last;box.textContent=Math.round(state.fps||0)+' FPS / '+f.draws.toLocaleString()+' draw calls / '+(f.triangles/1e6).toFixed(2)+'M submitted triangles';$('perfDetail21').textContent='Booths: '+shippedBooths.size+'; crowd: '+(crowdState.sim?.agents.length||0)+'; booth representatives: '+crowdState.staff.length+'. Frame submission: '+f.renderCPU.toFixed(1)+' ms; redundant graphics-state calls avoided: '+f.redundantCallsAvoided.toLocaleString()+'.';}
 function installUI(){if($('perfPanel21'))return;const p=document.createElement('details');p.id='perfPanel21';p.className='panel';p.style.marginBottom='8px';p.innerHTML='<summary>Performance / DEV 21</summary><p id="perfSummary21" class="ship-hint">Waiting for frames...</p><p id="perfDetail21" class="ship-foot"></p><div class="buttonRow"><button id="perfSave21">Save performance report</button><button id="perfReset21">Reset measurements</button></div><label class="setting">Skip redundant graphics-state calls<input type="checkbox" id="perfCache21" checked></label><p class="ship-foot">Same models, lighting, textures and graphics settings. This switch compares only the state-call optimization, not the indexed geometry. Measurements are local. Let loading finish before comparing.</p>';$('rightTools').prepend(p);$('perfSave21').onclick=()=>downloadJSON18(report(),'MiCareerQuest-performance-DEV21.json');$('perfReset21').onclick=()=>{meter.frames=[];meter.frameAt=0;refreshPanel();};$('perfCache21').onchange=e=>{meter.stateCaching=e.target.checked;meter.clearState?.();meter.frames=[];};}
 function install(){
  decorate(window.Crowd,'update','crowd-update');decorate(window.Crowd,'draw','crowd-render');decorate(window.RobotExhibit20,'update','robot-update');decorate(window.RobotExhibit20,'draw','robot-render');decorate(window.AnimatedCharacters,'update','player-animation');decorate(window.AnimatedCharacters,'draw','player-render');
  const oldPhysics=advancePlayer;advancePlayer=function(...args){return timed('physics',oldPhysics,this,args);};const oldCamera=updateCamera;updateCamera=function(...args){return timed('camera',oldCamera,this,args);};
  const oldShadow=updateSunShadows;updateSunShadows=function(...args){return timed('shadow',oldShadow,this,args);};
  const oldRender=render;render=function(...args){if(!state.ready)return oldRender.apply(this,args);beforeFrame();try{return oldRender.apply(this,args);}finally{afterFrame();}};
  const previous=window.MCQSupport18?.report;if(window.MCQSupport18)window.MCQSupport18.report=()=>({...previous(),performance:report()});
 }
 return {indexPart,groupShipmentParts,boundsOfParts,placeBatch,cacheGL,invalidateDebug,ensureDebug,install,installUI,report,geometryStats,meter};
})();
window.MCQPerformance21=Performance21;
Performance21.install();
