const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
(async()=>{
 const {NodeIO}=await import('../../work/browser/node_modules/@gltf-transform/core/dist/index.js');
 const {ALL_EXTENSIONS}=await import('../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js');
 const html=fs.readFileSync(path.resolve(__dirname,'../venue-frame.html'),'utf8');
 const data=zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64'));
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).readBinary(data),rows=[];
 for(const n of doc.getRoot().listNodes()){
  if(!n.getMesh())continue;const m=n.getWorldMatrix(),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(const p of n.getMesh().listPrimitives()){
   const a=p.getAttribute('POSITION');for(let i=0;i<a.getCount();i++){const v=a.getElement(i,[]);for(let k=0;k<3;k++){const c=(m[k]*v[0]+m[k+4]*v[1]+m[k+8]*v[2]+m[k+12])*.3;lo[k]=Math.min(lo[k],c);hi[k]=Math.max(hi[k],c);}}
  }
  rows.push({name:n.getName(),kind:n.getExtras().kind,bounds:[lo,hi].map(a=>a.map(x=>+x.toFixed(3))),materials:n.getMesh().listPrimitives().map(p=>p.getMaterial()?.getName()),extras:n.getExtras()});
 }
 const out=path.resolve(__dirname,'../../work/gallery105-inventory.json');fs.writeFileSync(out,JSON.stringify(rows,null,2));
 const selected=rows.filter(r=>/gallery|entry|entrance|exterior44|swoop|airfoil|curved_roof/i.test(r.name));
 const groups=new Map();for(const r of selected){const key=(r.kind||'')+'|'+r.name.replace(/\d+/g,'#');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 for(const [key,rs]of groups)console.log(JSON.stringify({key,count:rs.length,first:rs[0],last:rs.length>1?rs.at(-1):undefined}));
 console.log('INVENTORY',out,'NODES',rows.length);
})();
