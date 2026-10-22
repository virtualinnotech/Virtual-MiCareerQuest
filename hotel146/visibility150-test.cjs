const assert=require('node:assert/strict'),C=require('./core.js');
const at=p=>p.map((v,k)=>v+C.origin[k]),eye=at([0,.7,0]);
const hidden=(p,e=eye)=>C.lobbyOccludes150(at(p.map(v=>v-.02)),at(p.map(v=>v+.02)),e);
assert(hidden([6,9,0]),'solid wall above windows hides exterior objects');
assert(!hidden([6,.7,.8*6/3.39]),'side window retains the street');
assert(!hidden([0,.7,-7]),'revolving door retains the street');
assert(!hidden([1,.3,1]),'lobby furnishings stay visible');
assert(!hidden([6,.7,0],at([12,.7,0])),'outside views are unchanged');
for(const w of C.windows)for(let i=0;i<20;i++){
 const p=[0,w.y+w.height*(i+.5)/20,0];p[w.axis]=w.wall;p[w.axis===0?2:0]=w.along;
 const aperture=at(p),target=aperture.map((v,k)=>eye[k]+(v-eye[k])*2.5);
 assert(!C.lobbyOccludes150(target.map(v=>v-.01),target.map(v=>v+.01),eye),'view through every supplied ground-floor window');
}
console.log('PASS opaque-wall culling, every ground-floor window, revolving entrance, lobby objects and unchanged outside views');
