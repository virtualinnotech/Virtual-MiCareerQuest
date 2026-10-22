const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const optimized=require('./life111.js'),source=fs.readFileSync(require.resolve('./life111.js'),'utf8');
const referenceSource=source.replace('crossingCars.some(o=>','previousCars.some(o=>').replace('for(const o of crossingCars)','for(const o of previousCars)');
const context={module:{exports:{}}};vm.runInNewContext(referenceSource,context);const reference=context.module.exports;
const report=require('./report.json').life;
for(const offset of[0,17,31]){
 const a=structuredClone(report.vehicles),b=structuredClone(a);
 // Include displaced wrecks and shoulder traffic in the broad-phase comparison.
 a[8].crashed=b[8].crashed=true;a[8].yaw=b[8].yaw=.74;
 a[12].p[2]+=.4;b[12].p[2]+=.4;a[12].offset115=b[12].offset115=.4;
 for(let i=0;i<1000;i++){
  const t=(i*.05+offset)%44,phase={ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red'};
  const player=i%200<50?[10,42.9]:null;
  optimized.trafficStep(a,report.lanes,.05,phase,player);reference.trafficStep(b,report.lanes,.05,phase,player);
  assert.equal(JSON.stringify(a),JSON.stringify(b),'lane broad phase must preserve traffic at step '+i);
 }
}
const lane={id:'new',length:60,start:0,end:60,axis:0,cross:0,dir:1,signal:'ew',stops:[{s:12}]};
const cars=[{id:'new-car',lane:'new',s:3,length:1.5,width:.6,maxSpeed:2.4,speed:0,travel:0}];
for(let i=0;i<500;i++)optimized.trafficStep(cars,[lane],.05,{ew:'red'},null);
assert(cars[0].p.every(Number.isFinite)&&cars[0].s<12);
console.log('PASS exact traffic parity across signals, turns, displaced traffic and player crossings; uninitialized positions');
