import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';

const out='../work/skins127';fs.mkdirSync(out,{recursive:true});
const io=new NodeIO(),city=await io.read('city106/city.glb');
const hash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const templates=city.getRoot().listMeshes().filter(m=>m.getExtras().cityBuildingTemplate).map(m=>({name:m.getName(),extras:m.getExtras(),primitives:m.listPrimitives().map(p=>({position:hash(p.getAttribute('POSITION').getArray()),normal:hash(p.getAttribute('NORMAL').getArray()),uv:hash(p.getAttribute('TEXCOORD_0').getArray()),indices:hash(p.getIndices().getArray())}))}));
const html=fs.readFileSync('venue-frame.html','utf8'),original=await io.readBinary(zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64')));
const placements=original.getRoot().listNodes().filter(n=>['cityBuildingDetailed','distantCityBackdropDetailed'].includes(n.getExtras().kind)).map(n=>({name:n.getName(),matrix:n.getWorldMatrix(),mesh:original.getRoot().listMeshes().indexOf(n.getMesh())}));
fs.writeFileSync(out+'/original-geometry.json',JSON.stringify({templates,placements},null,2));
const library=await io.read('city106/buildings125/buildings.glb');
const names=['chicago:Bricks','chicago:Building','chicago:BLACK BUILD','nyc:Bricks','nyc:White Concreete','nyc:Concrete.001','nyc:Concrete blocks','nyc:Metal Old Green','scene:Color3','london:Concrete_Pillar','london:Glass_Lobby','procedural:CityGenBrick Wall.001','procedural:CityGenconcrete.001','pbr:building','procedural:Us_Builds_facadesWalls.001'];
const tiles=[];
for(const [i,name]of names.entries()){
 const m=library.getRoot().listMaterials().find(m=>m.getName()==='Building125 '+name),bytes=m.getBaseColorTexture().getImage();
 fs.writeFileSync(out+'/'+name.replace(/[^a-z0-9]/gi,'-')+'.png',await sharp(bytes).png().toBuffer());
 const tile=await sharp(bytes).resize(240,220,{fit:'contain',background:'#ffffff'}).png().toBuffer();
 const label=Buffer.from(`<svg width="240" height="36"><rect width="240" height="36" fill="white"/><text x="4" y="20" font-size="12">${name}</text></svg>`);
 tiles.push({input:tile,left:(i%5)*240,top:Math.floor(i/5)*256},{input:label,left:(i%5)*240,top:Math.floor(i/5)*256+220});
}
await sharp({create:{width:1200,height:768,channels:4,background:'white'}}).composite(tiles).png().toFile(out+'/materials.png');
console.log({templates:templates.length,placements:placements.length,preview:out+'/materials.png'});
