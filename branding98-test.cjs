const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261012-logo98&challenge=drone');await page.waitForFunction(()=>window.Drone44?.snapshot().ready,null,{timeout:120000});await page.evaluate(()=>document.getElementById('controlsPopup')?.classList.add('hidden'));
 for(const width of [1440,1024,768,640,390,320]){
  await page.setViewportSize({width,height:width>760?1000:844});await page.waitForTimeout(200);
  const layout=await page.evaluate(()=>{const img=document.querySelector('body>header .brand img'),box=img.getBoundingClientRect(),brand=img.parentElement.getBoundingClientRect(),hud=document.getElementById('skillHud').getBoundingClientRect();return {loaded:img.complete&&img.naturalWidth===904,alt:img.alt,embedded:img.src.startsWith('data:image/png;base64,'),ratio:box.width/box.height,inside:box.left>=0&&box.right<=innerWidth,overlap:Math.max(brand.left,hud.left)<Math.min(brand.right,hud.right)&&Math.max(brand.top,hud.top)<Math.min(brand.bottom,hud.bottom),text:img.parentElement.textContent};});
  assert(layout.loaded&&layout.embedded&&layout.inside);assert.equal(layout.alt,'MiCareerQuest');assert.equal(layout.text,'');assert(Math.abs(layout.ratio-904/178)<.01);assert(!layout.overlap,'logo does not overlap progress at '+width);
  const {data,info}=await sharp(await page.locator('body>header .brand').screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});let red=0,blue=0;for(let i=0;i<data.length;i+=info.channels){if(data[i]>data[i+1]*1.4&&data[i]>data[i+2]*1.2)red++;if(data[i+2]>data[i]*1.3&&data[i+1]>data[i]*1.2)blue++;}assert(red>20&&blue>40,'official logo colors render at '+width);
  if([1440,390,768].includes(width))await page.screenshot({path:path.resolve(__dirname,'../work/logo98-'+width+'.png')});
 }
 await page.evaluate(()=>Drone44.enter());await page.getByRole('button',{name:'Launch drone',exact:true}).click();await page.waitForTimeout(200);assert(await page.locator('body>header').isHidden(),'compact challenge retains its unobstructed HUD');await page.evaluate(()=>Drone44.exit());await page.waitForTimeout(200);assert(await page.locator('body>header .brand').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS official embedded logo, correct aspect/colors, 6 viewport sizes, no progress overlap, challenge hide/restore');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
