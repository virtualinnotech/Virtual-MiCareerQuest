const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/hibachi145');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],assets=[];
 page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});page.on('console',m=>{if(/GL_INVALID|shader.*ERROR|Hibachi145/.test(m.text()))console.log('BROWSER',m.text());});
 page.on('response',r=>{if(r.url().includes('/hibachi145/assets/'))assets.push({url:r.url(),status:r.status()});});
 await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261019-hibachi145&time=night&challenge=hibachi');
 await page.waitForFunction(()=>window.Hibachi145?.snapshot().ready||window.Hibachi145?.snapshot().error,null,{timeout:180000});
 console.log('INIT',await page.evaluate(()=>Hibachi145.snapshot()));
 assert.equal(await page.evaluate(()=>Hibachi145.snapshot().error),null);
 await page.waitForFunction(()=>state.ready&&AnimatedCharacters.hasPlayer(),null,{timeout:180000});
 await page.evaluate(async()=>{await venueLayoutReady;Crowd.pause(true);applyStudentMode();CityLighting131.test.setTime(2100);state.paused=false;Hibachi145.visit();});
 async function shot(name){await page.evaluate(()=>{updateCamera(0,true);render();});const png=await page.screenshot({timeout:120000});fs.writeFileSync(path.join(out,name+'.png'),png);const stats=await sharp(png).extract({left:250,top:200,width:700,height:400}).stats();assert(stats.channels.some(c=>c.stdev>8));assert.equal(await page.evaluate(()=>gl.getError()),0);}
 await shot('station-night');
 console.log('NEAR',await page.evaluate(()=>({near:Hibachi145.near(),player:player.position,snapshot:Hibachi145.snapshot()})));
 await page.keyboard.press('t');assert(await page.evaluate(()=>Hibachi145.active));
 await shot('chef-view');
 await page.locator('[data-action="ticket"]').click();await shot('hood-ticket');await page.locator('[data-action="ticket"]').click();
 async function tick(seconds){await page.evaluate(seconds=>{state.paused=false;for(let t=0;t<seconds;t+=.05)Hibachi145.update(.05);state.paused=true;render();},seconds);}
 async function click(id,seconds=0){await page.evaluate(()=>state.paused=false);await page.locator(':is(#hibachiTop145,#hibachiPanel145) [data-action="'+id+'"]').click();await tick(seconds);}
 const snap=()=>page.evaluate(()=>Hibachi145.snapshot());
 assert(await page.locator('[data-action="serve"]').isDisabled());
 const power=await page.evaluate(()=>Hibachi145.test.project(HibachiScene145.powerSwitch));assert(power[0]>0&&power[0]<1440&&power[1]>0&&power[1]<960,'physical power switch is visible');
 await page.mouse.click(...power);await tick(12);assert.equal((await snap()).phase,'egg');
 await click('egg',.75);await shot('egg-crack');await tick(1.5);assert.equal((await snap()).phase,'scramble');
 await tick(2);assert.equal((await snap()).scramble,0,'mixing cannot complete without input');
 const mix=page.locator('[data-action="scramble"]');await mix.dispatchEvent('pointerdown',{pointerId:1});await tick(1.4);await shot('egg-scramble');await tick(3);await mix.dispatchEvent('pointerup');assert.equal((await snap()).phase,'rice');
 await click('rice',.8);await shot('rice-pour');await tick(1.5);assert.equal((await snap()).phase,'mix');
 const points=await page.evaluate(()=>[[-.29,.440,-.04],[-.15,.440,.02]].map(p=>Hibachi145.test.project(p)));
 await page.mouse.move(...points[0]);await page.mouse.down();for(let i=0;i<8;i++){await page.mouse.move(...points[i%2]);await tick(.1);}await page.mouse.up();assert((await snap()).mix>0,'pointer mixing advances food preparation');
 const rice=page.locator('[data-action="mix"]');await rice.dispatchEvent('pointerdown',{pointerId:1});await tick(1.5);await shot('rice-mixing');await tick(.3);await shot('rice-mixing-next');
 const pixels=async file=>sharp(path.join(out,file+'.png')).extract({left:450,top:390,width:650,height:320}).raw().toBuffer(),a=await pixels('rice-mixing'),b=await pixels('rice-mixing-next');let changed=0;for(let i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>15)changed++;assert(changed/a.length>.005,'cooking animation changes canvas pixels');
 await tick(6);await rice.dispatchEvent('pointerup');assert.equal((await snap()).phase,'proteins');
 await click('steak',.65);await shot('placing-steak');await tick(1);await click('chicken',1.5);await click('shrimp',1.9);assert.equal((await snap()).phase,'cooking');
 assert(await page.locator('[data-action="serve"]').isDisabled());await shot('sizzle');
 await click('flame',.6);await shot('flame');assert((await snap()).flame>0);await tick(2);
 await click('flip',1.3);assert.equal((await snap()).foods.shrimp.flips,1);await click('probe',1.4);assert((await snap()).foods.shrimp.checked);
 await tick(30);const hot=await snap();assert.equal(hot.phase,'serve');assert.equal(hot.foods.chicken.temp,165);assert.equal(hot.foods.steak.temp,135);assert.equal(hot.foods.shrimp.temp,165);await shot('cooked-order');
 await page.setViewportSize({width:1280,height:800});await shot('laptop-cooking');
 const boxes=await page.locator('#hibachiTop145,#hibachiPanel145,#hibachiOrder145').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
 assert(boxes.every(r=>r.x>=0&&r.y>=0&&r.right<=1280&&r.bottom<=800));assert(boxes[1].bottom<boxes[2].y,'temperature ticket clears toolbar');
 await click('serve',1.3);await shot('serving');await tick(3);assert.equal((await snap()).phase,'complete');await shot('served');
 assert(await page.evaluate(()=>JSON.parse(localStorage.getItem(MissionCore99.KEY)).challenges.hibachi));
 await page.keyboard.press('Escape');assert(!(await snap()).active);await page.evaluate(()=>state.paused=false);await page.keyboard.press('t');assert((await snap()).active);assert.equal((await snap()).phase,'complete');
 await click('reset',.1);assert.equal((await snap()).phase,'off');assert(!(await snap()).foods.chicken.placed);await page.keyboard.press('Escape');
 const collision=await page.evaluate(()=>({count:colliders.filter(c=>c.name.startsWith('Hibachi145')).length,slots:DISCOVERY_LAYOUT.sectors.find(s=>s.industry==='Hospitality').slots.length}));assert.equal(collision.count,3);assert.equal(collision.slots,25);
 let boothAudit=null;
 if(process.argv.includes('--booths')){
 await page.evaluate(()=>{const frame=document.createElement('iframe');frame.id='hibachiStudioTest';frame.hidden=true;frame.src='/studio-frame.html';document.body.append(frame);});
 const studio=await (await page.locator('#hibachiStudioTest').elementHandle()).contentFrame();await studio.waitForFunction(()=>window.StudioShipping,null,{timeout:120000});
 await page.evaluate(()=>{let serial=0;window.hibachiSampleTest=payload=>new Promise((resolve,reject)=>{const id='hibachi-test-'+(++serial),w=document.getElementById('hibachiStudioTest').contentWindow;
  const timer=setTimeout(()=>{window.removeEventListener('message',receive);reject(Error('Sample timeout'));},60000);
  function receive(e){if(e.source===w&&e.data?.reply===id){clearTimeout(timer);window.removeEventListener('message',receive);e.data.error?reject(Error(e.data.error)):resolve(e.data.result);}}
  window.addEventListener('message',receive);w.postMessage({_mcq:true,id,action:'sample',payload},'*');
 });});
 for(let i=0;i<25;i++)await page.evaluate(async i=>{const packet=await hibachiSampleTest({id:'hibachi-audit-'+i,name:'Hospitality Employer '+(i+1),industry:'Hospitality',family:i%32,variant:i%12,palette:i%36,size:i%5===0?'wide':'compact'});packet.focus=false;await acceptShipment(packet,false);},i);
 boothAudit=await page.evaluate(()=>{const booths=[...shippedBooths.values()].filter(r=>r.industry==='Hospitality');return {count:booths.length,problems:booths.flatMap(r=>{const problem=placementProblem(r,r.placement);return problem?[problem]:shipmentApproach(r)?[]:['No approach: '+r.id];})};});
 console.log('BOOTH AUDIT',boothAudit);assert.equal(boothAudit.count,25);assert.deepEqual(boothAudit.problems,[]);
 await page.evaluate(()=>{document.getElementById('hibachiStudioTest').remove();state.paused=false;Hibachi145.visit();state.paused=true;});await page.setViewportSize({width:1440,height:960});await shot('station-with-booths');
 await page.evaluate(()=>{state.paused=false;Hibachi145.enter();state.paused=true;});await shot('chef-with-booths');
 await page.evaluate(()=>CityLighting131.test.setTime(900));await shot('chef-day');await page.keyboard.press('Escape');
 }
 assert.equal(assets.length,13);assert(assets.every(a=>a.status===200));assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({passed:true,assets,errors,collision,hot,boxes,boothAudit,movingPixelFraction:changed/a.length},null,2));
 console.log('PASS 13 assets, walk-up T, hood ticket, egg/rice pointer mixing, animated proteins/flame, temperature gate, serving, persistent mission credit, exit/resume/reset and laptop framing');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
