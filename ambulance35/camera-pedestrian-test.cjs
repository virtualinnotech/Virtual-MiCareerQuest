const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
 await page.goto(process.env.VENUE_URL||'http://127.0.0.1:8014/venue-frame.html');
 await page.waitForFunction(()=>window.Ambulance35?.snapshot().status==='ready',null,{timeout:60000});
 await page.waitForFunction(()=>!window.Farming36||Farming36.snapshot().status==='ready',null,{timeout:60000});
 await page.evaluate(()=>{
   const A=Ambulance35;A.visit();window.__oldRadius=state.radius;A.enter();A.test.place(30,43,Math.PI/2);
   const wheel=(delta,mode=0)=>canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:delta,deltaMode:mode,bubbles:true,cancelable:true}));
   wheel(300);if(state.radius<=5)throw Error('Scroll-out still clamps to walking zoom');
   for(let i=0;i<12;i++)wheel(-500);if(state.radius!==2.8)throw Error('Zoom-in limit failed');
   for(let i=0;i<12;i++)wheel(500);if(state.radius!==12||len(sub(camera,target))<8)throw Error('Cannot zoom back out');
   wheel(-4,1);if(state.radius>=12)throw Error('Line-mode wheel failed');
   A.test.place(11.4,-50.4,-1.936);state.orbitYaw=Math.PI/2;state.radius=5;updateCamera(0,true);
   if(len(sub(camera,target))<2.8)throw Error('Bridge rail pushed camera inside cab');
 });
 await page.locator('#ambulanceView35').click();
 assert.equal(await page.evaluate(()=>state.radius),5);
 assert.equal(await page.evaluate(()=>state.orbitYaw),0);
 await page.evaluate(()=>{Ambulance35.exit();if(state.radius!==window.__oldRadius)throw Error('Walking camera was not restored');});
 await page.waitForFunction(()=>CrowdGraphics.ready&&crowdState.sim?.agents.some(a=>a.model),null,{timeout:60000});
 await page.evaluate(()=>{
   const A=Ambulance35,t=A.test,s=t.state,agents=crowdState.sim.agents;
   A.reset();A.visit();A.enter();t.place(30,43,Math.PI/2);
   const npc={...agents.find(a=>a.model),id:999999,player:false,x:32.5,z:43,renderX:32.5,renderZ:43,position:[32.5,0,43]};
   agents.push(npc);
   try{
     npc.position=[30,3,43];npc.x=npc.renderX=30;if(t.pedestrianContact())throw Error('NPC on another floor counted');
     npc.position=[30,0,44];npc.z=npc.renderZ=44;if(t.pedestrianContact())throw Error('Nearby sidewalk NPC counted as contact');
     npc.position=[32.5,0,43];npc.x=npc.renderX=32.5;npc.z=npc.renderZ=43;
     t.controls.add('w');for(let i=0;i<200&&s.phase==='running';i++)A.update(.008,s.started+(s.elapsed+.008)*1000);
     if(s.phase!=='pedestrian'||s.speed!==0||s.points!==0)throw Error('Pedestrian collision did not immediately fail');
     if($('ambulanceResultText35').textContent!=='You hit a pedestrian. Challenge failed.')throw Error('Wrong failure message');
     const x=s.x,z=s.z;t.controls.add('w');A.update(.1);if(s.x!==x||s.z!==z)throw Error('Ambulance moved after pedestrian failure');
     if(t.debris.length)throw Error('Pedestrian contact generated crash debris');
   }finally{agents.splice(agents.indexOf(npc),1);}
   updateCamera(0,true);__walktest.render();
 });
 await page.screenshot({path:'../work/ambulance-pedestrian.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../work/ambulance-pedestrian-mobile.png'});
 const panel=await page.locator('#ambulancePanel35').boundingBox(),result=await page.locator('#ambulanceResult35').boundingBox();assert(result.y>panel.y+panel.height);assert(panel.y+panel.height<=844);
 await page.evaluate(()=>{Ambulance35.reset();if(Ambulance35.snapshot().phase!=='ready')throw Error('Retry failed');});
 assert.deepEqual(errors,[]);console.log('PASS: wheel zoom both directions, bounds, line-mode scrolling, bridge camera clearance, reset view, walking camera restore, actual NPC contact, vertical/near-miss exclusions, failure, immobilization and retry.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
