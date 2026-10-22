const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const sharp=(await import('../../work/browser/node_modules/sharp/dist/index.cjs')).default;
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text().slice(0,300));});await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
 await page.route('**/api/manifest',r=>r.fulfill({json:{booths:[]}}));await page.route('**/api/sectors',r=>r.fulfill({json:{sectors:[]}}));
 await page.goto('http://127.0.0.1:8014/venue-frame.html?v=crane-test&challenge=crane');await page.waitForFunction(()=>window.Crane39?.snapshot().ready||window.Crane39?.snapshot().error,null,{timeout:90000});
 assert.equal(await page.evaluate(()=>Crane39.snapshot().error),null);await page.waitForTimeout(700);await page.screenshot({path:'../work/crane-statue.png'});
 await page.keyboard.press('t');assert(await page.evaluate(()=>Crane39.active));await page.waitForTimeout(700);await page.screenshot({path:'../work/crane-site.png'});
 async function cranePixels(){const {data,info}=await sharp(await page.screenshot()).raw().toBuffer({resolveWithObject:true});let gold=0;for(let y=140;y<Math.min(info.height-100,440);y++)for(let x=60;x<info.width-60;x++){const i=(y*info.width+x)*info.channels;if(data[i]>110&&data[i]>data[i+1]*1.1&&data[i+1]>data[i+2]*1.35)gold++;}assert(gold>20,'Crane must render gold pixels, not a blank canvas');}
 await cranePixels();
 await page.getByLabel('Crane camera').selectOption('cabin');
 for(const [key,field,direction]of [['w','hookY',1],['s','hookY',-1],['a','yaw',1],['d','yaw',-1]]){
  const before=await page.evaluate(field=>Crane39.snapshot()[field],field);
  await page.keyboard.down(key);
  await page.waitForFunction(({field,before,direction})=>(Crane39.snapshot()[field]-before)*direction>.015,{field,before,direction},{timeout:5000});
  await page.keyboard.up(key);
 }
 await page.mouse.move(550,500);await page.mouse.down();await page.mouse.move(550,405,{steps:10});await page.mouse.up();
 await page.screenshot({path:'../work/crane-first-person-regression.png'});
 await page.getByLabel('Crane camera').selectOption('overview');
 assert(await page.locator('#forkliftPanel34').isHidden());
 await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');assert(await page.evaluate(()=>Crane39.snapshot().hookY>1.1));
 const delivery=await page.evaluate(()=>{
  const {game,collision}=Crane39.test,s=game.state,C=CraneCore39;game.reset();const failures=[];
  function move(key,value){for(let n=0;n<4000&&Math.abs(s[key]-value)>.008;n++){const delta=value-s[key],axis={yaw:'turn',radius:'trolley',hookY:'hoist'}[key],speed={yaw:.35,radius:1.4,hookY:1.6}[key];game.tick(Math.min(.04,Math.abs(delta)/speed),{[axis]:Math.sign(delta)},collision);}if(Math.abs(s[key]-value)>.01)failures.push({key,value,actual:s[key],message:s.message});}
  function aim(p){move('yaw',Math.atan2(p[0]-C.site.tower[0],p[2]-C.site.tower[2]));move('radius',Math.hypot(p[0]-C.site.tower[0],p[2]-C.site.tower[2]));}
  for(let i=0;i<3;i++){move('hookY',5);aim(C.source[i]);move('hookY',1);if(!game.attach())failures.push('attach '+i);move('hookY',5);aim(C.targets[i]);move('hookY',C.site.roof+1);if(!game.release())failures.push('release '+i);}
  return {failures,state:Crane39.snapshot()};
 });assert.deepEqual(delivery.failures,[]);assert.equal(delivery.state.delivered,3);assert.equal(delivery.state.points,200);await page.waitForTimeout(100);await page.screenshot({path:'../work/crane-complete.png'});
 assert(await page.evaluate(()=>{const {game,collision}=Crane39.test,s=game.state;game.reset();game.attach();s.hookY=5;game.tick(.01);game.release();for(let i=0;i<80;i++)game.tick(.05);return !s.bundles[0].falling&&s.delivered===0&&s.held===-1;}));
 assert(await page.evaluate(()=>{const {game,collision}=Crane39.test;game.reset();for(let i=0;i<500;i++)game.tick(.05,{turn:1,hoist:1},collision);return game.state.impactAt>0&&game.state.debris.length>0;}));
 await page.evaluate(()=>Crane39.test.game.reset());
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:'../work/crane-mobile.png'});
 await cranePixels();
 assert(await page.evaluate(()=>{const p=document.querySelector('#cranePanel39'),b=p.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.bottom<=innerHeight&&p.scrollWidth<=p.clientWidth;}));
 await page.keyboard.press('Escape');assert(!await page.evaluate(()=>Crane39.active));assert(await page.locator('#cranePanel39').isHidden());
 assert(await page.evaluate(()=>Math.hypot(player.position[0]-CraneCore39.site.statue[0],player.position[2]-CraneCore39.site.statue[2])<1.5));
 assert(await page.evaluate(()=>{const s=Forklift34.snapshot();return s.x>54&&s.z<7;}));
 console.log('errors',errors);assert.deepEqual(errors,[]);
 console.log('PASS: walk-up entry, keyboard hoist, collision-checked three-bundle delivery, dropped load recovery, building debris, mobile controls, exit and forklift corner.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
