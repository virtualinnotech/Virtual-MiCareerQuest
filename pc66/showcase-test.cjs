const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&m.text().includes('THREE.'))errors.push(m.text());});
  await page.goto('http://127.0.0.1:8014/pc66/index.html?v=20261009-detail78');
  await page.waitForFunction(()=>window.PCBuilder66?.view,null,{timeout:120000});
  await page.locator('#reference').check();await page.waitForTimeout(500);
  // Four GPU fans and raised solder contacts increase the previous simplified model budget.
  const snapshot=await page.evaluate(()=>PCBuilder66.view.snapshot());console.log('RENDER BUDGET',snapshot.drawCalls,snapshot.triangles);assert(snapshot.drawCalls<340);assert(snapshot.triangles<200000);
  async function image(name){await page.waitForTimeout(300);await page.screenshot({path:'../work/pc66/detail78-'+name+'.png'});}
  await image('desktop');
  const screen=()=>page.evaluate(()=>PCBuilder66.view.groups.cooler.getObjectByName('CPU cooler display').material.map.image.toDataURL());
  const first=await screen();await page.waitForTimeout(300);assert.notEqual(await screen(),first);
  for(const [name,position]of [['side',[-6.4,2.3,.1]],['rear',[-3.5,2.9,-5.4]],['front',[.1,2.3,6.4]],['underside',[-4.8,.75,3.9]]]){
   await page.evaluate(p=>{const {camera,controls}=PCBuilder66.view;camera.position.set(...p);controls.target.set(0,1.49,0);controls.update();},position);await image(name);
  }
  await page.locator('#home').click();await page.setViewportSize({width:390,height:844});await page.locator('#home').click();await image('mobile');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const pixels=await page.evaluate(()=>{const {renderer}=PCBuilder66.view,g=renderer.getContext(),data=new Uint8Array(g.drawingBufferWidth*g.drawingBufferHeight*4);g.readPixels(0,0,g.drawingBufferWidth,g.drawingBufferHeight,g.RGBA,g.UNSIGNED_BYTE,data);let bright=0,color=0;for(let i=0;i<data.length;i+=4){if(data[i]+data[i+1]+data[i+2]>600)bright++;if(Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2])>40)color++;}return {bright,color,total:data.length/4};});
  assert(pixels.bright>pixels.total*.02);assert(pixels.color>pixels.total*.01);assert.deepEqual(errors,[]);
  console.log('PASS multi-angle desktop/mobile rendering, animated cooler display, neon pixels and rendering budget',snapshot.drawCalls,snapshot.triangles);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
