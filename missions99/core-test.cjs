const assert=require('node:assert/strict'),C=require('./core.js');
let data=null;const storage={getItem:()=>data,setItem:(k,v)=>{assert.equal(k,C.KEY);data=v;}},p=C.create(storage);
assert.equal(p.complete(),false);assert.equal(C.missions.length,7);assert.equal(C.industries.flatMap(m=>m.challenges).length,12);
assert.equal(p.challenge('visitHub'),false);assert.equal(p.challenge('failed'),false);
assert.equal(p.visit({id:'x',name:'X',industry:'Health Science'},[' ','a','b']),false);
assert.equal(p.reflect('health','    '),false);assert.equal(p.career({name:'x'}),false);
for(const m of C.industries){
 for(const [id]of m.challenges){assert(p.challenge(id));assert(!p.challenge(id));}
 for(let i=0;i<5;i++){const b={id:m.id+i,name:'Employer '+i,industry:m.industry},a=m.questions.map((q,n)=>'Thoughtful answer '+n);assert(p.visit(b,a));assert(p.visit(b,a));}
 assert.equal(p.snapshot().visits[m.id].length,5);assert(p.progress(m)<100);assert(p.reflect(m.id,'I want to explore this work because it helps people.'));assert.equal(p.progress(m),100);
}
assert(!p.complete());assert(p.career({name:'Taylor',company:'Future Works',industry:'it',logo:'spark',plan:'I would like to explore an apprenticeship.',step:'I will talk with my school counselor.'}));assert(p.complete());assert(p.snapshot().completedAt);
const restored=C.create(storage);assert(restored.complete());assert.deepEqual(restored.snapshot(),p.snapshot());
const legacy=restored.snapshot();delete legacy.challenges.hibachi;delete legacy.challenges.hotel;delete legacy.visits.hospitality;delete legacy.reflections.hospitality;
const migrated=C.normalize(legacy);for(const m of C.industries.filter(m=>m.id!=='hospitality'))assert.equal(C.progress(migrated,m),100);
assert.equal(C.progress(migrated,C.industries.find(m=>m.id==='hospitality')),0);assert(!C.complete(migrated));
assert.equal(C.create({getItem:()=>'{not json'}).complete(),false);assert.equal(C.normalize({done:{viewBooth:true}}).version,2);assert(!C.complete(C.normalize({done:{viewBooth:true}})));
const bad=C.normalize({version:2,challenges:{pc:'true'},visits:{health:[{id:'x',name:'X',answers:['a','b','c']}]},career:{}});assert(!bad.challenges.pc);assert.equal(bad.visits.health.length,0);
const denied=C.create({getItem:()=>null,setItem:()=>{throw Error('quota');}});assert(denied.challenge('pc'));assert(!denied.storageOK);assert(denied.snapshot().challenges.pc);
console.log('PASS 7 missions, 12 challenges, 30 unique visits, required reflections/career, deduplication, persistence, corrupt/old data and storage denial');
