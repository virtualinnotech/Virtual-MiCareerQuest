const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const views={
 gallery:{camera:[.7,1.6,22],target:[0,5,-10],player:[0,.6,22]},
 entrance:{camera:[-11,4,46],target:[0,5,35],player:[-11,.35,46]},
 street:{camera:[-26,1.3,38.5],target:[-55,2,38.5],player:[-26,.35,38.5]},
 river:{camera:[-11,1.1,-32],target:[-17,1.5,-38],player:[-11,.35,-32]},
 cityLife:{camera:[65.65,1.12,24],target:[69,.6,7],player:[65.6,.4,15]},
 hall:{camera:[18,2,4],target:[32,1.5,-9],player:[18,.6,4]}
};
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('mcqOnboardingDone_v1','1');localStorage.setItem('mcqScooterReward_v1',JSON.stringify({seen:true}));});
  await page.goto('http://127.0.0.1:8014/venue-frame.html?v=city106-'+Date.now());
  await page.waitForFunction(()=>window.Scooter100?.snapshot().ready&&characterState.player,null,{timeout:180000});
  await page.waitForTimeout(10000);
  const label=process.argv[2]||'after',out=path.resolve(__dirname,'../../work/city106');fs.mkdirSync(out,{recursive:true});
  const results={errors,views:{}};
  for(const [name,view] of Object.entries(views)){
   await page.evaluate(v=>{Crowd.pause(true);player.position=[...v.player];state.overview=v;updateCamera(0,true);},view);
   await page.waitForTimeout(600);
   results.views[name]=await page.evaluate(async()=>{
    const frames=[];
    for(let i=0;i<24;i++){
     await new Promise(requestAnimationFrame);const t=performance.now();render();gl.finish();
     frames.push({ms:performance.now()-t,draws:MCQPerformance21.meter.last.draws,triangles:MCQPerformance21.meter.last.triangles});
    }
    const report=MCQPerformance21.report();
    return {medianMs:frames.map(f=>f.ms).sort((a,b)=>a-b)[12],draws:frames[23].draws,triangles:frames[23].triangles,groups:MCQPerformance21.meter.last.groups,settings:report.settings,gpu:report.gpu,crowd:report.crowd,model:state.modelStats};
   });
   await page.screenshot({path:path.join(out,label+'-'+name+'.png')});
   console.log(name,JSON.stringify({ms:results.views[name].medianMs,draws:results.views[name].draws,triangles:results.views[name].triangles}));
  }
  fs.writeFileSync(path.join(out,label+'.json'),JSON.stringify(results,null,2));
  console.log('Errors',errors);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
