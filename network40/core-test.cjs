const assert=require('node:assert/strict'),C=require('./core.js'),g=C.create(),s=g.state;
const tick=seconds=>{for(let i=0;i<Math.ceil(seconds/.05);i++)g.tick(.05);};
for(const order of [[0,1],[1,0]]){
 g.reset();g.start();for(const f of C.faults)g.door(f.rack);tick(1);
 assert(g.reconnect(order[0]));tick(1.7);assert(g.test());tick(2.5);
 assert.equal(s.phase,'secondary-fault');assert(s.message.includes(C.faults[order[1]].name));assert.equal(s.points,0);
 assert(g.reconnect(order[1]));tick(1.7);assert(g.test());tick(2.5);assert.equal(s.phase,'complete');assert.equal(s.points,200);
}
g.reset();g.start();for(const f of C.faults)g.door(f.rack);tick(1);
for(const i of [1,0]){assert(g.reconnect(i));tick(1.7);}assert(g.test());tick(2.5);assert.equal(s.phase,'complete');
g.reset();
assert(!g.reconnect(0));assert(!g.test());g.start();assert(s.started);assert(g.test());tick(2.5);assert.equal(s.phase,'offline');assert.equal(s.tests,1);
for(let i=0;i<9;i++)assert(g.door(i));tick(1);assert.equal(s.inspected.length,9);assert(s.angles.every(a=>a===1.85));
for(let r=0;r<9;r++){const leds=Array.from({length:50},(_,p)=>g.led(r,p));assert.equal(leds.filter(v=>v==='amber').length,[1,4].includes(r)?1:0);}
const before=Array.from({length:50},(_,p)=>g.led(0,p));tick(.4);assert.notDeepEqual(before,Array.from({length:50},(_,p)=>g.led(0,p)));
assert(g.reconnect(0));assert(!g.reconnect(0));assert(!g.test());assert(!g.door(0));tick(1.7);assert(s.connected[0]);assert.equal(s.phase,'awaiting-test');assert.notEqual(g.led(1,27),'amber');
assert(g.test());assert(!g.test());tick(2.5);assert(s.diagnosed);assert.equal(s.phase,'secondary-fault');assert(g.reconnect(1));tick(1.7);assert(g.test());tick(2.5);assert.equal(s.phase,'complete');assert.equal(s.points,200);assert(!g.test());tick(3);assert.equal(s.points,200);
g.reset();assert(!s.started);assert.deepEqual(s.connected,[false,false]);assert(s.doors.every(v=>!v));assert.equal(s.points,0);console.log('PASS: nine doors, 450 staggered LEDs, staged repairs, test failures, duplicate guards, completion, and reset.');
