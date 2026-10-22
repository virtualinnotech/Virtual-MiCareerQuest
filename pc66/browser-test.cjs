const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failed.push(r.url());});
 await p.goto('http://127.0.0.1:8014/pc66/index.html');await p.waitForFunction(()=>window.PCBuilder66?.view,null,{timeout:120000});
 assert(await p.locator('#spec').isHidden());assert(await p.locator('#detail').isHidden());
 assert.equal(await p.locator('#hardware-list li').count(),12);assert.equal(await p.locator('#hardware-list .installed').count(),0);assert.equal(await p.locator('#hardware-list [aria-current="step"]').getAttribute('data-hardware'),'case');
 assert.deepEqual(await p.locator('#hardware-list li:not([hidden])').evaluateAll(rows=>rows.map(row=>row.dataset.hardware)),['case','board','cpu','ramA','cooler','gpu','drive','psu']);
 assert.deepEqual(await p.locator('#hardware-list li:not([hidden]) .hardware-mark').allTextContents(),['1','2','3','4','5','6','7','8']);
 assert(await p.locator('#hardware-list img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0)));
 assert.equal(await p.evaluate(()=>{let feet=0;PCBuilder66.view.groups.case.traverse(o=>{if(o.name==='Solid case foot')feet++;});return feet;}),4);
 const fanState=()=>p.evaluate(()=>{const g=PCBuilder66.view.groups.frontFans,rotor=g.getObjectByName('Animated fan blades'),ring=g.children[0].children.find(o=>o.material?.emissive?.getHex());return {angle:rotor.rotation.z,glow:ring.material.emissiveIntensity,scale:g.children[0].scale.x};});
 assert((await fanState()).glow>0);
 assert(await p.evaluate(()=>['ramA','ramB'].every(id=>PCBuilder66.view.groups[id].userData.model==='Corsair Vengeance RGB Pro White'&&PCBuilder66.view.groups[id].getObjectByName('Corsair Vengeance badge'))));
 const rotors=()=>p.evaluate(()=>{const a=[];PCBuilder66.view.scene.traverse(o=>{if(o.name==='Animated fan blades'&&o.parent.parent.name!=='fans')a.push(o.rotation.z);});return a;});
 assert.equal((await rotors()).length,12);
 await p.locator('#reference').check();const preview=await rotors();await p.waitForTimeout(150);assert((await rotors()).every((angle,i)=>angle!==preview[i]));assert((await fanState()).glow>0);await p.locator('#reference').uncheck();
 await p.locator('#autoRotate').click();const camera=await p.evaluate(()=>PCBuilder66.view.snapshot().camera);await p.waitForTimeout(350);assert.notDeepEqual(await p.evaluate(()=>PCBuilder66.view.snapshot().camera),camera);await p.locator('#autoRotate').click();await p.locator('#home').click();
 await p.locator('#glass').click();assert.equal(await p.evaluate(()=>PCBuilder66.view.groups.panel.visible),false);await p.locator('#glass').click();
 await p.locator('#rgb').click();assert.equal(await p.evaluate(()=>PCBuilder66.view.snapshot().viewer.rgb),false);await p.locator('#rgb').click();
 await p.locator('#airflow').click();assert(await p.evaluate(()=>PCBuilder66.view.scene.getObjectByName('Fan airflow').children.some(o=>o.visible)));await p.locator('#airflow').click();
 await p.screenshot({path:'../work/pc66/clear71-learn.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:'../work/pc66/clear71-mobile.png'});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.setViewportSize({width:1440,height:900});await p.locator('#specs').click();assert((await p.locator('#spec-list').textContent()).includes('AM5'));assert.equal(await p.locator('#spec-list details p').count(),await p.evaluate(()=>PCBuilder66.buildSteps.length));await p.getByRole('button',{name:'Close build sheet'}).click();
 for(let i=0;i<8;i++){assert.equal(await p.locator('#quiz button').count(),0);assert(await p.locator('#next').isVisible());if(i===1){await p.waitForTimeout(300);assert(await p.evaluate(()=>PCBuilder66.view.groups.board.getObjectByName('Raised motherboard hardware').userData.detailCount>50));assert(await p.evaluate(()=>['socket','slots','ports'].every(id=>PCBuilder66.view.groups[id].visible)));await p.screenshot({path:'../work/pc66/board73.png'});await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:'../work/pc66/board73-mobile.png'});await p.setViewportSize({width:1440,height:900});}if(i===2)await p.screenshot({path:'../work/pc66/cpu.png'});await p.locator('#next').click();}
 assert.equal(await p.evaluate(()=>PCBuilder66.state.phase),'build');const idle=await rotors();assert.equal((await fanState()).glow,0);await p.waitForTimeout(150);assert.deepEqual(await rotors(),idle);
 const total=await p.evaluate(()=>PCBuilder66.buildSteps.length);
 for(let i=0;i<total;i++){
  const step=await p.evaluate(()=>PCBuilder66.buildSteps[PCBuilder66.state.step]);assert.equal(await p.evaluate(()=>PCBuilder66.state.step),i);
  assert.equal(await p.locator('#hardware-list .installed').count(),await p.evaluate(async()=>{const {installationList}=await import('/pc66/curriculum.js?v=20261009-hardware85');return installationList.filter(item=>item.steps.every(id=>PCBuilder66.state.installed.includes(id))).length;}));
  assert.equal(await p.locator('#hardware-list [aria-current="step"]').count(),1);
  if(i===5)await p.screenshot({path:'../work/pc66/list72-building.png'});
  if(i===5)assert.equal(await p.evaluate(()=>PCBuilder66.view.groups.gpu.visible),false);
  assert.equal(await p.locator('#quiz button').count(),0);assert.equal(await p.locator('#inventory button').count(),0);
  if(step.kind==='instruction'){await p.locator('#next').click();continue;}
  assert.equal(await p.locator('[data-part]').count(),1);assert.equal(await p.evaluate(()=>PCBuilder66.state.selected),step.part);
  if(step.kind!=='fasten'){assert.equal(await p.locator('.target:not(.wrong)').getAttribute('class'),'target single-target');assert.equal(await p.locator('.target:not(.wrong)').evaluate(el=>Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join('')),'');}
  if(step.id==='panel'){assert(await p.evaluate(()=>PCBuilder66.view.groups.panel.getObjectByName('Tempered side glass')));await p.waitForTimeout(300);await p.screenshot({path:'../work/pc66/glass73.png'});}
  if(step.kind==='fasten')assert.equal(await p.locator('#detail').textContent(),'Click each green numbered point.');
  if(step.orientation!=null){await p.evaluate(s=>PCBuilder66.act(s.target),step);assert.equal(await p.evaluate(()=>PCBuilder66.state.step),i);while(await p.evaluate(()=>PCBuilder66.state.orientation))await p.locator('#rotate').click();}
  if(step.id==='cpu'||step.id==='atx')await p.screenshot({path:`../work/pc66/${step.id}-assembly.png`});
  for(let k=0;k<(step.count||1);k++){
   const target=p.locator(`.target[data-target="${step.target}"][data-index="${k}"]`);
   await target.click();
  }
 }
 assert.equal(await p.evaluate(()=>PCBuilder66.state.phase),'boot');await p.screenshot({path:'../work/pc66/neon74.png'});await p.reload();await p.waitForFunction(()=>PCBuilder66?.view,null,{timeout:120000});assert.equal(await p.evaluate(()=>PCBuilder66.state.phase),'boot');await p.screenshot({path:'../work/pc66/boot.png'});
 assert.equal(await p.locator('#hardware-list .installed').count(),12);assert.equal(await p.locator('#hardware-list .installed .hardware-mark').allTextContents().then(v=>v.filter(t=>t==='\u2713').length),12);
 const beforePower=await fanState();assert.equal(beforePower.glow,0);await p.waitForTimeout(150);assert.equal((await fanState()).angle,beforePower.angle);
 await p.locator('#next').click();await p.waitForFunction(()=>PCBuilder66.state.boot===1);assert.equal((await fanState()).glow,0);await p.locator('[data-target="power"]').click();await p.waitForFunction(()=>PCBuilder66.state.boot===2);const on=await fanState();assert(on.glow>0);await p.waitForTimeout(150);assert.notEqual((await fanState()).angle,on.angle);await p.waitForFunction(()=>PCBuilder66.state.phase==='complete');await p.screenshot({path:'../work/pc66/fans81-powered.png'});
 assert.equal(await p.evaluate(()=>PCBuilder66.state.phase),'complete');await p.locator('#glass').click();await p.locator('#airflow').click();await p.waitForTimeout(300);await p.screenshot({path:'../work/pc66/view75-desktop.png'});
 assert(await p.evaluate(()=>PCBuilder66.view.scene.children.filter(o=>o.name==='Visible tied cable').every(o=>o.visible&&o.getObjectByName('Cable zip ties'))));
 const running=await rotors();await p.waitForTimeout(150);assert((await rotors()).every((angle,i)=>angle!==running[i]));
 assert(await p.evaluate(()=>['ramA','ramB','gpu'].every(id=>{let lit=false;PCBuilder66.view.groups[id].traverse(o=>{if(o.material?.emissive?.getHex()&&o.material.emissiveIntensity>0)lit=true;});return lit;})));
 await p.locator('#rgb').click();assert.equal((await fanState()).glow,0);const noRgb=await rotors();await p.waitForTimeout(150);assert((await rotors()).every((angle,i)=>angle!==noRgb[i]));await p.locator('#rgb').click();
 await p.screenshot({path:'../work/pc66/live77-desktop.png'});await p.locator('#glass').click();await p.screenshot({path:'../work/pc66/live77-glass.png'});await p.locator('#glass').click();
 await p.locator('#next').click();await p.waitForFunction(()=>PCBuilder66.race?.snapshot().phase==='ready',null,{timeout:60000});await p.getByRole('button',{name:'Ready!',exact:true}).click();await p.waitForFunction(()=>PCBuilder66.race.snapshot().phase==='racing');await p.screenshot({path:'../work/pc66/race.png'});await p.locator('#next').click();
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:'../work/pc66/view75-mobile.png'});
 assert(await p.evaluate(()=>{const r=PCBuilder66.view.renderer,gl=r.getContext(),d=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,d);const c=new Set();for(let i=0;i<d.length;i+=64)c.add(d.slice(i,i+3).join());return c.size>100;}));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('#specs').click();assert(await p.locator('#build-sheet').isVisible());await p.getByRole('button',{name:'Close build sheet'}).click();
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS complete PC lesson, assembly, first boot, saved progress, optional test drive, mobile pixels and sources');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
