/* Local-only student progress. Old exploration badges do not award challenge credit. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MissionCore99=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const industries=[
  {id:'agri',industry:'Agribusiness',title:'Feed the Future',color:'#508329',icon:'sprout',challenges:[['harvest','Harvest & Bale'],['drone','Drone Inspection & Irrigation']],questions:['What does this employer grow, produce, or help farmers do?','Name a job at this employer and a skill or training it needs.','How does this employer use technology, conserve resources, or keep food safe?'],reflection:'What interests you most about food, farming, or the environment, and why?'},
  {id:'manufacturing',industry:'Manufacturing',title:'Make It Happen',color:'#247ca5',icon:'factory',challenges:[['robotics','Robotics'],['welding','Welding']],questions:['What does this employer make, and who uses it?','Name a job at this employer and a skill or training it needs.','What machine, process, or safety practice did you learn about here?'],reflection:'Which manufacturing job or technology would you like to try, and why?'},
  {id:'construction',industry:'Construction',title:'Build Our World',color:'#a96b16',icon:'hard-hat',challenges:[['forklift','Forklift'],['crane','Crane']],questions:['What does this employer build, install, design, or maintain?','Name a trade or job at this employer and how someone trains for it.','What tool, teamwork skill, or safety practice matters in this work?'],reflection:'What would you enjoy building or helping improve in your community?'},
  {id:'health',industry:'Health Science',title:'Care for People',color:'#b53658',icon:'heart-pulse',challenges:[['ambulance','Ambulance'],['mri','MRI']],questions:['Who does this employer help, and what services or products does it provide?','Name a job at this employer and the education or training it needs.','What did you learn about caring for patients or protecting their safety?'],reflection:'What about healthcare do you find most interesting, and why?'},
  {id:'it',industry:'Information Technology',title:'Connect the Future',color:'#7252a7',icon:'cpu',challenges:[['network','Network Recovery'],['pc','PC Build']],questions:['What technology or service does this employer provide, and who uses it?','Name a job at this employer and a skill or training it needs.','What problem does this employer solve using technology?'],reflection:'Which technology problem would you like to solve, and why?'},
  {id:'hospitality',industry:'Hospitality',title:'Create Great Experiences',color:'#dc7528',icon:'briefcase',challenges:[['hibachi','Hibachi Grill'],['hotel','Hotel Guest Check-In']],questions:['What experience or service does this employer provide for guests?','Name a hospitality job and the skills or training it needs.','How does this employer use teamwork or care for guests?'],reflection:'What kind of guest experience would you enjoy helping create, and why?'}
 ];
 const career={id:'career',title:'My Next Step',color:'#127f78',icon:'compass'};
 const missions=[...industries,career];
 const logos=[{id:'spark',name:'Bright Ideas',icon:'lightbulb',color:'#247ca5'},{id:'growth',name:'New Growth',icon:'sprout',color:'#508329'},{id:'connect',name:'Connected',icon:'network',color:'#7252a7'},{id:'care',name:'People First',icon:'heart-handshake',color:'#b53658'}];
 const KEY='mcqStudentMissions_v2';
 const clean=(v,max=700)=>typeof v==='string'?v.trim().slice(0,max):'';
 const enough=v=>typeof v==='string'&&v.trim().length>=8&&v.trim().length<=700;
 const empty=()=>({version:2,challenges:{},visits:{},reflections:{},career:{},completedAt:null,testComplete:false});
 function normalize(raw){
  const s=empty();if(raw?.version!==2)return s;s.testComplete=raw.testComplete===true;
  for(const m of industries){for(const [id] of m.challenges)if(raw.challenges?.[id]===true)s.challenges[id]=true;
   s.visits[m.id]=[];
   for(const v of (Array.isArray(raw.visits?.[m.id])?raw.visits[m.id]:[]).slice(0,200)){
    const id=clean(v?.id,200),name=clean(v?.name,200),answers=Array.isArray(v?.answers)?v.answers.slice(0,3).map(x=>clean(x)):[];
    if(id&&name&&answers.length===3&&answers.every(enough)&&!s.visits[m.id].some(x=>x.id===id))s.visits[m.id].push({id,name,answers});
   }
   s.reflections[m.id]=clean(raw.reflections?.[m.id]);
  }
  for(const k of ['name','company','industry','plan','step','logo'])s.career[k]=clean(raw.career?.[k],['name','company'].includes(k)?80:700);
  if(typeof raw.completedAt==='string'&&!Number.isNaN(Date.parse(raw.completedAt)))s.completedAt=raw.completedAt;
  return s;
 }
 function careerDone(s){const c=s.career;return !!(clean(c.name,80)&&clean(c.company,80)&&industries.some(m=>m.id===c.industry)&&logos.some(l=>l.id===c.logo)&&enough(c.plan)&&enough(c.step));}
 function progress(s,m){if(s.testComplete)return 100;if(m.id==='career')return careerDone(s)?100:0;const n=m.challenges.filter(([id])=>s.challenges[id]).length,v=Math.min(5,(s.visits[m.id]||[]).length),r=enough(s.reflections[m.id])?1:0;return Math.round((n+v+r)/(m.challenges.length+6)*100);}
 const complete=s=>missions.every(m=>progress(s,m)===100);
 function create(storage){let s;try{s=normalize(JSON.parse(storage?.getItem(KEY)));}catch{s=empty();}const listeners=new Set();let storageOK=true;
  function save(){if(complete(s)&&!s.completedAt)s.completedAt=new Date().toISOString();try{storage?.setItem(KEY,JSON.stringify(s));storageOK=!!storage;}catch{storageOK=false;}for(const f of listeners)f();}
  return {
   snapshot:()=>JSON.parse(JSON.stringify(s)),get storageOK(){return storageOK;},subscribe(f){listeners.add(f);return()=>listeners.delete(f);},
   progress:m=>progress(s,m),complete:()=>complete(s),
   completeForTesting(){s.testComplete=true;save();},
   challenge(id){if(!industries.some(m=>m.challenges.some(c=>c[0]===id))||s.challenges[id])return false;s.challenges[id]=true;save();return true;},
   visit(booth,answers){const m=industries.find(m=>m.industry===booth?.industry);if(!m||!clean(booth.id,200)||!clean(booth.name,200)||!Array.isArray(answers)||answers.length!==3||!answers.every(enough))return false;const entry={id:clean(booth.id,200),name:clean(booth.name,200),answers:answers.map(x=>clean(x))},list=s.visits[m.id]||(s.visits[m.id]=[]),i=list.findIndex(v=>v.id===entry.id);if(i<0)list.push(entry);else list[i]=entry;save();return true;},
   reflect(id,answer){if(!industries.some(m=>m.id===id)||!enough(answer))return false;s.reflections[id]=clean(answer);save();return true;},
   career(c){const next=normalize({version:2,career:c}).career;if(!careerDone({career:next}))return false;s.career=next;save();return true;}
  };
 }
 return {industries,missions,logos,KEY,empty,normalize,enough,progress,complete,create};
});
