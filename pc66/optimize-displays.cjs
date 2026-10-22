// Offline display LODs only. The interactive workshop keeps its original geometry.
const sharp=require('sharp'),fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'models');
const hero=process.argv.includes('--hero');
const jobs=[
 ['tower90','display90-tower'],['gpu90','display90-gpu'],
 ...['aurora','polar','ember','sunset','glacier','stealth','gold','emerald','rose','inferno'].map(id=>['collection86-'+id,'display88-'+id]),
 ['equipment86','display88-original'],['peripherals86','peripherals87'],['gallery85','gallery88'],
 ...['white','carbon','oak'].map(id=>['furniture85-'+id,'furniture87-'+id])
];
const srgb=x=>Math.round(255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055));
function stats(d){const prims=d.getRoot().listMeshes().flatMap(m=>m.listPrimitives());return {primitives:prims.length,triangles:prims.reduce((n,p)=>n+(p.getIndices()?.getCount()||0)/3,0)};}
(async()=>{const esm=name=>import(require.resolve(name).replace(/index\.cjs$/,'index.js'));
 const {NodeIO}=await esm('@gltf-transform/core'),{ALL_EXTENSIONS}=await esm('@gltf-transform/extensions'),{dedup,flatten,join,weld,simplify,prune,textureCompress}=await esm('@gltf-transform/functions'),{MeshoptSimplifier}=await esm('meshoptimizer');
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);await MeshoptSimplifier.ready;const report=[];
 for(const [source,displayName]of jobs){
  if(hero&&!['tower90',...jobs.filter(([s])=>s.startsWith('collection86-')).map(([s])=>s)].includes(source))continue;
  const name=hero?'showcase92-'+(source==='tower90'?'original':source.replace('collection86-','')):displayName;
  if(process.argv[2]&&!hero&&name!==process.argv[2])continue;
  const d=await io.read(path.join(dir,source+'.glb')),root=d.getRoot(),before=stats(d);
  // Sub-pixel lettering and hub decals need not be separate draws in the room.
  if(!hero)for(const mesh of root.listMeshes())for(const p of mesh.listPrimitives()){const m=p.getMaterial();if(m?.getAlphaMode()==='BLEND'&&m.getBaseColorFactor()[3]>.5&&m.getBaseColorTexture())p.dispose();}
  const flat=root.listMaterials().filter(m=>!m.getBaseColorTexture()&&m.getAlphaMode()==='OPAQUE');
  const width=2**Math.ceil(Math.log2(Math.max(8,flat.length*8))),pixels=Buffer.alloc(width*8*4,255),materials=new Map();
  flat.forEach((m,i)=>{const c=m.getBaseColorFactor();for(let y=0;y<8;y++)for(let x=i*8;x<(i+1)*8;x++){const k=(y*width+x)*4;for(let n=0;n<3;n++)pixels[k+n]=srgb(c[n]);}});
  const texture=d.createTexture(name+' palette').setMimeType('image/png').setImage(await sharp(pixels,{raw:{width,height:8,channels:4}}).png().toBuffer());
  const buffer=root.listBuffers()[0];
  for(const mesh of root.listMeshes())for(const p of mesh.listPrimitives()){
   const m=p.getMaterial(),i=flat.indexOf(m);if(i<0)continue;
   const intensity=m.getExtension('KHR_materials_emissive_strength')?.getEmissiveStrength()||1,em=m.getEmissiveFactor().map(v=>Math.round(v*intensity*4)/4),key=em.join(',');
   if(!materials.has(key))materials.set(key,d.createMaterial('Display surface '+key).setBaseColorTexture(texture).setBaseColorFactor([1,1,1,1]).setEmissiveFactor(em).setMetallicFactor(.3).setRoughnessFactor(.48).setDoubleSided(true));
   const count=p.getAttribute('POSITION').getCount(),uv=new Float32Array(count*2);
   for(let k=0;k<count;k++){uv[k*2]=(i*8+4)/width;uv[k*2+1]=.5;}
   p.setAttribute('TEXCOORD_0',d.createAccessor().setType('VEC2').setArray(uv).setBuffer(buffer));p.setMaterial(materials.get(key));
  }
  // Retain three lightweight fan pivots per display, not every internal rotor.
  if(!hero)for(const n of root.listNodes())if(n.getName().startsWith('s83-fan-')&&Number(n.getName().split('-').at(-1))>2)n.setName('Display fan');
  const displaySimplifier={...MeshoptSimplifier,simplify:(indices,positions,stride,count,error)=>MeshoptSimplifier.simplify(indices,positions,stride,count,error,['Prune','Permissive'])};
  await d.transform(prune(),dedup(),flatten(),join({filter:n=>n.getName()!=='arena-monitor-screen'&&!n.getName().startsWith('s83-fan-')}),weld(),...hero?[]:[simplify({simplifier:displaySimplifier,ratio:.10,error:.012})],prune(),textureCompress({encoder:sharp,resize:hero?[1024,1024]:[256,256]}));
  await io.write(path.join(dir,name+'.glb'),d);
  const item={source,name,before,after:stats(d),beforeBytes:fs.statSync(path.join(dir,source+'.glb')).size,bytes:fs.statSync(path.join(dir,name+'.glb')).size};report.push(item);console.log(item);
 }
 fs.writeFileSync(path.resolve(__dirname,'../../work/pc66/display88-optimization.json'),JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
