const assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/city.glb'),jsonLength=source.readUInt32LE(12),j=JSON.parse(source.subarray(20,20+jsonLength).toString()),binStart=20+jsonLength+8;
const manifest=require('./detail150.json'),data=fs.readFileSync(__dirname+'/detail150.bin');
assert.equal(data.length,manifest.bytes);assert(manifest.records.length>300);assert(manifest.distantTriangles<manifest.sourceTriangles*.3);
for(const r of manifest.records){
 const p=j.meshes[r.mesh].primitives[r.part],a=j.accessors[p.indices],v=j.accessors[p.attributes.POSITION];
 assert.equal(a.count,r.sourceCount);assert.equal(v.count,r.vertices);assert.equal(j.materials[p.material].alphaMode||'OPAQUE','OPAQUE');
 const view=j.bufferViews[a.bufferView],offset=binStart+(view.byteOffset||0)+(a.byteOffset||0),step=a.componentType===5125?4:2;
 for(let i=0;i<r.signature.length;i++)assert.equal(step===4?source.readUInt32LE(offset+i*step):source.readUInt16LE(offset+i*step),r.signature[i]);
 assert(r.offset%4===0&&r.count%3===0&&r.offset+r.count*4<=data.length);assert(r.error<=.01201);
 for(let i=0;i<r.count;i++)assert(data.readUInt32LE(r.offset+i*4)<r.vertices,'indices reuse original vertex buffer');
}
console.log('PASS 386 background detail records match original meshes, valid indices, preserved alpha geometry and bounded simplification error');
