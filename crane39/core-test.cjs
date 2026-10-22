const assert=require('node:assert/strict'),C=require('./core.js');
const g=C.create(),s=g.state;
assert(g.attach());assert(!g.attach());s.hookY=5;g.tick(.01);assert.equal(s.bundles[0].p[1],4);
g.release();for(let i=0;i<60;i++)g.tick(.05);assert.deepEqual(s.bundles[0].p,C.source[0]);assert(!s.bundles[0].falling);
g.reset();for(let i=0;i<1000;i++)g.tick(.05,{turn:1});assert(s.yaw>Math.PI*2);assert(s.radius>=2);
g.reset();const yaw=s.yaw;g.tick(.05,{turn:1},()=>[1,2,3]);assert.equal(s.yaw,yaw);assert.equal(s.debris.length,14);
g.reset();for(let i=0;i<3;i++){s.yaw=Math.atan2(C.source[i][0]-C.site.tower[0],C.source[i][2]-C.site.tower[2]);s.radius=Math.hypot(C.source[i][0]-C.site.tower[0],C.source[i][2]-C.site.tower[2]);s.hookY=1;assert(g.attach());const t=C.targets[2-i];s.yaw=Math.atan2(t[0]-C.site.tower[0],t[2]-C.site.tower[2]);s.radius=Math.hypot(t[0]-C.site.tower[0],t[2]-C.site.tower[2]);s.hookY=t[1]+1;assert(g.release());}assert.equal(s.phase,'complete');assert.equal(s.points,200);assert(!g.attach());
g.reset();assert.equal(s.delivered,0);assert.equal(s.points,0);assert.equal(s.debris.length,0);
console.log('PASS: pickup, falling load, 360-degree slew, collision rollback, any-slot delivery, completion and reset.');
