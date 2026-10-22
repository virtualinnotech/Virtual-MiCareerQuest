const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),sharp=require('sharp');
const report=require('./report.json'),out=path.resolve(__dirname,'../../work/city106');
const context={window:{},URL,URLSearchParams,location:{search:''},document:{currentScript:{src:'http://localhost/city106/runtime.js'}},console};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8'),context);
const phase=context.window.City106.trafficState;
for(let seconds=-44;seconds<132;seconds+=.125){const p=phase(seconds);assert(p.ns==='red'||p.ew==='red','cross traffic never enabled together');}
for(const [t,ns,ew]of[[0,'green','red'],[18,'yellow','red'],[21,'red','red'],[22,'red','green'],[40,'red','yellow'],[43,'red','red'],[44,'green','red']]){assert.equal(phase(t).ns,ns);assert.equal(phase(t).ew,ew);}
assert.equal(report.signals.intersections.length,14);assert.equal(report.signals.signalCount,44);
assert(report.bytes<8_500_000);assert(report.uniqueTriangles<40_000);
assert(report.signals.intersections.filter(p=>Math.abs(p.z-42.9)<.01&&p.x>-30&&p.x<66).every(p=>!p.approaches.includes('north')),'T junctions do not signal into the building');
console.log('PASS full signal cycle, all-red clearance, T-junction approaches, shared asset budgets');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261013-signals108');
  await page.waitForFunction(()=>City106.snapshot().ready&&characterState.player&&Crowd.snapshot().status==='ready',null,{timeout:180000});
  const signal=report.signals.placements.find(s=>s.from==='west'&&Math.abs(s.p[0]-15)<5&&Math.abs(s.p[2]-45)<5),head=report.lightClearance.find(s=>s.name===signal.name).head;
  await page.evaluate(({head,yaw})=>{state.paused=true;Crowd.pause(true);player.position=[head[0],.35,head[2]];state.overview={camera:[head[0]+Math.sin(yaw)*3,head[1],head[2]+Math.cos(yaw)*3],target:head};updateCamera(0,true);},{head,yaw:signal.yaw});
  const stats=await page.evaluate(()=>City106.snapshot());console.log('SIGNALS',stats);
  const expectedSignals=await page.evaluate(placements=>placements.filter(s=>!HarvestCore36.inField(s.p[0],s.p[2])).length,report.signals.placements);
  assert.equal(stats.activeSignals,expectedSignals,'all signals outside the farm scene load');assert(stats.activeSignals>30);assert(stats.uniquePropBatches<=82);
  const snapshots=[];
  for(const [time,color]of[[10,'red'],[25,'green'],[41,'yellow'],[43.5,'clearance']]){
   const result=await page.evaluate(t=>{
    City106.setTrafficTime(t);render();const expected=City106.trafficState(t),heads=new Map();
    for(const b of City106.batches.filter(b=>b.traffic108)){if(!heads.has(b.name))heads.set(b.name,[]);if(b.emission.some(n=>n>0))heads.get(b.name).push(b.traffic108.color);}
    const invalid=Array.from(heads).filter(([name,colors])=>{const b=City106.batches.find(b=>b.name===name&&b.traffic108);return colors.length!==1||colors[0]!==expected[b.traffic108.axis];});
    return {invalid,heads:heads.size,buffers:City106.batches.filter(b=>b.traffic108).map(b=>b.sharedKey)};
   },time);
   assert.equal(result.invalid.length,0,'one correct illuminated lens per signal');
   const shot=await page.locator('#canvas').screenshot();snapshots.push(await sharp(shot).raw().toBuffer());
   await page.screenshot({path:path.join(out,'traffic-'+color+'.png')});
  }
  for(let i=1;i<3;i++){let changed=0;for(let k=0;k<snapshots[0].length;k++)if(Math.abs(snapshots[i][k]-snapshots[0][k])>25)changed++;assert(changed>300,'visible red/yellow/green pixel changes');}
  const auto=await page.evaluate(async()=>{City106.setTrafficTime(null);const now=performance.now.bind(performance),base=now();performance.now=()=>base+50000;render();const actual=City106.snapshot().trafficPhase,expected=City106.trafficState((base+50000)/1000).phase;performance.now=now;return {actual,expected};});assert.equal(auto.actual,auto.expected,'normal render updates signal time');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{City106.setTrafficTime(25);render();});
  assert((await sharp(await page.locator('#canvas').screenshot()).stats()).channels.some(c=>c.stdev>20));await page.screenshot({path:path.join(out,'traffic-mobile.png')});
  assert.deepEqual(errors,[]);console.log('PASS live signals, phase rendering, visible pixel changes, automatic cycling, desktop/mobile and no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
