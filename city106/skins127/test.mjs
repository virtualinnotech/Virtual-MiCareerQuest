import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {NodeIO} from '../../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import {clearance,segmentDistance} from '../blocks126/layout.mjs';

const io=new NodeIO(),city=await io.read('city106/city.glb'),baseline=JSON.parse(fs.readFileSync('city106/skins127/original-geometry.json'));
const hash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const templates=city.getRoot().listMeshes().filter(m=>m.getExtras().cityBuildingTemplate).map(m=>({name:m.getName(),extras:m.getExtras(),primitives:m.listPrimitives().map(p=>({position:hash(p.getAttribute('POSITION').getArray()),normal:hash(p.getAttribute('NORMAL').getArray()),uv:hash(p.getAttribute('TEXCOORD_0').getArray()),indices:hash(p.getIndices().getArray())}))}));
assert.deepEqual(templates,baseline.templates,'original shell geometry is byte-identical');
const html=fs.readFileSync('venue-frame.html','utf8'),original=await io.readBinary(zlib.gunzipSync(Buffer.from(html.match(/<script id="model-data"[^>]*>([^<]+)/)[1].trim(),'base64')));
const placements=original.getRoot().listNodes().filter(n=>['cityBuildingDetailed','distantCityBackdropDetailed'].includes(n.getExtras().kind)).map(n=>({name:n.getName(),matrix:n.getWorldMatrix(),mesh:original.getRoot().listMeshes().indexOf(n.getMesh())}));
assert.deepEqual(placements,baseline.placements,'original building transforms and mesh references are unchanged');
const report=JSON.parse(fs.readFileSync('city106/report.json'));
assert.equal(report.blocks.counts.addedBuildings,0);assert.equal(report.blocks.counts.tallerBuildings,0);assert.equal(report.buildings.placements.length,395);
assert.equal(city.getRoot().listNodes().filter(n=>n.getExtras().building125||n.getExtras().colliderMesh126).length,0,'no imported replacement geometry or replacement footprint contacts');
const skins=city.getRoot().listMaterials().filter(m=>m.getExtras().skin127);assert.equal(skins.length,24);
assert(new Set(skins.map(m=>m.getExtras().skin127.source.split(':')[0])).size>=5,'supplied model textures are reused');
for(const m of skins){assert(m.getBaseColorTexture());assert(m.getNormalTexture());const tone=m.getExtras().skin127.tone,c=[1,3,5].map(i=>parseInt(tone.slice(i,i+2),16));assert(!(c[0]>c[1]*1.06&&c[2]>c[1]*1.06),'no pink facade: '+m.getName());}
for(const m of skins){
 const pixel=await sharp(m.getBaseColorTexture().getImage()).extract({left:10,top:64,width:1,height:1}).removeAlpha().raw().toBuffer();
 assert(Math.max(...pixel)-Math.min(...pixel)<90,'neutral photographed wall encoding: '+m.getName());
}
for(const plaza of report.blocks.plazas)for(const prop of plaza.props){
 for(const b of report.buildings.placements)assert(clearance(prop.p,b.footprint126)>prop.radius+.1,'furniture intersects restored building');
 for(const route of report.blocks.plazas.map(p=>p.route))for(let i=1;i<route.length;i++)assert(segmentDistance(prop.p,route[i-1],route[i])>(prop.type==='tree'?.12:prop.radius)+.50,'furniture blocks walkway');
}
console.log('PASS original geometry and placement hashes, 395 restored buildings, 24 photographic skins, no pink, clear retained landscaping');
