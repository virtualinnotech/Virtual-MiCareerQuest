import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as T from '../../../work/pc66/tools/node_modules/three/build/three.module.js';
import {FBXLoader} from '../../../work/pc66/tools/node_modules/three/examples/jsm/loaders/FBXLoader.js';
import {GLTFExporter} from '../../../work/pc66/tools/node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {dedup,weld,prune} from '../../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';

const dir=path.dirname(fileURLToPath(import.meta.url));
globalThis.window={URL:globalThis.URL};
globalThis.FileReader=class {
 readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}
 readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.();});}
};
T.TextureLoader.prototype.load=function(){return new T.Texture();};
let text=fs.readFileSync(path.join(dir,'source-dog/source/Wolf_test_animation_.fbx'),'utf8');
// The FBX repeats front/hind bone labels. Distinct declaration labels let the
// official loader bind every animation track by its existing unique FBX ID.
text=text.replace(/(Model:\s*(\d+),\s*"Model::)([^"]+)"/g,(_,prefix,id,name)=>prefix+name+'_'+id+'"');
const bytes=Buffer.from(text),object=new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
object.updateMatrixWorld(true);
const bounds=new T.Box3().setFromObject(object),scale=.34/(bounds.max.y-bounds.min.y),center=bounds.getCenter(new T.Vector3());
const root=new T.Group();root.name='Street dog normalized';root.scale.setScalar(scale);root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);root.add(object);
const meshes=[];object.traverse(n=>{if(n.isMesh){n.material=new T.MeshStandardMaterial({color:0xffffff,roughness:.92,metalness:0});meshes.push(n);}});
const walk=object.animations[0];walk.name='walk';
const idle=new T.AnimationClip('idle',2,walk.tracks.map(track=>{
 const value=track.createInterpolant().evaluate(.16),times=[0,2],values=[...value,...value];
 return new track.constructor(track.name,times,values);
}));
const glb=await new GLTFExporter().parseAsync(root,{binary:true,animations:[walk,idle],onlyVisible:false});
const io=new NodeIO(),doc=await io.readBinary(new Uint8Array(glb));
// FBX diffuse textures use bottom-left UVs; glTF embedded images use top-left.
for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives()){
 const uv=p.getAttribute('TEXCOORD_0').getArray();for(let i=1;i<uv.length;i+=2)uv[i]=1-uv[i];
}
const image=await sharp(path.join(dir,'source-dog/textures/wolf_difuse_001.tga.png')).resize(1024,1024).jpeg({quality:86}).toBuffer();
const texture=doc.createTexture('Supplied dog fur').setImage(image).setMimeType('image/jpeg');
for(const m of doc.getRoot().listMaterials())m.setBaseColorTexture(texture).setMetallicFactor(0).setRoughnessFactor(.92).setDoubleSided(true);
await doc.transform(weld(),dedup(),prune());
const output=await io.writeBinary(doc);fs.writeFileSync(path.join(dir,'dog.glb'),output);
const report={source:'User supplied dog.zip',bytes:output.length,triangles:doc.getRoot().listMeshes().reduce((s,m)=>s+m.listPrimitives().reduce((s,p)=>s+p.getIndices().getCount()/3,0),0),bones:doc.getRoot().listSkins()[0].listJoints().length,clips:doc.getRoot().listAnimations().map(a=>a.getName()),height:.34};
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
