import assert from 'node:assert/strict';
import {create} from './core.js';
import {parts,buildSteps,bootSteps,installationList} from './curriculum.js';
const g=create();assert.equal(g.boot(),false);
for(const p of parts){assert(p.role.split(/\s+/).length<=30);assert.equal(p.options,undefined);assert(p.detail.length>0);}
for(const step of buildSteps){assert(step.text.split(/\s+/).length<=35);assert(step.note.length>0);}
assert.deepEqual(installationList.flatMap(item=>item.steps).sort(),buildSteps.map(item=>item.id).sort());
for(const p of parts)assert(installationList.some(item=>item.id===p.id));
for(const p of parts)assert.equal(g.nextLesson(),true);
assert.equal(g.state.phase,'build');
for(const [index,step]of buildSteps.entries()){
 assert.equal(g.state.step,index);
 assert.equal(step.options,undefined);
 if(step.kind==='instruction'){assert.equal(g.continueStep().ok,true);continue;}
 assert.equal(g.state.selected,step.part);assert.equal(g.act('incorrect').ok,false);
 if(step.orientation!=null){assert.equal(g.act(step.target).ok,false);while(g.state.orientation)g.rotate();}
 for(let i=0;i<(step.count||1);i++){assert.equal(g.act(step.target,i).ok,true);if(i<(step.count||1)-1)assert.equal(g.act(step.target,i).ok,false);}
 assert.equal(g.state.step,index+1);
}
assert.equal(g.state.phase,'boot');assert.equal(g.state.completed,false);
const restored=create(g.serialize());assert.equal(restored.state.phase,'boot');
for(const step of bootSteps)assert.equal(restored.boot(),true);
assert.equal(restored.state.phase,'complete');assert.equal(restored.boot(),false);assert.equal(create(restored.serialize()).state.completed,true);
assert.equal(create({version:1,phase:'complete',step:99,learned:[],boot:4}).state.phase,'learn');
assert.equal(create({version:1,phase:'build',step:30,learned:parts.map(p=>p.id)}).state.phase,'boot');
assert.equal(create({version:1,phase:'build',step:20,learned:parts.map(p=>p.id)}).state.step,25);assert.equal(g.state.errors,0);
console.log('PASS guided lessons, ready parts, fan mounting, wiring, fasteners, first boot, persistence and old-save migration');
