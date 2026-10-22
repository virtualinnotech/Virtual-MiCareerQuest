// Offline index-only LODs retain original vertices, UVs and skin weights.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 const {MeshoptSimplifier}=await import('../../work/browser/node_modules/meshoptimizer/meshopt_simplifier.js');await MeshoptSimplifier.ready;
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 let models;
 try{
  const page=await browser.newPage();await page.addInitScript(()=>localStorage.setItem('mcqOnboardingDone_v1','1'));
  await page.goto('http://127.0.0.1:8014/venue-frame.html?city111off');
  await page.waitForFunction(()=>typeof CrowdGraphics!=='undefined'&&CrowdGraphics.ready,null,{timeout:180000});
  models=await page.evaluate(()=>['sara_character','roger_character','zoe','jason_character','liz','brad_character'].map(id=>{
   const m=characterState.models.get(id);return {id,parts:m.parts.map((p,index)=>({p,index})).filter(({p})=>p.source&&!p.fitted).map(({p,index})=>({index,name:p.name,positions:Array.from(p.source.positions),normals:Array.from(p.source.normals),uv:Array.from(p.source.uv),indices:Array.from(p.source.indices)}))};
  }));
 }finally{await browser.close();}
 const records=[],chunks=[];let offset=0;
 for(const m of models){const totals=[0,0,0];
  for(const part of m.parts){
   const pos=new Float32Array(part.positions),idx=new Uint32Array(part.indices),attrs=new Float32Array(pos.length/3*5);
   for(let i=0;i<pos.length/3;i++)attrs.set([...part.normals.slice(i*3,i*3+3),...part.uv.slice(i*2,i*2+2)],i*5);
   const record={model:m.id,part:part.index,name:part.name,vertices:pos.length/3,sourceCount:idx.length,signature:Array.from(idx.subarray(0,12)),levels:[]};totals[0]+=idx.length/3;
   for(const [ratio,error]of[[.28,.009],[.12,.02]]){
    const target=Math.max(36,Math.floor(idx.length*ratio/3)*3);
    const [result,actualError]=idx.length<300?[idx,0]:MeshoptSimplifier.simplifyWithAttributes(idx,pos,3,attrs,5,[.3,.3,.3,.5,.5],null,target,error,['LockBorder']);
    const bytes=Buffer.from(result.buffer,result.byteOffset,result.byteLength);chunks.push(bytes);record.levels.push({offset,count:result.length,error:actualError});offset+=bytes.length;totals[record.levels.length]+=result.length/3;
   }records.push(record);
  }console.log(m.id,{full:totals[0],medium:totals[1],far:totals[2]});
 }
 const bytes=Buffer.concat(chunks),manifest={version:111,generator:'meshoptimizer 1.3 simplifyWithAttributes / LockBorder / original vertex buffers',bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),records};
 fs.writeFileSync(path.join(__dirname,'street-lods.bin'),bytes);fs.writeFileSync(path.join(__dirname,'street-lods.json'),JSON.stringify(manifest)+'\n');console.log('Street LOD bytes',bytes.length);
})().catch(e=>{console.error(e);process.exitCode=1;});
