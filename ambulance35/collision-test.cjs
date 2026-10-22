const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
 await page.goto(process.env.VENUE_URL||'http://127.0.0.1:8014/venue-frame.html');
 await page.waitForFunction(()=>['ready','error'].includes(window.Ambulance35?.snapshot().status),null,{timeout:60000});
 await page.waitForFunction(()=>!window.Farming36||Farming36.snapshot().status==='ready',null,{timeout:60000});
 assert.equal(await page.evaluate(()=>Ambulance35.snapshot().status),'ready');
 const result=await page.evaluate(()=>{
   const A=Ambulance35,t=A.test,s=t.state,c=t.controls;
   function start(x,z,yaw){A.reset();A.visit();A.enter();t.place(x,z,yaw);}
   function run(seconds,until=()=>false){for(let i=0;i<Math.ceil(seconds/.008);i++){A.update(.008,s.started+(s.elapsed+.008)*1000);if(until())break;}}
   start(8,43,0);c.add('w');run(1.15);
   if(s.z<45.5||s.speed<4||s.health!==100)throw Error('Invisible course edge still blocks driving');
   start(-5,43,Math.PI/2);c.add('w');run(.5);if(!s.warning.startsWith('Off course'))throw Error('Missing off-course warning');
   start(30,43,-Math.PI/2);c.add('w');run(.5);if(!s.warning.startsWith('Wrong way'))throw Error('Missing wrong-way warning');
   t.place(30,43,Math.PI/2);c.add('w');run(.5);if(s.warning)throw Error('Warning did not clear when heading returned');
   const hits=[];
   for(const [name,x,z,yaw=Math.PI] of [['School_bus',6,43.8],['trunk',11.85,43.5],['Hospital',-24,-69.6],['Blue_Bridge',11.4,-50.4,Math.atan2(.357,-.934)]]){
     start(x,z,yaw);c.add('w');run(3,()=>s.impacts>0);
     if(s.impacts!==1||s.health>=100||!s.lastHit.includes(name))throw Error('Missing '+name+' collision: '+JSON.stringify(A.snapshot()));
     if(t.debris.length<5)throw Error('Missing collision debris');
     hits.push({object:s.lastHit,health:s.health,speed:s.speed});
     if(s.speed>=0)throw Error('Impact did not rebound: '+JSON.stringify(hits.at(-1)));
   }
   if(!t.physics.shapes.some(p=>p.radius&&p.name.startsWith('City_tree_')))throw Error('Decorative city trunks have no vehicle colliders');
   start(10,-45,0);run(.016);if(s.phase!=='water'||s.health!==0)throw Error('Driving into the river should disable the vehicle');
   // Repeated independent impacts must eventually disable driving and award no points.
   start(6,43.8,Math.PI);
   for(let i=0;i<8&&s.phase==='running';i++){
     t.place(6,43.8,Math.PI);c.add('w');const count=s.impacts;run(3,()=>s.impacts>count);
   }
   if(s.phase!=='breakdown'||s.health!==0||s.points!==0)throw Error('Repeated hits did not fail the challenge: '+JSON.stringify(A.snapshot()));
   const pos=[s.x,s.z];c.add('w');run(.5);if(Math.hypot(s.x-pos[0],s.z-pos[1])>.001)throw Error('Broken ambulance still drives');
   updateCamera(0,true);__walktest.render();
   return {hits,breakdown:A.snapshot(),shapes:t.physics.shapes.length};
 });
 console.log(JSON.stringify(result,null,2));
 await page.screenshot({path:'../work/ambulance-breakdown.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'../work/ambulance-damage-mobile.png'});
 const resultBox=await page.locator('#ambulanceResult35').boundingBox();
 assert(resultBox&&resultBox.x>=0&&resultBox.x+resultBox.width<=390&&resultBox.y+resultBox.height<=844);
 await page.evaluate(()=>{Ambulance35.reset();if(Ambulance35.snapshot().health!==100||Ambulance35.test.debris.length)throw Error('Reset did not repair vehicle and clear debris');});
 assert.deepEqual(errors,[]);console.log('PASS: free driving, warnings, physical bus/tree/building impacts, bounce, debris, damage, breakdown, reset and mobile layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
