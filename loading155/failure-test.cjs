const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('**/mri42/mri.glb*',r=>r.fulfill({status:503,body:'Test asset unavailable'}));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261020-loading155',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Loading155.snapshot().failed,null,{timeout:180000});
  const failure=await page.evaluate(()=>({status:Loading155.snapshot(),position:[...player.position],paused:state.paused}));
  assert.match(failure.status.failed,/MRI/i);assert(failure.status.blocked&&failure.paused);
  assert(await page.getByRole('button',{name:'Retry',exact:true}).isVisible());
  await page.keyboard.down('w');await page.waitForTimeout(400);await page.keyboard.up('w');
  assert.deepEqual(await page.evaluate(()=>player.position),failure.position);
  console.log('PASS an actual failed world asset retains the loading barrier and offers Retry');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
