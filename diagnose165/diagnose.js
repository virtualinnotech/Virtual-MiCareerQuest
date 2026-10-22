/* Self-running speed test (165), opened as /student?diagnose=<id>.
 * Walks, then drives the Rivian, and measures each stretch once as normal and
 * once each with one thing switched off: half resolution, sun shadows, crowd,
 * the Rivian itself, headlights, and Light graphics. That shows what the
 * computer finds hardest. Everything is put back afterwards and the numbers
 * are sent to /api/diagnostics under the same id, where they can be read. */
(()=>{
 const id=new URLSearchParams(location.search).get('diagnose')||'';
 if(!/^[a-z0-9]{12,40}$/.test(id))return;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const box=document.createElement('div');
 box.id='speedTestBox165';box.setAttribute('role','status');
 box.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:400;background:#0f2433f2;color:#eef7fd;border:1px solid #5cd5e680;border-radius:12px;padding:12px 18px;font:600 15px system-ui,sans-serif;width:min(92vw,560px);text-align:center;box-shadow:0 10px 30px #0008';
 const say=text=>{box.textContent=text;};

 // GPU time per frame, where the browser allows timer queries.
 function gpuTimer(){
  const g=MCQPerformance21.meter.native,ext=g?.getExtension('EXT_disjoint_timer_query_webgl2');if(!ext)return null;
  const pending=[],done=[],R=render;
  const collect=()=>{while(pending.length){const q=pending[0];if(!g.getQueryParameter(q,g.QUERY_RESULT_AVAILABLE))break;pending.shift();const ns=g.getQueryParameter(q,g.QUERY_RESULT);g.deleteQuery(q);if(!g.getParameter(ext.GPU_DISJOINT_EXT))done.push(ns/1e6);}};
  render=function(...a){let q=null;if(pending.length<8){q=g.createQuery();g.beginQuery(ext.TIME_ELAPSED_EXT,q);}try{return R.apply(this,a);}finally{if(q){g.endQuery(ext.TIME_ELAPSED_EXT);pending.push(q);}collect();}};
  return {reset(){done.length=0;},values:()=>done.slice(),restore(){render=R;}};
 }

 async function measure(report,timer,name,ms){
  const frames=[],L=loop;
  loop=function(t){const skipped=FramePacing164.skip(t,lastTime),a=performance.now(),r=L(t);if(!skipped)frames.push({t,js:performance.now()-a});return r;};
  timer?.reset();MCQPerformance21.meter.frames.length=0;
  await wait(ms);
  loop=L;
  const f=frames.slice(1),gaps=[];for(let i=1;i<f.length;i++)gaps.push(f[i].t-f[i-1].t);
  const sorted=gaps.slice().sort((a,b)=>a-b),secs=f.length>1?(f.at(-1).t-f[0].t)/1000:1,rows=MCQPerformance21.meter.frames.slice(),avg=(list,k)=>list.length?list.reduce((s,x)=>s+(k?x[k]||0:x),0)/list.length:null;
  const gpu=timer?.values()||[];
  report.phases.push({name,fps:+(gaps.length/secs).toFixed(1),scriptMs:+(avg(f,'js')||0).toFixed(1),gpuMs:gpu.length?+avg(gpu).toFixed(1):null,
   p95GapMs:Math.round(sorted[Math.floor(sorted.length*.95)]||0),worstGapMs:Math.round(sorted.at(-1)||0),lateFrames:gaps.filter(x=>x>40).length,frames:gaps.length,
   draws:Math.round(avg(rows,'draws')||0),trianglesK:Math.round((avg(rows,'triangles')||0)/1000),picture:canvas.width+'x'+canvas.height});
 }

 async function run(){
  document.body.append(box);say('Speed test: waiting for the game to finish loading...');
  for(let i=0;i<300&&!(window.Rivian147?.snapshot().ready&&window.Loading155&&!Loading155.blocked&&state.ready&&crowdState.status==='ready');i++)await wait(1000);
  const report={format:'micareerquest-diagnose',version:1,id,at:new Date().toISOString(),userAgent:navigator.userAgent,cores:navigator.hardwareConcurrency||null,memoryGB:navigator.deviceMemory||null,
   screen:[screen.width,screen.height,devicePixelRatio],window:[innerWidth,innerHeight],renderer:MCQPerformance21.report().gpu?.renderer||null,booths:shippedBooths.size,people:crowdState.targetCount,
   before:{frameRate:FramePacing164.snapshot(),graphics:GraphicsMode165.snapshot()},phases:[],errors:[]};
  const pacing=FramePacing164.snapshot().mode,graphics=GraphicsMode165.snapshot().mode,timer=gpuTimer();report.gpuTimer=!!timer;
  const saved={quality:null,shadows:state.sunShadows,crowdDraw:window.Crowd?.draw,rivianDraw:Rivian147.draw,rivianLighting:Rivian147.drawLighting,lights:Rivian147.test.state.lights};
  try{
   document.getElementById('controlsPopup')?.classList.add('hidden');
   try{HubGuide.close?.();}catch(e){}
   try{if(document.body.classList.contains('tour-running')&&typeof StudentTour!=='undefined')StudentTour.end();}catch(e){}
   try{window.MissionUI99?.active&&MissionList.close();}catch(e){}
   // Measure the real cost: no 30 fps cap, full graphics unless a step says otherwise.
   FramePacing164.set('max');GraphicsMode165.set('full');saved.quality=state.quality;state.paused=false;keys.clear();
   const steps=[
    ['as is',()=>{}],
    ['half resolution',()=>{state.quality=Math.min(saved.quality,.5);}],
    ['no shadows',()=>{state.sunShadows=false;}],
    ['no crowd',()=>{if(window.Crowd)Crowd.draw=()=>{};}],
    ['Light graphics',()=>{GraphicsMode165.set('light');}],
   ];
   const undo=()=>{GraphicsMode165.set('full');state.quality=saved.quality;state.sunShadows=saved.shadows;if(window.Crowd&&saved.crowdDraw)Crowd.draw=saved.crowdDraw;Rivian147.draw=saved.rivianDraw;Rivian147.drawLighting=saved.rivianLighting;Rivian147.test.state.lights=saved.lights;};
   let n=0;const total=steps.length+steps.length+2;
   for(const [name,apply] of steps){n++;say('Speed test '+n+' of '+total+': walking, '+name+'. Please don\'t touch the keyboard or mouse.');
    apply();teleport('entrance');await wait(1500);keys.add('w');await measure(report,timer,'walk: '+name,5000);keys.clear();undo();}
   if(!Rivian147.snapshot().unlocked){StudentRewards100.cheat();StudentRewards100.close();report.unlockedRivian=true;}
   for(let i=0;i<60&&!Rivian147.snapshot().modelReady;i++)await wait(500);
   player.position=[4,PHYSICS.radii[1]+.015,36.5];
   if(!Rivian147.enter())throw Error('Could not get into the Rivian');
   const driveSteps=[...steps,['no Rivian drawn',()=>{Rivian147.draw=()=>{};Rivian147.drawLighting=()=>{};}],['no headlights',()=>{Rivian147.test.state.lights=false;}]];
   for(const [name,apply] of driveSteps){n++;say('Speed test '+n+' of '+total+': driving, '+name+'. Please don\'t touch the keyboard or mouse.');
    apply();Rivian147.test.place(4,36.5,0);await wait(1000);keys.add('w');keys.add('a');await measure(report,timer,'drive: '+name,5000);keys.clear();undo();}
   Rivian147.exit(true);teleport('entrance');
  }catch(e){report.errors.push(String(e&&e.message||e));}
  finally{keys.clear();timer?.restore();
   try{state.quality=saved.quality??state.quality;state.sunShadows=saved.shadows;if(window.Crowd&&saved.crowdDraw)Crowd.draw=saved.crowdDraw;Rivian147.draw=saved.rivianDraw;Rivian147.drawLighting=saved.rivianLighting;Rivian147.test.state.lights=saved.lights;}catch(e){}
   GraphicsMode165.set(graphics);FramePacing164.set(pacing);}
  say('Speed test finished. Sending the results...');
  try{const r=await fetch('/api/diagnostics?id='+id,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(report)});if(!r.ok)throw Error('status '+r.status);
   say('Speed test finished and sent. You can close this tab and tell Claude it\'s done.');}
  catch(e){say('Speed test finished, but the results could not be sent ('+e.message+'). Reload this page to run it again.');}
  window.speedTest165=report;
 }
 run();
})();
