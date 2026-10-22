/* Fictional teaching workflow, not a clinical diagnostic tool. */
(function(root){
 const regions=[[.80,.66],[.75,.70],[.82,.67],[.85,.66]];
 function create(){
  const s={phase:'idle',checks:[false,false,false,false],time:0,bed:0,attempt:0,marks:{},viewed:[],points:0,message:'Meet the patient at the MRI table.'};
  const begin=()=>{if(s.phase==='idle'){s.phase='screening';s.message='Check who the patient is and complete the four safety checks.';}};
  const prepare=()=>{if(s.phase!=='screening'||!s.checks.every(Boolean))return false;s.phase='ready';s.message='Help Alex lie down on the MRI table.';return true;};
  const assist=()=>{if(s.phase!=='ready')return false;s.phase='positioning';s.time=0;s.message='Helping Alex lie down; hearing protection and call bell in place.';return true;};
  const scan=()=>{if(!['positioned','repeat'].includes(s.phase))return false;s.phase='scanning';s.time=0;s.attempt++;s.message='Scanning. Walk around the glass divider to the computer.';return true;};
  function tick(dt){dt=Math.min(.1,Math.max(0,dt));if(s.phase==='positioning'){s.time+=dt;if(s.time>=2){s.phase='positioned';s.message='Press the illuminated scanner button to begin.';}}else if(s.phase==='scanning'){s.time+=dt;s.bed=Math.min(1,s.time/3);if(s.time>=10){s.phase='review';s.message='Images are ready. Go to the computer and check for blur.';}}else if(s.phase==='complete'){s.bed=Math.max(0,s.bed-dt/3);}}
  function quality(value){if(s.phase!=='review')return false;if(s.attempt===1){if(value!=='repeat'){s.message='Look at the doubled edges. Choose scan again if the picture is blurry.';return false;}s.phase='repeat';s.message='You spotted blur from movement. Return to the scanner button and scan again.';return true;}if(value!=='adequate'){s.message='This scan has sharper edges. Choose the clear-image option.';return false;}s.phase='interpret';s.message='Click an unusual area in two views. Then choose the patient side and who should review it.';return true;}
  function mark(sequence,x,y){if(s.phase!=='interpret'||!Number.isInteger(sequence)||sequence<0||sequence>3||x<0||x>1||y<0||y>1)return false;s.marks[sequence]=[x,y];s.message='Evidence marked on '+Object.keys(s.marks).length+' view(s). Compare the spots, then check your answer.';return true;}
  function submit(side,finding,handoff){if(s.phase!=='interpret')return false;const good=Object.entries(s.marks).filter(([i,p])=>Math.hypot(p[0]-regions[i][0],p[1]-regions[i][1])<.14).length;
   if(good<2){s.message='Try again: mark the same unusual area in two different views. Compare both sides of the brain.';return false;}
   if(side!=='left'||finding!=='focal'||handoff!=='radiologist'){s.message='Check Alex\'s left and right. Describe what looks different and send the images to the imaging doctor.';return false;}
   s.phase='complete';s.points=200;s.message='Well done! Clear images and your marked area are ready for the imaging doctor. +200 points';return true;
  }
  function reset(){Object.assign(s,{phase:'idle',checks:[false,false,false,false],time:0,bed:0,attempt:0,marks:{},viewed:[],points:0,message:'Meet the patient at the MRI table.'});}
  return{state:s,begin,prepare,assist,scan,tick,quality,mark,submit,reset};
 }
 const api={create,regions};root.MRICore42=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
