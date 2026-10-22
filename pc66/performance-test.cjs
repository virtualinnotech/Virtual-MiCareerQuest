const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.url().includes('/pc66/models/'))requests.push(r.url().split('/').at(-1));});
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=performance87&challenge=pc');await p.waitForFunction(()=>window.PCChallenge66?.snapshot().displayReady,null,{timeout:120000});
 await p.evaluate(()=>document.getElementById('controlsPopup')?.classList.add('hidden'));await p.waitForTimeout(500);
 const measure=await p.evaluate(async()=>{
  let calls=0,triangles=0;
  const meter=MCQPerformance21.meter,draw=PCChallenge66.draw;
  PCChallenge66.draw=(...args)=>{const c=meter.draws,t=meter.triangles;draw(...args);calls=meter.draws-c;triangles=meter.triangles-t;};
  const frames=[];for(let i=0;i<20;i++){await new Promise(requestAnimationFrame);calls=triangles=0;const t=performance.now();render();gl.finish();frames.push({ms:performance.now()-t,calls,triangles});}
  return {snapshot:PCChallenge66.snapshot(),calls:frames.at(-1).calls,triangles:frames.at(-1).triangles,medianMs:frames.map(f=>f.ms).sort((a,b)=>a-b)[10],maxMs:Math.max(...frames.map(f=>f.ms)),bytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('/pc66/models/')).reduce((n,r)=>n+r.decodedBodySize,0)};
 });
 const out=path.resolve(__dirname,'../../work/pc66'),label=process.argv.includes('--baseline')?'before':'after';fs.writeFileSync(path.join(out,'performance87-'+label+'.json'),JSON.stringify({...measure,requests},null,2));
 await p.screenshot({path:path.join(out,'performance87-'+label+'.png')});
 if(label==='after'){assert(measure.calls>0&&measure.calls<400,'PC exhibit draw-call budget');assert(measure.triangles>10000&&measure.triangles<700000,'PC exhibit triangle budget');assert(measure.bytes>0&&measure.bytes<25000000,'exhibit asset download budget');assert(!requests.some(n=>/^collection86-|equipment86/.test(n)),'full inspection models are never loaded into the venue');assert.equal(measure.snapshot.collectionBuilds.length,11);assert.equal(measure.snapshot.displayError,null);}
 assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels.some(c=>c.stdev>15),'desktop canvas is nonblank');
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:path.join(out,'performance87-'+label+'-mobile.png')});
 assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels.some(c=>c.stdev>15),'mobile canvas is nonblank');assert.deepEqual(errors,[]);console.log(label,measure);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
