/* Preserve geometry/rigs; omit maps the venue character renderer does not use. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const input=fs.readFileSync(path.join(__dirname,'doctor.glb'));
const jsonLength=input.readUInt32LE(12),j=JSON.parse(input.subarray(20,20+jsonLength));
const bin=input.subarray(28+jsonLength),used=new Set();
for(const m of j.materials){
 const t=m.pbrMetallicRoughness?.baseColorTexture?.index;if(t!=null)used.add(t);
 delete m.normalTexture;delete m.occlusionTexture;delete m.emissiveTexture;delete m.extensions;
 if(m.pbrMetallicRoughness)delete m.pbrMetallicRoughness.metallicRoughnessTexture;
}
const textures=[...used],images=[...new Set(textures.map(i=>j.textures[i].source))];
for(const m of j.materials)if(m.pbrMetallicRoughness?.baseColorTexture)m.pbrMetallicRoughness.baseColorTexture.index=textures.indexOf(m.pbrMetallicRoughness.baseColorTexture.index);
j.textures=textures.map(i=>({...j.textures[i],source:images.indexOf(j.textures[i].source)}));
const removedViews=new Set(j.images.filter((_,i)=>!images.includes(i)).map(i=>i.bufferView));
j.images=images.map(i=>j.images[i]);
for(const a of j.accessors)removedViews.delete(a.bufferView);
for(const i of j.images)removedViews.delete(i.bufferView);
const remap=new Map(),chunks=[];let offset=0;
j.bufferViews=j.bufferViews.flatMap((view,i)=>{if(removedViews.has(i))return[];remap.set(i,remap.size);const data=bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength),padding=(4-data.length%4)%4;chunks.push(data,Buffer.alloc(padding));const result={...view,byteOffset:offset};offset+=data.length+padding;return[result];});
for(const a of j.accessors){assert(!a.sparse);if(a.bufferView!=null)a.bufferView=remap.get(a.bufferView);}
for(const image of j.images)image.bufferView=remap.get(image.bufferView);
j.buffers[0].byteLength=offset;
const json=Buffer.from(JSON.stringify(j)),jsonPad=Buffer.alloc((4-json.length%4)%4,32),header=Buffer.alloc(20),binHeader=Buffer.alloc(8),length=20+json.length+jsonPad.length+8+offset;
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(length,8);header.writeUInt32LE(json.length+jsonPad.length,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(offset,0);binHeader.writeUInt32LE(0x004e4942,4);
fs.writeFileSync(path.join(__dirname,'doctor-runtime.glb'),Buffer.concat([header,json,jsonPad,binHeader,...chunks]));
console.log(`Doctor runtime: ${(input.length/1048576).toFixed(1)} MB -> ${(length/1048576).toFixed(1)} MB; geometry and skinning unchanged.`);
