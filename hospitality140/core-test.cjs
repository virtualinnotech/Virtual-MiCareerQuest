const assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process'),C=require('./core'),L=require('../booth-layout139');
const s=C.sector(),p=L.pack(s,[],25,.34),polygons=p.slots.map(p=>L.polygon(p,2.88*.34/.4,2.08*.34/.4));
assert.equal(p.slots.length,25);assert.equal(p.overflow,0);assert(p.slots.every(s=>!s.anchorId.includes('fit139')));
assert.equal(p.slots.filter(s=>s.group==='court').length,20);assert(new Set(p.slots.map(s=>s.yaw)).size>=4);
for(let i=0;i<25;i++){assert(L.distance(polygons[i],L.rect(C.hole))>.3);for(let j=0;j<i;j++)assert(L.distance(polygons[i],polygons[j])>=.6-1e-6);}
assert.equal(C.height(C.bottom),.24);assert(Math.abs(C.height(C.top)-C.floor)<1e-12);
assert(C.hole[3]<-13.3125&&C.hole[3]>-13.55,'opening hugs the IT wall without cutting into it');
for(const e of C.escalators){const low=C.lowLanding(e),high=C.highLanding(e);assert(high[0]<low[0]);assert.equal(low[1],high[1]);assert.deepEqual(C.point(e,C.bottom,C.ground),[C.bottom,C.ground,e.z]);}
assert(C.removeOriginal('Grand_Gallery_back_glass_stairs_to_second_level_tread'));
assert(!C.removeOriginal('Grand_Gallery_second_level_back_floor'));
assert(C.removeOriginal('District115 River entrance gallery stair tread 0'));
const data=new Float32Array([-5,0,-30,1,0,0,-5,4,-30,1,0,0,-5,0,10,1,0,0]);
const clipped=C.clipWall(data,new Uint32Array([0,1,2]),new Float32Array([0,0,0,1,1,0]));
assert(clipped.idx.length>0);for(let i=2;i<clipped.data.length;i+=6)assert(clipped.data[i]>=-13.35001);assert(clipped.data.includes(10));
const shell=new Float32Array([-5,2,-30,1,0,0,-4,9,-30,1,0,0,-5,2,10,1,0,0]),cut=C.clipShell(shell,new Uint32Array([0,1,2]),new Float32Array([0,0,0,1,1,0]));
assert(cut.idx.length>0);assert.equal(cut.uv.length,cut.data.length/3);
for(let i=0;i<cut.idx.length;i+=3){const c=[0,1,2].map(k=>(cut.data[cut.idx[i]*6+k]+cut.data[cut.idx[i+1]*6+k]+cut.data[cut.idx[i+2]*6+k])/3);assert(c[0]>=0||c[1]>=C.ceiling-1e-5||c[2]<=C.footprint[1]||c[2]>=C.footprint[3]-1e-5);}
assert(C.clearsGarden('Park tree','',[-14,0,-24],[-10,8,-20]));assert(!C.clearsGarden('River road','',[-34,0,-30],[-31,0,-13]));
const schema=fs.readFileSync('booth-shipping/db/schema.sql','utf8'),migration=fs.readFileSync('booth-shipping/db/hospitality141.sql','utf8');
const sql=schema+"\nINSERT INTO slots(sector,slot_number,status,company_name) VALUES('Manufacturing',1,'shipped','Existing employer');\n"+migration+"\nUPDATE slots SET status='claimed',company_name='Hospitality employer' WHERE sector='Hospitality' AND slot_number=1;\n"+migration+"\nSELECT COUNT(*) FROM slots WHERE sector='Hospitality';SELECT company_name FROM slots WHERE status IN ('shipped','claimed') ORDER BY sector;";
const result=execFileSync('sqlite3',[':memory:'],{input:sql,encoding:'utf8'}).trim().split('\n');assert.deepEqual(result,['25','Hospitality employer','Existing employer']);
const upgraded=execFileSync('sqlite3',[':memory:'],{input:schema+fs.readFileSync('booth-shipping/db/hospitality140.sql','utf8')+"UPDATE slots SET status='shipped',email='existing@example.com' WHERE sector='Hospitality' AND slot_number=40;"+migration+"SELECT COUNT(*) FROM slots WHERE sector='Hospitality';SELECT email FROM slots WHERE slot_number=40;",encoding:'utf8'}).trim().split('\n');assert.deepEqual(upgraded,['26','existing@example.com']);
console.log('PASS: 25 authored booths in courts/arrival row, clear escalator opening, wall clipping, safe capacity migration.');
