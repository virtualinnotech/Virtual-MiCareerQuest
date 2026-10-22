import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import * as T from '../../pc66/vendor/three/three.core.js';
const doc=await new NodeIO().read(new URL('../city.glb',import.meta.url).pathname),nodes=doc.getRoot().listNodes(),extras=doc.getRoot().getExtras();
const report=JSON.parse(fs.readFileSync(new URL('../report.json',import.meta.url)));
function contact(n){const c=n.getExtras().collider107;return c&&new T.Box3(new T.Vector3(...c.center).sub(new T.Vector3(...c.size).multiplyScalar(.5)),new T.Vector3(...c.center).add(new T.Vector3(...c.size).multiplyScalar(.5))).applyMatrix4(new T.Matrix4().fromArray(n.getWorldMatrix()));}
const benches=nodes.filter(n=>n.getExtras().detail111==='busBenches');assert.equal(benches.length,3);
const parkBenches=nodes.filter(n=>n.getName().startsWith('District115 supplied ParkBenchLong'));assert.equal(parkBenches.length,6);
for(const b of parkBenches){
 const p=b.getTranslation(),target=p[0]<-20?[-28.2,p[2]]:[p[0],-25],toward=new T.Vector3(target[0]-p[0],0,target[1]-p[2]).normalize();
 const front=new T.Vector3(0,0,1).applyQuaternion(new T.Quaternion(...b.getRotation()));assert(front.dot(toward)>.999,'park bench faces its sidewalk: '+b.getName());
}
const venueBenches=nodes.filter(n=>n.getName().startsWith('City106 riverwalk bench')||n.getExtras().furnishing107==='addedBenches'&&n.getTranslation()[0]>-29&&n.getTranslation()[0]<67&&Math.abs(n.getTranslation()[2])<40);assert.equal(venueBenches.length,16);
for(const b of venueBenches){const front=new T.Vector3(0,0,1).applyQuaternion(new T.Quaternion(...b.getRotation())),direction=b.getTranslation()[2]>0?1:-1;assert(front.z*direction>.999,'venue bench faces walkway: '+b.getName());}
for(const b of benches){
 assert.deepEqual(b.getRotation(),[0,0,0,1],'seat fronts face the road (+Z)');
 const footprint=contact(b).expandByScalar(.18);
 for(const n of nodes){
  if(n===b||n.getExtras().detail111==='busShelters'||!n.getExtras().collider107)continue;
  assert(!footprint.intersectsBox(contact(n)),`${n.getName()} obstructs ${b.getName()}`);
 }
}
for(const shelter of nodes.filter(n=>n.getExtras().detail111==='busShelters')){
 const footprint=contact(shelter).expandByScalar(.12);
 for(const n of nodes){
  if(n===shelter||n.getExtras().detail111==='busBenches'||!n.getExtras().collider107)continue;
  assert(!footprint.intersectsBox(contact(n)),`${n.getName()} obstructs shelter ${shelter.getName()}`);
 }
}
assert.equal(extras.assets130.schoolBuses.length,9);
for(const b of extras.assets130.schoolBuses){
 const n=nodes.find(n=>n.getName()==='Supplied130 '+b.original),c=contact(n);
 assert(Math.abs((c.max.y-c.min.y)-b.height)<.002);
 assert(Math.abs(Math.sin(b.modelYaw)+Math.sin(b.yaw))<1e-6);
 assert(Math.abs(Math.cos(b.modelYaw)+Math.cos(b.yaw))<1e-6);
 if(b.original.endsWith('front'))assert(c.min.z>39.6&&c.max.z<40.9);
 else assert(c.min.x>66.6&&c.max.x<67.9&&c.max.z<39.1);
 const lane=report.life.lanes.find(l=>l.id===(b.original.endsWith('front')?'front-west':'east-south'));
 assert(lane.junctions.every(j=>Math.abs(b.p[lane.axis]-j.q)>j.half+b.length/2+.6),'parked bus clears crosswalks: '+b.original);
 const obstacle=report.life.obstacles.find(o=>o.id===b.original);assert.deepEqual(obstacle.p,b.p);assert.equal(obstacle.yaw,b.yaw);
 assert(extras.assets130.retired131.includes(b.original+'_body_collider'));
 assert(extras.assets130.retired131.includes(b.original+'_contact_patch'));
}
for(const board of extras.assets130.streetBoards131){assert(board.center[1]>=3);assert(Math.max(board.center[0],board.center[2])-.46>.05,'lettered face clears pole');}
const corner=nodes.find(n=>n.getName()==='City131 square sidewalk corner');assert(corner.getExtras().surface115);
assert(extras.assets130.retired131.includes('Front_east_corner_curb'));
assert(extras.assets130.retired131.includes('Front_east_rounded_sidewalk'));
console.log('PASS six path-facing park benches, three unobstructed bus-stop benches, nine aligned buses and matching collisions, readable signs, square corner');
