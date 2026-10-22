const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20260929-welding1&exhibit=welding');
  await page.waitForFunction(()=>Welding37.snapshot().status==='ready',null,{timeout:60000});
  await page.waitForFunction(()=>Robotics37.snapshot().ready);
  await page.evaluate(()=>{Welding37.visit();state.animateSculptures=true;});
  await page.waitForTimeout(500);
  const before=await page.evaluate(()=>Welding37.snapshot());assert(before.triangles<200000);assert(before.draws>0);
  assert(await page.evaluate(()=>venueSceneJSON.nodes.filter(n=>n.extras?.replacedByWelding37).length===23));
  assert(await page.evaluate(()=>{
   const cleared=venueSceneJSON.nodes.filter(n=>n.extras?.clearedForWelding37);
   return cleared.length===103&&cleared.every(n=>n.mesh===undefined&&!colliders.some(c=>c.name===n.name));
  }),'Surrounding furnishings and their collision must be removed');
  assert(await page.evaluate(()=>colliders.some(c=>c.name==='Welding37 workcell')));
  await page.screenshot({path:'../work/welding-start.png'});
  await page.evaluate(()=>{for(let i=0;i<800;i++)Welding37.update(.05);__walktest.render();});
  const after=await page.evaluate(()=>Welding37.snapshot());assert.notDeepEqual(after.pose,before.pose);
  await page.screenshot({path:'../work/welding-motion.png'});
  await page.evaluate(()=>{for(let i=0;i<1600;i++)Welding37.update(.05);__walktest.render();});
  assert((await page.evaluate(()=>Welding37.snapshot().time))>before.duration,'Animation must continue beyond one full cycle');
  assert(await page.evaluate(()=>{__walktest.render();const pixels=new Uint8Array(100*100*4);gl.readPixels(670,440,100,100,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return new Set(pixels).size>25;}));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>Welding37.visit());await page.screenshot({path:'../work/welding-mobile.png'});
  await page.evaluate(()=>Robotics37.visit());await page.keyboard.press('t');await page.screenshot({path:'../work/console-smaller-mobile.png'});
  await page.locator('#robotTest37').click();assert.equal(await page.evaluate(()=>Robotics37.snapshot().phase),'running');
  assert.deepEqual(errors,[]);console.log('PASS: optimized workcell, statue removed, collision, animated poses, full loop, visible pixels, mobile and console controls.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
