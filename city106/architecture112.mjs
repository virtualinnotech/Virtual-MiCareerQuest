import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';

export async function addArchitecture({doc,original,mesh,geo,box,rod,material,texture,facadeSkin}){
 const styles=[
  {name:'Red brick warehouse',wall:'#803c37',trim:'#c5aea0',glass:'#607c91',type:'brick',columns:6},
  {name:'White modern apartments',wall:'#dce3e2',trim:'#f3f4ed',glass:'#476477',type:'balcony',columns:7},
  {name:'Green copper crown',wall:'#557870',trim:'#a5bab0',glass:'#365765',type:'copper',columns:6},
  {name:'Limestone Art Deco',wall:'#c5c1af',trim:'#efebd8',glass:'#526979',type:'deco',columns:8},
  {name:'Charcoal industrial',wall:'#393c43',trim:'#777e86',glass:'#7b97ab',type:'loft',columns:5},
  {name:'Burgundy masonry',wall:'#68404c',trim:'#d3c3b2',glass:'#647b8c',type:'arch',columns:5},
  {name:'Blue green glass tower',wall:'#2b737e',trim:'#8fbdc1',glass:'#377f98',type:'glass',columns:12},
  {name:'Silver stepped tower',wall:'#a1b3c2',trim:'#d2dbe2',glass:'#466981',type:'silver',columns:9}
 ];
 const materials=[];
 for(let style=0;style<styles.length;style++){
  const p=styles[style];let seed=112+style*19;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768"><defs><linearGradient id="glass" x2=".2" y2="1"><stop stop-color="${p.glass}"/><stop offset=".48" stop-color="#8b9ca6"/><stop offset=".5" stop-color="#567482"/><stop offset="1" stop-color="#233a45"/></linearGradient><linearGradient id="lit" x2="0" y2="1"><stop stop-color="#f1dbab"/><stop offset="1" stop-color="#786d5d"/></linearGradient><filter id="grain"><feTurbulence baseFrequency=".5" numOctaves="2" seed="${style}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".12"/></feComponentTransfer></filter></defs><rect width="768" height="768" fill="${p.wall}"/>`;
  let mask='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 768 768"><rect width="768" height="768" fill="black"/>';
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   const x=col*192,y=row*192,w=p.type==='glass'?178:p.type==='loft'?145:p.type==='arch'?102:p.type==='deco'?86:116,xx=x+(192-w)/2,lit=random()<.18;
   if(['brick','arch','loft'].includes(p.type))for(let j=0;j<192;j+=12){
    svg+=`<path d="M${x} ${y+j}h192" stroke="#d1b6a0" stroke-opacity=".22"/>`;
    for(let k=0;k<192;k+=38)svg+=`<path d="M${x+k+(j%24?19:0)} ${y+j}v12" stroke="#beafa1" stroke-opacity=".25"/>`;
   }else svg+=`<path d="M${x} ${y}h192v192" fill="none" stroke="${p.trim}" stroke-opacity=".55" stroke-width="2"/>`;
   const arched=p.type==='arch'||p.type==='brick',top=y+24,bottom=y+161;
   const window=arched?`M${xx} ${bottom}V${top+30}Q${xx+w/2} ${top-25} ${xx+w} ${top+30}V${bottom}Z`:`M${xx} ${top}h${w}v${bottom-top}h-${w}Z`;
   svg+=`<path d="${window}" fill="url(#${lit?'lit':'glass'})" stroke="#233039" stroke-width="8"/><path d="M${xx+w/2} ${top+4}v${bottom-top-4}M${xx} ${y+103}h${w}" stroke="${p.trim}" stroke-width="${p.type==='glass'?2:4}"/>`;
   mask+=`<path d="${window}" fill="${lit?'#e6e6e6':'#555555'}"/>`;
   if(p.type==='loft')for(let k=1;k<4;k++)svg+=`<path d="M${xx+k*w/4} ${top}v137" stroke="#252a30" stroke-width="3"/>`;
   if(random()<.58)svg+=`<rect x="${xx+5}" y="${top+12}" width="${w/2-10}" height="${12+random()*50}" fill="#d3d0bd" opacity=".65"/>`;
   svg+=`<path d="M${xx-6} ${bottom+9}h${w+12}" stroke="${p.trim}" stroke-width="${p.type==='deco'?10:5}"/><path d="M${xx-6} ${bottom+14}h${w+12}" stroke="#18252b" stroke-opacity=".6" stroke-width="3"/>`;
   if(p.type==='balcony'){
    svg+=`<rect x="${xx-14}" y="${y+134}" width="${w+28}" height="37" fill="#647783" opacity=".6"/><path d="M${xx-14} ${y+134}h${w+28}" stroke="#dce5e4" stroke-width="4"/>`;
    for(let k=0;k<9;k++)svg+=`<path d="M${xx-12+k*(w+24)/8} ${y+134}v37" stroke="#abbcbc" stroke-width="2"/>`;
   }
   if(p.type==='deco')svg+=`<path d="M${x+20} ${y}v192M${x+172} ${y}v192" stroke="${p.trim}" stroke-width="9"/><path d="M${x+70} ${y+182}l26 -10 26 10" stroke="${p.trim}" stroke-width="3" fill="none"/>`;
   if(p.type==='copper')svg+=`<path d="M${x+8} ${y+181}h176" stroke="#a6bfa5" stroke-width="10"/>`;
  }
  svg+='<rect width="768" height="768" filter="url(#grain)"/></svg>';mask+='</svg>';
  const color=await sharp(Buffer.from(svg)).jpeg({quality:89}).toBuffer(),alpha=await sharp(Buffer.from(mask)).greyscale().raw().toBuffer(),normal=Buffer.alloc(512*512*4);
  for(let i=0;i<alpha.length;i++){normal[i*4]=128;normal[i*4+1]=128;normal[i*4+2]=255;normal[i*4+3]=alpha[i];}
  const tex=doc.createTexture('City112 '+p.name).setImage(color).setMimeType('image/jpeg'),mat=material('City112 facade '+style,[1,1,1,1],tex,p.type==='glass'?.35:.08,.72);
  mat.setNormalTexture(await texture('City112 window mask '+style,await sharp(normal,{raw:{width:512,height:512,channels:4}}).png().toBuffer()));materials.push(mat);
  if(facadeSkin)await facadeSkin({style,p,svg,mask,mat});
 }
 const source=original.getRoot().listMeshes(),ids=[...new Set(original.getRoot().listNodes().filter(n=>['cityBuildingDetailed','distantCityBackdropDetailed'].includes(n.getExtras().kind)).map(n=>source.indexOf(n.getMesh())))];
 for(const [style,id]of ids.entries()){
  const p=styles[style%8],mat=materials[style%8],parts=[];
  const add=(c,s,facade=false)=>{
   const item=box(c,s,mat),g=item.g,v=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
   for(let i=0;i<v.count;i++)uv.setXY(i,facade&&Math.abs(n.getY(i))<.5?(Math.abs(n.getX(i))>.5?v.getZ(i):v.getX(i))+.5:.008,facade&&Math.abs(n.getY(i))<.5?v.getY(i):.004);
   parts.push(item);
  };
  const levels=[
   [[1,0,.91]],[[1,0,.16],[.91,.16,.90]],[[1,0,.63],[.83,.63,.83],[.64,.83,.93]],
   [[1,0,.62],[.86,.62,.80],[.66,.80,.94]],[[1,0,.86]],[[1,0,.88]],
   [[1,0,.12],[.94,.12,.93]],[[1,0,.52],[.84,.52,.73],[.67,.73,.87],[.48,.87,.96]]
  ][style%8];
  for(const [w,lo,hi]of levels){add([0,(lo+hi)/2,0],[w,hi-lo,w],true);add([0,hi+.006,0],[w+.012,.012,w+.012]);}
  const top=levels.at(-1),w=top[0],y=top[2];
  if([0,4,5].includes(style)){
   for(let k=0;k<3;k++)add([0,y+.008+k*.012,0],[1.015+k*.006,.008,1.015+k*.006]);
   // Rooftop water tank, supports and a small maintenance penthouse.
   add([.23,y+.048,-.16],[.20,.075,.22]);
   const tank=rod([-.21,y+.055,.06],[-.21,y+.13,.06],.07,.07,mat,12);
   const uv=tank.g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.008,.004);parts.push(tank);
   for(const x of[-.26,-.16])for(const z of[.01,.11])add([x,y+.024,z],[.012,.055,.012]);
   const roof=new T.ConeGeometry(.081,.035,12);roof.translate(-.21,y+.147,.06);const u=roof.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,.008,.004);parts.push(geo(roof,mat));
  }else{
   add([0,y+.026,0],[w*.65,.052,w*.65]);
   if(style===2||style===7){add([0,y+.07,0],[.16,.07,.16]);add([0,y+.12,0],[.012,.07,.012]);}
  }
  if(style===1)for(let f=1;f<12;f++)for(const z of[-.47,.47])add([0,f*.072+.08,z],[.91,.009,.055]);
  if(style===3||style===7)for(const x of[-.43,-.29,.29,.43])for(const z of[-.48,.48])add([x,.32,z],[.014,.61,.026]);
  if(style===6)for(const x of[-.45,-.3,-.15,0,.15,.3,.45])for(const z of[-.477,.477])add([x,.53,z],[.007,.80,.012]);
  add([0,.08,.50],[.25,.15,.015],true);add([0,.16,.51],[.32,.012,.06]);
  mesh('City112 '+p.name+' shell '+id,parts).setExtras({sourceMesh:id,cityBuildingTemplate:true,style112:style%8,columns112:p.columns});
 }
 for(const m of doc.getRoot().listMaterials())if(/^City106 facade /.test(m.getName()))m.dispose();
 return styles.map((s,i)=>({...s,sourceMesh:ids[i]}));
}
