const assert=require('node:assert/strict'),D=require('./core.js');
assert.equal(D.sprinklers.length,15);
for(let fault=0;fault<15;fault++){
 const g=D.create(fault),s=g.state;assert.equal(g.report(),false);g.launch();s.x=0;s.z=0;assert.equal(g.inspect(fault),false);
 const p=D.sprinklers[fault];s.x=p.x;s.z=p.z;s.y=20;assert.equal(g.inspect(fault),false);s.y=5;assert(g.inspect(fault));assert(g.report());assert.equal(s.points,0);assert.equal(g.report(),false);assert.equal(g.land(),false);
 Object.assign(s,{x:D.pad.x,z:D.pad.z,y:5});assert.equal(g.land(),false);s.y=.25;s.vx=2;assert.equal(g.land(),false);s.vx=0;assert(g.land());assert.equal(g.land(),false);
 const pump=D.pumps[fault],wrong=D.pumps[(fault+1)%15];assert.equal(g.repair(fault,pump.x,pump.z,false),false);const vehicle=fault%2?'truck':'utv';g.drive(pump.x,pump.z,6,vehicle);assert.equal(s.vehicle,vehicle);assert.equal(g.repair(wrong.id,wrong.x,wrong.z,false),false);assert.equal(g.repair(fault,pump.x,pump.z,true),false);assert.equal(g.repair(fault,0,0,false),false);assert(g.repair(fault,pump.x,pump.z,false));assert.equal(s.points,200);assert.equal(g.repair(fault,pump.x,pump.z,false),false);
}
const g=D.create(7);g.launch();g.state.x=D.sprinklers[6].x;g.state.z=D.sprinklers[6].z;assert.equal(g.inspect(6),false);assert.equal(g.state.phase,'flying');
for(let i=0;i<3000;i++)g.tick(.05,-1,-1,-1);assert.equal(g.state.x,D.field.left-2);assert.equal(g.state.z,D.field.north-2);assert.equal(g.state.y,2.4);
console.log('PASS: all 15 faults, flight/landing gates, UTV arrival, wrong pump, on-foot proximity, one-time repair reward');
