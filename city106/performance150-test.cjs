const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('./road-pose117.js'),C=require('./life111.js');
function legacyMatrix(f,o,spin,steer,scale){
 const c=Math.cos(steer),s=Math.sin(steer),cx=Math.cos(spin),sx=Math.sin(spin),x=f.right.map((v,k)=>v*c-f.forward[k]*s),z=f.right.map((v,k)=>v*s+f.forward[k]*c),y=f.up;
 return [...x.map(v=>v*scale[0]),0,...y.map((v,k)=>(v*cx+z[k]*sx)*scale[1]),0,...z.map((v,k)=>(v*cx-y[k]*sx)*scale[2]),0,...R.point(f,o),1];
}
for(let i=0;i<500;i++){
 const f=R.frame([i*.01,.3,-2],i*.037,Math.sin(i)*.3),o=[.5,-.1,1],scale=[1.2,.9,1.3],spin=i*.41,steer=Math.sin(i)*.45;
 const expected=legacyMatrix(f,o,spin,steer,scale),out=new Float32Array(16);
 assert.deepEqual(R.matrix(f,o,spin,steer,scale),expected);
 assert.equal(R.matrix(f,o,spin,steer,scale,out),out);
 assert.deepEqual(out,new Float32Array(expected));
}
// Compare the optimized turn reservation with the previous algorithm over a
// complete signal cycle, including all fleet types and rendered-state fields.
const source=fs.readFileSync(require.resolve('./life111.js'),'utf8');
const optimized='path.some(p=>overlap(p,o))';assert(source.includes(optimized));
const legacy=source.replace(optimized,'[0,.25,.5,.75,1].some(t=>overlap({...v,...sampleTurn(turn,turn.length*t)},o))');
const context={module:{exports:{}}};vm.runInNewContext(legacy,context);const previous=context.module.exports;
const config=require('./report.json').life,old=config.vehicles.map(v=>({...C.scaledVehicle144(v),poseCache117:{x:1,y:2,z:3},light134:{power:5},health:100,speed:0,travel:0})),current=structuredClone(old);
for(let i=0;i<1000;i++){
 const t=i*.05%44,phase={ns:t<18?'green':t<21?'yellow':'red',ew:t>=22&&t<40?'green':t>=40&&t<43?'yellow':'red'},pedestrian=i>400&&i<500?[22,38]:null;
 previous.trafficStep(old,config.lanes,.05,phase,pedestrian);C.trafficStep(current,config.lanes,.05,phase,pedestrian);
 assert.equal(JSON.stringify(current),JSON.stringify(old),'identical turn/queue/braking behavior at step '+i);
}
const html=fs.readFileSync(require.resolve('../venue-frame.html'),'utf8'),sizing=html.match(/function renderSize150\([\s\S]*?\n}/)[0];
const size=vm.runInNewContext('('+sizing+')');
for(const [w,h,dpr,q]of [[3442,1930,2,1.25],[1920,1080,2,1.25],[390,844,3,1.25],[3442,1930,2,.75]]){
 const [rw,rh]=size(w,h,dpr,q);assert(rw*rh<=(q<=.75?1200000:2400000));assert(Math.abs(rw/rh-w/h)<.004);
}
assert.equal(JSON.stringify(size(1440,900,1,1.25)),JSON.stringify([1440,900]));
assert.equal(JSON.stringify(size(3442,1930,2,2)),JSON.stringify([6884,3860]));
assert(/if\(state.sunShadows===false\|\|clock.power<\.001\)return/.test(html));
const solar={window:{},camera:[0,0,0],state:{sunShadows:true},SUN_INTERVAL132:.5,sunSlot132:null,sunBlend132:0,sunPending150:false,lastSunRoof:null,sunDepth:'a',sunNextDepth132:'b',sunLightVP:null,sunNextVP132:null,time:0,power:1,roof:true,calls:0};
solar.CityLighting131={snapshot:()=>({cycle:solar.time,power:solar.power})};solar.CityClock131={sample:t=>({sun:t})};solar.roofsVisible=()=>solar.roof;solar.solarMatrix131=t=>t;solar.drawSolarMap132=()=>solar.calls++;
vm.createContext(solar);vm.runInContext(html.match(/function updateSunShadows\(\)\{[\s\S]*?\n}/)[0],solar);
for(const [time,count]of [[0,1],[.01,1],[.02,0],[.51,1],[3.1,1],[8.7,1],[8.8,0]]){
 solar.time=time;solar.calls=0;solar.updateSunShadows();assert.equal(solar.calls,count,'bounded solar work at '+time);
}
solar.state.sunShadows=false;solar.time=10;solar.calls=0;solar.updateSunShadows();assert.equal(solar.calls,0);
solar.state.sunShadows=true;solar.power=0;solar.updateSunShadows();assert.equal(solar.calls,0);
solar.power=1;solar.window.HotelCore146={insideLobby150:()=>true};solar.updateSunShadows();assert.equal(solar.calls,0,'lobby reuses the outdoor atlas');
const adaptive={state:{quality:1.25,paused:false,fps:20},document:{hidden:false},canvas:{width:1440,height:900},renderBudget150:2400000,resolutionCheck150:0,resolutionGrow150:0};
vm.createContext(adaptive);vm.runInContext(html.match(/function updateRenderBudget150\(now\)\{[\s\S]*?\n}/)[0],adaptive);
adaptive.updateRenderBudget150(2500);assert.equal(adaptive.renderBudget150,1036800);
adaptive.state.quality=2;adaptive.updateRenderBudget150(5000);assert.equal(adaptive.renderBudget150,1036800,'Sharp remains manual');
console.log('PASS 500 wheel/body matrices, 1000 identical traffic steps, pixel budgets, and solar initialization/late-frame/disabled/night scheduling');
