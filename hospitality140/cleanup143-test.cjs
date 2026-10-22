const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const C=require('./core'),N=require('../network40/core');
const bytes=zlib.gunzipSync(fs.readFileSync('city106/city.glb.gz'));
const city=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
const moved=city.nodes.filter(n=>C.fixtureOffset(n.name));
assert.equal(moved.length,3);
for(const n of moved)assert.equal(n.translation[2]+C.fixtureOffset(n.name)[2],-12.45);
assert.equal(C.fixtureOffset('DeVos130 FIRE sign 2'),null);
assert.equal(C.fixtureOffset('DeVos130 FIRE sign -12.45'),null);
const removed=city.nodes.filter(n=>/^Park137 (planted room border |border \d+ plant )/.test(n.name));
assert(removed.length>30);assert(removed.every(n=>C.removeOriginal(n.name)));
assert(!C.removeOriginal('Park137 server room solid foundation'));
assert(!C.clearsGarden('Park137 server room side skirt','',[-21,0,-19],[-20,1,-13]));
assert(C.clearsGarden('supplied fixture','recycle-blue',[-15,0,-24],[-14,1,-23]));
assert(!C.clearsGarden('City111 bins','recycle-blue',[-40,0,-24],[-39,1,-23]));
for(const z of [-86,-68,-50])assert(C.opensWall('Gallery_side_clerestory_band_'+z,[-5.1,3,-28],[-4.98,7,-14]));
assert(!C.opensWall('Grand_Gallery_glass_guard',[-3.9,3,-28],[-3.8,4,-14]));
assert(!C.opensWall('Exterior window wall',[-30.4,3,-28],[-30.3,7,-14]));
const extent=[-20.8,-18.8,-15.2,-13.2];
for(const x of [-20.5,-15.5])for(const z of [-18.5,-13.5])for(let i=0;i<720;i++){
 const yaw=i*Math.PI/360,length=N.beamLength([x,1.69,z],yaw,extent);assert(length>=0&&length<=2.3);
 for(const a of [-.15,.15])for(const b of [0,length]){
  const px=x+a*Math.cos(yaw)+b*Math.sin(yaw),pz=z-a*Math.sin(yaw)+b*Math.cos(yaw);
  assert(px>=extent[0]+.07999&&px<=extent[2]-.07999&&pz>=extent[1]+.07999&&pz<=extent[3]-.07999);
 }
}
console.log('PASS: asset fixture migration, planting/bin cleanup, selective glass opening, and 2,880 alarm-beam orientations.');
