/* Indoor walk-up entry points; existing outdoor challenges own their gameplay. */
const ChallengeEntry38=(()=>{
 const entries={farm:{x:10.4,z:5,label:'Harvest challenge'},ambulance:{x:56.8,z:-23.2,label:'Ambulance challenge'}};
 let active=null,ready=false,prompt;
 const mounted=()=>Farming36.mounted||Ambulance35.mounted||Forklift34.mounted||Robotics37.active;
 function nearby(){if(!ready||mounted()||state.overview||state.paused||HubGuide.snapshot().dialogOpen)return null;return Object.keys(entries).find(k=>{const p=entries[k],x=player.position[0],z=player.position[2],inside=k==='farm'?x>=9&&z>=3.6:x<=58.2&&z>=-24.6;return inside&&Math.hypot(x-p.x,z-p.z)<2.35&&Math.abs(player.position[1]-floorHeightAt(p.x,p.z))<1.5;})||null;}
 function visit(kind){if(!ready||mounted()||!entries[kind])return;const p=entries[kind];places.challengeEntry38={label:p.label,p:[p.x+(kind==='farm'?1.7:-1.6),floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.02,p.z+.8],scaledPlayer:true,yaw:kind==='farm'?1:-1};teleport('challengeEntry38');state.radius=2.5;updateCamera(0,true);update();}
 function begin(kind=nearby()){
  if(!kind||nearby()!==kind)return;
  const challenge=kind==='farm'?Farming36:Ambulance35;
  if(challenge.snapshot().status!=='ready')return;
  active=kind;keys.clear();challenge.visit();challenge.enter();update();
 }
 function update(){
  if(!ready)return;
  if(Farming36.mounted)active='farm';else if(Ambulance35.mounted)active='ambulance';
  if(active==='ambulance'&&!Ambulance35.mounted){const s=Ambulance35.snapshot();if(Math.hypot(player.position[0]-s.x,player.position[2]-s.z)>3.5){active=null;$('ambulanceResult35').hidden=true;}}
  if(!Farming36.mounted&&!Ambulance35.mounted&&player.position[0]>-22&&player.position[0]<60&&player.position[2]>-25&&player.position[2]<25)active=null;
  const blocked=Forklift34.mounted||Robotics37.active;
  for(const [kind,id] of [['farm','farmPanel36'],['ambulance','ambulancePanel35']]){const p=$(id);p.hidden=active!==kind||blocked;if(!p.hidden){p.open=true;const skill=$('skillHud').getBoundingClientRect();p.style.setProperty('--challenge-top',Math.max(70,skill.bottom+8)+'px');const result=$(kind==='farm'?'farmResult36':'ambulanceResult35'),top=p.getBoundingClientRect().bottom+10;result.style.setProperty('top',top+'px','important');result.style.maxHeight=Math.max(90,innerHeight-top-90)+'px';result.style.overflow='auto';result.style.boxSizing='border-box';}}
  const kind=nearby();prompt.hidden=!kind;prompt.textContent=kind?'Press T - '+entries[kind].label:'';
 }
 function init(){
  const style=document.createElement('style');style.textContent=`
   #farmPanel36,#ambulancePanel35{display:none!important}
   #farmPanel36:not([hidden]),#ambulancePanel35:not([hidden]){display:grid!important;position:fixed!important;top:var(--challenge-top,130px)!important;bottom:auto!important;left:50%!important;right:auto!important;transform:translateX(-50%);width:min(880px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px);max-height:250px!important;box-sizing:border-box;padding:10px 14px!important;overflow:auto;gap:8px 16px;grid-template-columns:160px minmax(240px,1fr) 230px;align-items:center;z-index:25}
   #farmPanel36 summary,#ambulancePanel35 summary,#farmVisit36,#ambulanceVisit35{display:none!important}
   #farmStatus36,#ambulanceStatus35{margin:0!important;font-weight:bold;font-size:13px;line-height:1.4}
   #farmReadout36{display:grid!important;grid-template-columns:minmax(130px,1fr) 68px!important;gap:12px;margin:0!important}#farmMap36{width:68px!important;height:92px!important}#farmBales36{margin:4px 0!important;font-size:12px}#farmPanel36 label{margin-top:2px}#farmPanel36 progress{height:8px}#farmGrain36{margin-top:3px!important}
   #farmSwitch36{width:auto!important;margin:0!important}#farmDrive36{grid-column:3;grid-row:2}#farmActions36{grid-column:1/3;grid-row:2}#farmControls36,#ambulanceControls35{margin:0!important;gap:4px}#farmPanel36 button,#ambulancePanel35 button{min-height:30px!important;padding:4px 7px!important;font-size:11px}
   #ambulancePanel35:not([hidden]){grid-template-columns:110px minmax(180px,1fr) 250px}#ambulanceTimer35{grid-column:1;grid-row:1/3;font-size:30px;margin:0}#ambulanceStatus35{grid-column:2;grid-row:1}#ambulanceCondition35{grid-column:2;grid-row:2;margin:0}#ambulanceWarning35{grid-column:1/3;grid-row:3;margin:0;min-height:0}#ambulanceRestart35{grid-column:3;grid-row:1;justify-self:end}#ambulanceDrive35{grid-column:3;grid-row:2/4}#ambulanceControls35{margin-bottom:5px!important}
   #challengePrompt38{position:fixed;bottom:105px;left:50%;transform:translateX(-50%);z-index:40;padding:12px 18px;color:white;background:#17443c;border:1px solid #9cdec7;border-radius:4px;white-space:nowrap}#challengePrompt38[hidden]{display:none}
   
  `;document.head.append(style);
  style.textContent+=`#farmPanel36:not([hidden]),#ambulancePanel35:not([hidden]){display:block!important}.challengeLayout38{display:grid;grid-template-columns:160px minmax(240px,1fr) 230px;gap:8px 16px;align-items:center}#ambulancePanel35 .challengeLayout38{grid-template-columns:110px minmax(180px,1fr) 250px}`;
  for(const id of ['farmPanel36','ambulancePanel35']){const panel=$(id),layout=document.createElement('div');layout.className='challengeLayout38';for(const child of [...panel.children])if(child.tagName!=='SUMMARY')layout.append(child);panel.append(layout);}
  prompt=document.createElement('button');prompt.id='challengePrompt38';prompt.hidden=true;prompt.onclick=()=>begin();document.body.append(prompt);
  const p=entries.ambulance,y=floorHeightAt(p.x,p.z),v=[];for(const h of [y,y+1.5])for(const z of [p.z-1.3,p.z+1.3])for(const x of [p.x-1.3,p.x+1.3])v.push(x,h,z);
  registerCollider('Health Science ambulance display','solidCollider',new Float32Array(v),new Uint32Array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3]),false,{});baselineColliders.push(colliders.at(-1));refreshShipments();Crowd.invalidate();
  ready=true;update();const entry=new URLSearchParams(location.search).get('entry');if(entries[entry])visit(entry);
 }
 window.addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='t'||!nearby()||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)begin();},true);
 return {init,update,begin,nearby,visit,snapshot:()=>({ready,active,entries})};
})();
window.ChallengeEntry38=ChallengeEntry38;
{
 const update=RobotExhibit20.update;RobotExhibit20.update=function(dt){update(dt);ChallengeEntry38.update();};
 const start=()=>{if(!state.ready||Farming36.snapshot().status!=='ready'||Ambulance35.snapshot().status!=='ready'){setTimeout(start,250);return;}ChallengeEntry38.init();};start();
}
