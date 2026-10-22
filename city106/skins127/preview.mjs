import fs from 'node:fs';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
const doc=await new NodeIO().read('city106/city.glb'),tiles=[];
for(const m of doc.getRoot().listMaterials().filter(m=>m.getExtras().skin127)){
 const {style,variant}=m.getExtras().skin127;
 const input=await sharp(m.getBaseColorTexture().getImage()).resize(256,256).png().toBuffer();
 tiles.push({input,left:variant*256,top:style*256});
}
fs.mkdirSync('../work/skins127',{recursive:true});
await sharp({create:{width:768,height:2048,channels:4,background:'white'}}).composite(tiles).png().toFile('../work/skins127/facades.png');
