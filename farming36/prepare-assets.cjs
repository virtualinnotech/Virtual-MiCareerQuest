// Convert the supplied offline Three.js scenes into compact venue-compatible GLBs.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
async function exportScene(page,input,kind){
 await page.goto('file://'+input);
 let html=await page.locator('iframe').getAttribute('data-srcdoc');
 if(!html)html=await page.locator('iframe').getAttribute('srcdoc');
 html=html.replace('window.__combineDebug={machine,reel,wheels,renderer,','window.__combineDebug={machine,reel,auger,wheels,renderer,');
 if(kind==='combine'){
  html=html.replace('// Unloading tube stowed along the left side; swept elbows and outlet boot.','const unloadingStart=machine.children.length;');
  html=html.replace('// Tires: rounded carcass, raised opposing chevron lugs, inset rims and hub bolts.',`const unloadingParts=machine.children.slice(unloadingStart),unloadingPipe=new T.Group();
   unloadingPipe.position.set(1.15,3.83,-.2);machine.add(unloadingPipe);machine.updateMatrixWorld(true);
   for(const part of unloadingParts)unloadingPipe.attach(part);
   window.__unloadingPipe=unloadingPipe;`);
 }
 html=html.replace('window.__hayDebug={machine,baler,gate,','window.__hayDebug={machine,baler,gate,pickup,wheels,chamberBale,');
 await page.goto('about:blank');
 await page.evaluate(()=>window.requestAnimationFrame=()=>0);
 await page.setContent(html,{waitUntil:'load'});
 const data=await page.evaluate(kind=>{
  const T=window.THREE,d=kind==='combine'?window.__combineDebug:window.__hayDebug;
  if(!d)throw Error('Source model failed to initialize');
  // Slide the adjustable cab seat forward so the venue-sized driver can reach the wheel.
  const seatParts=kind==='combine'?[[.23,2.81,-1.51],[.23,3.18,-1.28],[-.17,2.98,-1.51],[.63,2.98,-1.51]]:[[.03,1.74,.95],[.03,2.04,1.17],[-.37,1.96,.93],[.37,1.96,.93]];
  for(const position of seatParts){
   const part=d.machine.children.find(o=>o.isMesh&&o.position.distanceTo(new T.Vector3(...position))<.0001);
   if(!part)throw Error('Cab seat component missing');part.position.z-=.35;
  }
  const roots=kind==='combine'?[d.machine]:[d.machine,d.baler,d.chamberBale];
  const all=[];
  for(let ri=0;ri<roots.length;ri++){
   const root=roots[ri];root.position.set(0,0,0);root.rotation.set(0,0,0);root.updateMatrixWorld(true);
   const groups=[{object:root,name:['Body','Baler','Bale'][ri],extras:{}}];
   if(ri<2)for(const [i,w] of d.wheels.entries()){
    if(w.swivel.parent!==root)continue;
    w.w.rotation.set(0,0,0);w.swivel.rotation.set(0,0,0);
    groups.push({object:w.w,name:'Wheel_'+i,extras:{radius:w.r,steer:!!(w.steerable||w.front),rear:kind==='combine'}});
   }
   for(const [name,obj] of Object.entries({UnloadingPipe:kind==='combine'?window.__unloadingPipe:null,Reel:d.reel,Auger:d.auger,Pickup:ri===1?d.pickup:null,Gate:ri===1?d.gate:null})){
    if(obj&&((ri===0&&kind==='combine')||ri===1))groups.push({object:obj,name,extras:{}});
   }
   root.updateMatrixWorld(true);
   const groupMap=new Map(groups.map(g=>[g.object,g])),buckets=new Map();
   root.traverse(o=>{
    if(!o.isMesh||ri===1&&d.chamberBale&&(o===d.chamberBale||(()=>{let p=o;while(p){if(p===d.chamberBale)return true;p=p.parent;}return false;})()))return;
    let parent=o;while(parent&&!groupMap.has(parent))parent=parent.parent;
    const group=groupMap.get(parent),g=o.geometry;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    const ranges=Array.isArray(o.material)?g.groups:[{start:0,count:g.index?.count||g.attributes.position.count,materialIndex:0}];
    for(const range of ranges){
     const mat=mats[range.materialIndex],key=group.name+':'+mat.uuid;
     if(!buckets.has(key))buckets.set(key,{group:group.name,positions:[],normals:[],uv:[],indices:[],material:{color:[mat.color.r,mat.color.g,mat.color.b,mat.opacity],roughness:mat.roughness??1,metalness:mat.metalness??0,texture:mat.map?.image?.toDataURL?.()||null}});
     const b=buckets.get(key);
     for(let instance=0;instance<(o.isInstancedMesh?o.count:1);instance++){
      const matrix=new T.Matrix4().copy(group.object.matrixWorld).invert().multiply(o.matrixWorld);
      if(o.isInstancedMesh){const im=new T.Matrix4();o.getMatrixAt(instance,im);matrix.multiply(im);}
      const normalMatrix=new T.Matrix3().getNormalMatrix(matrix),base=b.positions.length/3;
      for(let i=0;i<g.attributes.position.count;i++){
       b.positions.push(...new T.Vector3().fromBufferAttribute(g.attributes.position,i).applyMatrix4(matrix).toArray());
       b.normals.push(...new T.Vector3().fromBufferAttribute(g.attributes.normal,i).applyMatrix3(normalMatrix).normalize().toArray());
       b.uv.push(g.attributes.uv?.getX(i)||0,g.attributes.uv?.getY(i)||0);
      }
      for(let i=range.start;i<range.start+range.count;i++)b.indices.push(base+(g.index?g.index.getX(i):i));
     }
    }
   });
   all.push({groups:groups.map(g=>({name:g.name,matrix:g.object.matrixWorld.toArray(),extras:g.extras})),buckets:[...buckets.values()]});
  }
  return all;
 },kind);
 for(let ri=0;ri<data.length;ri++)writeGLB(data[ri],path.join(__dirname,kind==='combine'?'combine.glb':['tractor.glb','baler.glb','bale.glb'][ri]));
}
function writeGLB(data,file){
 const j={asset:{version:'2.0',generator:'MCQ source scene converter'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],buffers:[{byteLength:0}],bufferViews:[],accessors:[],images:[],textures:[],samplers:[{magFilter:9729,minFilter:9729,wrapS:33071,wrapT:33071}]},chunks=[];
 let offset=0;
 function bytes(buffer){const index=j.bufferViews.length;j.bufferViews.push({buffer:0,byteOffset:offset,byteLength:buffer.length});chunks.push(buffer);offset+=buffer.length;const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}return index;}
 function accessor(values,size,index=false){const a=index?new Uint32Array(values):new Float32Array(values),id=j.accessors.length,obj={bufferView:bytes(Buffer.from(a.buffer)),componentType:index?5125:5126,count:values.length/size,type:{1:'SCALAR',2:'VEC2',3:'VEC3'}[size]};
  if(size===3){obj.min=[Infinity,Infinity,Infinity];obj.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<values.length;i++){obj.min[i%3]=Math.min(obj.min[i%3],values[i]);obj.max[i%3]=Math.max(obj.max[i%3],values[i]);}}
  j.accessors.push(obj);return id;
 }
 for(const g of data.groups){
  const primitives=[];
  for(const b of data.buckets.filter(b=>b.group===g.name)){
   const m=b.material,pbr={baseColorFactor:m.color,roughnessFactor:m.roughness,metallicFactor:m.metalness};
   if(m.texture){const image=j.images.length;j.images.push({bufferView:bytes(Buffer.from(m.texture.split(',')[1],'base64')),mimeType:'image/png'});pbr.baseColorTexture={index:j.textures.length};j.textures.push({source:image,sampler:0});}
   const material=j.materials.length;j.materials.push({pbrMetallicRoughness:pbr,doubleSided:true,alphaMode:m.color[3]<1?'BLEND':m.texture?'MASK':'OPAQUE',alphaCutoff:.2});
   primitives.push({attributes:{POSITION:accessor(b.positions,3),NORMAL:accessor(b.normals,3),TEXCOORD_0:accessor(b.uv,2)},indices:accessor(b.indices,1,true),material});
  }
  if(!primitives.length)continue;
  j.scenes[0].nodes.push(j.nodes.length);j.nodes.push({name:g.name,matrix:g.matrix,extras:g.extras,mesh:j.meshes.length});j.meshes.push({primitives});
 }
 j.buffers[0].byteLength=offset;let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const bin=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(bin.length,0);bh.writeUInt32LE(0x004e4942,4);
 fs.writeFileSync(file,Buffer.concat([header,json,bh,bin]));console.log(path.basename(file),j.nodes.length,'animated groups',bin.length,'bytes');
}
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{const page=await browser.newPage();for(const kind of ['combine','tractor'])await exportScene(page,path.resolve(__dirname,'../../work/farming',kind==='combine'?'combine-3d/index.html':'tractor-baler/index.html'),kind);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
