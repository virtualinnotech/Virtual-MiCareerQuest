const assert=require('node:assert/strict'),D=require('./driving154.js');
for(const heavy of [false,true]){
 const d=D.create({heavy});d.reset(0);
 for(let i=1;i<=30;i++)d.step(1/60,i/60,3);
 assert(d.state.yaw-d.state.followYaw>.12&&d.state.yaw-d.state.followYaw<.55,'camera trails the turn');
 assert(d.state.roll>.01&&d.state.roll<.1,'suspension leans outward');
 for(let i=0;i<240;i++)d.step(1/60,.5,3);
 assert(Math.abs(d.state.followYaw-.5)<.0001,'camera recenters');
 assert(Math.abs(d.state.roll)<.0001,'suspension settles');
 d.reset(Math.PI-.02);d.step(1/60,-Math.PI+.02,2);
 assert(Math.abs(D.angle(d.state.followYaw-(-Math.PI+.02)))<.05,'heading wraps through pi');
 d.reset(0);for(let i=1;i<=30;i++)d.step(1/60,0,i/30*3);
 assert(d.state.pitch<-.005,'acceleration lifts the nose');
 for(let i=1;i<=20;i++)d.step(1/60,0,3-i/20*3);
 assert(d.state.pitch>0,'braking dips the nose');
 const before={...d.state};d.step(0,2,8);assert.deepEqual(d.state,before,'paused frames do not advance springs');
 d.reset(2);assert.equal(d.state.followYaw,2);assert.equal(d.state.roll,0);
}
function sample(hz){const d=D.create();d.reset(0);for(let i=1;i<=hz;i++)d.step(1/hz,i/hz*.6,2);return d.state;}
const a=sample(30),b=sample(120);assert(Math.abs(a.followYaw-b.followYaw)<.015);assert(Math.abs(a.roll-b.roll)<.004);
console.log('PASS camera trailing/recentering, angle wrap, suspension response, pause/reset and frame-rate consistency');
