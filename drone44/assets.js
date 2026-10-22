window.DroneAssets44={
 async load(name,{collision=false,base='./drone44/'}={}){
  const r=await fetch(base+name+'.glb');if(!r.ok)throw Error('Missing exhibit model: '+name);
  const {json:j,bin}=parseGLB(await r.arrayBuffer()),world=[],parents=new Map(),textures=new Map(),parts=[];
  j.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>parents.set(k,i)));const visit=i=>{world[i]=mm(world[parents.get(i)]||IDENTITY,trs(j.nodes[i]));for(const k of j.nodes[i].children||[])visit(k);};j.scenes[j.scene||0].nodes.forEach(visit);
  for(let i=0;i<j.nodes.length;i++){const node=j.nodes[i];if(node.mesh==null)continue;for(const p of j.meshes[node.mesh].primitives){const v=accessor(j,bin,p.attributes.POSITION),n=p.attributes.NORMAL==null?geometryNormals(v,accessor(j,bin,p.indices)):accessor(j,bin,p.attributes.NORMAL),data=new Float32Array(v.length*2),material=j.materials?.[p.material]||{};let idx=accessor(j,bin,p.indices);
   // The workshop slab and its painted bay stripes share the farm's walking height.
   if(name==='maintenance-barn65'){
    if(material.name==='Concrete')for(let k=1;k<v.length;k+=3)v[k]-=.025;
    if(material.name==='White trim'){const painted=k=>v[k*3+1]>.026&&v[k*3+1]<.037,keep=[];for(let k=0;k<idx.length;k+=3){const face=Array.from(idx.subarray(k,k+3));if(face.every(painted)){if(face.every(q=>n[q*3+1]>.55))keep.push(...face);}else keep.push(...face);}for(let k=0;k<v.length/3;k++)if(painted(k)){v[k*3+1]=.0006;n.set([0,1,0],k*3);}idx=new Uint32Array(keep);}
   }
   for(let k=0;k<v.length;k+=3)data.set([...v.subarray(k,k+3),...n.subarray(k,k+3)],k*2);const m=material.pbrMetallicRoughness||{},ti=m.baseColorTexture?.index,color=m.baseColorFactor||[.55,.6,.61,1],clearGlass=material.alphaMode==='BLEND'&&color[3]<.4;if(ti!=null&&!textures.has(ti))textures.set(ti,await embeddedGLBTexture(j,bin,ti));const b=uploadBatch(data,idx,{color,baseTexture:textures.get(ti),uv:p.attributes.TEXCOORD_0==null?null:accessor(j,bin,p.attributes.TEXCOORD_0),rough:m.roughnessFactor??.8,metal:m.metallicFactor??0,emission:mul(material.emissiveFactor||[0,0,0],material.extensions?.KHR_materials_emissive_strength?.emissiveStrength||1),surfaceType:clearGlass?8:0,transparent:clearGlass,doubleSided:true,alphaCutoff:clearGlass?-1:material.alphaMode==='BLEND'||material.alphaMode==='MASK'?.4:-1});parts.push({batch:b,matrix:world[i],buffer:gl.createBuffer(),matrixFascia:!!material.extras?.matrix,textureGlow:!!material.extras?.gradientRGB,...(collision?{positions:v,indices:idx}:{})});}}
  let partIndex=0;for(const node of j.nodes)if(node.mesh!=null)for(const primitive of j.meshes[node.mesh].primitives)parts[partIndex++].name=node.name||'';
  parts.textures=[...textures.values()];gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);return parts;
 },
 release(parts){for(const p of parts){freeBatch(p.batch);gl.deleteBuffer(p.buffer);}for(const t of parts.textures||[])releaseEmbeddedTexture(t);},
 draw(parts,m){for(const p of parts)drawBatch(p.batch,mm(m,p.matrix));},
 // Each part keeps one instance buffer (keyed by its GL buffer, which spread
 // copies of a part share) that is overwritten in place, and its VAO layout is
 // set once. Re-allocating every part's buffer on every call, every frame,
 // stalled the GPU process once a full venue of booths was loaded.
 slots:new WeakMap(),
 // Only copies in view are drawn. The first visible one goes through
 // drawBatch, which also sets the part's material; the others are instanced
 // with it. (Instancing after an off-screen first copy, which drawBatch skips
 // without setting anything, reused the previous draw's material: the PC lab's
 // desks turned neon pink whenever its first station was out of view.)
 instances(parts,matrices){if(!matrices.length)return;for(const p of parts){
  const shown=[];for(const m of matrices){const w=mm(m,p.matrix);if(City106.drawVisible(p.batch,w))shown.push(w);}
  if(!shown.length)continue;drawBatch(p.batch,shown[0]);if(shown.length===1)continue;
  const count=shown.length-1,need=count*16;let slot=this.slots.get(p.buffer);
  gl.bindVertexArray(p.batch.vao);gl.bindBuffer(gl.ARRAY_BUFFER,p.buffer);
  if(!slot||slot.data.length<need){slot={data:new Float32Array(Math.max(need,64,(slot?.data.length||0)*2)),vaos:slot?.vaos||new WeakSet()};this.slots.set(p.buffer,slot);gl.bufferData(gl.ARRAY_BUFFER,slot.data.byteLength,gl.DYNAMIC_DRAW);}
  for(let i=1;i<shown.length;i++)slot.data.set(shown[i],(i-1)*16);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,slot.data.subarray(0,need));
  if(!slot.vaos.has(p.batch.vao)){for(let k=0;k<4;k++){gl.enableVertexAttribArray(2+k);gl.vertexAttribPointer(2+k,4,gl.FLOAT,false,64,k*16);gl.vertexAttribDivisor(2+k,1);}slot.vaos.add(p.batch.vao);}
  gl.uniform1i(uniforms.uInstanced,1);gl.drawElementsInstanced(gl.TRIANGLES,p.batch.count,gl.UNSIGNED_INT,0,count);gl.uniform1i(uniforms.uInstanced,0);}}
};
