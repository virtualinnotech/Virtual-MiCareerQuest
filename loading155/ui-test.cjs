const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../../work/loading155'),venue=fs.readFileSync(path.join(__dirname,'../venue-frame.html'),'utf8'),start=venue.indexOf('<div id="loading" role="dialog"'),end=venue.indexOf('<script>Loading155.mount();</script>',start);
const fixture=`<!doctype html><html><head><link rel="stylesheet" href="/loading155/loading.css"><style>[hidden]{display:none!important}</style><script src="/loading155/loading.js"></script></head><body><button id="game">Game action</button><button id="already-inert" inert>Unavailable</button>${venue.slice(start,end)}<script>Loading155.mount();window.actions=0;document.querySelector('#game').onclick=()=>actions++;</script></body></html>`;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});await page.route('**/loading-fixture155',r=>r.fulfill({contentType:'text/html',body:fixture}));
  await page.route('**/loading155/art/front-entrance.webp',r=>r.fulfill({status:404,body:'Missing optional artwork'}));
  await page.goto('http://127.0.0.1:8014/loading-fixture155');await page.waitForFunction(()=>document.querySelector('.loading-slide.is-visible'));
  assert.equal(await page.evaluate(()=>Loading155.snapshot().slide),1,'missing artwork advances to the next image');
  assert.deepEqual(await page.evaluate(()=>Loading155.snapshot().artwork.slice(0,6)),['Front Entrance','Ambulance','Grand Gallery','River Walk','Farming','Exhibit Hall']);
  assert.equal(await page.locator('#loadingPlace155').textContent(),'Ambulance');
  await page.waitForFunction(()=>document.querySelector('.loading-title-image').naturalWidth===3092);
  assert.equal(await page.getByRole('heading',{name:'Virtual MiCareerQuest'}).count(),1);
  async function checkTitleFit(){
   assert(await page.evaluate(()=>{const title=document.querySelector('.loading-title-image').getBoundingClientRect(),status=document.querySelector('.loading-status').getBoundingClientRect(),bar=document.querySelector('progress').getBoundingClientRect();return title.x>=0&&title.y>=0&&title.right<=innerWidth&&title.bottom<status.top&&status.bottom<bar.top&&bar.bottom<innerHeight;}),'logo, status and progress bar fit without overlapping');
  }
  await checkTitleFit();await page.screenshot({path:path.join(out,'loading-title-desktop.png')});
  await page.setViewportSize({width:844,height:390});await checkTitleFit();await page.screenshot({path:path.join(out,'loading-title-short.png')});
  await page.setViewportSize({width:390,height:844});await checkTitleFit();
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'loading-mobile-ui.png')});await page.setViewportSize({width:1280,height:800});
  assert.equal(await page.evaluate(()=>document.querySelector('.loading-slide').getAnimations().length),0);
  const p=await page.evaluate(()=>Loading155.snapshot().progress);await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>Loading155.snapshot().progress),p,'time does not fabricate progress');
  assert(await page.evaluate(()=>document.querySelector('#game').inert));
  const early=await page.evaluate(()=>Loading155.finish().then(()=>false,()=>true));assert(early,'incomplete assets cannot release input');
  await page.evaluate(()=>Loading155.watch('mri',()=>({error:'MRI model unavailable'})).catch(e=>Loading155.fail(e)));
  assert(await page.getByRole('button',{name:'Retry',exact:true}).isVisible());assert.match(await page.locator('#loadText').textContent(),/MRI model unavailable/);
  assert(await page.evaluate(()=>Loading155.blocked&&document.querySelector('#game').inert));
  await page.screenshot({path:path.join(out,'error-retry.png')});await page.getByRole('button',{name:'Retry',exact:true}).click();await page.waitForLoadState('domcontentloaded');await page.waitForFunction(()=>!Loading155.snapshot().failed);
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert(await page.evaluate(async()=>{for(const t of Loading155.snapshot().tasks)Loading155.done(t.id);const finishing=Loading155.finish();setTimeout(()=>Loading155.fail(Error('Late GPU error')),80);try{await finishing;return false;}catch{return Loading155.blocked;}}),'late errors must not release the input barrier');
  await page.getByRole('button',{name:'Retry',exact:true}).click();await page.waitForLoadState('domcontentloaded');await page.waitForFunction(()=>!Loading155.snapshot().failed);await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>{for(const t of Loading155.snapshot().tasks)Loading155.done(t.id);window.finishing=Loading155.finish();});
  await page.waitForTimeout(200);
  assert(await page.evaluate(()=>Loading155.blocked&&Loading155.snapshot().elapsedMs<Loading155.snapshot().minimumDisplayMs),'ready assets still honor the minimum display time');
  const settling=await page.evaluate(()=>({status:Loading155.snapshot(),text:document.querySelector('#loadText').textContent}));
  assert.equal(settling.status.assetProgress,1);assert(settling.status.progress<1);assert.notEqual(settling.text,'Ready','Ready is reserved for the handoff into the game');
  await page.waitForTimeout(800);
  assert(await page.evaluate(p=>Loading155.snapshot().progress>p,settling.status.progress),'the bar continues filling during the minimum presentation time');
  await page.evaluate(()=>window.finishing);
  assert(await page.evaluate(()=>Loading155.snapshot().elapsedMs>=30000),'loading remains visible for at least 30 seconds');
  await page.locator('#game').click();assert.equal(await page.evaluate(()=>actions),1);
  assert(await page.evaluate(()=>document.querySelector('#already-inert').inert),'restore original inert state');
  console.log('PASS original logo, responsive title, slideshow order, 30-second minimum, reduced motion, real progress, readiness enforcement, failure barrier, accessible retry, and input restoration');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
