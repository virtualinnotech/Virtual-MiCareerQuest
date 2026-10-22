const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?challenge=mri&v=test42');await p.waitForFunction(()=>window.MRI42?.snapshot().ready,{timeout:120000});
 await p.evaluate(()=>document.getElementById('controlsPopup').classList.add('hidden'));await p.waitForTimeout(1200);
 await p.waitForFunction(()=>characterState.player,{timeout:120000});await p.screenshot({path:'../work/mri-room.png'});
 const original=await p.evaluate(()=>characterState.player.model.id);
 await p.keyboard.down('w');await p.waitForFunction(()=>MRI42.inside,{timeout:15000});await p.keyboard.up('w');assert.equal(await p.evaluate(()=>characterState.player.model.id),'mri-doctor');
 await p.keyboard.down('w');await p.waitForFunction(()=>player.position[2]<MRI42.snapshot().position[2]+1.4,{timeout:15000});await p.keyboard.up('w');
 await p.keyboard.down('s');await p.waitForFunction(()=>player.position[2]>MRI42.snapshot().position[2]+2.05,{timeout:15000});await p.keyboard.up('s');
 await p.evaluate(()=>{const c=MRI42.test.computer;player.position=[c[0],c[1]+PHYSICS.radii[1],c[2]+.5];player.yaw=0;state.firstPerson=true;state.pitch=0;updateCamera(0,true);});await p.waitForTimeout(500);await p.screenshot({path:'../work/mri-suite-window.png'});
 await p.keyboard.press('t');await p.getByRole('button',{name:'Patient ready',exact:true}).click();assert.equal(await p.evaluate(()=>MRI42.snapshot().phase),'screening');
 await p.locator('#mriPanel42 input[type=checkbox]').evaluateAll(es=>es.forEach(e=>e.click()));await p.getByRole('button',{name:'Patient ready',exact:true}).click();
 await p.evaluate(()=>{const c=MRI42.snapshot().position;player.position=[c[0]+.65,c[1]+PHYSICS.radii[1],c[2]+1.1];player.yaw=.7;state.pitch=-.1;updateCamera(0,true);});await p.waitForTimeout(300);await p.screenshot({path:'../work/mri-gown-seated.png'});
 await p.keyboard.press('t');await p.waitForFunction(()=>MRI42.snapshot().phase==='positioned',{timeout:15000});await p.screenshot({path:'../work/mri-lying.png'});
 const goScanner=()=>p.evaluate(()=>{const c=MRI42.snapshot().position;player.position=[c[0]+.75,c[1]+PHYSICS.radii[1],c[2]+.5];player.yaw=0;state.radius=1.5;updateCamera(0,true);});
 const goComputer=()=>p.evaluate(()=>{const c=MRI42.test.computer;player.position=[c[0],c[1]+PHYSICS.radii[1],c[2]+.65];player.yaw=0;state.radius=1.5;updateCamera(0,true);});
 const advance=()=>p.evaluate(()=>{for(let i=0;i<110;i++)MRI42.test.game.tick(.1);});
 await goScanner();await p.waitForTimeout(300);await p.getByRole('button',{name:'Press MRI scanner button',exact:true}).click();await p.waitForFunction(()=>MRI42.snapshot().bed>.3,{timeout:15000});await p.screenshot({path:'../work/mri-table-moving.png'});await advance();await goComputer();await p.waitForTimeout(300);await p.keyboard.press('t');await p.getByRole('button',{name:'The image is clear',exact:true}).click();assert.equal(await p.evaluate(()=>MRI42.snapshot().phase),'review');await p.getByRole('button',{name:'Blurry: scan again',exact:true}).click();assert.equal(await p.evaluate(()=>MRI42.snapshot().phase),'repeat');await p.getByRole('button',{name:'Return to room',exact:true}).click();
 await goScanner();await p.waitForTimeout(300);await p.keyboard.press('t');await advance();await goComputer();await p.waitForTimeout(300);await p.keyboard.press('t');await p.getByRole('button',{name:'The image is clear',exact:true}).click();assert.equal(await p.evaluate(()=>MRI42.snapshot().phase),'interpret');
 await p.getByRole('button',{name:'Check my answer',exact:true}).click();assert.equal(await p.evaluate(()=>MRI42.snapshot().phase),'interpret');
 for(const i of [1,2]){await p.getByRole('tab',{name:i===1?'View 2':'View 3',exact:true}).click();const region=await p.evaluate(i=>MRICore42.regions[i],i),r=await p.locator('#mriScan42').boundingBox();await p.mouse.click(r.x+(256+(region[0]-.5)*430)/512*r.width,r.y+(256+(region[1]-.5)*490)/512*r.height);}
 const pixels=await p.locator('#mriScan42').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,512,512).data;let n=0;for(let i=0;i<d.length;i+=16)if(d[i]>30)n++;return n;});assert(pixels>5000);
 await p.screenshot({path:'../work/mri-workstation.png'});await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:'../work/mri-mobile.png'});const bounds=await p.locator('#mriPanel42').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=390);await p.setViewportSize({width:1440,height:1000});
 await p.locator('#mriSide42').selectOption('left');await p.locator('#mriFinding42').selectOption('focal');await p.locator('#mriHandoff42').selectOption('radiologist');await p.getByRole('button',{name:'Check my answer',exact:true}).click();await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>MRI42.snapshot().phase),'complete');assert.equal(await p.locator('#skillHud').evaluate(e=>getComputedStyle(e).display),'block');await p.screenshot({path:'../work/mri-complete.png'});await p.getByRole('button',{name:'Ok',exact:true}).click();assert.equal(await p.evaluate(()=>MRI42.active),false);assert.deepEqual(errors,[]);console.log('PASS: complete MRI UI workflow, animated patient/table, scanner click, quality retry, evidence, mobile bounds, canvas pixels, skills restoration, no browser errors');
 await p.evaluate(()=>MRI42.visit());await p.waitForFunction(()=>!MRI42.inside);assert.equal(await p.evaluate(()=>characterState.player.model.id),original);console.log('PASS: walk through both medical doors, doctor role and student restoration');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
