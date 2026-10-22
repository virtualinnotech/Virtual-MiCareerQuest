/* Heading-up navigation uses the same lanes and checkpoints as the simulation. */
globalThis.AmbulanceMap120=(()=>{
 let canvas,last=-Infinity;
 // Camera right is forward cross up: [-cos(yaw), 0, sin(yaw)].
 function project(s,[x,z]){const dx=x-s.x,dz=z-s.z,co=Math.cos(s.yaw),si=Math.sin(s.yaw);return [-dx*co+dz*si,-dx*si-dz*co];}
 function init(){
  canvas=document.createElement('canvas');canvas.id='ambulanceMap120';canvas.hidden=true;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Ambulance navigation: highlighted route to hospital');document.body.append(canvas);
  const style=document.createElement('style');style.textContent=`
   #ambulanceMap120{position:fixed;left:18px;bottom:18px;width:208px;height:208px;z-index:30;pointer-events:none}
   #ambulanceMap120[hidden]{display:none}body.ambulance-driving #controlsIconBtn,body.ambulance-driving #cameraBtn,body.ambulance-driving #staffPrompt{display:none!important}
   @media(max-width:900px){#ambulanceMap120{left:12px;bottom:80px;width:164px;height:164px}}
   @media(max-width:650px){#ambulanceMap120{left:10px;bottom:80px;width:144px;height:144px}}
  `;document.head.append(style);
 }
 function draw(s,route){
  if(!canvas)return;canvas.hidden=!s.mounted;if(!s.mounted)return;
  const now=performance.now();if(now-last<60)return;last=now;
  const size=canvas.clientWidth,dpr=Math.min(2,devicePixelRatio||1);if(canvas.width!==Math.round(size*dpr)){canvas.width=Math.round(size*dpr);canvas.height=canvas.width;}
  const c=canvas.getContext('2d'),mid=size/2,r=mid-9,k=r/(62+Math.min(12,Math.abs(s.speed)*1.5));
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,size,size);
  const point=p=>project(s,p).map(v=>mid+v*k);
  const line=(ps,color,width)=>{c.beginPath();ps.forEach((p,i)=>c[i?'lineTo':'moveTo'](...point(p)));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();};
  const area=(ps,color)=>{c.beginPath();ps.forEach((p,i)=>c[i?'lineTo':'moveTo'](...point(p)));c.closePath();c.fillStyle=color;c.fill();};
  c.save();c.beginPath();c.arc(mid,mid,r,0,Math.PI*2);c.clip();c.fillStyle='#25383c';c.fillRect(0,0,size,size);
  const river=window.District115?.river;if(river)area([[river.x0,river.z0],[river.x1,river.z0],[river.x1,river.z1],[river.x0,river.z1]],'#39999f');
  area([[-30,-32],[-7,-32],[-7,33],[-30,33]],'#486652');
  area([[-5.1,-30.3],[64,-30.3],[64,35],[-5.1,35]],'#576169');
  for(const l of window.CityLife111?.mapLanes()||[]){const a=l.axis===0?[l.start,l.cross]:[l.cross,l.start],b=l.axis===0?[l.end,l.cross]:[l.cross,l.end];line([a,b],'#91a4aa',Math.max(2,1.9*k));}
  for(const b of window.District115?.bridges||[])line([[b.x,b.start],[b.x,b.end]],'#bdc8c8',Math.max(2,b.width*k));
  line(route,'#607a80',4);
  const remaining=[[s.x,s.z],...route.slice(s.next)];if(remaining.length>1){line(remaining,'#26343a',7);line(remaining,'#ffd45b',4);}
  c.restore();
  const dest=point(route.at(-1)),dx=dest[0]-mid,dy=dest[1]-mid,d=Math.hypot(dx,dy),f=Math.min(1,(r-12)/Math.max(1,d));
  c.beginPath();c.arc(mid+dx*f,mid+dy*f,7,0,Math.PI*2);c.fillStyle='#f4f7f4';c.fill();c.fillStyle='#cd4050';c.fillRect(mid+dx*f-4,mid+dy*f-1.5,8,3);c.fillRect(mid+dx*f-1.5,mid+dy*f-4,3,8);
  c.beginPath();c.moveTo(mid,mid-9);c.lineTo(mid+6,mid+7);c.lineTo(mid,mid+3);c.lineTo(mid-6,mid+7);c.closePath();c.fillStyle='#fff';c.fill();c.strokeStyle='#14262b';c.lineWidth=2;c.stroke();
  c.beginPath();c.arc(mid,mid,r+3,0,Math.PI*2);c.strokeStyle='#10242a';c.lineWidth=7;c.stroke();
  c.beginPath();c.arc(mid,mid,r+3,-Math.PI/2,-Math.PI/2+Math.PI*2*s.health/100);c.strokeStyle=s.health>30?'#7fc6a3':'#ed7a71';c.lineWidth=3;c.stroke();
  const north=project(s,[s.x,s.z-1]),nx=mid+north[0]*(r-1),ny=mid+north[1]*(r-1);c.beginPath();c.arc(nx,ny,8,0,Math.PI*2);c.fillStyle='#14262b';c.fill();c.fillStyle='#fff';c.font='bold 10px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('N',nx,ny);
 }
 return {init,draw,project};
})();
if(typeof module!=='undefined')module.exports=globalThis.AmbulanceMap120;
