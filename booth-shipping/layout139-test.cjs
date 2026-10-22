const assert=require('node:assert/strict'),fs=require('node:fs'),L=require('../booth-layout139');
const source=fs.readFileSync(require('node:path').join(__dirname,'../venue-frame.html'),'utf8');
const layout=JSON.parse(source.match(/const DISCOVERY_LAYOUT=(.*);/)[1]);
const caps=[60,61,57,55,52];
layout.gates=layout.gates.filter(g=>g.id!=='construction-east');
for(const sector of layout.sectors){
 const plan=L.generate(sector,layout.gates,30),w=L.nominal[0]*plan.scale/.4,d=L.nominal[1]*plan.scale/.4;
 assert.equal(plan.slots.length,30,sector.industry);assert.equal(plan.overflow,0);assert(plan.scale>=.3);
 const polygons=plan.slots.map(p=>L.polygon(p,w,d));
 for(const [i,p]of polygons.entries()){
  assert.equal(L.challengeProblem(sector.industry,p),null);
  for(let j=0;j<i;j++)assert(L.distance(p,polygons[j])>=L.gap-.0001);
  const b=L.bounds(p);assert(b[0]>=sector.min[0]+.4&&b[2]<=sector.max[0]-.4&&b[1]>=sector.min[1]+.4&&b[3]<=sector.max[1]-.4);
 }
 assert.deepEqual(L.generate(sector,layout.gates,30),plan,'deterministic placements');
 console.log(sector.industry,plan.slots.length,'booths at',plan.scale);
 const maximum=L.generate(sector,layout.gates,caps[layout.sectors.indexOf(sector)]);assert.equal(maximum.overflow,0,'configured maximum capacity '+sector.industry);
}
for(const r of L.reservations)assert(L.challengeProblem(r.industry,L.rect(r.bounds)),r.name);
for(const dimensions of [[7.2,4,5.2],[12,6,8],[9,5,12]]){
 const s=L.fitScale([0,0,0],dimensions,.34);assert(dimensions[0]*s<=L.nominal[0]*.34/.4+1e-9);assert(dimensions[2]*s<=L.nominal[1]*.34/.4+1e-9);
}
console.log('PASS: 150 slots, challenge reservations, rotated geometry, clearance, deterministic layout and oversize fitting.');
