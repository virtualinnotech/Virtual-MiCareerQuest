/* Booth media: a student standing at a booth's TV or resource paper presses E
   to watch the employer's video or open their link. The game pauses, so it
   draws nothing, while the panel is open. Nothing is downloaded until a student
   asks, and the player is removed again on close, which keeps it light on
   Chromebooks. Links come from the booth file: the studio stores the video
   link in the root node's employerData and each resource paper's link on its
   node (extras.href). */
window.BoothMedia162=(()=>{
 // A TV can be watched from the aisle; a resource paper needs a step closer.
 const RANGE={video:3,link:2},CONE=.7,CHECK_MS=150;
 const safeUrl=v=>{try{const u=new URL(String(v||'').trim());return /^https?:$/.test(u.protocol)?u:null;}catch{return null;}};
 const host=u=>u.hostname.replace(/^www\./,'');

 // YouTube and Vimeo play inside the panel through their own embed players
 // (built here from the video ID, never from the employer's text); a direct
 // .mp4/.webm file plays in a <video>; anything else opens in a new tab.
 function embedFor(u){
  const h=u.hostname.replace(/^(www|m)\./,'');let id=null;
  if(h==='youtu.be')id=u.pathname.slice(1).split('/')[0];
  else if(h==='youtube.com'||h==='youtube-nocookie.com')id=u.searchParams.get('v')||(u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)||[])[1];
  if(id&&/^[\w-]{6,20}$/.test(id))return {iframe:'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0'};
  const vimeo=h==='vimeo.com'||h==='player.vimeo.com'?(u.pathname.match(/\/(\d{6,12})(?:\/|$)/)||[])[1]:null;
  if(vimeo)return {iframe:'https://player.vimeo.com/video/'+vimeo+'?autoplay=1'};
  if(/\.(mp4|webm|m4v)$/i.test(u.pathname))return {video:u.href};
  return null;
 }

 // Called from decodeShipment with the booth's glTF JSON: the TV and every
 // resource paper that has a real link, at the centre of its mesh, in the same
 // booth space as the shipment's geometry.
 function anchors(j){
  const out=[],root=j.nodes?.find(n=>n.extras?.employerData),video=safeUrl(root?.extras.employerData.videoLink);
  const visit=(i,m,depth=0)=>{const n=j.nodes[i];if(!n||depth>20)return;const w=mm(m,trs(n)),role=n.extras?.role,link=role==='resource'?safeUrl(n.extras.href):role==='video'?video:null;
   if(link&&n.mesh!=null){const a=j.accessors?.[j.meshes[n.mesh]?.primitives?.[0]?.attributes?.POSITION];
    if(a?.min&&a?.max)out.push({kind:role==='video'?'video':'link',url:link.href,title:role==='video'?'Company video':String(n.extras.title||'Resource').slice(0,80),at:tp(w,(a.min[0]+a.max[0])/2,(a.min[1]+a.max[1])/2,(a.min[2]+a.max[2])/2)});}
   for(const k of n.children||[])visit(k,w,depth+1);};
  for(const i of j.scenes?.[j.scene||0]?.nodes||[])visit(i,IDENTITY);
  return out;
 }

 const prompt=document.createElement('button');prompt.id='boothMedia162Prompt';prompt.hidden=true;document.body.append(prompt);
 const dialog=document.createElement('dialog');dialog.id='boothMedia162';dialog.setAttribute('aria-labelledby','boothMedia162Title');
 dialog.innerHTML='<h2 id="boothMedia162Title"></h2><p class="bm-source"></p><div class="bm-frame" hidden></div><p class="bm-note" hidden></p><div class="bm-actions"><a class="bm-open" target="_blank" rel="noopener noreferrer"></a><button type="button" class="bm-close">Back to the fair</button></div>';
 document.body.append(dialog);
 const $q=s=>dialog.querySelector(s);
 let near=null,claim=false,paused=false;

 function usable(){
  return !!(state.ready&&!state.paused&&!state.overview&&!state.ghost&&!window.Loading155?.blocked&&!document.hidden&&!dialog.open&&
   !window.MissionUI99?.active&&!window.StudentRewards100?.active&&!window.HubGuide?.snapshot().dialogOpen&&!window.Rivian147?.mounted&&!window.Scooter100?.snapshot().mounted&&!window.CharacterInspector?.active);
 }
 // Angle between where the student is looking (camera toward its target)
 // and the direction from the player to p, in radians.
 function angleTo(p){const look=Math.atan2(target[0]-camera[0],target[2]-camera[2]),to=Math.atan2(p[0]-player.position[0],p[2]-player.position[2]),d=to-look;return Math.abs(Math.atan2(Math.sin(d),Math.cos(d)));}
 function nearest(){
  let best=null;const [px,py,pz]=player.position;
  for(const r of shippedBooths.values()){
   if(!r.media162?.length||!r.placement||Math.hypot(r.placement.x-px,r.placement.z-pz)>14)continue;
   const m=shipmentMatrix(r);
   for(const a of r.media162){const p=tp(m,...a.at),dd=Math.hypot(p[0]-px,p[2]-pz);if(dd>RANGE[a.kind]||Math.abs(p[1]-py)>2.4)continue;
    const angle=angleTo(p);if(angle<CONE&&(!best||angle<best.angle))best={...a,booth:r.name,distance:dd,angle};}
  }
  return best;
 }
 // Booths are scaled down to fit the hall, so the TV, the resource papers and
 // the booth representative are all within reach at once. E goes to the one
 // the student is facing: a TV or paper takes it from the representative only
 // when clearly more in view (AnimatedCharacters hides its own prompt while
 // claimsE() is true). The representative's booth panel lists the same media.
 function check(){
  near=usable()?nearest():null;
  if(near&&window.nearestStaff){const s=nearestStaff();if(s&&angleTo(s.position)<near.angle+.17)near=null;}
  claim=!!near;prompt.hidden=!near;
  if(near)prompt.textContent=near.kind==='video'?'E - Watch company video':'E - Open: '+near.title;
 }
 setInterval(check,CHECK_MS);

 function open(target=near){
  if(!target||dialog.open)return false;
  const u=safeUrl(target.url);if(!u)return false;
  const media=target.kind==='video'?embedFor(u):null,frame=$q('.bm-frame'),openLink=$q('.bm-open'),note=$q('.bm-note');
  $q('h2').textContent=target.kind==='video'?target.booth+': company video':target.title;
  $q('.bm-source').textContent=target.kind==='video'?host(u):target.booth+' - '+host(u);
  frame.replaceChildren();frame.hidden=!media;
  if(media?.iframe){const f=document.createElement('iframe');f.title=target.booth+' video';f.src=media.iframe;f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';
   f.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox');frame.append(f);}
  else if(media?.video){const v=document.createElement('video');v.src=media.video;v.controls=true;v.autoplay=true;v.playsInline=true;v.preload='metadata';frame.append(v);}
  openLink.href=u.href;openLink.textContent=media?'Open in a new tab':'Open '+host(u);openLink.classList.toggle('bm-primary',!media);
  note.hidden=!!media;note.textContent=target.kind==='video'?'This video opens on its own website, in a new tab.':'This opens in a new tab. Come back to this tab to keep exploring the fair.';
  paused=state.paused;state.paused=true;keys.clear();if(document.pointerLockElement)document.exitPointerLock();
  prompt.hidden=true;claim=false;dialog.showModal();(media?$q('.bm-close'):openLink).focus();
  return true;
 }
 function close(){
  if(!dialog.open)return;
  // Removing the player stops playback and frees its memory and decoder.
  $q('.bm-frame').replaceChildren();dialog.close();
  state.paused=paused;keys.clear();canvas.focus();
 }
 $q('.bm-close').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 prompt.onclick=()=>open();
 window.addEventListener('keydown',e=>{
  if(dialog.open||e.repeat||e.key.toLowerCase()!=='e'||prompt.hidden||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  e.preventDefault();e.stopImmediatePropagation();open();
 },true);

 return {anchors,open,close,check,claimsE:()=>claim,get active(){return dialog.open;},snapshot:()=>({near,open:dialog.open,prompt:prompt.hidden?null:prompt.textContent})};
})();
