import assert from 'node:assert/strict';
import {PropWorld} from './core.mjs';
const world=new PropWorld(),props=[];
for(let i=0;i<12;i++)props.push(world.register({id:'bin-'+i,type:'bins',lo:[i%4,0,Math.floor(i/4)],hi:[i%4+.2,.4,Math.floor(i/4)+.2]}));
for(const p of props)world.hit(p.id,{x:2,z:0,mass:3100});
assert(world.groundBodies.size<=9,'nearby impacts must share tiled ground');
for(const a of world.groundBodies.values())for(const b of world.groundBodies.values()){
 if(a===b)continue;
 assert(Math.abs(a.body.position.x-b.body.position.x)>=8||Math.abs(a.body.position.z-b.body.position.z)>=8,'ground slabs must not overlap');
}
const shared=props[0].grounds.filter(key=>world.groundBodies.get(key).users>1);
assert(shared.length>0);
world.reset(props[0]);
assert(shared.every(key=>world.groundBodies.has(key)),'one reset must not remove another prop ground');
for(let i=0;i<180;i++)world.step(1/60);
for(const p of props.slice(1))assert(p.body.position.y>-.3,'shared ground must catch every prop');
world.step(30);
assert.equal(world.active.size,0);assert.equal(world.groundBodies.size,0);
assert.equal(world.pending.size,0);assert.equal(world.world.bodies.length,0);
console.log('PASS shared non-overlapping debris ground, per-owner lifetime, ground contact and complete cleanup');
