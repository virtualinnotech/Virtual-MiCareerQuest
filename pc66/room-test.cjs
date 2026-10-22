const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),sharp=require('sharp');
const out=path.resolve(__dirname,'../../work/pc66');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?v=room88&challenge=pc');await p.waitForFunction(()=>PCChallenge66.snapshot().displayReady&&ITRoom88.snapshot().ready,null,{timeout:120000});
 await p.evaluate(()=>document.getElementById('controlsPopup')?.classList.add('hidden'));
 const initial=await p.evaluate(()=>({pc:PCChallenge66.snapshot(),room:ITRoom88.snapshot()}));
 assert.equal(initial.room.height,2.62);assert.deepEqual(initial.room.bounds,[-21.78,-13.08,-5.22,13.08]);assert(initial.pc.animatedParts>0);assert(initial.pc.position[0]<-19);
 const layout=await p.evaluate(()=>{const s=PCChallenge66.snapshot(),m=transform(s.position,[s.scale,s.scale,s.scale],0,s.rotation),corners=[[-6,0,-5],[-6,0,5],[6,0,-5],[6,0,5]].map(v=>tp(m,...v));return {corners,roof:s.position[1]+s.scale*3.85,slots:DISCOVERY_LAYOUT.sectors.find(s=>s.industry==='Information Technology').slots.filter(p=>p.x>-21.9&&p.x<-17.2&&p.z>7.9&&p.z<13.2).length};});
 assert(layout.corners.every(([x,,z])=>x>-21.78&&x<-5.22&&z>-13.08&&z<13.08));assert(layout.roof<initial.room.height-.5);assert.equal(layout.slots,0);
 // Fix the camera on the vitrine so changed pixels come from animated hardware.
 await p.evaluate(()=>{window.originalRoomCamera=updateCamera;updateCamera=()=>{const s=PCChallenge66.snapshot(),m=transform(s.position,[s.scale,s.scale,s.scale],0,s.rotation);camera=tp(m,-3.4,2.1,-1.8);target=tp(m,-4.7,1.65,-3.73);};});
 await p.waitForTimeout(400);const a=await p.screenshot();await p.waitForTimeout(650);const b=await p.screenshot({path:path.join(out,'room88-hardware.png')});
 const aa=await sharp(a).raw().toBuffer(),bb=await sharp(b).raw().toBuffer();let changes=0;for(let i=0;i<aa.length;i++)if(Math.abs(aa[i]-bb[i])>15)changes++;assert(changes>200,'hardware animation changes visible pixels');
 const after=await p.evaluate(()=>PCChallenge66.snapshot());assert(after.fanSpin>initial.pc.fanSpin);assert(after.glowClock>initial.pc.glowClock);
 await p.evaluate(()=>{updateCamera=()=>{camera=[-12,1.15,6];target=[-18,2.25,-6];};});await p.waitForTimeout(350);await p.screenshot({path:path.join(out,'room88-ceiling.png')});
 assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
 await p.evaluate(()=>{updateCamera=originalRoomCamera;state.pitch=1.1;state.radius=5;updateCamera(0,true);});assert(await p.evaluate(()=>camera[1]<ITRoom88.snapshot().height));
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>PCChallenge66.visit());await p.waitForTimeout(350);await p.screenshot({path:path.join(out,'room88-mobile.png')});assert((await sharp(await p.locator('canvas').first().screenshot()).stats()).channels[0].stdev>15);
 assert.deepEqual(errors,[]);console.log('PASS animated pixels, glow clock, corner clearances, reserved slots, lowered ceiling, camera clearance, mobile',layout,changes);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
