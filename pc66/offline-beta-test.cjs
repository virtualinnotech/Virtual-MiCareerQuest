const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{pathToFileURL}=require('node:url'),{execFileSync}=require('node:child_process'),sharp=require('sharp');
(async()=>{const extracted=fs.mkdtempSync(path.join(os.tmpdir(),'pc-beta-test-'));execFileSync('unzip',['-q',path.resolve(__dirname,'../../deliverables/PC-Build-Challenge-Beta.zip'),'-d',extracted]);
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const context=await browser.newContext({offline:true}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(pathToFileURL(path.join(extracted,'PC Build Challenge Beta/START HERE.html')).href);
 await page.waitForFunction(()=>window.PCBuilder66?.view,null,{timeout:60000});
 assert.equal(await page.evaluate(()=>PCBuilder66.state.phase),'learn');assert(await page.locator('#display-build').isHidden());
 await page.evaluate(()=>{const api=PCBuilder66,g=api.game;let guard=0;while(g.state.phase==='learn'&&guard++<50)g.nextLesson();while(g.state.phase==='build'&&guard++<300){const s=g.current();if(s.orientation!=null)while(g.state.orientation!==0)g.rotate();if(s.kind==='instruction')g.continueStep();else if(s.kind==='fasten')for(let i=0;i<s.count;i++)g.act(s.target,i);else g.act(s.target);}if(g.state.phase!=='boot')throw Error('Assembly stopped at '+g.state.step);api.render();});
 await page.locator('#next').click();await page.locator('[data-target="power"]').click();await page.waitForFunction(()=>PCBuilder66.state.completed);
 await page.locator('#display-build').click();assert(await page.evaluate(()=>PCBuilder66.view.award.active));
 await page.waitForTimeout(500);const out=path.resolve(__dirname,'../../work/pc66');await page.screenshot({path:path.join(out,'offline91-award.png')});
 assert((await sharp(await page.locator('#viewport').screenshot()).stats()).channels[0].stdev>15);
 await page.locator('#display-build').click();await page.locator('#next').click();
 await page.waitForFunction(()=>PCBuilder66.race?.snapshot().phase==='ready',null,{timeout:60000});
 await page.getByRole('button',{name:'Ready!',exact:true}).click();await page.waitForFunction(()=>PCBuilder66.race.snapshot().phase==='racing');
 await page.keyboard.down('w');await page.waitForFunction(()=>PCBuilder66.race.snapshot().distance>20);await page.keyboard.up('w');
 await page.screenshot({path:path.join(out,'offline91-race.png')});await page.locator('#next').click();
 await page.locator('#collection-open').click();await page.locator('[data-build="rose"]').click();await page.locator('#display-build').click();
 assert(await page.evaluate(()=>PCBuilder66.view.award.active));
 await page.reload();await page.waitForFunction(()=>window.PCBuilder66?.view);assert.equal(await page.evaluate(()=>PCBuilder66.reward.selected),'rose');assert.equal(await page.evaluate(()=>PCBuilder66.state.phase),'complete');
 await page.setViewportSize({width:390,height:844});await page.locator('#display-build').click();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'offline91-mobile.png')});assert((await sharp(await page.locator('#viewport').screenshot()).stats()).channels[0].stdev>15);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS actual ZIP extracted, file://, internet disabled, lessons and full assembly, startup, display case, racing, collection, persistence and mobile; no external requests',extracted);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
