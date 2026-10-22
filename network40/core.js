(function(root){
 const faults=[{rack:1,port:27,name:'Primary uplink'},{rack:4,port:22,name:'Application server link'}];
 function beamLength(p,yaw,extent,maxLength=2.3){
  const direction=[Math.sin(yaw),Math.cos(yaw)],margin=[.08+Math.abs(Math.cos(yaw))*.15,.08+Math.abs(Math.sin(yaw))*.15];let length=maxLength;
  // Clip the entire beam width to the room's inner faces, not only its center ray.
  for(let i=0;i<2;i++){const d=direction[i];if(Math.abs(d)<1e-8)continue;const edge=d>0?extent[i+2]-margin[i]:extent[i]+margin[i];length=Math.min(length,(edge-p[i*2])/d);}
  return Math.max(0,length);
 }
 function create(){
  const s={};
  function reset(){Object.assign(s,{started:false,phase:'offline',connected:[false,false],doors:Array(9).fill(false),angles:Array(9).fill(0),inspected:[],repair:null,testTime:0,tests:0,diagnosed:false,points:0,time:0,message:'Network connection lost. Inspect the server cabinets.',log:[]});}
  function start(){if(s.started)return;s.started=true;s.log=['ALERT: network connection lost'];}
  function door(i){if(i<0||i>=9||s.repair)return false;s.doors[i]=!s.doors[i];if(s.doors[i]&&!s.inspected.includes(i))s.inspected.push(i);return true;}
  function reconnect(i){const f=faults[i];if(!s.started||!f||s.connected[i]||s.repair||s.phase==='testing'||!s.doors[f.rack]||s.angles[f.rack]<1)return false;
   s.repair={fault:i,time:0};s.message='Reconnecting Ethernet cable...';return true;
  }
  function test(){if(!s.started||s.repair||s.phase==='testing'||s.phase==='complete')return false;s.phase='testing';s.testTime=0;s.message='Running network diagnostics...';return true;}
  function tick(dt){dt=Math.max(0,Math.min(.1,dt));s.time+=dt;
   for(let i=0;i<9;i++){const goal=s.doors[i]?1.85:0;s.angles[i]+=Math.max(-dt*2.5,Math.min(dt*2.5,goal-s.angles[i]));}
   if(s.repair){s.repair.time+=dt;if(s.repair.time>=1.6){s.connected[s.repair.fault]=true;s.log.push(faults[s.repair.fault].name+': cable seated');s.repair=null;s.phase='awaiting-test';s.message='Cable connected. Return to the computer and run a network test.';}}
   if(s.phase==='testing'){s.testTime+=dt;if(s.testTime>=2.4){s.tests++;
    const remaining=faults.filter((_,i)=>!s.connected[i]);
    faults.forEach((f,i)=>s.log.push((s.connected[i]?'PASS: ':'FAIL: ')+f.name+(s.connected[i]?' connected':' disconnected')));
    if(remaining.length){s.diagnosed=true;s.phase=s.connected.some(Boolean)?'secondary-fault':'offline';s.message=(s.connected.some(Boolean)?'Another error: ':'Test failed: ')+remaining.map(f=>f.name).join(' and ')+' disconnected. Check the cabinets for a loose cable.';}
    else{s.phase='complete';s.points=200;s.message='Network connection established. Challenge complete! +200 points';s.log.push('PASS: end-to-end network connection established');}
   }}
  }
  function faulty(rack,port){return faults.some((f,i)=>f.rack===rack&&f.port===port&&!s.connected[i]);}
  function led(rack,port){if(faulty(rack,port))return 'amber';return (s.time*(.55+((port*17+rack*11)%251)/90)+(port*0.618+rack*.31))%1<.7?'green':'dim';}
  reset();return{state:s,start,door,reconnect,test,tick,reset,led};
 }
 const api={create,faults,beamLength};root.NetworkCore40=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
