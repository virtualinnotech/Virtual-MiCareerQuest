import assert from 'node:assert/strict';
import {PropWorld,RESET_SECONDS} from './core.mjs';
const world=new PropWorld();
const lamp=world.register({id:'lamp',type:'streetlights',lo:[-.1,0,-.1],hi:[.3,2.7,.1],contact:{lo:[-.08,0,-.08],hi:[.08,2.6,.08]},glass:[{lo:[.1,2.55,-.1],hi:[.3,2.6,.1]}]});
const bin=world.register({id:'bin',type:'bins',lo:[1,0,-.15],hi:[1.3,.5,.15]});
assert.equal(world.hit('tree',{x:5,z:0,mass:3600}),false,'unregistered permanent structures never move');
assert.equal(world.sweep({id:'walker',x:0,z:0,vx:0,vz:0}),0);
assert(world.sweep({id:'ambulance',from:[0,-2],x:0,z:.5,y:0,yaw:0,width:1,length:2.6,vx:0,vz:4,mass:3600})>0,'swept bumper impact');
assert(lamp.body);assert(lamp.broken);assert(world.shards.length>0);
world.step(3);assert(Math.abs(lamp.body.quaternion.x)+Math.abs(lamp.body.quaternion.z)>.1,'lamp falls in 3D');
assert(lamp.body.position.y>-1,'ground catches fallen furniture');
world.step(RESET_SECONDS-3-.01);assert(lamp.body,'no early reset');world.step(.02);assert.equal(lamp.body,null);assert(!lamp.broken);assert.equal(lamp.resets,1);
for(const mass of[95,1500,11000]){assert(world.hit('bin',{x:3,z:0,mass}));world.step(30.01);assert.equal(bin.body,null);}
for(let i=0;i<12;i++){world.hit('lamp',{x:4,z:0,mass:95});world.step(30.01);}
assert.equal(world.shards.length,0);assert.equal(world.world.bodies.length,0,'no rigid-body leak over repeated resets');
assert.equal(world.sweep({id:'teleport',from:[0,-100],x:0,z:0,vx:4,vz:0}),0);
world.hit('bin',{x:3,z:0,mass:1500});world.setVehicles([{id:'parked',p:[1.8,0,0],width:.6,length:1.4,height:.8}]);world.step(1);
assert(bin.body.position.x<1.55,'fallen furniture contacts the vehicle instead of passing through it');world.step(30);assert.equal(world.world.bodies.length,0,'vehicle contact bodies are cleaned up');
console.log('PASS swept impacts, masses, fixed objects, pole tipping, glass, ground contact, exact 30s resets and repeated cleanup');
