import {parts,buildSteps,bootSteps} from './curriculum.js?v=20261009-detail78';
export function create(saved){
 const s={phase:'learn',lesson:0,learned:[],step:0,installed:[],fasteners:[],selected:null,orientation:0,boot:0,errors:0,completed:false};
 if(saved&&(saved.version===1||saved.version===2)){
  if(['learn','build','boot','complete'].includes(saved.phase))s.phase=saved.phase;
  s.learned=parts.map(p=>p.id).filter(id=>saved.learned?.includes(id));
  s.lesson=Math.min(s.learned.length,parts.length-1);
  if(s.learned.length!==parts.length&&s.phase!=='learn')s.phase='learn';
  const restoredStep=saved.version===1&&saved.step>=20?saved.step+5:saved.step;
  s.step=Number.isInteger(restoredStep)?Math.max(0,Math.min(buildSteps.length,restoredStep)):0;
  if(s.phase==='learn')s.step=0;
  s.installed=buildSteps.slice(0,s.step).map(p=>p.id);
  s.boot=s.step===buildSteps.length&&Number.isInteger(saved.boot)?Math.max(0,Math.min(bootSteps.length,saved.boot)):0;
  if(s.phase==='complete'&&s.boot<bootSteps.length)s.phase='build';
  if(s.phase==='boot'&&s.step<buildSteps.length)s.phase='build';
  if(s.phase==='build'&&s.step===buildSteps.length)s.phase='boot';
  s.completed=s.phase==='complete';
 }
 const current=()=>buildSteps[s.step];
 function startStep(){s.selected=current()?.kind==='instruction'?null:current()?.part||null;s.fasteners=[];s.orientation=current()?.orientation||0;}
 startStep();
 function wrong(text){return {ok:false,text};}
 function nextLesson(){if(s.phase!=='learn')return false;const id=parts[s.lesson].id;if(!s.learned.includes(id))s.learned.push(id);if(s.lesson<parts.length-1)s.lesson++;else{s.phase='build';startStep();}return true;}
 function select(id){s.selected=id;}
 function rotate(){s.orientation=(s.orientation+1)%4;}
 function advance(){s.installed.push(current().id);s.step++;if(s.step===buildSteps.length)s.phase='boot';startStep();return {ok:true,text:'Completed.'};}
 function continueStep(){if(s.phase!=='build'||current().kind!=='instruction')return {ok:false};return advance();}
 function act(target,index=0){
  if(s.phase!=='build')return {ok:false};const step=current();
  if(step.kind==='instruction')return {ok:false};
  if(s.selected!==step.part)return wrong('Choose the part or tool for this step first.');
  if(target!==step.target)return wrong('Look for the green '+step.target+' point.');
  if(step.orientation!=null&&s.orientation!==0)return wrong('Turn the part until the markers match. Do not force it.');
  if(step.kind==='fasten'){
   if(!Number.isInteger(index)||index<0||index>=step.count||s.fasteners.includes(index))return {ok:false,text:'Already done. Choose another green point.'};
   s.fasteners.push(index);if(s.fasteners.length<step.count)return {ok:true,text:`${step.count-s.fasteners.length} points left.`,partial:true};
  }
  return advance();
 }
 function boot(){if(s.phase!=='boot'||s.installed.length!==buildSteps.length)return false;s.boot++;if(s.boot>=bootSteps.length){s.phase='complete';s.completed=true;}return true;}
 return {state:s,current,nextLesson,select,rotate,continueStep,act,boot,serialize:()=>({version:2,...s})};
}
