import {parts,buildSteps,bootSteps,sources,installationList} from './curriculum.js?v=20261009-hardware85';
import {create} from './core.js?v=20261009-detail78';
import {workshop} from './scene.js?v=20261020-loading155';
import {builds,collectionKey,rewardState,earnReward} from './collection.js?v=20261009-collection86';
import {testTrack,preloadTestTrack} from './race.js?v=20261020-loading155';
const $=id=>document.getElementById(id),key='micq.pc-builder66.v1';
let saved;try{saved=JSON.parse(localStorage.getItem(key));}catch{}
let storedReward;try{storedReward=JSON.parse(localStorage.getItem(collectionKey));}catch{}
const reward=rewardState(storedReward);
let game=create(saved),view=null,race=null,busy=false,feedback='',bootTimer=null,bootTimerStep=-1;
let embeddedVisible=new URLSearchParams(location.search).get('preload')!=='1';
function stopRace(){race?.dispose();race=null;view?.desktop.setRace(false);document.body.classList.remove('monitor-race');$('race').hidden=$('race-controls').hidden=true;render();$('next').focus();}
function startRace(){
 if(race||!view)return;document.body.classList.add('monitor-race');$('race').hidden=$('race-controls').hidden=false;view.desktop.setRace(true);view.home();
 try{race=testTrack($('race'),$('race-controls'),stopRace,{embedded:true,onFrame:(canvas,state)=>view.desktop.gameFrame(canvas,state)});}catch(error){view.desktop.setRace(false);document.body.classList.remove('monitor-race');$('race').hidden=$('race-controls').hidden=true;feedback='The race could not start. Please try again.';console.error(error);}
 render();
}
function advanceBoot(){if(game.state.phase!=='boot'||game.state.boot>1)return;game.boot();feedback='';save();render();}
function scheduleBoot(){const s=game.state;if(!embeddedVisible||s.phase!=='boot'||s.boot<2){clearTimeout(bootTimer);bootTimer=null;bootTimerStep=-1;return;}if(bootTimer&&bootTimerStep===s.boot)return;clearTimeout(bootTimer);bootTimerStep=s.boot;bootTimer=setTimeout(()=>{bootTimer=null;if(game.state.phase==='boot'&&game.state.boot===bootTimerStep){game.boot();save();render();if(game.state.completed)notify('pc66-complete');}},s.boot===2?3700:750);}
const parentOrigin=(()=>{try{return new URL(document.referrer||location.href).origin;}catch{return location.origin;}})();
const notify=(type,data={})=>parent.postMessage({type,...data},parentOrigin==='null'?'*':parentOrigin);
const names={board:'Motherboard',cpu:'CPU',ramA:'First RAM stick',ramB:'Second RAM stick',cooler:'Liquid CPU cooler',psu:'Power supply',drive:'Hard drive',gpu:'Graphics card',panel:'Side panel',standoffs:'Board supports',screwdriver:'Screwdriver',lever:'Socket lever',bracket:'Cooler supports',paste:'Thermal paste',cpuFan:'Pump speed cable',atx:'24-pin board power',eps:'4+4-pin CPU power',pcie:'GPU power lead',sataData:'SATA data cable',sataPower:'SATA power cable',caseFans:'Case fan harness',frontPanel:'Power-button cable',usb:'Front USB cable',audio:'HD AUDIO cable',frontFans:'Bottom intake fans',rearFan:'Rear exhaust fan',topFans:'Radiator fans',pumpPower:'Cooling controller power',pumpUsb:'Cooling controller USB'};
const icon=id=>parts.find(p=>p.id===id)?.icon||(/ram/.test(id)?'memory-stick':/screw|stand|bracket/.test(id)?'wrench':/Fan|cooler/.test(id)?'fan':'plug');
function button(text,fn,iconName){const b=document.createElement('button');if(iconName){const im=document.createElement('img');im.src='icons/'+iconName+'.svg';im.alt='';b.append(im);}b.append(document.createTextNode(text));b.onclick=fn;return b;}
function save(){try{localStorage.setItem(key,JSON.stringify(game.serialize()));$('save').textContent='Progress saved on this device';}catch{$('save').textContent='Storage unavailable; progress lasts for this visit';}}
function report(result){feedback=result.text||'';$('feedback').classList.toggle('success',!!result.ok);save();render();}
function act(target,index=0){if(target==='power'){advanceBoot();return;}if(target==='test-graphics'){startRace();return;}if(target==='monitor'){race?.screenClick(index.x,index.y);return;}if(busy)return;view?.viewer({rotation:false});$('autoRotate').setAttribute('aria-pressed','false');report(game.act(target,index));}
let lastChecklistFocus='';
const checklistRows=installationList.map((item,i)=>{
 const row=document.createElement('li');row.dataset.hardware=item.id;
 const picture=document.createElement('img');picture.src=`pictures/${item.image}.png?v=20261009-hardware85`;picture.alt=item.name;picture.width=64;picture.height=64;
 const copy=document.createElement('div'),name=document.createElement('strong'),status=document.createElement('small'),mark=document.createElement('span');
 name.textContent=item.name;mark.className='hardware-mark';mark.textContent=String(i+1);mark.setAttribute('aria-hidden','true');copy.append(name,status);row.append(picture,copy,mark);$('hardware-list').append(row);return {row,status,mark,item};
});
function updateChecklist(s){
 let doneCount=0,focus=null;
 const learning=s.phase==='learn',order=learning?parts.map(part=>checklistRows.find(entry=>entry.item.id===part.id)):checklistRows;
 document.querySelector('.list-heading h2').textContent=learning?'Meet the parts':'Build order';
 $('build-list').setAttribute('aria-label',learning?'Hardware lesson order':'Parts in installation order');
 for(const entry of checklistRows)entry.row.hidden=learning&&!order.includes(entry);
 for(const entry of order)$('hardware-list').append(entry.row);
 for(const entry of checklistRows){const {row,status,mark,item}=entry,done=item.steps.every(id=>s.installed.includes(id)),current=s.phase==='build'?item.steps.includes(buildSteps[s.step]?.id):s.phase==='learn'&&parts[s.lesson].id===item.id;
  if(done)doneCount++;row.classList.toggle('installed',done);row.classList.toggle('current',current);status.textContent=done?'Installed':current?learning?'Meet this part':'Install now':learning?s.learned.includes(item.id)?'Learned':'Next part':'Not installed';mark.textContent=done?'\u2713':String(order.indexOf(entry)+1);
  if(current){row.setAttribute('aria-current','step');focus=row;}else row.removeAttribute('aria-current');
 }
 $('installed-count').textContent=learning?`${s.learned.length} / ${parts.length} learned`:`${doneCount} / ${installationList.length} installed`;
 if(focus&&lastChecklistFocus!==s.phase+focus.dataset.hardware){lastChecklistFocus=s.phase+focus.dataset.hardware;focus.scrollIntoView({block:'nearest',inline:'nearest'});}
}
function render(){const firstReward=earnReward(reward,game);if(reward.unlocked){try{localStorage.setItem(collectionKey,JSON.stringify(reward));}catch{}}const s=game.state,step=game.current();
 $('display-build').lastChild.textContent='Display Build';
 $('display-build').hidden=s.phase!=='complete'||!reward.unlocked||!!race;
 $('collection-open').hidden=!reward.unlocked;$('collection-open').disabled=!!race;$('collection-selected').hidden=!reward.unlocked||s.phase!=='complete';$('collection-selected').textContent=builds.find(b=>b.id===reward.selected).name;
 document.body.classList.toggle('desk-mode',s.phase==='boot'||s.phase==='complete');$('monitorFocus').hidden=s.phase!=='boot'&&s.phase!=='complete';scheduleBoot();
 updateChecklist(s);
 document.querySelectorAll('nav [data-phase]').forEach(n=>{const phases=['learn','build','boot','complete'];n.classList.toggle('active',n.dataset.phase===s.phase);n.classList.toggle('done',phases.indexOf(n.dataset.phase)<phases.indexOf(s.phase));});
 $('quiz').replaceChildren();$('inventory').replaceChildren();$('next').hidden=true;$('source').hidden=true;$('boot-screen').hidden=true;$('rotate').disabled=s.phase!=='build'||step?.orientation==null||$('reference').checked;$('feedback').textContent=feedback;
 $('progress').value=(s.learned.length+s.step+s.boot)/(parts.length+buildSteps.length+bootSteps.length)*100;
 if(s.phase==='learn'){
  const p=parts[s.lesson];$('counter').textContent=`MEET THE PARTS ${s.lesson+1} / ${parts.length}`;$('title').textContent=p.name;$('spec').textContent='';$('description').textContent=p.role;$('detail').textContent='';
  $('next').hidden=false;$('next').textContent=s.lesson===parts.length-1?'Start building':'Next part';$('next').onclick=()=>{game.nextLesson();feedback='';save();render();};
 }else if(s.phase==='build'){
  $('counter').textContent=`BUILD ${s.step+1} / ${buildSteps.length}`;$('title').textContent=step.title;$('spec').textContent=step.kind==='fasten'?`${s.fasteners.length} / ${step.count} points done`:'';$('description').textContent=step.text;
  $('detail').textContent=step.kind==='instruction'?'':step.orientation!=null&&s.orientation!==0?'Turn the part with the rotate button until the markers match.':step.kind==='fasten'?'Click each green numbered point.':`Click the green ${step.target==='panel'?'side panel':step.target} point.`;
  if(step.kind==='instruction'){$('next').hidden=false;$('next').textContent=step.action;$('next').onclick=()=>report(game.continueStep());}
  else{
   const ids=[step.part];
   for(const id of ids){const label=document.createElement('div'),picture=document.createElement('img');label.className='ready-part';label.dataset.part=id;picture.src='icons/'+icon(id)+'.svg';picture.alt='';label.append(picture,document.createTextNode(names[id]));$('inventory').append(label);}
  }
 }else if(s.phase==='boot'){
  $('counter').textContent='GAMING SETUP';$('spec').textContent=s.boot===0?'Alienware / 38-inch curved ultrawide':'';
  $('title').textContent=['Connect your setup','Power on','Starting your PC','All systems ready'][s.boot];
  $('description').textContent=['Connect the monitor to the graphics card. Connect the white RGB keyboard and mouse to USB.','Press the highlighted power button on the PC.','The monitor shows each component as it passes its startup check.','Your gaming setup is ready.'][s.boot];$('detail').textContent='';
  if(s.boot===0){$('next').hidden=false;$('next').disabled=false;$('next').textContent='Connect DisplayPort + USB';$('next').onclick=advanceBoot;}
 }else{
  $('counter').textContent='BUILD COMPLETE';$('title').textContent='Your setup is ready';$('spec').textContent='';$('description').textContent=firstReward?'Build complete. Your PC collection is unlocked.':'All six system checks passed.';$('detail').textContent='Training simulation, not a real hardware benchmark.';
  $('next').hidden=false;$('next').disabled=false;$('next').textContent=race?'End test drive':'Test graphics';$('next').onclick=()=>race?stopRace():startRace();
 }
 $('spec').hidden=!$('spec').textContent;$('detail').hidden=!$('detail').textContent;
 if(view){view.choosePC(s.phase==='complete'?reward.selected:'original');view.setView({...s,lessonPart:parts[s.lesson].id},step,$('reference').checked);view.suspend(!embeddedVisible);}
}
for(const p of parts){const row=document.createElement('div');row.className='spec-row';const name=document.createElement('strong');name.textContent=p.name;const spec=document.createElement('p');spec.textContent=p.spec;const detail=document.createElement('p');detail.textContent=p.detail;const a=document.createElement('a');a.textContent=sources[p.source][0];a.href=sources[p.source][1];a.target='_blank';a.rel='noopener';row.append(name,spec,detail,a);$('spec-list').append(row);}
const notes=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Full assembly notes';notes.append(summary);for(const item of buildSteps){const row=document.createElement('p'),title=document.createElement('strong');title.textContent=item.title+': ';row.append(title,document.createTextNode(item.note));notes.append(row);}$('spec-list').append(notes);
for(const [name,url]of Object.values(sources)){const a=document.createElement('a');a.href=url;a.textContent=name;a.target='_blank';a.rel='noopener';$('source-list').append(a);}
for(const [name,url]of [['Race car: Ferrari 458 Italia by vicent091036 (Three.js example)','https://threejs.org/examples/webgl_materials_car.html'],['Race lighting: Venice Sunset by Greg Zaal / Poly Haven (CC0)','https://polyhaven.com/a/venice_sunset']]){const a=document.createElement('a');a.href=url;a.textContent=name;a.target='_blank';a.rel='noopener';$('source-list').append(a);}
const collectionDialog=$('pc-collection');
for(const build of builds){const tile=button('',()=>{if(!reward.unlocked)return;const showing=view?.award.active;reward.selected=build.id;if(game.state.phase!=='complete')game=create(reward.certificate);save();render();collectionDialog.close();view?.home();if(showing&&window.PCStandalone91){view.award.show();displayBuild.lastChild.textContent='Back to Setup';}if(parent!==window)notify('pc66-select',{id:build.id});});tile.className='collection-tile';tile.dataset.build=build.id;tile.setAttribute('aria-label','Use '+build.name);const picture=document.createElement('img');picture.src='pictures/collection-'+build.id+'.jpg?v=collection86';picture.alt='';picture.width=480;picture.height=400;const name=document.createElement('strong');name.textContent=build.name;const finish=document.createElement('span');finish.textContent=build.finish;const cooling=document.createElement('small');cooling.textContent=build.cooling;tile.append(picture,name,finish,cooling);$('collection-grid').append(tile);}
$('collection-open').onclick=()=>{if(!reward.unlocked)return;for(const tile of collectionDialog.querySelectorAll('[data-build]'))tile.setAttribute('aria-pressed',String(tile.dataset.build===reward.selected));collectionDialog.showModal();};
$('specs').onclick=()=>$('build-sheet').showModal();$('restart').onclick=()=>$('reset-dialog').showModal();$('cancel-reset').onclick=()=>$('reset-dialog').close();$('confirm-reset').onclick=()=>{game=create();feedback='';race?.dispose();race=null;view?.desktop.setRace(false);document.body.classList.remove('monitor-race');$('race').hidden=$('race-controls').hidden=true;$('reference').checked=false;$('reset-dialog').close();save();render();};
$('exit').onclick=()=>{if(window.PCStandalone91){view?.award.close();view?.home();return;}if(parent!==window)notify('pc66-close');else location.href='../venue-frame.html?challenge=pc';};
$('home').onclick=()=>view?.home();$('zoomIn').onclick=()=>view?.zoom(.82);$('zoomOut').onclick=()=>view?.zoom(1.22);$('rotate').onclick=()=>{game.rotate();feedback='';render();};$('reference').onchange=render;
const displayBuild=button('Display Build',()=>{if(game.state.phase!=='complete'||!reward.unlocked||race)return;if(window.PCStandalone91){if(view.award.active){view.award.close();displayBuild.lastChild.textContent='Display Build';}else{view.award.show();displayBuild.lastChild.textContent='Back to Setup';}return;}const id=reward.selected;try{localStorage.setItem('micq.pc-builder66.showcase.v1',JSON.stringify({id}));}catch{}if(parent!==window)notify('pc66-display',{id});else location.href='../venue-frame.html?v=20261009-showcase90&challenge=pc';},'rotate-3d');displayBuild.id='display-build';displayBuild.hidden=true;document.getElementById('workspace').append(displayBuild);
const monitorFocus=button('',()=>view?.focusMonitor(),'monitor');monitorFocus.id='monitorFocus';monitorFocus.title='Focus monitor';monitorFocus.setAttribute('aria-label','Focus monitor');monitorFocus.hidden=true;document.querySelector('.view-tools').append(monitorFocus);
for(const [id,setting]of [['autoRotate','rotation'],['airflow','airflow'],['rgb','rgb'],['glass','glass']])$(id).onclick=()=>{if(!view)return;const current=view.snapshot().viewer[setting],next=!current;view.viewer({[setting]:next});$(id).setAttribute('aria-pressed',String(setting==='glass'?!next:next));};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){e.preventDefault();if(race)stopRace();else $('exit').click();}});
window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='pc66-visibility')return;embeddedVisible=!!e.data.visible;if(!embeddedVisible&&race)stopRace();view?.suspend(!embeddedVisible);render();});
async function load(){try{view=await workshop($('viewport'),act,{suspended:!embeddedVisible});if(!embeddedVisible)await preloadTestTrack();$('loading').hidden=true;render();notify('pc66-ready');}catch(e){$('loading').replaceChildren(document.createTextNode('The workshop could not load. '+e.message),button('Retry',()=>location.reload()));notify('pc66-error',{message:e.message});console.error(e);}}
window.PCBuilder66={get reward(){return structuredClone(reward);},get state(){return structuredClone(game.state);},get view(){return view;},get game(){return game;},get race(){return race;},render,act,parts,buildSteps,bootSteps};
window.addEventListener('pagehide',()=>{clearTimeout(bootTimer);race?.dispose();view?.dispose();});render();load();
