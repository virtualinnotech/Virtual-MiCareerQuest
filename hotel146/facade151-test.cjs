const assert=require('node:assert/strict'),C=require('./core.js'),life=require('../city106/life111.js');
const walks=require('../city106/report.json').life.walks;
const hotel={lo:C.bounds.lo,hi:C.bounds.hi};
for(const source of walks){
 const w={...source,width:source.id==='front'?.97:source.id==='east'?.57:source.id==='river'?1.15:source.id.startsWith('park')?.60:.32,obstacles:[hotel]};
 w.offset=Math.min(.28,w.width-.04,life.walkEndMargin(w));
 const length=2*(w.end-w.start+Math.PI*w.offset);
 for(let i=0;i<300;i++){
  const p=life.sampleWalk(w,length*i/300);
  assert(!(p.x>hotel.lo[0]-.159&&p.x<hotel.hi[0]+.159&&p.z>hotel.lo[2]-.159&&p.z<hotel.hi[2]+.159),'sidewalk route clears the hotel: '+w.id);
 }
}
for(const axis of [0,2])for(const side of axis===0?[-1,1]:[-1]){
 const row=C.windows.filter(w=>w.axis===axis&&Math.sign(w.wall)===side&&w.y<1).sort((a,b)=>a.along-b.along);
 assert(row.length>=(axis===0?6:4));
 for(let i=1;i<row.length;i++){
  if(axis===2&&row[i-1].along<0&&row[i].along>0)continue;
  assert(row[i].along-row[i].width/2-(row[i-1].along+row[i-1].width/2)<.16,'narrow piers between neighboring windows');
 }
}
console.log('PASS all street pedestrian routes clear the hotel, continuous front/side window bays and narrow piers');
