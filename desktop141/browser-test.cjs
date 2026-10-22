const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{chromium,devices}=require('playwright');
const out=path.resolve(__dirname,'../../work/hospitality141');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const [name,options,route]of [
  ['iphone',devices['iPhone 13'],'venue-frame.html'],
  ['android',devices['Pixel 7'],'studio-frame.html'],
  ['ipad',{...devices['iPad Pro 11'],userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15'},'venue-frame.html'],
  ['workspace',devices['iPhone 13'],'MiCareerQuest-Ship-to-Venue-v13.html'],
 ]){
  const ctx=await browser.newContext(options),page=await ctx.newPage(),models=[],webgl=[];
  await ctx.exposeBinding('webglAttempt141',()=>webgl.push(true));
  await ctx.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/.test(type))window.webglAttempt141();return get.call(this,type,...args);};});
  page.on('request',r=>{if(/\.(glb|bin)(\?|$)/.test(r.url()))models.push(r.url());});
  await page.goto('http://127.0.0.1:8014/'+route,{waitUntil:'domcontentloaded'}).catch(e=>{if(!/ERR_ABORTED/.test(e.message))throw e;});
  await page.waitForURL('**/computer-required.html');await page.getByRole('heading',{name:'Please Open This on a Computer'}).waitFor();
  assert.deepEqual(models,[],'no 3D model requests on '+name);assert.deepEqual(webgl,[],'no GPU context on '+name);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,'computer-required-'+name+'.png')});await ctx.close();
  console.log('PASS:',name,'message shown without models or WebGL');
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
