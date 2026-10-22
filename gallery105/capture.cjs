const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>console.log('ERROR',e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=gallery105-'+Date.now());
  await page.waitForFunction(()=>window.Scooter100?.snapshot().ready&&characterState.player,null,{timeout:120000});
  await page.evaluate(()=>{Crowd.pause(true);});
  if(process.argv.includes('--no-shadows'))await page.evaluate(()=>{state.sunShadows=false;});
  const views={exterior:{camera:[-11,5.5,46],target:[0,5.3,35]},front:{camera:[.5,3,44],target:[0,5.5,35]},entry:{camera:[1,1.8,34],target:[-1,6,24]},gallery:{camera:[.7,1.6,22],target:[0,4,-10]},reverse:{camera:[-.5,1.8,-21],target:[-.5,5,25]},hall:{camera:[18,3.2,4],target:[32,1.5,-9]}};
  for(const [name,view] of Object.entries(views)){
   await page.evaluate(v=>{state.overview=v;updateCamera(0,true);},view);
   await page.waitForTimeout(250);
   await page.screenshot({path:path.resolve(__dirname,'../../work/gallery105-'+(process.argv[2]||'before')+'-'+name+'.png')});
  }
  console.log('Captured',Object.keys(views));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
