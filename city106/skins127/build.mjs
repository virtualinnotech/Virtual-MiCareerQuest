import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';

const dir=path.dirname(fileURLToPath(import.meta.url));
export async function createFacadeSkins127({doc,material}){
 const source=await new NodeIO().read(path.join(dir,'../buildings125/buildings.glb')),records=[];
 const bytes=name=>source.getRoot().listMaterials().find(m=>m.getName()==='Building125 '+name)?.getBaseColorTexture()?.getImage();
 const profiles=[
  [['procedural:CityGenBrick Wall.001',1,'#674638'],['procedural:CityGenBrick Wall.001',6,'#755646'],['chicago:Bricks',null,'#867e6d']],
  [['nyc:White Concreete',null,'#c2c2b7'],['scene:Color3',null,'#afb6b5'],['nyc:Concrete blocks',null,'#aeb3b3']],
  [['nyc:Metal Old Green',null,'#4f655d'],['nyc:Metal Old Green',null,'#596263'],['nyc:Metal Old Green',null,'#6a6253']],
  [['nyc:White Concreete',null,'#b2ac97'],['procedural:CityGenBrick Wall.001',0,'#b8b6a7'],['london:Concrete_Pillar',null,'#a8aaa4']],
  [['nyc:Concrete.001',null,'#515558'],['nyc:Bricks',null,'#4e5355'],['procedural:CityGenconcrete.001',6,'#656864']],
  [['procedural:CityGenBrick Wall.001',1,'#614d40'],['chicago:Bricks',null,'#737269'],['procedural:CityGenBrick Wall.001',7,'#725341']],
  [['scene:Color3',null,'#466268'],['nyc:Concrete blocks',null,'#657779'],['procedural:CityGenconcrete.001',5,'#4d5b63']],
  [['nyc:Concrete blocks',null,'#989e9d'],['scene:Color3',null,'#a7aeac'],['pbr:building',null,'#828986']]
 ];
 const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
 async function wall(profile){
  const [name,tile,tone]=profile;let input=sharp(bytes(name));
  if(tile!==null)input=input.extract({left:tile*128,top:0,width:128,height:128});
  if(name==='london:Concrete_Pillar')input=input.extract({left:110,top:360,width:310,height:260});
  if(name==='pbr:building')input=input.extract({left:48,top:610,width:220,height:180});
  if(name==='chicago:Bricks')input=input.extract({left:64,top:64,width:256,height:256});
  const {data,info}=await input.resize(384,384).toColourspace('srgb').removeAlpha().raw().toBuffer({resolveWithObject:true}),target=hex(tone);
  if(info.channels!==3)throw Error('Facade surface must decode to RGB: '+name);
  let mean=0;for(let i=0;i<data.length;i+=info.channels)mean+=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;mean/=info.width*info.height;
  for(let i=0;i<data.length;i+=info.channels){const lum=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722,contrast=name==='nyc:Metal Old Green'?.3:1,detail=1+(Math.max(.45,Math.min(1.6,(lum+24)/(mean+24)))-1)*contrast;for(let c=0;c<3;c++)data[i+c]=Math.min(255,target[c]*detail);}
  // The source atlas may be premultiplied; these edited RGB samples are not.
  return sharp(data,{raw:{width:info.width,height:info.height,channels:3}}).png().toBuffer();
 }
 // Pane crops retain the original window openings and add photographed blinds
 // and reflections without importing any of the source building geometry.
 const panes=await Promise.all([[523,168,37,96],[625,168,37,96],[728,168,37,96],[831,168,37,96],[164,375,33,96],[268,375,34,96]].map(([left,top,width,height])=>sharp(bytes('chicago:Building')).extract({left,top,width,height}).modulate({saturation:.4,brightness:.8}).png().toBuffer()));
 const surrounds=await Promise.all([98,302].flatMap(top=>[489,592,695,798].map(left=>sharp(bytes('chicago:Building')).extract({left,top,width:104,height:197}).modulate({saturation:.42,brightness:.91}).png().toBuffer())));
 async function apply({style,p,svg,mask,mat}){
  const size=1024,originalMask=await sharp(Buffer.from(mask)).resize(size,size).greyscale().raw().toBuffer();
  for(let variant=0;variant<3;variant++){
   const profile=profiles[style][variant],wallBytes=await wall(profile),width=p.type==='glass'?178:p.type==='loft'?145:p.type==='arch'?102:p.type==='deco'?86:116;
   let defs=`<pattern id="photoWall" patternUnits="userSpaceOnUse" width="384" height="384"><image width="384" height="384" href="data:image/png;base64,${wallBytes.toString('base64')}"/></pattern><pattern id="photoGlass" patternUnits="userSpaceOnUse" width="768" height="768">`;
   for(let row=0;row<4;row++)for(let col=0;col<4;col++)defs+=`<image x="${col*192+(192-width)/2}" y="${row*192+24}" width="${width}" height="137" preserveAspectRatio="none" href="data:image/png;base64,${panes[(row*3+col+variant)%panes.length].toString('base64')}"/>`;
   defs+='</pattern>';
   const trim=['#a19c8b','#949c9c','#9f9a8c'][variant];
   let painted=svg.replace('<defs>','<defs>'+defs).replace(`fill="${p.wall}"`,'fill="url(#photoWall)"').replaceAll('url(#glass)','url(#photoGlass)').replaceAll('url(#lit)','url(#photoGlass)').replaceAll(p.trim,trim)
    .replace(/stroke-width="8"/g,'stroke-width="5"');
   let maskBytes=originalMask;
   if([0,5].includes(style)&&variant!==0){
    painted='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">';
    let windowMask='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="black"/>';
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
     const x=col*256,y=row*256,k=(row*3+col*5+variant)%surrounds.length;
     painted+=`<image x="${x}" y="${y}" width="256" height="256" preserveAspectRatio="none" href="data:image/png;base64,${surrounds[k].toString('base64')}"/>`;
     windowMask+=`<rect x="${x+64}" y="${y+83}" width="120" height="147" fill="#555555"/>`;
    }
    painted+='</svg>';windowMask+='</svg>';
    maskBytes=await sharp(Buffer.from(windowMask)).greyscale().raw().toBuffer();
   }
   const rgba=await sharp(Buffer.from(painted)).resize(size,size).ensureAlpha().raw().toBuffer(),normal=Buffer.alloc(size*size*4);
   const height=i=>maskBytes[i]>24?-.12:(rgba[i*4]+rgba[i*4+1]+rgba[i*4+2])/765*.07;
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=y*size+x,dx=(height(y*size+(x+1)%size)-height(y*size+(x+size-1)%size))*1.6,dy=(height(((y+1)%size)*size+x)-height(((y+size-1)%size)*size+x))*1.6;
    normal[i*4]=Math.round(128-dx*127);normal[i*4+1]=Math.round(128+dy*127);normal[i*4+2]=255;normal[i*4+3]=maskBytes[i];
   }
   const tex=doc.createTexture(`City127 skin ${style}-${variant}`).setImage(await sharp(rgba,{raw:{width:size,height:size,channels:4}}).jpeg({quality:92}).toBuffer()).setMimeType('image/jpeg');
   const bump=doc.createTexture(`City127 masonry and glass mask ${style}-${variant}`).setImage(await sharp(normal,{raw:{width:size,height:size,channels:4}}).png().toBuffer()).setMimeType('image/png');
   const skin=variant===0?mat:material(`City127 facade ${style}-${variant}`,[1,1,1,1]);
   skin.setBaseColorTexture(tex).setNormalTexture(bump).setMetallicFactor(p.type==='glass'?.22:.06).setRoughnessFactor(.84).setExtras({skin127:{style,variant,source:profile[0],tone:profile[2]}});
   records.push({style,variant,material:skin.getName(),source:profile[0],tone:profile[2]});
  }
 }
 return {apply,records};
}

export function originalBuildings127({original,worldBounds,hidden}){
 const placements=[];
 for(const n of original.getRoot().listNodes()){
  if(!n.getMesh()||!['cityBuildingDetailed','distantCityBackdropDetailed'].includes(n.getExtras().kind))continue;
  if(n.getName()==='City_Riverbank_100_Building-Medium-01'){hidden.push(n.getName());continue;}
  const bounds=worldBounds(n),{lo,hi}=bounds;
  placements.push({name:n.getName(),source:'original',variant:n.getMesh().getName(),lot:bounds,bounds,position:[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2],size:hi.map((v,i)=>v-lo[i]),matrix:n.getWorldMatrix(),footprint126:[[lo[0],lo[2]],[hi[0],lo[2]],[hi[0],hi[2]],[lo[0],hi[2]]],preserved127:true});
 }
 return {preserved127:true,placements,counts:{original:placements.length},variants:{}};
}
