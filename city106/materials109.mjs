import path from 'node:path';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';

// Baked relief and photographic color add detail without subdividing the street.
export async function upgradeMaterials({doc,dir,material}){
 let seed=109;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const tex=(name,data,mime='image/png')=>doc.createTexture(name).setImage(data).setMimeType(mime);
 const png=svg=>sharp(Buffer.from(svg)).png().toBuffer();
 async function normalMap(name,input,strength,alpha=null){
  const {data,info}=await sharp(input).resize(512,512).greyscale().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height,out=Buffer.alloc(w*h*4);
  const at=(x,y)=>data[((y+h)%h)*w+(x+w)%w]/255;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const dx=(at(x-1,y)-at(x+1,y))*strength,dy=(at(x,y-1)-at(x,y+1))*strength,l=Math.hypot(dx,dy,1),i=(y*w+x)*4;
   out[i]=(dx/l*.5+.5)*255;out[i+1]=(dy/l*.5+.5)*255;out[i+2]=(.5+.5/l)*255;out[i+3]=alpha?alpha(x/w,y/h):255;
  }
  return tex(name,await sharp(out,{raw:{width:w,height:h,channels:4}}).png().toBuffer());
 }
 const sky=tex('City109 sunset cloud panorama',await sharp(path.join(dir,'sky-source.png')).resize(1024,512).jpeg({quality:88}).toBuffer(),'image/jpeg');
 material('City109 sky',[1,1,1,1],sky);
 const road=await sharp(path.join(dir,'asphalt-source.png')).resize(1024,1024).jpeg({quality:86}).toBuffer();
 const asphalt=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 asphalt');
 asphalt.setBaseColorTexture(tex('City109 scanned asphalt aggregate',road,'image/jpeg')).setBaseColorFactor([.74,.76,.78,1]).setNormalTexture(await normalMap('City109 asphalt relief',road,1.2)).setExtras({surfaceType:18});

 let paving='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".45" numOctaves="3" seed="109"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".23"/></feComponentTransfer></filter><radialGradient id="stain"><stop stop-color="#625a4b" stop-opacity=".23"/><stop offset="1" stop-color="#777467" stop-opacity="0"/></radialGradient></defs><rect width="1024" height="1024" fill="#656860"/>';
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){
  const c=166+Math.floor(random()*22),xx=x*256,yy=y*256;
  paving+=`<rect x="${xx+3}" y="${yy+3}" width="250" height="250" rx="2" fill="rgb(${c},${c+1},${c-4})"/><path d="M${xx+5} ${yy+252}v-247h246" fill="none" stroke="#dadbd5" stroke-opacity=".5" stroke-width="2"/><path d="M${xx+250} ${yy+5}v246h-245" fill="none" stroke="#6d7168" stroke-opacity=".6" stroke-width="3"/>`;
  if(random()<.4)paving+=`<path d="M${xx+250} ${yy+176}l-39 -13 -23 -34 -44 -8 -36 -48 -32 -9" stroke="#696d64" stroke-opacity=".5" stroke-width="1.5" fill="none"/>`;
 }
 for(let i=0;i<75;i++)paving+=`<ellipse cx="${random()*1024}" cy="${random()*1024}" rx="${15+random()*65}" ry="${8+random()*24}" fill="url(#stain)"/>`;
 paving+='<rect width="1024" height="1024" filter="url(#grain)"/></svg>';
 const pavingBytes=await png(paving),paver=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 paving');
 paver.setBaseColorTexture(tex('City109 weathered concrete slabs',await sharp(pavingBytes).jpeg({quality:86}).toBuffer(),'image/jpeg')).setNormalTexture(await normalMap('City109 concrete relief',pavingBytes,2.5)).setExtras({surfaceType:19});

 const palettes=[['#a29c8f','#d5cfc1'],['#737d81','#b5bab9'],['#805f50','#ba9780'],['#7b8a90','#adbcbf']];
 for(let style=0;style<4;style++){
  const [dark,light]=palettes[style],litCells=[];
  let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><linearGradient id="glass" x2=".15" y2="1"><stop stop-color="#93b0c1"/><stop offset=".36" stop-color="#627d8a"/><stop offset=".63" stop-color="#b59e8c"/><stop offset=".7" stop-color="#52636d"/><stop offset="1" stop-color="#253a44"/></linearGradient><linearGradient id="lit" x2="0" y2="1"><stop stop-color="#f5d2a0"/><stop offset=".30" stop-color="#c7ad7e"/><stop offset="1" stop-color="#695745"/></linearGradient><linearGradient id="stone" x2="0" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient><filter id="grain"><feTurbulence baseFrequency=".45" numOctaves="2" seed="${109+style}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".17"/></feComponentTransfer></filter></defs><rect width="1024" height="1024" fill="url(#stone)"/>`;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
   const x=c*256,y=r*256,lit=random()<.27,w=style===3?224:style===1?198:164,xx=x+(256-w)/2;
   litCells.push(lit);
   for(let yy=0;yy<256;yy+=style===2?16:64){s+=`<path d="M${x} ${y+yy}h256" stroke="#534f47" stroke-opacity=".35" stroke-width="2"/>`;for(let bx=0;bx<256;bx+=style===2?64:128)s+=`<path d="M${x+bx+(yy%32?32:0)} ${y+yy}v${style===2?16:64}" stroke="#5d5950" stroke-opacity=".28"/>`;}
   s+=`<rect x="${xx-8}" y="${y+22}" width="${w+16}" height="211" fill="#4b4c48"/><rect x="${xx-3}" y="${y+26}" width="${w+6}" height="202" fill="#202b30"/><rect x="${xx+3}" y="${y+30}" width="${w-6}" height="189" fill="url(#${lit?'lit':'glass'})"/>`;
   // Faint reflected adjacent towers, office partitions and occupied floors.
   for(let q=0;q<5;q++){const h=35+random()*95;s+=`<rect x="${xx+4+q*(w-8)/5}" y="${y+215-h}" width="${(w-8)/5-2}" height="${h}" fill="${lit?'#493f37':'#243945'}" opacity="${lit?.21:.26}"/>`;}
   if(lit)s+=`<path d="M${xx+15} ${y+52}h${w-30}" stroke="#ffe5bf" stroke-width="5"/><path d="M${xx+8} ${y+180}h${w-16}v8h-${w-16}" fill="#352e27"/><rect x="${xx+24}" y="${y+162}" width="24" height="18" fill="#4e5550"/>`;
   const bh=20+Math.floor(random()*92);
   if(random()<.8){s+=`<rect x="${xx+4}" y="${y+31}" width="${w/2-8}" height="${bh}" fill="#b9b9ad" opacity=".84"/>`;for(let q=4;q<bh;q+=5)s+=`<path d="M${xx+5} ${y+31+q}h${w/2-10}" stroke="#6e736f" stroke-opacity=".55"/>`;}
   s+=`<path d="M${xx} ${y+29}h${w}v7h-${w}" fill="#142b31" opacity=".75"/><path d="M${xx+w/2} ${y+29}v192M${xx+2} ${y+139}h${w-4}" stroke="#28383d" stroke-width="5"/><path d="M${xx+w/2+3} ${y+29}v190M${xx+2} ${y+142}h${w-4}" stroke="#b2b8ad" stroke-width="1"/><path d="M${xx-10} ${y+234}h${w+20}" stroke="${light}" stroke-width="7"/><path d="M${xx-10} ${y+239}h${w+20}" stroke="#333c3d" stroke-width="4" opacity=".65"/>`;
   for(const dx of[-6,w+4])s+=`<path d="M${xx+dx} ${y+245}v10" stroke="#40423c" stroke-width="3" opacity=".3"/>`;
  }
  s+='<rect width="1024" height="1024" filter="url(#grain)"/></svg>';
  const bytes=await png(s),w=style===3?224:style===1?198:164;
  const alpha=(u,v)=>{const x=u*4%1,y=v*4%1;return x>(256-w)/512+.013&&x<1-(256-w)/512-.013&&y>.12&&y<.85?(litCells[Math.floor(v*4)*4+Math.floor(u*4)]?230:85):0;};
  const m=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 facade '+style);
  m.setBaseColorTexture(tex('City109 detailed facade '+style,await sharp(bytes).jpeg({quality:90}).toBuffer(),'image/jpeg')).setNormalTexture(await normalMap('City109 facade relief and window mask '+style,bytes,.85,alpha)).setRoughnessFactor(.8);
 }
}
