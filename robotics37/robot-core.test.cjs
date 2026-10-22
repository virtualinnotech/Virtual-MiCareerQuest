const assert=require('node:assert/strict'),C=require('./robot-core.js');
const robot=C.create(),s=robot.state;
assert.equal(robot.start('production'),false);
robot.start('test');assert.equal(robot.move(0,1),false);
let dropped=false;for(let i=0;i<1500;i++){robot.tick(.016);if(s.phase==='dropping')dropped=true;}
assert(dropped);assert.equal(s.phase,'failed');assert.equal(s.part[1],.1);assert.equal(s.points,0);
assert(robot.move(6,-1));assert.deepEqual(s.program,C.solution);
robot.start('test');for(let i=0;i<1000;i++)robot.tick(.016);assert.equal(s.phase,'passed');
robot.start('production');for(let i=0;i<2000;i++)robot.tick(.016);assert.equal(s.phase,'complete');assert.equal(s.completed,3);assert.equal(s.points,200);
robot.reset();robot.start('test');robot.tick(.2);robot.stop();const p=[...s.tcp];robot.tick(10);assert.deepEqual(s.tcp,p);assert.equal(s.phase,'stopped');
robot.reset();robot.move(2,-1);robot.start('test');for(let i=0;i<1000;i++)robot.tick(.016);assert.equal(s.phase,'failed');assert.match(s.message,/without a component/);
console.log('PASS: literal command order, visible drop, incorrect grip, reordering, test gate, production, emergency stop and reset.');
