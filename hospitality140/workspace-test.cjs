const assert=require('node:assert/strict'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/MiCareerQuest-Ship-to-Venue-v13.html?preview=hospitality140');
  await page.locator('#landingNew').click();
  await page.waitForFunction(()=>window.ShipWorkspace?.studioReady,null,{timeout:180000});
  const studio=await(await page.locator('#studioFrame').elementHandle()).contentFrame();
  await studio.locator('[data-industry="Hospitality"]').click();
  assert.equal(await studio.locator('#industry').inputValue(),'Hospitality');
  await page.evaluate(()=>document.getElementById('sampleBooths').click());
  await page.waitForFunction(()=>ShipWorkspace.boothCount===6&&!document.getElementById('sampleBooths').disabled,null,{timeout:240000});
  const venue=await(await page.locator('#venueFrame').elementHandle()).contentFrame();
  const booths=await venue.evaluate(()=>[...shippedBooths.values()].map(r=>({industry:r.industry,problem:placementProblem(r,r.placement),y:worldBound(r,r.placement).lo[1]})));
  assert.equal(booths.length,6);assert(booths.every(b=>!b.problem));assert(booths.find(b=>b.industry==='Hospitality').y>3);
  await venue.evaluate(()=>{state.paused=true;Crowd.pause(true);CityLighting131.test.setTime(0);discoveryWalk('Hospitality');render();});
  await page.screenshot({path:path.resolve(__dirname,'../../work/hospitality140/workspace.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS: packaged employer workspace selects Hospitality and ships six sector samples, including an upstairs booth.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
