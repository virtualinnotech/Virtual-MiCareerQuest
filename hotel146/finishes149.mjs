import fs from 'node:fs';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';

// Reuse the same photographic masonry as the neighboring city buildings.
export async function facadeFinishes(doc){
 const source=await new NodeIO().read(new URL('../city106/buildings125/buildings.glb',import.meta.url).pathname);
 const bytes=name=>source.getRoot().listMaterials().find(m=>m.getName()==='Building125 '+name).getBaseColorTexture().getImage();
 const brick=await sharp(bytes('procedural:CityGenBrick Wall.001')).extract({left:128,top:0,width:128,height:128}).resize(512,512).modulate({saturation:.65,brightness:.90}).png().toBuffer();
 const stone=await sharp(bytes('nyc:Concrete blocks')).resize(512,512).png().toBuffer();
 const trim=await sharp(bytes('nyc:White Concreete')).resize(512,512).png().toBuffer();
 const textures={};for(const [name,image]of Object.entries({brick,stone,trim}))textures[name]=doc.createTexture('City masonry '+name).setImage(image).setMimeType('image/png');
 return textures;
}
export function finish(m,texture,color=[1,1,1,1]){
 m.setBaseColorFactor(color).setBaseColorTexture(texture).setMetallicFactor(0).setRoughnessFactor(.82);
 m.getBaseColorTextureInfo().setWrapS(10497).setWrapT(10497);return m;
}
export function projectUV(positions,normals,scale=.8){
 const uv=[];for(let i=0;i<positions.length;i+=3){const [x,y,z]=positions.slice(i,i+3),[nx,ny,nz]=normals.slice(i,i+3);uv.push((Math.abs(ny)>.75?x:Math.abs(nx)>Math.abs(nz)?z:x)/scale,(Math.abs(ny)>.75?z:y)/scale);}return uv;
}
export async function upholstery(doc){
 const texture=doc.createTexture('Blue velvet diamond upholstery').setImage(await sharp(fs.readFileSync(new URL('./assets/velvet-tufted149.png',import.meta.url))).resize(1024,1024).jpeg({quality:92}).toBuffer()).setMimeType('image/jpeg');
 for(const node of doc.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()||[]){
  const material=p.getMaterial();finish(material,texture,[.82,.88,.94,1]);material.setRoughnessFactor(.97);
  const position=p.getAttribute('POSITION'),normal=p.getAttribute('NORMAL'),idx=p.getIndices().getArray(),points=[],normals=[],uv=[];
  // Unwrap around the circular back rather than stretching the original atlas.
  for(let k=0;k<idx.length;k+=3){const tri=Array.from(idx.slice(k,k+3),i=>position.getElement(i,[])),angles=tri.map(v=>Math.atan2(v[2],v[0])/(2*Math.PI)+.5),up=Array.from(idx.slice(k,k+3),i=>normal.getElement(i,[])[1]).reduce((a,b)=>a+b,0)>1.5;if(Math.max(...angles)-Math.min(...angles)>.5)for(let j=0;j<3;j++)if(angles[j]<.5)angles[j]++;
   for(let j=0;j<3;j++){const v=tri[j],n=normal.getElement(idx[k+j],[]);points.push(...v);normals.push(...n);uv.push(...(up?[v[0]/.75,v[2]/.75]:[angles[j]*6,(v[1]-.15)/.55]));}
  }
  const buffer=doc.getRoot().listBuffers()[0],a=(v,type,Class=Float32Array)=>doc.createAccessor().setType(type).setArray(new Class(v)).setBuffer(buffer);
  p.setAttribute('POSITION',a(points,'VEC3')).setAttribute('NORMAL',a(normals,'VEC3')).setAttribute('TEXCOORD_0',a(uv,'VEC2')).setIndices(a(Array.from({length:points.length/3},(_,i)=>i),'SCALAR',Uint32Array));
 }
}
