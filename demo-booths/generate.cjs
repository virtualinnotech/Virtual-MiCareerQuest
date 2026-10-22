// Generates the demo booths the admin page's "Demo" toggles place in empty
// slots: 5 designs per sector, exported from the real booth editor
// (studio-frame.html) with a logo and two photos each, then run through the
// admin page's lossless optimizer (booth-shipping/public/booth-optimizer162.js):
// textures shared by several demo booths are stored once in library/, the
// rest embedded at display size, each booth gzipped into models/.
//
// Needs Google Chrome and playwright-core, and a static server on the project
// root:  python3 -m http.server 8014 --bind 127.0.0.1
// usage: node demo-booths/generate.cjs [--port=8014]
const {chromium}=require('playwright-core'),fs=require('node:fs'),path=require('node:path');
const arg=(k,d)=>process.argv.find(a=>a.startsWith('--'+k+'='))?.split('=')[1]??d;
const SECTORS=['Manufacturing','Health Science','Agribusiness','Construction','Information Technology','Hospitality'];
const PER_SECTOR=5;
const slug=v=>String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const out=__dirname;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  page.on('pageerror',e=>console.log('pageerror',e.message));
  await page.goto(`http://127.0.0.1:${arg('port','8014')}/studio-frame.html`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.StudioShipping,null,{timeout:180000});
  await page.addScriptTag({url:`http://127.0.0.1:${arg('port','8014')}/booth-shipping/public/booth-optimizer162.js`});
  const booths=[];
  for(const [si,industry] of SECTORS.entries())for(let k=1;k<=PER_SECTOR;k++)booths.push({industry,k,si,name:industry+' Demo '+k,file:slug(industry)+'-'+k+'.glb.gz'});
  // 1. Export every demo booth from the booth editor (kept in the page).
  for(const [n,b] of booths.entries()){
   await page.evaluate(async({b,n})=>{
    const image=(w,h,hue,label)=>new Promise(resolve=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),grad=g.createLinearGradient(0,0,w,h);grad.addColorStop(0,`hsl(${hue},62%,42%)`);grad.addColorStop(1,`hsl(${(hue+50)%360},62%,28%)`);g.fillStyle=grad;g.fillRect(0,0,w,h);
     for(let i=0;i<24;i++){g.fillStyle=`hsla(${(hue+i*29)%360},65%,${35+i%30}%,.45)`;g.beginPath();g.arc((i*97*(n+3))%w,(i*61+n*17)%h,24+(i*11)%80,0,7);g.fill();}
     g.fillStyle='#fff';g.font=`bold ${Math.round(h/6)}px sans-serif`;g.fillText(label,w*.06,h*.56);c.toBlob(x=>resolve(new File([x],label+'.png',{type:'image/png'})),'image/png');});
    window.suspendPreview=true;resetInformationControls();
    const logo=await loadLocalImage(await image(800,400,(n*47)%360,'DEMO')),p1=await loadLocalImage(await image(1200,900,(n*83)%360,'Team')),p2=await loadLocalImage(await image(1200,900,(n*29+120)%360,'Careers'));
    let packet,last;
    for(let k=0;k<12&&!packet;k++){
     const photos=k<6?[p1,p2]:k<9?[p1]:[];
     projectImages={logo,photos,photoSlots:[photos[0]||null,photos[1]||null]};
     $('logoMode').value='flanked';$('logoOnCounter').checked=true;$('boothName').value=b.name;$('contactName').value='Demo Recruiter';$('contactEmail').value='demo@example.com';
     $('industry').value=b.industry;syncIndustryPicker();for(const f of ['website','videoLink','resourceTitle','resourceUrl'])$(f).value='';
     $('layout').value=(b.k*7+b.si*5+k)%32;$('variant').value=(b.k*3+b.si+k)%12;$('palette').value=(b.k*5+b.si*7)%36;$('size').value=b.k===1?'standard':'compact';$('detail').value='balanced';applyPalette();
     try{packet=await makeShipmentPacket('demo-'+n);}catch(e){last=e.message;}
    }
    if(!packet)throw Error(b.name+': '+last);
    (window.__demo??=[])[n]=packet.model;
   },{b,n});
   process.stdout.write('exported '+(n+1)+'/'+booths.length+'\r');
  }
  console.log();
  // 2. Optimize them together: count shared textures first, then rebuild.
  const files=await page.evaluate(async()=>{
   const B=BoothOptimizer162,hex=buf=>[...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');
   const parsed=[];for(const model of __demo){const {json,bin}=B.parseGLB(model);parsed.push(await B.imageKeys(json,bin));}
   const counts=new Map();for(const keys of parsed)for(const k of new Set(keys.filter(Boolean)))counts.set(k,(counts.get(k)||0)+1);
   const processed=new Map(),library=new Map(),ext={'image/webp':'webp','image/png':'png','image/jpeg':'jpg'};
   const ctx={shared:k=>(counts.get(k)||0)>=2,processed(k,make){if(!processed.has(k))processed.set(k,make());return processed.get(k);},
    async library(k,o){if(!library.has(k))library.set(k,{name:hex(await crypto.subtle.digest('SHA-256',o.bytes))+'.'+ext[o.mime],bytes:o.bytes});return library.get(k).name;}};
   const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);};
   const models=[];for(let i=0;i<__demo.length;i++){const {gz}=await B.optimizeBooth(__demo[i],parsed[i],ctx);models.push(b64(gz));}
   return {models,library:[...library.values()].map(l=>({name:l.name,data:b64(l.bytes)}))};
  });
  fs.rmSync(path.join(out,'models'),{recursive:true,force:true});fs.rmSync(path.join(out,'library'),{recursive:true,force:true});
  fs.mkdirSync(path.join(out,'models'),{recursive:true});fs.mkdirSync(path.join(out,'library'),{recursive:true});
  let modelBytes=0,libBytes=0;
  booths.forEach((b,i)=>{const buf=Buffer.from(files.models[i],'base64');modelBytes+=buf.length;fs.writeFileSync(path.join(out,'models',b.file),buf);});
  for(const l of files.library){const buf=Buffer.from(l.data,'base64');libBytes+=buf.length;fs.writeFileSync(path.join(out,'library',l.name),buf);}
  fs.writeFileSync(path.join(out,'designs.json'),JSON.stringify(booths.map(({industry,k,name,file})=>({sector:industry,design:k,name,file:'models/'+file})),null,1)+'\n');
  console.log(JSON.stringify({booths:booths.length,modelsMB:+(modelBytes/1048576).toFixed(1),libraryFiles:files.library.length,libraryMB:+(libBytes/1048576).toFixed(1)}));
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
