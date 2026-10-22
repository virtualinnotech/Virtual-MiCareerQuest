const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
globalThis.Matter=require('./vendor/matter.min.js');
require('./recovery123.js');require('./vehicle-physics.js');
const lanes=Array.from({length:16},(_,i)=>({id:'lane-'+i,axis:1,dir:1,start:-100,end:100,length:200,cross:i*8,junctions:[]}));
const fleet=lanes.map((l,i)=>({id:'wreck-'+i,kind:'sedan',p:[l.cross+.9,0,0],yaw:.25,width:.85,length:2,lane:l.id,s:100,speed:0,travel:0,crashed:true}));
const physics=AmbulancePhysics35.create([],()=>{},{traffic:()=>fleet,lanes:()=>lanes,heightAt:()=>0});
physics.reset(-50,-60,0);
for(let i=0;i<7200&&fleet.some(v=>v.crashed);i++){
 physics.step(1/120,{throttle:0,steer:0,brake:true},0);
 assert(physics.recoveryWork.maxChecksPerTick<=24,'pileup exceeded shared planning budget');
}
assert(fleet.every(v=>!v.crashed&&v.recoveries123===1),'all queued wrecks must recover without starvation');
assert(fleet.every(v=>!v.recoveryResets123),'clear routes must not teleport');
assert(physics.recoveryWork.probeBuilds<=fleet.length*2,'recovery must reuse collision probes');
assert(physics.recoveryWork.checks>500,'test must exercise dense path validation');

// Particle count stays the same, but a multi-hydrant crash uses three draws.
const source=fs.readFileSync(require.resolve('../city106/street128/runtime.js'),'utf8');
const draw=source.slice(source.indexOf(' function draw(){'),source.indexOf(' function enable('));
const calls=[],props=Array.from({length:3},(_,i)=>({type:'hydrants',lo:[i,0,0],origin:[i,0,0],age:2}));
const ctx={engine:{active:props,shards:Array.from({length:8},()=>({size:.02,body:{position:{toArray:()=>[0,0,0]},quaternion:{toArray:()=>[0,0,0,1]}}}))},finished:true,
 glassBatch:{id:'glass'},waterBatch:{id:'water'},jetBatch:{id:'jet'},Math,uniforms:{},program:{},gl:{getUniformLocation:()=>null,uniform1i(){},uniform1f(){}},
 transform:(p,s)=>({p,s}),trs:p=>p,mm:(a,b)=>({a,b}),drawBuildingInstances:(b,items)=>calls.push([b.id,items.length])};
vm.runInNewContext(draw+';draw();',ctx);
assert.deepEqual(calls,[['glass',8],['jet',3],['water',366]]);
console.log('PASS 16 simultaneous wrecks, bounded/fair recovery, reusable probes, unchanged particles in three draws',physics.recoveryWork);
