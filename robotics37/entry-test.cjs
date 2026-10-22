const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20260929-entry1');await page.waitForFunction(()=>window.ChallengeEntry38?.snapshot().ready,null,{timeout:60000});
 async function visit(kind){await page.evaluate(kind=>{const p=ChallengeEntry38.snapshot().entries[kind];places.entryTest={p:[p.x+ (kind==='farm'?1.7:-1.6),floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.02,p.z+.8],scaledPlayer:true,yaw:kind==='farm'?1:-1};teleport('entryTest');state.radius=2.5;updateCamera(0,true);ChallengeEntry38.update();},kind);}
 assert(await page.locator('#farmPanel36').isHidden());assert(await page.locator('#ambulancePanel35').isHidden());
 await visit('farm');assert.equal(await page.evaluate(()=>ChallengeEntry38.nearby()),'farm');await page.screenshot({path:'../work/farm-entry.png'});
 await page.keyboard.press('t');assert(await page.evaluate(()=>Farming36.mounted));await page.waitForTimeout(100);await page.screenshot({path:'../work/farm-top.png'});
 assert(await page.evaluate(()=>{const p=document.querySelector('#farmPanel36').getBoundingClientRect(),s=document.querySelector('#skillHud').getBoundingClientRect();return p.top>=s.bottom&&p.right<=innerWidth&&p.left>=0&&p.bottom<430;}));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.screenshot({path:'../work/farm-top-mobile.png'});
 assert(await page.evaluate(()=>{const p=document.querySelector('#farmPanel36');return p.scrollWidth<=p.clientWidth;}));
 await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});await visit('ambulance');assert.equal(await page.evaluate(()=>ChallengeEntry38.nearby()),'ambulance');await page.screenshot({path:'../work/ambulance-entry.png'});
 await page.keyboard.press('t');assert(await page.evaluate(()=>Ambulance35.mounted));await page.waitForTimeout(100);await page.screenshot({path:'../work/ambulance-top.png'});
 assert(await page.evaluate(()=>{const p=document.querySelector('#ambulancePanel35').getBoundingClientRect(),s=document.querySelector('#skillHud').getBoundingClientRect();return p.top>=s.bottom&&p.right<=innerWidth&&p.left>=0&&p.bottom<430;}));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.screenshot({path:'../work/ambulance-top-mobile.png'});
 assert(await page.evaluate(()=>{const p=document.querySelector('#ambulancePanel35');return p.scrollWidth<=p.clientWidth;}));
 assert.deepEqual(errors,[]);console.log('PASS: both walk-up T entries, hidden idle panels, mounted challenges, top HUD placement, desktop/mobile bounds.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
