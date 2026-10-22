const assert=require('node:assert/strict'),C=require('./core.js');
const a=C.create();assert(!a.choose(-1));for(let i=0;i<8;i++)assert(a.choose(0));assert(a.state.complete);assert.equal(a.state.score,100);assert.equal(a.state.tip,20);assert.equal(a.state.room,'412');assert(!a.choose(0));
const b=C.create();b.choose(2);assert.equal(b.state.step,1);assert(!b.choose(1));assert.equal(b.state.step,1);b.choose(0);for(let i=2;i<8;i++)b.choose(0);assert(b.state.complete);assert.equal(b.state.score,75);assert.equal(b.state.tip,10);b.reset();assert(!b.state.complete);assert.equal(b.state.score,0);
const data=new Float32Array([0,4,0,0,0,1,1,7,0,0,0,1,-1,7,0,0,0,1]),uv=new Float32Array([.5,0,1,1,0,1]);const clipped=C.clip(data,new Uint32Array([0,1,2]),uv);assert(clipped.idx.length===6);for(let i=1;i<clipped.data.length;i+=6)assert(clipped.data[i]>=C.cutHeight-.000001);assert.equal(clipped.uv.length,clipped.data.length/3);
const ground={pos:new Float32Array([-10,0,-10,10,0,-10,10,0,10,-10,0,10]),nor:new Float32Array([0,1,0,0,1,0,0,1,0,0,1,0]),uv:new Float32Array([0,0,1,0,1,1,0,1]),idx:new Uint32Array([0,1,2,0,2,3])};
const world=[1,0,0,0,0,1,0,0,0,0,1,0,...C.origin,1],floor=C.pavingSource(ground,world);let area=0;
for(let i=0;i<floor.idx.length;i+=3){const v=Array.from(floor.idx.subarray(i,i+3),j=>floor.pos.subarray(j*3,j*3+3));area+=Math.abs((v[1][0]-v[0][0])*(v[2][2]-v[0][2])-(v[2][0]-v[0][0])*(v[1][2]-v[0][2]))/2;}
assert(Math.abs(area-(400-7.14*8.3))<.001,'remove only lobby paving, preserving the full sidewalk');assert.equal(floor.uv.length,floor.pos.length/3*2);assert.equal(floor.nor.length,floor.pos.length);
assert(C.removeOriginal('District115 sidewalk green tree 1728'));assert(!C.removeOriginal('District115 sidewalk green tree 1727'));
console.log('Hotel: scoring, retry gates, reset, completion, tips, upper-story clipping, paving cutout and tree isolation passed');
