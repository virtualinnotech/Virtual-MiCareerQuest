const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),C=require('./life111.js');
const source=fs.readFileSync(__dirname+'/life111.js','utf8'),context={CityLifeCore111:C};
vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' function walkPoint('),source.indexOf(' async function loadDogs('))+'\nthis.point=walkPoint;',context);
const paths=JSON.parse(fs.readFileSync(__dirname+'/pedestrian121-fixture.json'));
// Check both axes, including road setbacks, before the full-scene liveness run.
for(const axis of [0,2])for(const id of ['park-test','shops-test']){
 const w={id,axis,start:0,end:5,cross:0,width:.6,offset:.16,obstacles:[]},cap=C.walkEndMargin(w);
 const point=(along,cross=0)=>axis===0?{x:along,z:cross}:{x:cross,z:along};
 assert.equal(cap,id==='shops-test'?.20:.60);
 for(const along of [-cap,0,5,5+cap])assert(C.insideWalk(w,...[point(along).x,point(along).z]));
 for(const p of [point(-cap-.001),point(5+cap+.001),point(2,.601),point(2,-.601),{x:NaN,z:0},{x:0,z:Infinity}]){
  assert(!C.insideWalk(w,p.x,p.z));assert(!C.walkSegment(w,point(2),p));assert.equal(C.walkRoute(w,point(2),p).length,0);
 }
 const a={id:'edge-0',path:w,...point(5+cap-.001),s:5,yaw:axis===0?Math.PI/2:0,speed:.51,speed120:.51,direction:1,moving:true};
 const move=C.pedestrianStep(a,[a],1/30,point(5+cap));
 assert(C.insideWalk(w,move.x,move.z),'momentum cannot leave the route end cap');
}
// A neighbor arriving after commitment must trigger a new safe escape route.
{
 const w={id:'shops-recovery-test',axis:0,start:-6,end:6,cross:0,width:.32,offset:.2,obstacles:[]};
 const a={id:'recovery-0',ordinal:0,path:w,x:0,z:.2,s:6,yaw:Math.PI/2,speed:.35,speed120:0,direction:1,moving:true};
 assert(C.recoverWalk(a,[a]));const first=a.recovery121;
 assert(first.goal.x>1.5,'initial escape follows the free corridor');
 const blocker={id:'late-blocker',path:w,x:1,z:0,yaw:-Math.PI/2,speed:0,moving:false,resting121:true};
 let replanned=false;
 for(let i=0;i<600;i++){
  C.coordinateWalk([a,blocker],1/30);
  replanned||=a.recovery121!==first;
  const next=a.recovery121?.goal||C.sampleWalk(w,a.s+a.direction*.45),move=C.pedestrianStep(a,[a,blocker],1/30,next);
  assert(C.walkSegment(w,a,move));assert(Math.hypot(move.x-blocker.x,move.z-blocker.z)>.29);
  a.s=C.advanceWalk(w,a.s,a,move);a.x=move.x;a.z=move.z;
 }
 assert(replanned,'a goal blocked after planning is not latched forever');
 assert(a.x<-1,'blocked recovery makes real progress into the free corridor');
}
function checkAgent(a){
 assert([a.x,a.z,a.s,a.yaw,a.speed,a.speed120,a.walked,a.stall,a.maxStall].every(Number.isFinite),'finite pedestrian state: '+a.id);
 assert(C.insideWalk(a.path,a.x,a.z),'body stays inside its route envelope: '+a.id);
 assert(C.walkSegment(a.path,a,a),'body stays clear of static obstacles: '+a.id);
 for(const p of [...(a.route121||[]),...(a.detour120?[a.detour120]:[]),...(a.recovery121?[a.recovery121.goal]:[])])assert(C.insideWalk(a.path,p.x,p.z),'waypoint stays inside its route envelope: '+a.id);
}
const spans=new Map();
function recordSpan(a,frame){
 let record=spans.get(a.id);const q=a.path.axis===0?a.x:a.z;
 if(!record){record={bins:[],min:q,max:q,minS:a.s,maxS:a.s,worst:null};spans.set(a.id,record);}
 record.min=Math.min(record.min,q);record.max=Math.max(record.max,q);record.minS=Math.min(record.minS,a.s);record.maxS=Math.max(record.maxS,a.s);
 if(frame%30!==29)return;
 record.bins.push({min:record.min,max:record.max,minS:record.minS,maxS:record.maxS});if(record.bins.length>60)record.bins.shift();
 if(record.bins.length===60){
  const span=Math.max(...record.bins.map(b=>b.max))-Math.min(...record.bins.map(b=>b.min)),phaseSpan=Math.max(...record.bins.map(b=>b.maxS))-Math.min(...record.bins.map(b=>b.minS));
  const window={id:a.id,start:(frame+1)/30-60,end:(frame+1)/30,span,phaseSpan};
  if(!record.worst||span<record.worst.span)record.worst=window;
 }
 record.min=record.max=q;record.minS=record.maxS=a.s;
}
let seed=112;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const agents=[];
for(const w of paths){w.offset=Math.min(.28,w.width-.04,C.walkEndMargin(w));const count=w.count;
 for(let i=0;i<count;i++){
  let s=(i+random()*.85)/count*2*(w.end-w.start+Math.PI*w.offset),pattern={bias:(random()-.5)*.04,amplitude:.04,phase:random()*Math.PI*2},p=context.point(w,s,pattern);
  for(let retry=0;(!p.clear||agents.some(a=>Math.hypot(a.x-p.x,a.z-p.z)<.38))&&retry<80;retry++){s+=.4;p=context.point(w,s,pattern);}
  const a={id:w.id+'-'+i,ordinal:agents.length,path:w,s,initialS:s,pattern,...p,yaw:p.yaw,direction:1,speed:.28+random()*.23,speed120:0,moving:true,walked:0,maxStall:0,stall:0,windowWalk:0,minWindow:Infinity};checkAgent(a);agents.push(a);
 }
}
let maxTurn=0,minGap=Infinity;
for(let i=0;i<18000;i++){
 C.coordinateWalk(agents,1/30);
 const snap=agents.map(a=>({...a}));
 for(const a of agents){
  const nearby=snap.filter(b=>Math.hypot(a.x-b.x,a.z-b.z)<2),old=a.yaw;
  let next=a.recovery121?.goal||context.point(a.path,a.s+a.direction*.45,a.pattern);
  if(!next.clear&&C.recoverWalk(a,agents))next=a.recovery121.goal;
  if(!next.clear){a.speed120=0;a.moving=false;}
  else{
   const move=C.pedestrianStep(a,nearby,1/30,next);
   assert([move.x,move.z,move.yaw,move.progress].every(Number.isFinite),'finite pedestrian step: '+a.id);
   assert(C.walkSegment(a.path,a,move),'swept movement stays clear: '+a.id);
   a.s=C.advanceWalk(a.path,a.s,a,move);a.walked+=move.progress;a.x=move.x;a.z=move.z;a.moving=move.progress>1/30*.025;
  }
  a.stall=a.moving?0:a.stall+1/30;a.maxStall=Math.max(a.maxStall,a.stall);maxTurn=Math.max(maxTurn,Math.abs(Math.atan2(Math.sin(a.yaw-old),Math.cos(a.yaw-old))));
  checkAgent(a);recordSpan(a,i);
 }
 if(i%900===899)for(const a of agents){a.minWindow=Math.min(a.minWindow,a.walked-a.windowWalk);a.windowWalk=a.walked;}
 if(i%3===0)for(let j=0;j<agents.length;j++)for(let k=0;k<j;k++)minGap=Math.min(minGap,Math.hypot(agents[j].x-agents[k].x,agents[j].z-agents[k].z));
}
const worstSpans=[...spans.values()].map(r=>r.worst).sort((a,b)=>a.span-b.span);
console.log('RESULT',JSON.stringify({count:agents.length,maxTurn,minGap,minimum30SecondTravel:Math.min(...agents.map(a=>a.minWindow)),maximumStop:Math.max(...agents.map(a=>a.maxStall)),worst60SecondSpans:worstSpans.slice(0,5),least:agents.slice().sort((a,b)=>a.minWindow-b.minWindow).slice(0,5).map(a=>({id:a.id,walked:a.walked,minWindow:a.minWindow,stall:a.stall,maxStall:a.maxStall,recoveries:a.watch121.recoveries}))},null,2));
assert(maxTurn<=2.4/30+.00001);
assert.equal(agents.length,175,'full fresh scene population');
assert(agents.every(a=>a.maxStall<10),'every pedestrian recovers within ten seconds, including blocked targets');
assert(agents.every(a=>a.minWindow>1),'every pedestrian makes progress in every 30-second window for ten minutes');
assert(worstSpans.every(w=>w.span>1),'every rolling 60-second window leaves a one-unit longitudinal area: '+JSON.stringify(worstSpans.slice(0,3)));
assert(minGap>.28,'simultaneous steps preserve pedestrian spacing');
