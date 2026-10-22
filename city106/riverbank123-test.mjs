import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {NodeIO} from '../../work/browser/node_modules/@gltf-transform/core/dist/index.js';
const D=createRequire(import.meta.url)('./district115.js');
const doc=await new NodeIO().read(new URL('./city.glb',import.meta.url).pathname),nodes=doc.getRoot().listNodes(),trees=nodes.filter(n=>n.getExtras().riverbankTree123);
assert.equal(trees.length,9);assert.equal(trees.filter(n=>n.getExtras().riverbankTree123==='green').length,5);
for(const n of trees){
 const [x,y,z]=n.getTranslation();assert(x>=-27.3&&x<=63.3&&z>-38.7&&z<-37.29,'trunk stays on planted bank');
 assert(!D.inWater(x,z)&&!D.bridgeAt(x,z));assert(Math.abs(y+.015)<1e-6);
 assert(n.getExtras().collider107);assert(nodes.some(b=>b.getExtras().soilBed115?.tree===n.getName()));
 assert(n.getMesh().listPrimitives().some(p=>p.getMaterial().getAlphaMode()==='MASK'&&p.getMaterial().getBaseColorTexture()),'textured leaf mesh');
 if(n.getExtras().riverbankTree123==='green')assert(n.getMesh().getName().includes('green'));
 assert(trees.every(o=>o===n||Math.hypot(o.getTranslation()[0]-x,o.getTranslation()[2]-z)>3),'new trees spaced apart');
}
for(const suffix of['','_before_bridge_opening','_after_bridge_opening'])assert(D.remove('Riverfront_concrete_retaining_wall'+suffix));
for(const name of['Riverfront_planted_bank_strip','Riverfront_black_railing_post_8','Riverfront_black_railing_top_rail_before_bridge_opening','Riverfront_black_railing_mid_rail_after_bridge_opening'])assert(!D.remove(name));
const report=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url),'utf8'));assert(report.lightClearance.every(l=>!l.blockedBy.length));
console.log('PASS nine river-side trees, five green canopies, textured foliage, matching soil beds, bridge/water/light clearance and selective concrete-wall removal.');
