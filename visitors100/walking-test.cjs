const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('student'))console.log(m.text());});
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261012-students102');
 await page.waitForFunction(()=>Visitors100.snapshot().ready&&Visitors100.snapshot().visitors.length>=7,null,{timeout:180000});
 const before=await page.evaluate(()=>Visitors100.snapshot());assert.equal(before.error,null);assert.equal(new Set(before.visitors.map(a=>a.id)).size,7);
 await page.waitForTimeout(5000);const after=await page.evaluate(()=>Visitors100.snapshot());
 assert(after.visitors.filter(a=>a.distance>before.visitors.find(b=>b.agentId===a.agentId).distance+.03).length>=7,'Students must actually move through venue routes');
 const rig=await page.evaluate(()=>Array.from(characterState.models.values()).filter(m=>m.id.startsWith('visitor102-')).map(m=>{const a=CrowdGraphics.posePalette(m,m.walk,.1),b=CrowdGraphics.posePalette(m,m.walk,.6);return{id:m.id,skins:m.skins.length,delta:a[0].reduce((s,v,i)=>s+Math.abs(v-b[0][i]),0),valid:a[0].every(Number.isFinite),duration:m.walk.duration};}));
 assert(rig.every(m=>m.skins>0&&m.valid&&m.delta>1),'Every model needs changing bone transforms');console.log('RIGS',rig);
 assert(await page.evaluate(()=>Array.from(characterState.models.values()).filter(m=>m.id.startsWith('visitor102-')).every(m=>m.parts.every(p=>p.source.positions.every(Number.isFinite)&&p.source.normals.every(Number.isFinite)))),'No invalid mesh vertices or normals');
 const seamErrors=await page.evaluate(()=>{const errors=[];for(const m of characterState.models.values()){if(!/^visitor102-(casual|stride|smiling|teenage)/.test(m.id))continue;for(const part of m.parts){const s=part.source,seen=new Map();for(let i=0;i<s.positions.length/3;i++){const key=Array.from(s.positions.subarray(i*3,i*3+3),v=>Math.round(v*1e6)).join(',');const w=new Map();for(let k=0;k<4;k++)w.set(s.joints[i*4+k],(w.get(s.joints[i*4+k])||0)+s.weights[i*4+k]);if(seen.has(key)){const a=seen.get(key);if([...new Set([...a.keys(),...w.keys()])].some(j=>Math.abs((a.get(j)||0)-(w.get(j)||0))>1e-4))errors.push(m.id);}else seen.set(key,w);}}}return errors;});assert.deepEqual(seamErrors,[],'Coincident UV-seam vertices must deform together');
 await page.evaluate(()=>{crowdState.paused=true;});
 for(const id of ['student2','green','casual','stride-a','stride-b','smiling','teenage']){
  await page.evaluate(id=>{const a=crowdState.sim.agents.find(a=>a.visitor102===id);const x=a.renderX,z=a.renderZ,y=floorHeightAt(x,z),s=sectorScaleAt(x,z);state.overview={camera:[x+Math.sin(a.yaw)*1.05,y+.5*s,z+Math.cos(a.yaw)*1.05],target:[x,y+.40*s,z]};state.firstPerson=true;updateCamera(0,true);render();},id);
  await page.waitForTimeout(150);await page.screenshot({path:path.resolve(__dirname,`../../work/students102-venue-${id}.png`)});
 }
 await page.evaluate(()=>{state.overview=null;crowdState.paused=false;Visitors100.visit();});await page.waitForTimeout(300);await page.screenshot({path:path.resolve(__dirname,'../../work/students102-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);const image=await page.screenshot({path:path.resolve(__dirname,'../../work/students102-mobile.png')});const stats=await sharp(image).stats();assert(stats.channels.some(c=>c.stdev>20),'Canvas must not be blank');assert.deepEqual(errors,[]);console.log('PASS repaired student rendering, all 7 rigs animate, walking routes, mobile pixels, no page errors');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
