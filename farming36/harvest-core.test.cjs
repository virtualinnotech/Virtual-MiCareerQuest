const assert=require('node:assert/strict');
const {create,rows}=require('./harvest-core.js');
const crop=create(),trailer={x:0,z:0,yaw:0};
assert.equal(crop.snapshot().complete,false);
assert.equal(crop.collect(0,0),0);
assert.equal(crop.harvest(0,0,0),0,'Driving outside crop must not create hay');
for(const x of rows)for(let z=26;z>=-10;z-=.08){
 if(crop.snapshot().grain===crop.snapshot().capacity){assert.equal(crop.harvest(x,z,Math.PI),0);crop.unload(Infinity);}
 crop.harvest(x,z,Math.PI);
}
assert.equal(crop.snapshot().capacity,720);
crop.unload(Infinity);assert.equal(crop.snapshot().delivered,1440);
assert.equal(crop.snapshot().cut,1440);
assert.equal(crop.hay.reduce((sum,h)=>sum+h.amount,0),1440,'All cut material reaches the windrow');
assert.equal(crop.harvest(rows[0],0,Math.PI),0,'Cut crop cannot be harvested again');
// Uneven windrows retain the same mass and exercise the final partial chamber.
crop.hay[0].amount--;crop.hay.at(-1).amount++;
let pickedUpDuringEjection=false;
for(const h of crop.hay){
 if(h.collected)continue;
 const ejecting=crop.snapshot().cycle>=0;
 const picked=crop.collect(h.x,h.z);
 if(ejecting&&picked>0)pickedUpDuringEjection=true;
 const before=crop.snapshot().collected;crop.collect(h.x,h.z);assert.equal(crop.snapshot().collected,before,'Pickup must be idempotent');
}
assert.equal(crop.snapshot().collected,1440);
assert.equal(crop.snapshot().complete,false,'Wait until the final bale has left the chamber');
crop.tick(.9,trailer);assert(crop.bales.length>0);
for(let i=0;i<20;i++)crop.tick(3,trailer);
assert.equal(crop.snapshot().complete,true);
assert.equal(crop.snapshot().remaining,0);
assert.equal(crop.bales.reduce((sum,b)=>sum+b.amount,0),1440,'Every collected unit is in a bale, including a partial final bale');
assert(pickedUpDuringEjection,'Pickup must continue while a bale is ejecting');
assert(crop.bales.every(b=>b.amount<=120));
const total=crop.snapshot().bales;crop.tick(10,trailer);assert.equal(crop.snapshot().bales,total,'No duplicate ejections');
assert.equal(create().snapshot().cut,0);
const partial=create();
partial.cells.pop();
for(const x of rows)for(let z=26;z>=-10;z-=.08){if(partial.snapshot().grain===partial.snapshot().capacity)partial.unload(Infinity);partial.harvest(x,z,Math.PI);}
for(const h of partial.hay)partial.collect(h.x,h.z);
for(let i=0;i<20;i++)partial.tick(3,trailer);
assert.equal(partial.snapshot().complete,false,'Final grain delivery is required');
partial.unload(Infinity);assert(partial.snapshot().complete);
assert.equal(partial.bales.at(-1).amount,119,'The final partial bale must be emitted');
assert.equal(partial.bales.reduce((sum,b)=>sum+b.amount,0),1439);
console.log('PASS: crop conservation, repeat passes, pickup, final partial bale, delayed completion and reset.');
const damaged=create();
assert(damaged.damage(-50,0,0,1.1,2)>0);
const loss=damaged.snapshot().damaged;
assert.equal(damaged.damage(-50,0,0,1.1,2),0,'Damage cannot be counted twice');
assert.equal(damaged.snapshot().grain,0,'Crushing does not create grain');
assert.equal(damaged.snapshot().delivered,0);
assert.equal(damaged.hay.length,0,'Crushing does not create collectible hay');
for(const x of rows)for(let z=26;z>=-10;z-=.08){if(damaged.snapshot().grainFull)damaged.unload(Infinity);damaged.harvest(x,z,Math.PI);}
damaged.unload(Infinity);
for(const h of damaged.hay)damaged.collect(h.x,h.z);
for(let i=0;i<20;i++)damaged.tick(3,trailer);
assert.equal(damaged.snapshot().delivered,1440-loss);
assert.equal(damaged.bales.reduce((n,b)=>n+b.amount,0),1440-loss);
assert(damaged.snapshot().complete,'A damaged field must still be completable');
assert.equal(create().snapshot().damaged,0,'Restart restores wheat yield');
console.log('PASS: crop damage reduces grain and hay yield without preventing completion.');
