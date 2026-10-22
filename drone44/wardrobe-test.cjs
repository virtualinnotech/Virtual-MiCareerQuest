const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:900,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8014/venue-frame.html?exhibit=utv&v=country63');await p.waitForFunction(()=>window.FarmPeople55?.snapshot().ready&&window.FarmVehicles53?.snapshot().ready&&FarmScene63.active,null,{timeout:120000});
 await p.evaluate(()=>{document.getElementById('controlsPopup').classList.add('hidden');player.position=[-65,.54,28];FarmPeople55.update();window.savedActor58=characterState.player;window.savedModel58=characterState.player.model;window.oldCamera58=updateCamera;updateCamera=()=>{camera=[player.position[0]+.9,player.position[1]+.5,player.position[2]+1.1];target=[player.position[0],player.position[1]+.35,player.position[2]];};});
 await p.waitForTimeout(500);await p.screenshot({path:'../work/farmer58-front.png'});
 await p.evaluate(()=>{window.wideCamera60=updateCamera;updateCamera=()=>{const a=characterState.player,m=a.model,U=(m.hi[1]-m.lo[1])/1.78,root=actorMatrix(a),head=CharacterFitting.bones(m).Head.p;target=tp(root,head[0],head[1]+.09*U,head[2]);camera=tp(root,head[0]+.65*U,head[1]+.17*U,head[2]+.7*U);};});await p.waitForTimeout(300);await p.screenshot({path:'../work/cap60-close.png'});await p.evaluate(()=>{updateCamera=wideCamera60;});
 await p.keyboard.down('w');await p.waitForTimeout(450);await p.keyboard.up('w');await p.screenshot({path:'../work/farmer58-walk.png'});
 assert(await p.evaluate(()=>characterState.player===savedActor58&&characterState.player.model===savedModel58));
 await p.evaluate(()=>{player.position=[-70,.54,29];updateCamera=()=>{camera=[-68,1.5,31];target=[-70.5,.55,29];};});await p.waitForTimeout(300);await p.screenshot({path:'../work/pumps58.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);await p.screenshot({path:'../work/farmer58-mobile.png'});
 assert(await p.evaluate(()=>{render();const px=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,px);return new Set(px).size>30;}));
 assert.deepEqual(errors,[]);console.log('PASS unchanged player/model while walking, farm cap, pump and mobile rendering');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
