const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/pc66');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8014/pc66/index.html?v=collection86');await page.waitForFunction(()=>window.PCBuilder66?.view);
 assert(await page.locator('#collection-open').isHidden());
 await page.evaluate(()=>{const a=PCBuilder66,g=a.game;for(const p of a.parts)g.nextLesson();for(const step of a.buildSteps){if(step.kind==='instruction')g.continueStep();else{while(g.state.orientation)g.rotate();for(let i=0;i<(step.count||1);i++)g.act(step.target,i);}}for(const step of a.bootSteps)g.boot();a.render();});
 assert(await page.locator('#collection-open').isVisible());assert.equal(await page.evaluate(()=>PCBuilder66.reward.unlocked),true);
 await page.waitForTimeout(700);
 // The original thumbnail is rendered from the same build as the workshop.
 const original=await page.evaluate(()=>{const v=PCBuilder66.view;v.suspend(true);v.desktop.root.visible=v.desktop.cables.visible=false;v.renderer.setPixelRatio(1);v.renderer.setSize(480,400);v.camera.aspect=1.2;v.camera.updateProjectionMatrix();v.camera.position.set(-5.6,3.7,5.9);v.camera.lookAt(0,1.5,0);v.renderer.render(v.scene,v.camera);return v.renderer.domElement.toDataURL();});
 await sharp(Buffer.from(original.split(',')[1],'base64')).jpeg({quality:90}).toFile(path.join(__dirname,'pictures/collection-original.jpg'));
 await page.reload();await page.waitForFunction(()=>window.PCBuilder66?.view);
 // Completed legacy saves earn the same collection; choose a reward after a practice restart.
 await page.locator('#collection-open').click();assert.equal(await page.locator('.collection-tile').count(),11);
 await page.getByRole('button',{name:'Use Rose Quartz',exact:true}).click();
 await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>PCBuilder66.state.phase),'complete');assert.equal(await page.evaluate(()=>PCBuilder66.view.snapshot().selectedPC),'rose');
 const counts=await page.evaluate(()=>{const c=PCBuilder66.view.collection;return {fans:c.rotors.length,vertices:(()=>{let n=0;c.root.traverse(o=>{if(o.isMesh)n+=o.geometry.attributes.position.count;});return n;})()};});assert(counts.fans>=13);assert(counts.vertices>40000);
 await page.screenshot({path:path.join(out,'collection86-rose-setup.png')});
 for(const id of ['aurora','polar','ember','sunset','glacier','stealth','gold','emerald','inferno']){
  await page.locator('#collection-open').click();await page.locator('[data-build="'+id+'"]').click();await page.waitForTimeout(140);assert.equal(await page.evaluate(()=>PCBuilder66.view.snapshot().selectedPC),id);
  assert((await sharp(await page.locator('#viewport').screenshot()).stats()).channels[0].stdev>12);
 }
 await page.locator('#collection-open').click();await page.screenshot({path:path.join(out,'collection86-lineup.png')});await page.getByRole('button',{name:'Use Aurora Loop',exact:true}).click();
 await page.reload();await page.waitForFunction(()=>window.PCBuilder66?.view);assert.equal(await page.evaluate(()=>PCBuilder66.view.snapshot().selectedPC),'aurora');
 await page.locator('#restart').click();await page.locator('#confirm-reset').click();assert.equal(await page.evaluate(()=>PCBuilder66.state.phase),'learn');assert(await page.locator('#collection-open').isVisible());
 await page.locator('#collection-open').click();await page.getByRole('button',{name:'Use Gold Edition',exact:true}).click();assert.equal(await page.evaluate(()=>PCBuilder66.state.phase),'complete');
 await page.locator('#next').click();await page.waitForFunction(()=>PCBuilder66.race?.snapshot().phase==='ready',null,{timeout:60000});assert.equal(await page.evaluate(()=>PCBuilder66.view.collection.root.visible),true);await page.keyboard.press('Enter');await page.waitForFunction(()=>PCBuilder66.race.snapshot().phase==='racing');await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>PCBuilder66.race.snapshot().speed),0);await page.keyboard.down('w');await page.waitForFunction(()=>PCBuilder66.race.snapshot().speed>2);await page.keyboard.up('w');await page.screenshot({path:path.join(out,'collection86-racing.png')});await page.locator('#next').click();
 await page.setViewportSize({width:390,height:844});await page.locator('#home').click();await page.locator('#collection-open').click();await page.waitForTimeout(200);await page.screenshot({path:path.join(out,'collection86-mobile.png')});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.evaluate(()=>[...document.querySelectorAll('.collection-tile img')].every(i=>i.complete&&i.naturalWidth>0)));
 await page.locator('[data-build="original"]').click();await page.waitForTimeout(200);
 const clear=await page.evaluate(async()=>{const THREE=await import('/pc66/vendor/three/three.module.js'),v=PCBuilder66.view;v.scene.updateMatrixWorld(true);let floor=0,base=0,stand=0,minY=Infinity;for(const cable of v.desktop.cables.children){const a=cable.geometry.attributes.position,p=new THREE.Vector3();for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(cable.matrixWorld);minY=Math.min(minY,p.y);if(p.y<0)floor++;if(Math.abs(p.x)<.66&&p.z>-1.29&&p.z<1.29&&p.y<.30)base++;}for(const point of cable.userData.route){const p=v.desktop.root.worldToLocal(new THREE.Vector3(...point)),r=cable.userData.radius+.018;if(Math.abs(p.x)<.215+r&&p.y>.18-r&&p.y<2.1+r&&p.z>-.48-r&&p.z<-.19+r||Math.abs(p.x)<1.27+r&&p.y<.35+r&&p.y>-.02&&p.z>-.44-r&&p.z<-.065+r)stand++;}}return {floor,base,stand,minY};});
 assert.equal(clear.floor,0);assert.equal(clear.base,0);assert.equal(clear.stand,0);assert(clear.minY>.05);
 assert.deepEqual(errors,[]);console.log('PASS reward gating, 11 choices, detailed rotating models, persistence, restart, race controls, mobile, images, floor/base/stand clearance',counts,clear);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
