const {chromium}=require('playwright'),path=require('path'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:760,height:1000}});p.on('pageerror',e=>console.log(e));await p.goto('http://127.0.0.1:8014/visitors100/inspect.html?repaired=1');await p.waitForFunction(()=>window.ready,null,{timeout:120000});
 for(let i=0;i<7;i++){await p.evaluate(i=>inspect(i,0,false),i);await p.screenshot({path:path.resolve(__dirname,`../../work/students102-body-${i}.png`)});await p.evaluate(i=>inspect(i,0,true),i);await p.screenshot({path:path.resolve(__dirname,`../../work/students102-face-${i}.png`)});}
 const bounds=[];for(let i=0;i<7;i++)for(const time of [0,.27,.54,.81]){bounds.push({i,time,...await p.evaluate(([i,t])=>gaitBounds(i,t),[i,time])});await p.evaluate(([i,t])=>inspect(i,t,false,.6),[i,time]);await p.screenshot({path:path.resolve(__dirname,`../../work/students102-gait-${i}-${time}.png`)});}
 assert(bounds.every(b=>Math.abs(b.min[1])<.008),'Stance shoes stay at floor level');
 assert(bounds.every(b=>b.max[1]-b.min[1]>1.5&&b.max[1]-b.min[1]<1.9),'All walking bodies remain at human scale');
 console.log('BOUNDS',JSON.stringify(bounds));
 console.log('Inspection renders complete');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
