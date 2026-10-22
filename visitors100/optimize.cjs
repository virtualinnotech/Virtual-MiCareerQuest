const sharp=require('sharp'),path=require('node:path');
(async()=>{
 const {NodeIO}=await import('../../work/browser/node_modules/@gltf-transform/core/dist/index.js');
 const {ALL_EXTENSIONS}=await import('../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js');
 const {prune}=await import('../../work/browser/node_modules/@gltf-transform/functions/dist/index.js');
 const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
 const rigged=process.argv.includes('--rigged'),directory=rigged?path.join(__dirname,'rigged102'):__dirname;
 for(const id of ['student2','green','casual','stride-a','stride-b','smiling','teenage',...(!rigged?['scooter']:[])]){
  const file=path.join(directory,id+'.glb'),d=await io.read(file);
  for(const m of d.getRoot().listMaterials()){m.setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);for(const e of m.listExtensions())m.setExtension(e.extensionName,null);if(id!=='scooter')m.setEmissiveFactor([0,0,0]);}
  for(const mesh of d.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
   const info=p.getMaterial()?.getBaseColorTextureInfo(),t=info?.getExtension('KHR_texture_transform');
   if(t){const uv=p.getAttribute('TEXCOORD_'+(t.getTexCoord()??info.getTexCoord()));if(uv){const a=uv.clone(),s=t.getScale(),o=t.getOffset(),r=t.getRotation(),v=[];for(let i=0;i<a.getCount();i++){a.getElement(i,v);const x=v[0]*s[0],y=v[1]*s[1];a.setElement(i,[Math.cos(r)*x-Math.sin(r)*y+o[0],Math.sin(r)*x+Math.cos(r)*y+o[1]]);}p.setAttribute('TEXCOORD_0',a);}info.setExtension('KHR_texture_transform',null);}
  }
  for(const t of d.getRoot().listTextures()){
   const size=rigged?2048:1024,alphaUsed=d.getRoot().listMaterials().some(m=>m.getBaseColorTexture()===t&&m.getAlphaMode()!=='OPAQUE');
   let image=sharp(Buffer.from(t.getImage())).resize({width:size,height:size,fit:'inside',withoutEnlargement:true});
   const jpeg=rigged&&!alphaUsed;image=await(jpeg?image.removeAlpha().jpeg({quality:94}):image.png()).toBuffer();t.setImage(image).setMimeType(jpeg?'image/jpeg':'image/png');
  }
  await d.transform(prune());await io.write(file,d);
  if(['student2','green'].includes(id)){
   for(const m of d.getRoot().listMaterials())if(id==='student2'?['Material.001','Material.002','25_part3-Model-0-Mesh-0-0_1_0_0'].includes(m.getName()):/Wolf3D_(Hair|Outfit_Top|Outfit_Bottom)/.test(m.getName())){
    const original=m.getBaseColorTexture();if(original){const image=await sharp(Buffer.from(original.getImage())).grayscale().linear(1.35,24).png().toBuffer();const t=d.createTexture().setImage(image).setMimeType('image/png');m.setBaseColorTexture(t).setBaseColorFactor([1,1,1,1]);}
   }
   await d.transform(prune());await io.write(path.join(directory,id+'-variants.glb'),d);
  }
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
