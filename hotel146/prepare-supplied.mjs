import fs from 'node:fs';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../work/browser/node_modules/@gltf-transform/extensions/dist/index.js';
import {dedup,prune,weld,simplify} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../../work/browser/node_modules/meshoptimizer/index.js';
import {fileURLToPath} from 'node:url';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
for(const [id,file]of [['opulent','/Users/mapettiforsd/Desktop/glb_magnificient_opulent_elite_living_room_2_storeys.glb'],['victorian','../../work/hotel146/source/supplied-room/Victorian Room with Fireplace.glb']]){
 if(process.argv[2]&&process.argv[2]!==id)continue;
 const input=file.startsWith('/')?file:fileURLToPath(new URL(file,import.meta.url)),doc=await io.read(input);
 for(const texture of doc.getRoot().listTextures()){const bytes=texture.getImage();if(!bytes)continue;const meta=await sharp(bytes).metadata();const image=sharp(bytes).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true});texture.setImage(await(meta.hasAlpha?image.png():image.jpeg({quality:88})).toBuffer()).setMimeType(meta.hasAlpha?'image/png':'image/jpeg');}
 await MeshoptSimplifier.ready;await doc.transform(dedup(),weld(),simplify({simplifier:MeshoptSimplifier,ratio:.25,error:.002}),prune());const output=new URL('../../work/hotel146/'+id+'-prepared.glb',import.meta.url).pathname;await io.write(output,doc);console.log(id,fs.statSync(output).size);
}
