const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=annex-test&challenge=network');
  await page.waitForFunction(()=>window.Network40?.snapshot().ready,null,{timeout:90000});
  assert(!await page.evaluate(()=>Network40.snapshot().started));
  await page.screenshot({path:'../work/network-annex-entry.png'});
  await page.keyboard.down('w');
  await page.waitForFunction(()=>Network40.snapshot().inside,null,{timeout:10000});
  await page.keyboard.up('w');
  assert(await page.evaluate(()=>Network40.snapshot().started));
  assert(await page.evaluate(()=>Network40.snapshot().swing[0].angle>0));
  await page.keyboard.down('w');await page.waitForTimeout(850);await page.keyboard.up('w');
  await page.waitForFunction(()=>Math.abs(Network40.snapshot().swing[0].angle)<.02,null,{timeout:10000});
  await page.screenshot({path:'../work/network-annex-inside.png'});
  await page.evaluate(()=>{player.yaw=Math.PI;updateCamera(0,true);});
  await page.keyboard.down('w');
  await page.waitForFunction(()=>Network40.snapshot().swing[0].angle<-.2,null,{timeout:10000});
  await page.waitForFunction(()=>!Network40.snapshot().inside,null,{timeout:10000});
  await page.waitForFunction(()=>player.position[2]>Network40.snapshot().entrance[2]+.85,null,{timeout:10000});await page.keyboard.up('w');
  await page.waitForFunction(()=>Math.abs(Network40.snapshot().swing[0].angle)<.02,null,{timeout:10000});
  assert(await page.locator('#networkNotice40').isHidden());
  assert.equal(await page.evaluate(()=>Network40.snapshot().racks.length),9);
  for(let i=0;i<9;i++)await page.evaluate(i=>{const p=Network40.snapshot().racks[i];places.rackCheck={p:[p[0],p[1]+PHYSICS.radii[1]+.02,p[2]+.55],scaledPlayer:true,yaw:0};teleport('rackCheck');Network40.update(0);if(Network40.snapshot().nearest!==i)throw Error('Wrong cabinet '+i);},i);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>Network40.visit());await page.screenshot({path:'../work/network-annex-mobile.png'});
  assert.deepEqual(errors,[]);console.log('PASS: actual entry/exit, bidirectional spring doors, entry-only start, nine reachable cabinets, mobile render.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
