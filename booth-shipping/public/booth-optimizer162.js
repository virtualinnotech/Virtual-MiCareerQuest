/* Student download optimizer for shipped booths. Runs in the admin's browser
   (admin.html, "Optimize booths for students"); the server half is
   functions/api/admin/optimized-booth.js and library.js.

   Every booth export embeds the booth builder's material maps (plaster,
   carpet, wood...), the same files in every booth, plus the employer's
   logo and photos at upload size. For each shipped booth this:
   - stores a texture used by two or more booths once, in booths/library/,
     and points the booth at it, so a student downloads it once;
   - saves logos and photos at the size the game draws them (512 px, 1024 px
     for wide signs; the venue scales anything larger down to this anyway);
   - gzips the result (booth geometry compresses ~6x).
   Every image is saved losslessly (PNG, or WebP only after checking it
   decodes to exactly the same pixels), so the game draws exactly the pixels
   it drew from the original. Lossy WebP was measured and rejected: it
   visibly softened colored logo text. The employer's original upload is
   never modified. */
window.BoothOptimizer162=(()=>{
 const GLB=0x46546c67,JSON_CHUNK=0x4e4f534a,BIN_CHUNK=0x004e4942;
 const CONCURRENCY=2;
 const KNOWN_REQUIRED=new Set(['KHR_materials_unlit','EXT_texture_webp']);
 const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
 const sha256=async bytes=>hex(await crypto.subtle.digest('SHA-256',bytes));
 const EXT={'image/webp':'webp','image/png':'png','image/jpeg':'jpg'};

 function parseGLB(buffer){
  const dv=new DataView(buffer);
  if(buffer.byteLength<20||dv.getUint32(0,true)!==GLB||dv.getUint32(4,true)!==2)throw Error('not a GLB 2.0 file');
  let json,bin=new Uint8Array(0);
  for(let p=12;p+8<=buffer.byteLength;){const len=dv.getUint32(p,true),type=dv.getUint32(p+4,true);p+=8;
   if(type===JSON_CHUNK)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,p,len)));
   else if(type===BIN_CHUNK)bin=new Uint8Array(buffer,p,len);
   p+=len;}
  if(!json)throw Error('GLB has no JSON chunk');
  return {json,bin};
 }
 function buildGLB(json,bin){
  const text=new TextEncoder().encode(JSON.stringify(json)),jl=(text.length+3)&~3,bl=(bin.length+3)&~3;
  const total=20+jl+(bl?8+bl:0),out=new Uint8Array(total),dv=new DataView(out.buffer);
  dv.setUint32(0,GLB,true);dv.setUint32(4,2,true);dv.setUint32(8,total,true);
  dv.setUint32(12,jl,true);dv.setUint32(16,JSON_CHUNK,true);out.set(text,20);out.fill(0x20,20+text.length,20+jl);
  if(bl){dv.setUint32(20+jl,bl,true);dv.setUint32(24+jl,BIN_CHUNK,true);out.set(bin,28+jl);}
  return out;
 }
 const gzip=bytes=>new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
 function decode(bytes,type){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(new Blob([bytes],{type}));const img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('an image could not be decoded'));};img.src=url;});}
 // Resolves to null when the browser cannot write that format (Safari quietly
 // writes PNG when asked for WebP).
 const encode=(canvas,type,quality)=>new Promise((resolve,reject)=>canvas.toBlob(b=>!b?reject(Error('image encoding failed')):b.type!==type?resolve(null):b.arrayBuffer().then(a=>resolve({bytes:new Uint8Array(a),mime:type}),reject),type,quality));
 const smallest=(...list)=>list.filter(Boolean).reduce((a,b)=>b.bytes.length<a.bytes.length?b:a);

 // Chrome writes lossless WebP at quality 1. Trust it only after decoding it
 // back to exactly the canvas's pixels; otherwise use PNG.
 async function samePixels(out,canvas){
  const img=await decode(out.bytes,out.mime);if(img.naturalWidth!==canvas.width||img.naturalHeight!==canvas.height)return false;
  const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
  const a=g.getImageData(0,0,c.width,c.height).data,b=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height).data;
  for(let i=0;i<a.length;i+=4)if(a[i+3]!==b[i+3]||a[i+3]&&(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]))return false;
  return true;
 }
 async function lossless(canvas){
  const png=await encode(canvas,'image/png'),webp=await encode(canvas,'image/webp',1);
  return webp&&webp.bytes.length<png.bytes.length&&await samePixels(webp,canvas)?webp:png;
 }
 // Same size rule as embeddedGLBTexture(...,512) in venue-frame.html.
 const capFor=(w,h)=>w/h>=3?1024:512;
 async function processImage(bytes,mime){
  const keep={bytes,mime};
  const img=await decode(bytes,mime),w=img.naturalWidth,h=img.naturalHeight,cap=capFor(w,h),ratio=Math.min(1,cap/Math.max(w,h));
  const canvas=document.createElement('canvas');
  if(ratio<1){
   // Exactly the canvas the venue would draw this image into.
   canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));
   // Never let rounding move an image across the game's wide-sign rule.
   if(capFor(canvas.width,canvas.height)!==cap)return keep;
  }else{
   // Drawn at full size: only an opaque PNG can be re-saved without any change.
   if(mime!=='image/png')return keep;
   canvas.width=w;canvas.height=h;
  }
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);
  if(ratio===1){const alpha=ctx.getImageData(0,0,w,h).data;for(let i=3;i<alpha.length;i+=4)if(alpha[i]!==255)return keep;}
  return smallest(keep,await lossless(canvas));
 }

 // Which images the game draws, and how (venue-frame.html prepareShipmentGPU
 // uses baseColorTexture and normalTexture only). Anything else is left as is.
 function imageUses(j){
  const uses=(j.images||[]).map(()=>({base:false,normal:false,other:false}));
  const mark=(ref,kind)=>{if(ref?.index==null)return;const t=j.textures?.[ref.index];const i=t?.source??t?.extensions?.EXT_texture_webp?.source;if(uses[i])uses[i][kind]=true;};
  for(const m of j.materials||[]){const p=m.pbrMetallicRoughness||{};mark(p.baseColorTexture,'base');mark(m.normalTexture,'normal');mark(p.metallicRoughnessTexture,'other');mark(m.occlusionTexture,'other');mark(m.emissiveTexture,'other');}
  return uses;
 }
 const viewBytes=(j,bin,i)=>{const v=j.bufferViews[i];return bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);};

 // SHA-256 of each image this booth would optimize (null: left as is).
 async function imageKeys(j,bin){
  const uses=imageUses(j),keys=[];
  for(let i=0;i<(j.images||[]).length;i++){const im=j.images[i],u=uses[i];
   if(im.bufferView==null||u.other||!(u.base||u.normal)){keys.push(null);continue;}
   keys.push(await sha256(viewBytes(j,bin,im.bufferView)));}
  return keys;
 }

 async function optimizeBooth(buffer,keys,ctx){
  const {json:j,bin}=parseGLB(buffer);
  const unknown=(j.extensionsRequired||[]).filter(e=>!KNOWN_REQUIRED.has(e));
  if(unknown.length)throw Error('uses '+unknown.join(', '));
  if((j.buffers||[]).length>1||j.buffers?.[0]?.uri)throw Error('has external buffers');
  const imageViews=new Set((j.images||[]).map(im=>im.bufferView).filter(v=>v!=null));
  const views=[],remap=new Map(),chunks=[];let size=0;
  const place=bytes=>{const offset=size;chunks.push({offset,bytes});size=(offset+bytes.length+3)&~3;return offset;};
  (j.bufferViews||[]).forEach((v,i)=>{if(imageViews.has(i))return;const bytes=viewBytes(j,bin,i);remap.set(i,views.length);views.push({...v,buffer:0,byteOffset:place(bytes)});});
  const embedded=new Map(),usedKeys=new Set(),libraryKeys=new Set();
  for(let i=0;i<(j.images||[]).length;i++){const im=j.images[i],key=keys[i];
   let out={bytes:im.bufferView==null?null:viewBytes(j,bin,im.bufferView),mime:im.mimeType};
   if(key){out=await ctx.processed(key,()=>processImage(out.bytes,im.mimeType));usedKeys.add(key);}
   if(!out.bytes){remap.set(im.bufferView,null);continue;}
   if(key&&ctx.shared(key)){const name=await ctx.library(key,out);delete im.bufferView;im.uri='../library/'+name;libraryKeys.add(key);}
   else{const dedupe=key||('i'+i);if(!embedded.has(dedupe)){embedded.set(dedupe,views.length);views.push({buffer:0,byteOffset:place(out.bytes),byteLength:out.bytes.length});}im.bufferView=embedded.get(dedupe);}
   im.mimeType=out.mime;
  }
  for(const a of j.accessors||[]){if(a.bufferView!=null)a.bufferView=remap.get(a.bufferView);if(a.sparse){a.sparse.indices.bufferView=remap.get(a.sparse.indices.bufferView);a.sparse.values.bufferView=remap.get(a.sparse.values.bufferView);}}
  // WebP images are only valid glTF through EXT_texture_webp; the venue reads both forms.
  let webp=false;
  for(const t of j.textures||[]){const i=t.source??t.extensions?.EXT_texture_webp?.source;if(i==null)continue;
   if(j.images[i].mimeType==='image/webp'){webp=true;delete t.source;t.extensions={...t.extensions,EXT_texture_webp:{source:i}};}
   else if(t.extensions?.EXT_texture_webp){t.source=i;delete t.extensions.EXT_texture_webp;}}
  const strip=list=>(list||[]).filter(e=>e!=='EXT_texture_webp');
  j.extensionsUsed=strip(j.extensionsUsed);j.extensionsRequired=strip(j.extensionsRequired);
  if(webp){j.extensionsUsed.push('EXT_texture_webp');j.extensionsRequired.push('EXT_texture_webp');}
  for(const k of ['extensionsUsed','extensionsRequired'])if(!j[k].length)delete j[k];
  j.bufferViews=views;
  const out=new Uint8Array(size);for(const c of chunks)out.set(c.bytes,c.offset);
  j.buffers=[{byteLength:size}];
  const glb=buildGLB(j,out);
  parseGLB(glb.buffer);// sanity check before anything is uploaded
  return {gz:new Uint8Array(await gzip(glb)),embeddedKeys:[...usedKeys].filter(k=>!libraryKeys.has(k))};
 }

 // booths: [{sector,slot_number}] (status 'shipped'). Returns a summary.
 async function run({booths,adminKey,onProgress=()=>{}}){
  const call=async(path,opts={})=>{const res=await fetch(path,{...opts,headers:{...(opts.headers||{}),'x-admin-key':adminKey}});
   if(!res.ok){const body=await res.json().catch(()=>({}));throw Error(body.error||('Request failed ('+res.status+').'));}return res;};
  const slug=v=>String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const onServer=new Set((await (await call('/api/admin/library')).json()).names);
  const counts=new Map(),processed=new Map(),library=new Map();
  const stats={booths:booths.length,optimized:0,failed:[],originalBytes:0,optimizedBytes:0,libraryFiles:0,libraryBytes:0};
  const ctx={
   shared:key=>(counts.get(key)||0)>=2,
   processed(key,make){if(!processed.has(key))processed.set(key,make());return processed.get(key);},
   library(key,out){if(!library.has(key))library.set(key,(async()=>{
    const name=(await sha256(out.bytes))+'.'+EXT[out.mime];
    if(!onServer.has(name)){await call('/api/admin/library?name='+name,{method:'POST',headers:{'content-type':out.mime},body:out.bytes});onServer.add(name);}
    stats.libraryFiles++;stats.libraryBytes+=out.bytes.length;return name;})());
    return library.get(key);},
  };
  const download=async b=>(await call('/api/admin/booth-file?key='+encodeURIComponent(`booths/${slug(b.sector)}/${b.slot_number}.glb`))).arrayBuffer();
  const result=new Map();let done=0;
  async function one(b,phase){
   const label=b.sector+' #'+b.slot_number;
   try{
    const buffer=await download(b),{json:j,bin}=parseGLB(buffer),keys=await imageKeys(j,bin);
    if(phase===1){for(const k of new Set(keys.filter(Boolean)))counts.set(k,(counts.get(k)||0)+1);stats.originalBytes+=buffer.byteLength;}
    const {gz,embeddedKeys}=await optimizeBooth(buffer,keys,ctx);
    const form=new FormData();form.append('sector',b.sector);form.append('slotNumber',String(b.slot_number));form.append('file',new Blob([gz],{type:'application/gzip'}),'booth.glb.gz');
    await call('/api/admin/optimized-booth',{method:'POST',body:form});
    const previous=result.get(b);if(previous)stats.optimizedBytes-=previous.bytes;else stats.optimized++;
    stats.optimizedBytes+=gz.length;result.set(b,{bytes:gz.length,embeddedKeys});
   }catch(e){if(phase===1)stats.failed.push(label+': '+e.message);}
   finally{if(phase===1)onProgress({done:++done,total:booths.length,label});}
  }
  async function pool(list,phase){let next=0;await Promise.all(Array.from({length:Math.min(CONCURRENCY,list.length)},async()=>{while(next<list.length)await one(list[next++],phase);}));}
  await pool(booths,1);
  // A booth processed before a second booth with the same texture was seen
  // embedded its own copy; redo those few now that every texture is counted.
  const redo=booths.filter(b=>result.get(b)?.embeddedKeys.some(k=>ctx.shared(k)));
  if(redo.length){onProgress({done,total:booths.length,label:'Finishing '+redo.length+' booth'+(redo.length===1?'':'s')});await pool(redo,2);}
  return stats;
 }
 return {run,parseGLB,optimizeBooth,imageKeys};
})();
