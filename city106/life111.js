/* Street life reuses the venue's GPU instances and baked character animations. */
const CityLifeCore111=(()=>{
 const mod=(x,n)=>(x%n+n)%n;
 // Older fleet imports were normalized smaller than the .72-high adult and
 // newer police SUVs. Apply one uniform correction to geometry and physics.
 const vehicleScales144=Object.freeze({classic:1.20,sedan:1.18,taxi:1.08,suv:1.10,pickup:1.10,van:1.08,delivery:1.08});
 function scaledVehicle144(source){
  const scale=vehicleScales144[source.kind]||1,v={...source,p:[...source.p],scale144:scale};
  for(const key of ['length','width','height','frontZ','radius','wheelbase'])if(Number.isFinite(source[key]))v[key]=source[key]*scale;
  if(source.axles117)v.axles117=source.axles117.map(a=>({...a,z:a.z*scale,y:a.y*scale,radius:a.radius*scale}));
  return v;
 }
 function scaledVehiclePart144(part,scale=[1,1,1],factor=1){
  const shadow=part.role==='shadow';
  return {...part,offset:part.offset.map((n,i)=>n*(shadow&&i===1?1:factor)),scale:scale.map((n,i)=>n*(shadow&&i===1?1:factor)),...(Number.isFinite(part.radius)?{radius:part.radius*factor}:{})};
 }
 const laneYaw=l=>l.axis===0?l.dir*Math.PI/2:l.dir>0?0:Math.PI;
 const laneDistance=(l,q)=>l.dir>0?q-l.start:l.end-q;
 function turnOptions(lane,lanes){
  return lanes.filter(l=>l.axis!==lane.axis&&l.dir===(lane.axis===0?lane.dir:-lane.dir)&&l.cross>lane.start+3&&l.cross<lane.end-3&&lane.cross>l.start+3&&lane.cross<l.end-3).map(l=>{
   const radius=1.45,yaw=laneYaw(lane),s=laneDistance(lane,l.cross)-radius;
   const q=lane.dir>0?lane.start+s:lane.end-s;
   return {to:l.id,s,radius,yaw,start:lane.axis===0?[q,-.1275,lane.cross]:[lane.cross,-.1275,q],exitS:laneDistance(l,lane.cross)+radius,length:Math.PI*radius/2};
  });
 }
 function sampleTurn(turn,distance){
  const angle=Math.min(Math.PI/2,distance/turn.radius),yaw=turn.yaw-angle,r=turn.radius;
  return {yaw,p:[turn.start[0]+r*(Math.cos(yaw)-Math.cos(turn.yaw)),turn.start[1],turn.start[2]+r*(Math.sin(turn.yaw)-Math.sin(yaw))]};
 }
 function overlap(a,b){
  const dx=b.p[0]-a.p[0],dz=b.p[2]-a.p[2];if(Math.abs(dx)+Math.abs(dz)>(a.length+b.length+a.width+b.width)/2)return false;
  const axes=v=>[[Math.sin(v.yaw),Math.cos(v.yaw)],[Math.cos(v.yaw),-Math.sin(v.yaw)]],aa=axes(a),bb=axes(b),dot=(x,y)=>x[0]*y[0]+x[1]*y[1];
  return [...aa,...bb].every(u=>Math.abs(dx*u[0]+dz*u[1])<Math.abs(dot(aa[0],u))*a.length/2+Math.abs(dot(aa[1],u))*a.width/2+Math.abs(dot(bb[0],u))*b.length/2+Math.abs(dot(bb[1],u))*b.width/2+.035);
 }
 function wheelSteer(v,offset,front){return front?(v.turn114?-Math.atan((v.wheelbase||.9)/(v.turn114.radius+offset[0])):v.steer115||0):0;}
 const TRAFFIC_STEP=.05;
 function vehicleFrame(v){return {p:[...v.p],yaw:v.yaw,travel:v.travel||0,steer115:v.steer115||0,turn114:v.turn114?{radius:v.turn114.radius}:null,wheelbase:v.wheelbase,crashed:!!v.crashed,parked:!!v.parked,recoveries:v.recoveries123||0};}
 function sameVehicleFrame(a,v){return a&&a.p.every((p,i)=>p===v.p[i])&&a.yaw===v.yaw&&a.travel===(v.travel||0)&&a.steer115===(v.steer115||0)&&a.turn114?.radius===v.turn114?.radius&&a.crashed===!!v.crashed&&a.parked===!!v.parked&&a.recoveries===(v.recoveries123||0);}
 function interpolateVehicle(a,b,alpha){
  const distance=Math.hypot(...b.p.map((p,i)=>p-a.p[i])),travel=b.travel-a.travel,angle=Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw));
  // Route wrapping, collision physics and recovery resets must never sweep a
  // rendered vehicle through the city. Normal traffic stays one tick behind.
  const snap=a.crashed||b.crashed||a.parked||b.parked||a.recoveries!==b.recoveries||travel<0||distance>Math.max(.25,travel*1.5+.025)||Math.abs(angle)>Math.PI/2;
  const t=snap?1:Math.max(0,Math.min(1,alpha));
  return {p:a.p.map((p,i)=>p+(b.p[i]-p)*t),yaw:a.yaw+angle*t,travel:a.travel+travel*t,snap,steer:(offset,front)=>wheelSteer(a,offset,front)+(wheelSteer(b,offset,front)-wheelSteer(a,offset,front))*t};
 }
 function resolveVehiclePoint(p,previous,r,vehicles,contacts=[]){
  const steps=Math.max(1,Math.ceil(Math.hypot(p[0]-previous[0],p[2]-previous[2])/.12)),goal=[...p],q=[...previous];
  for(let step=0;step<steps;step++){
   q[0]+=(goal[0]-previous[0])/steps;q[2]+=(goal[2]-previous[2])/steps;q[1]=p[1];
   for(let pass=0;pass<3;pass++)for(const v of vehicles){
    if(q[1]-r[1]>v.p[1]+(v.height||.65)||q[1]+r[1]<v.p[1]||Math.hypot(q[0]-v.p[0],q[2]-v.p[2])>v.length/2+v.width/2+r[0]+.1)continue;
    const c=Math.cos(v.yaw),s=Math.sin(v.yaw),dx=q[0]-v.p[0],dz=q[2]-v.p[2],x=dx*c-dz*s,z=dx*s+dz*c,hx=v.width/2+r[0]+.006,hz=v.length/2+r[2]+.006;
    if(Math.abs(x)>=hx||Math.abs(z)>=hz)continue;
    const side=hx-Math.abs(x)<hz-Math.abs(z),sign=(side?x:z)<0?-1:1,n=side?[c*sign,0,-s*sign]:[s*sign,0,c*sign],depth=side?hx-Math.abs(x):hz-Math.abs(z);
    q[0]+=n[0]*depth;q[2]+=n[2]*depth;contacts.push({object:{name:v.id,kind:'trafficVehicle115'},normal:n});
   }
  }p[0]=q[0];p[2]=q[2];return p;
 }
 function emergencyStep(vehicles,lanes,dt,ambulance){
  const map=new Map(lanes.map(l=>[l.id,l]));
  for(const v of vehicles){
   if(v.parked||v.crashed)continue;const l=map.get(v.lane);if(!l)continue;const cross=l.axis===0?2:0;
   const dx=v.p[0]-(ambulance?.x||0),dz=v.p[2]-(ambulance?.z||0),along=dx*Math.sin(ambulance?.yaw||0)+dz*Math.cos(ambulance?.yaw||0),lateral=Math.abs(dx*Math.cos(ambulance?.yaw||0)-dz*Math.sin(ambulance?.yaw||0));
   const seed=Number(String(v.id).match(/\d+/)?.[0]||0),range=12+Math.min(14,Math.abs(ambulance?.speed||0)*2);
   const behind=ambulance?.active&&along<=-2&&along>-32&&lateral<3.6;
   if(v.turn114){v.emergencyBrake=!!behind;v.behind120=!!behind;continue;}
   const alert=ambulance?.active&&along>-2&&along<range&&lateral<3.6;
   v.reaction118=alert?(v.reaction118||0)+dt:0;
   const holding=ambulance?.active&&v.yieldTimer>0&&along>-2&&along<range+12&&lateral<5;
   if(behind||holding||alert&&v.reaction118>.22+(seed*37%101)/100*.75)v.yieldTimer=2.2;
   else v.yieldTimer=Math.max(0,(v.yieldTimer||0)-dt);
   const side=Math.sign(l.edge-l.cross),b=typeof District115!=='undefined'?District115.bridgeAt(...[v.p[0],v.p[2]]):null;
   let edge=l.edge;if(b&&!b.foot&&l.axis===2)edge=b.x+side*(District115.width(b,v.p[2])/2-.09);
   // An occupied bay exit must clear like a junction. Stopping a long bus
   // alongside it would trap the ambulance between the bus and parked cars.
   const bay=ambulance?.parked,join=ambulance?.route?.[0],sameHeading=bay&&Math.cos(laneYaw(l)-bay.yaw)>.9;
   const departure=ambulance?.active&&ambulance.next===0&&bay&&join&&sameHeading&&Math.hypot(ambulance.x-bay.x,ambulance.z-bay.z)<3;
   const bayAlong=bay&&(l.axis===0?bay.x:bay.z),bayCross=bay&&(l.axis===0?bay.z:bay.x);
   v.departure121=!!(departure&&!behind&&Math.abs(v.p[cross]-bayCross)<2&&
    (v.p[l.axis]-bayAlong)*l.dir+v.length/2>-1.8&&(v.p[l.axis]-join[l.axis===0?0:1])*l.dir-v.length/2<1.8);
   v.clearing115=v.departure121||v.yieldTimer>0&&(l.junctions||[]).some(j=>Math.abs(v.p[l.axis]-j.q)<j.half+v.length/2-.10);
   const target=side*Math.max(0,Math.abs(edge-l.cross)-v.width/2-.18),old=v.p[cross]-l.cross;
   v.offset115=old;v.behind120=!!behind;v.retry120=Math.max(0,(v.retry120||0)-dt);
   v.emergencyBrake=!!behind||v.yieldTimer>0&&!v.clearing115&&!v.yieldPath120;
   const wanted=v.yieldTimer>0?target:0;
   if(!behind&&!v.clearing115&&!v.yieldPath120&&Math.abs(wanted-old)>.10&&!v.retry120){
    const path={startS:v.s,startOffset:old,targetOffset:wanted,run:Math.max(3.6,(v.wheelbase||v.length*.55)*3,Math.abs(wanted-old)*3.2),progress:0};
    const obstacles=[...vehicles,...(ambulance?[ambulanceObstacle(ambulance)]:[])];
    const clear=v.s+path.run<l.length-1&&!((l.junctions||[]).some(j=>{const d=laneDistance(l,j.q)-v.s;return d>-j.half-v.length/2&&d<path.run+j.half+v.length/2;}))&&Array.from({length:13},(_,i)=>path.run*i/12).every(d=>{
     const p=sampleYield120(v,l,path,d),bridge=typeof District115!=='undefined'?District115.bridgeAt(p.p[0],p.p[2]):null;
     if(bridge&&Math.abs(p.p[0]-bridge.x)+Math.abs(Math.sin(p.yaw))*v.length/2+Math.abs(Math.cos(p.yaw))*v.width/2>District115.width(bridge,p.p[2])/2-.10)return false;
     return !obstacles.some(o=>o!==v&&Math.abs(o.p[1]-v.p[1])<.7&&overlap({...v,...p,width:v.width+.12,length:v.length+.25},o));
    });
    if(clear){v.yieldPath120=path;v.emergencyBrake=false;}else v.retry120=.65+(seed%7)*.11;
   }
   if(v.yieldPath120&&!behind)v.emergencyBrake=false;
   v.yielding=v.yieldTimer>0||!!v.yieldPath120||Math.abs(old)>.01;
  }
 }
 function sampleYield120(v,l,path,d){
  const t=Math.max(0,Math.min(1,d/path.run)),delta=path.targetOffset-path.startOffset;
  const offset=path.startOffset+delta*(10*t**3-15*t**4+6*t**5),slope=delta*30*t*t*(1-t)**2/path.run;
  const curvature=delta*60*t*(1-t)*(1-2*t)/(path.run**2*(1+slope*slope)**1.5),sign=l.axis===2?l.dir:-l.dir;
  const q=l.dir>0?l.start+path.startS+d:l.end-path.startS-d;
  return {p:l.axis===0?[q,v.p[1],l.cross+offset]:[l.cross+offset,v.p[1],q],yaw:laneYaw(l)+sign*Math.atan(slope),offset115:offset,steer115:Math.atan((v.wheelbase||v.length*.55)*sign*curvature)};
 }
 function ambulanceObstacle(a){return {id:'ambulance-clearance118',parked:true,p:[a.x,a.y??-.1275,a.z],yaw:a.yaw,width:1.24,length:2.95,height:1.2};}
 // Latch a passing side until the slower walker is behind. Movement follows
 // the bounded body heading, so a direction change cannot become a sideways slide.
 function walkEndMargin(w){
  // Road-split routes end .36 before asphalt: retain .16 body clearance.
  // Other paved routes have wider turning room, limited to their half-width.
  return Math.min(w.width,/shops|avenue/.test(w.id||'')?.20:.60);
 }
 function insideWalk(w,x,z,inset=0){
  const along=w.axis===0?x:z,cross=w.axis===0?z:x,cap=walkEndMargin(w);
  return Number.isFinite(x)&&Number.isFinite(z)&&along>=w.start-cap+inset&&along<=w.end+cap-inset&&Math.abs(cross-w.cross)<=w.width-inset;
 }
 function walkSegment(w,a,b,margin=.159){
  if(!insideWalk(w,a.x,a.z)||!insideWalk(w,b.x,b.z))return false;
  for(const o of w.obstacles||[]){
   let lo=0,hi=1;
   for(const [key,axis] of [['x',0],['z',2]]){
    const d=b[key]-a[key],min=o.lo[axis]-margin,max=o.hi[axis]+margin;
    if(Math.abs(d)<1e-9){if(a[key]<=min||a[key]>=max){lo=2;break;}}
    else{const t0=(min-a[key])/d,t1=(max-a[key])/d;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));}
   }
   if(lo<hi&&hi>0&&lo<1)return false;
  }
  return true;
 }
 function walkRoute(w,from,to){
  if(walkSegment(w,from,to))return [to];
  if(!w.graph121){
   const points=[];
   for(const o of w.obstacles||[])for(const x of[o.lo[0]-.19,o.hi[0]+.19])for(const z of[o.lo[2]-.19,o.hi[2]+.19]){
    const p={x,z};if(walkSegment(w,p,p))points.push(p);
   }
   const edges=points.map(()=>[]);
   for(let i=0;i<points.length;i++)for(let j=0;j<i;j++)if(walkSegment(w,points[i],points[j])){const cost=Math.hypot(points[i].x-points[j].x,points[i].z-points[j].z);edges[i].push([j,cost]);edges[j].push([i,cost]);}
   w.graph121={points,edges};
  }
  const {points,edges}=w.graph121,n=points.length,dist=points.map(p=>walkSegment(w,from,p)?Math.hypot(p.x-from.x,p.z-from.z):Infinity),prev=Array(n).fill(-1),seen=new Set();let best=-1,total=Infinity;
  for(let count=0;count<n;count++){
   let at=-1;for(let i=0;i<n;i++)if(!seen.has(i)&&(at<0||dist[i]<dist[at]))at=i;
   if(at<0||dist[at]>=total)break;seen.add(at);
   const p=points[at],end=dist[at]+Math.hypot(to.x-p.x,to.z-p.z);if(end<total&&walkSegment(w,p,to)){total=end;best=at;}
   for(const [i,cost] of edges[at])if(dist[at]+cost<dist[i]){dist[i]=dist[at]+cost;prev[i]=at;}
  }
  if(best<0)return [];
  const route=[to];for(let i=best;i>=0;i=prev[i])route.unshift(points[i]);return route;
 }
 function recoverWalk(a,neighbors,replan=false){
  if(a.recovery121&&!replan)return true;
  const w=a.path,along=w.axis===0?'x':'z',cross=w.axis===0?'z':'x',length=w.end-w.start,arc=Math.PI*w.offset,total=2*(length+arc),options=[];
  neighbors=neighbors.filter(b=>b.id!==a.id&&Math.hypot(a.x-b.x,a.z-b.z)<5);
  const segment=(w,from,to)=>{
   if(Math.hypot(from.x-a.x,from.z-a.z)>4.5||Math.hypot(to.x-a.x,to.z-a.z)>4.5||!walkSegment(w,from,to))return false;
   const dx=to.x-from.x,dz=to.z-from.z,length2=dx*dx+dz*dz;
   return neighbors.every(b=>{const t=Math.max(0,Math.min(1,((b.x-from.x)*dx+(b.z-from.z)*dz)/(length2||1)));
    return Math.hypot(from.x+dx*t-b.x,from.z+dz*t-b.z)>=Math.min(.32,Math.hypot(a.x-b.x,a.z-b.z)-1e-7);
   });
  };
  // Commit to another reachable part of this corridor, not another short
  // look-ahead on the same end turn. A blocked component is never crossed.
  for(const sign of [-1,1])for(const distance of [2.4,3.6,1.6]){
   const q=Math.max(w.start+.05,Math.min(w.end-.05,a[along]+sign*distance));if(Math.abs(q-a[along])<1.5)continue;
   for(const offset of [w.offset,-w.offset,0,w.width-.02,-w.width+.02]){
    const goal={[along]:q,[cross]:w.cross+offset},route=walkRoute(w,a,goal);if(!route.length)continue;
    let from=a,cost=0,safe=true;
    for(const to of route){
     if(!segment(w,from,to)){safe=false;break;}cost+=Math.hypot(to.x-from.x,to.z-from.z);from=to;
    }
    if(!safe)continue;
    let s=offset>=0?q-w.start:length+arc+w.end-q;s+=Math.round((a.s-s)/total)*total;
    const heading=Math.atan2(route[0].x-a.x,route[0].z-a.z),turn=Math.abs(Math.atan2(Math.sin(heading-a.yaw),Math.cos(heading-a.yaw)));
    options.push({goal,route,s,direction:offset>=0?sign:-sign,score:cost+turn*.3+(distance===1.6?.8:0),remaining:Math.hypot(goal.x-a.x,goal.z-a.z),stall:0});
   }
  }
  options.sort((a,b)=>a.score-b.score);const chosen=options[0];if(!chosen)return false;
  chosen.goal.clear=true;a.recovery121=chosen;a.route121=chosen.route.slice();a.pass118=null;a.detour120=null;a.stuck120=0;
  if(a.watch121)a.watch121.recoveries++;
  return true;
 }
 function coordinateWalk(agents,dt){
  for(const a of agents){
   const q=a.path.axis===0?a.x:a.z,watch=a.watch121||(a.watch121={x:a.x,z:a.z,time:0,recoveries:0,spanTime:0,min:q,max:q});watch.time+=dt;watch.spanTime+=dt;watch.min=Math.min(watch.min,q);watch.max=Math.max(watch.max,q);
   if(a.resting121){watch.time=watch.spanTime=0;watch.min=watch.max=q;watch.x=a.x;watch.z=a.z;continue;}
   if(a.recovery121){
    const recovery=a.recovery121,distance=Math.hypot(a.x-recovery.goal.x,a.z-recovery.goal.z);
    if(distance>=.08){
     recovery.stall+=dt;
     if(distance<recovery.remaining-.15){recovery.remaining=distance;recovery.stall=0;}
     // Release a stale commitment so ordinary local steering can yield and
     // try the other direction instead of waiting at that waypoint forever.
     if(recovery.stall>3){
      a.recovery121=null;a.direction*=-1;a.route121=null;a.pass118=null;a.detour120=null;a.stuck120=0;
      watch.time=watch.spanTime=0;watch.min=watch.max=q;watch.x=a.x;watch.z=a.z;
     }
     continue;
    }
    a.s=a.recovery121.s;a.direction=a.recovery121.direction;a.recovery121=null;a.route121=null;a.detour120=null;
    watch.time=watch.spanTime=0;watch.min=watch.max=q;watch.x=a.x;watch.z=a.z;
   }
   if(Math.hypot(a.x-watch.x,a.z-watch.z)>.45){watch.x=a.x;watch.z=a.z;watch.time=0;}
   if(watch.max-watch.min>1.2){watch.spanTime=0;watch.min=watch.max=q;}
   const delay=4+(a.ordinal??Number(String(a.id).match(/\d+$/)?.[0])??0)%5*.31;
   // A walker boxed in by debris stays past 16 s; retry that search once a
   // second instead of on every frame until the debris is cleared.
   a.spanWait161=Math.max(0,(a.spanWait161||0)-dt);
   let recovered=false;
   if(watch.spanTime>16&&!a.spanWait161){recovered=recoverWalk(a,agents.filter(b=>Math.hypot(a.x-b.x,a.z-b.z)<5));if(!recovered)a.spanWait161=1;}
   if(recovered){
    watch.time=watch.spanTime=0;watch.min=watch.max=q;watch.x=a.x;watch.z=a.z;
   }else if(watch.time>delay){
    a.direction*=-1;a.route121=null;a.pass118=null;a.detour120=null;a.speed120=0;a.stuck120=0;
    watch.time=0;watch.x=a.x;watch.z=a.z;watch.recoveries++;
   }
  }
 }
 function pedestrianStep(a,neighbors,dt,preferred,playerPoint){
  const w=a.path,cross=w.axis===0?'z':'x',along=w.axis===0?'x':'z';
  if(a.recovery121)preferred=a.recovery121.goal;
  const fx=Math.sin(a.yaw),fz=Math.cos(a.yaw);
  const clear=(x,z)=>(w.obstacles||[]).every(o=>x<=o.lo[0]-.16||x>=o.hi[0]+.16||z<=o.lo[2]-.16||z>=o.hi[2]+.16);
  const ahead=b=>(b.x-a.x)*fx+(b.z-a.z)*fz,side=b=>(b.x-a.x)*fz-(b.z-a.z)*fx;
  let lead=neighbors.find(b=>b.id===a.pass118?.id&&ahead(b)>-.65&&ahead(b)<1.8);
  if(!lead){a.pass118=null;lead=neighbors.filter(b=>b.id!==a.id&&ahead(b)>.05&&ahead(b)<1.3&&Math.abs(side(b))<.43&&(!b.moving||a.speed>b.speed+.025||Math.sin(b.yaw)*fx+Math.cos(b.yaw)*fz<0)).sort((b,c)=>ahead(b)-ahead(c))[0];}
  let target=preferred[cross];
  if(Math.min(Math.abs(a[along]-w.start),Math.abs(a[along]-w.end))<.3){lead=null;a.pass118=null;}
  if(lead){
   const options=[-1,1].map(sign=>({sign,value:lead[cross]+sign*.43})).filter(o=>Math.abs(o.value-w.cross)<=w.width&&clear(w.axis===0?lead.x:o.value,w.axis===0?o.value:lead.z));
   const headOn=Math.sin(lead.yaw)*fx+Math.cos(lead.yaw)*fz<0,right=Math.sign(w.axis===0?-fx:fz);
   const chosen=options.find(o=>o.sign===a.pass118?.sign)||headOn&&options.find(o=>o.sign===right)||options.sort((b,c)=>Math.abs(b.value-a[cross])-Math.abs(c.value-a[cross])||b.sign-c.sign)[0];
   if(chosen){
    if(!a.pass118)a.pass118={id:lead.id,sign:chosen.sign,value:chosen.value};
    const pass=a.pass118,required=Math.max(w.cross-w.width+.01,Math.min(w.cross+w.width-.01,lead[cross]+pass.sign*.46));
    // Widen a committed pass gradually if the other walker drifts into it;
    // never chase them back toward the centre before the pass is complete.
    if((required-pass.value)*pass.sign>0)pass.value+=pass.sign*Math.min(Math.abs(required-pass.value),.35*dt);
    target=pass.value;
   }
  }
  let goal={...preferred,[cross]:target};
  if(a.recovery121)goal=a.recovery121.goal;
  if(!insideWalk(w,goal.x,goal.z)||!clear(goal.x,goal.z))goal=preferred;
  // Persistent corner waypoints keep avoidance from flipping across a tree or
  // sign every frame. All edges use the same body clearance as movement.
  if(a.route121?.length&&Math.hypot(a.route121[0].x-a.x,a.route121[0].z-a.z)<.045)a.route121.shift();
  if(a.route121?.length&&!walkSegment(w,a,a.route121[0]))a.route121=null;
  // Fallen street furniture can block a whole sidewalk. Retrying a failed
  // plan on every frame for every blocked walker grew into most of the frame,
  // so a walker whose plan failed waits 0.8 s before planning again.
  a.routeWait161=Math.max(0,(a.routeWait161||0)-dt);
  if(!a.route121?.length&&!a.routeWait161&&!walkSegment(w,a,goal)){a.route121=walkRoute(w,a,goal);if(!a.route121.length)a.routeWait161=.8;}
  if(a.route121?.length)goal=a.route121[0];
  if(a.detour120){a.detour120.time-=dt;if(a.detour120.time<=0||Math.hypot(a.detour120.x-a.x,a.detour120.z-a.z)<.08||!walkSegment(w,a,a.detour120))a.detour120=null;}
  a.detourWait161=Math.max(0,(a.detourWait161||0)-dt);
  if((a.stuck120||0)>.65&&!a.detour120&&!a.detourWait161){
   const wanted=Math.atan2(goal.x-a.x,goal.z-a.z),options=[];
   for(const radius of [.22,.45,.7])for(let i=0;i<24;i++){
    const heading=wanted+i*Math.PI/12,x=a.x+Math.sin(heading)*radius,z=a.z+Math.cos(heading)*radius;
    if(!insideWalk(w,x,z,.01))continue;
    const safe=[.2,.4,.6,.8,1].every(t=>{const px=a.x+(x-a.x)*t,pz=a.z+(z-a.z)*t;return clear(px,pz)&&neighbors.every(b=>b.id===a.id||Math.hypot(px-b.x,pz-b.z)>=Math.min(.33,Math.hypot(a.x-b.x,a.z-b.z)-1e-7));});
    if(safe&&walkSegment(w,a,{x,z}))options.push({x,z,score:Math.hypot(x-goal.x,z-goal.z)+Math.abs(Math.atan2(Math.sin(heading-a.yaw),Math.cos(heading-a.yaw)))*.06});
   }
   options.sort((a,b)=>a.score-b.score);if(options.length){a.detour120={...options[0],time:3};a.pass118=null;a.stuck120=0;}else a.detourWait161=.5;
  }
  if(a.detour120)goal=a.detour120;
  const dx=goal.x-a.x,dz=goal.z-a.z;
  const desiredYaw=Math.atan2(dx,dz),angle=Math.atan2(Math.sin(desiredYaw-a.yaw),Math.cos(desiredYaw-a.yaw));
  const yaw=a.yaw+Math.max(-2.4*dt,Math.min(2.4*dt,angle));
  let speed=Math.min(a.speed,Math.hypot(dx,dz)*2)*Math.max(0,Math.cos(angle));
  if(Math.abs(angle)>.55)speed=0;
  for(const b of neighbors){if(b.id===a.id)continue;const forward=(b.x-a.x)*Math.sin(yaw)+(b.z-a.z)*Math.cos(yaw),lateral=Math.abs((b.x-a.x)*Math.cos(yaw)-(b.z-a.z)*Math.sin(yaw));if(forward>0&&forward<.75&&lateral<.30)speed=Math.min(speed,Math.max(0,(forward-.31)*1.5));}
  a.speed120=(a.speed120||0)+Math.max(-1.1*dt,Math.min(.65*dt,speed-(a.speed120||0)));
  a.vx118=Math.sin(yaw)*a.speed120;a.vz118=Math.cos(yaw)*a.speed120;
  let x=a.x+a.vx118*dt,z=a.z+a.vz118*dt;
  const free=(x,z)=>insideWalk(w,x,z)&&clear(x,z)&&(!playerPoint||Math.hypot(x-playerPoint[0],z-playerPoint[1])>=Math.min(.42,Math.hypot(a.x-playerPoint[0],a.z-playerPoint[1])-1e-7))&&neighbors.every(b=>b.id===a.id||Math.hypot(x-b.x,z-b.z)>=Math.min(.30,Math.hypot(a.x-b.x,a.z-b.z)-1e-7));
  if(!free(x,z)){let lo=0,hi=1;for(let i=0;i<8;i++){const t=(lo+hi)/2;if(free(a.x+(x-a.x)*t,a.z+(z-a.z)*t))lo=t;else hi=t;}x=a.x+(x-a.x)*lo;z=a.z+(z-a.z)*lo;a.speed120*=lo;}
  a.yaw=yaw;
  a.stuck120=a.speed120<.025?(a.stuck120||0)+dt:0;
  return {x,z,yaw,progress:Math.hypot(x-a.x,z-a.z),passing:!!a.pass118};
 }
 function sampleWalk(w,s){
  const length=w.end-w.start,r=w.offset,arc=Math.PI*r,total=2*(length+arc);s=mod(s,total);
  let along,cross,da,dc;
  if(s<length){along=w.start+s;cross=r;da=1;dc=0;}
  else if(s<length+arc){const a=(s-length)/r;along=w.end+r*Math.sin(a);cross=r*Math.cos(a);da=Math.cos(a);dc=-Math.sin(a);}
  else if(s<2*length+arc){along=w.end-(s-length-arc);cross=-r;da=-1;dc=0;}
  else{const a=(s-2*length-arc)/r;along=w.start-r*Math.sin(a);cross=-r*Math.cos(a);da=-Math.cos(a);dc=Math.sin(a);}
  return w.axis===0?{x:along,z:w.cross+cross,yaw:Math.atan2(da,dc)}:{x:w.cross+cross,z:along,yaw:Math.atan2(dc,da)};
 }
 function advanceWalk(w,s,from,to){
  if(Math.hypot(to.x-from.x,to.z-from.z)<1e-8)return s;
  const length=w.end-w.start,r=w.offset,arc=Math.PI*r,total=2*(length+arc),along=w.axis===0?to.x:to.z,cross=(w.axis===0?to.z:to.x)-w.cross;
  const endAngle=Math.max(0,Math.min(Math.PI,Math.atan2(along-w.end,cross))),startAngle=Math.max(0,Math.min(Math.PI,Math.atan2(w.start-along,-cross)));
  const candidates=[Math.max(0,Math.min(length,along-w.start)),length+endAngle*r,length+arc+Math.max(0,Math.min(length,w.end-along)),2*length+arc+startAngle*r];
  // Project onto the current leg, not distance travelled. Side steps and
  // backing up cannot advance a target through a wall or around a corner.
  let best=s,score=Infinity;
  for(let q of candidates){q+=Math.round((s-q)/total)*total;if(Math.abs(q-s)>.85)continue;const p=sampleWalk(w,q),cost=Math.hypot(p.x-to.x,p.z-to.z)+Math.abs(q-s)*.3;if(cost<score){score=cost;best=q;}}
  return best;
 }
 function trafficStep(vehicles,lanes,dt,phase,playerPoint){
  const before=new Map(vehicles.filter(v=>v.p&&!v.crashed&&!v.parked).map(v=>[v.id,{p:[...v.p],yaw:v.yaw,s:v.s,lane:v.lane,travel:v.travel,offset115:v.offset115,steer115:v.steer115,yieldPath120:v.yieldPath120?{...v.yieldPath120}:null,turn114:v.turn114?{...v.turn114}:null}]));
  const laneMap=new Map(lanes.map(l=>[l.id,l])),groups=new Map();
  for(const v of vehicles)if(!v.parked&&!v.crashed&&!v.turn114){if(!groups.has(v.lane))groups.set(v.lane,[]);groups.get(v.lane).push(v);}
  const previousCars=vehicles.filter(v=>v.p).map(v=>({id:v.id,p:v.p,width:v.width,length:v.length,axis:v.crashed||v.parked||v.turn114?-1:laneMap.get(v.lane).axis,halfX:(Math.abs(Math.sin(v.yaw))*v.length+Math.abs(Math.cos(v.yaw))*v.width)/2,halfZ:(Math.abs(Math.cos(v.yaw))*v.length+Math.abs(Math.sin(v.yaw))*v.width)/2}));
  for(const v of vehicles)if(v.turn114&&!v.crashed){
   const t=v.turn114,next=sampleTurn(t,Math.min(t.length,t.distance+.35)),blocked=playerPoint&&Math.hypot(next.p[0]-playerPoint[0],next.p[2]-playerPoint[1])<v.width/2+.55;
   const target=laneMap.get(t.to),exit=sampleTurn(t,t.length).p;
   const occupied=vehicles.some(o=>o!==v&&!o.parked&&!o.turn114&&o.lane===target.id&&o.s>=t.exitS-.2&&o.s<t.exitS+(o.length+v.length)/2+.45);
   const desired=blocked||occupied||v.emergencyBrake?0:Math.min(1.1,v.maxSpeed),old=v.speed||0;
   v.speed=Math.max(0,old+Math.max(-1.8*dt,Math.min(.62*dt,desired-old)));
   const distance=Math.min(blocked?0:v.speed*dt,t.length-t.distance);t.distance+=distance;v.travel+=distance;
   Object.assign(v,sampleTurn(t,t.distance));v.braking=desired<old-.02||blocked||occupied;v.waiting=v.speed<.04&&v.braking;v.reason=blocked?'pedestrian':occupied?'merge':'turn';
   if(t.distance>=t.length-1e-7){v.lane=t.to;v.s=t.exitS;v.p=exit;v.turn114=null;v.lastTurnTravel=v.travel;v.turnCount=(v.turnCount||0)+1;}
  }
  for(const [id,group]of groups){
   const lane=laneMap.get(id);group.sort((a,b)=>a.s-b.s);
   const previous=group.map(v=>({s:v.s,length:v.length}));
   // Only vehicles intersecting this lane's lateral span can block it.
   // Keep the original per-vehicle tests below, including yielded offsets.
   const across=lane.axis===0?2:0;
   let crossMin=Infinity,crossMax=-Infinity;
   for(const v of group){const cross=v.p?.[across]??lane.cross;crossMin=Math.min(crossMin,cross-v.width/2-.10);crossMax=Math.max(crossMax,cross+v.width/2+.10);}
   const crossingCars=previousCars.filter(o=>o.axis!==lane.axis&&o.p[across]+(across===0?o.halfX:o.halfZ)>=crossMin&&o.p[across]-(across===0?o.halfX:o.halfZ)<=crossMax);
   for(let i=0;i<group.length;i++){
    const v=group[i],lead=previous[(i+1)%group.length],gap=mod(lead.s-v.s,lane.length)-(v.length+lead.length)/2-.40;
    v.yaw=laneYaw(lane);
    let clearance=group.length>1?Math.max(0,gap):Infinity,reason='cruise';
    if(clearance<7)reason='queue';
    if(phase[lane.signal]!=='green')for(const stop of lane.stops){const d=stop.s-v.s-v.length/2;if(d>=-.025&&d<clearance){clearance=Math.max(0,d);reason='signal';}}
    let turn=v.turns114&&!v.yielding&&(v.travel||0)-(v.lastTurnTravel||-100)>4?turnOptions(lane,lanes).filter(t=>t.s>=v.s-.001&&t.s-v.s<4).sort((a,b)=>a.s-b.s)[0]:null;
    let turnClear=true;
    if(turn){
     // The candidate path is identical for every obstacle. Do not copy the
     // entire live vehicle (including its render caches) for each comparison.
     const path=[0,.25,.5,.75,1].map(t=>({length:v.length,width:v.width,...sampleTurn(turn,turn.length*t)}));
     const occupied=(groups.get(turn.to)?.length||0)>=Math.floor(laneMap.get(turn.to).length/6.2)||vehicles.some(o=>o!==v&&(o.turn114?.to===turn.to||o.lane===turn.to&&o.s>turn.exitS-(o.length+v.length)/2-2&&o.s<turn.exitS+(o.length+v.length)/2+.55||path.some(p=>overlap(p,o))));
     turnClear=!occupied;
     if(occupied)turn=null;
     // The approach stop line handles red lights. Once inside the junction,
     // continue straight instead of waiting at an internal turning point.
     else if(phase[lane.signal]!=='green')turn=null;
    }
    // Keep the junction clear until the full vehicle fits beyond its far edge.
    if(group.length>1)for(const j of lane.junctions||[]){const center=laneDistance(lane,j.q),entry=center-j.half-v.length/2-.3,exit=center+j.half+v.length+.4,leadS=lead.s<=v.s?lead.s+lane.length:lead.s;
     if(v.s<=entry+.001&&entry-v.s<7&&leadS-lead.length/2<exit){clearance=Math.min(clearance,Math.max(0,entry-v.s));reason='junction queue';}
    }
    // Wait at the approach until crossing traffic clears this driving lane.
    // A bus waiting beyond the lane must not reserve an entire adjacent block.
    for(const j of lane.junctions||[]){
     const entry=laneDistance(lane,j.q)-j.half-v.length/2-.27,across=lane.axis===0?2:0;
     if(v.s>entry+.001||entry-v.s>7)continue;
     if(crossingCars.some(o=>o.id!==v.id&&o.axis!==lane.axis&&Math.abs(o.p[lane.axis]-j.q)<j.half+(lane.axis===0?o.halfX:o.halfZ)+.04&&Math.abs(o.p[across]-v.p[across])<v.width/2+(across===0?o.halfX:o.halfZ)+.10)){
      clearance=Math.min(clearance,Math.max(0,entry-v.s));reason='junction clearing';
     }
    }
    // Let vehicles already inside the junction finish crossing after a phase change.
    if(v.p)for(const o of crossingCars){if(o.id===v.id||o.axis===lane.axis)continue;const across=lane.axis===0?2:0;
     const crossHalf=across===0?o.halfX:o.halfZ,alongHalf=lane.axis===0?o.halfX:o.halfZ;
     if(Math.abs(o.p[across]-v.p[across])>crossHalf+v.width/2+.055)continue;
     const ahead=(o.p[lane.axis]-v.p[lane.axis])*lane.dir,d=ahead-v.length/2-alongHalf-.10;
     if((o.axis===-1?ahead>=0:d>=-.12)&&d<clearance){clearance=Math.max(0,d);reason='crossing';}
    }
    if(playerPoint){const q=lane.axis===0?playerPoint[0]:playerPoint[1],cross=lane.axis===0?playerPoint[1]:playerPoint[0],ahead=(lane.dir>0?q-lane.start:lane.end-q)-v.s-v.length/2-.65;
     if(Math.abs(cross-lane.cross)<v.width/2+.34&&ahead>=-v.length-1&&ahead<clearance){clearance=Math.max(0,ahead);reason='pedestrian';}
    }
    const pullSpeed=v.yieldPath120?Math.min(v.maxSpeed,1.8,v.yieldTimer>0?Math.sqrt(3.6*Math.max(0,v.yieldPath120.run-v.yieldPath120.progress)):Infinity):.8;
    const desired=v.emergencyBrake?0:Math.min(v.clearing115?v.maxSpeed:v.yielding?pullSpeed:turn?1.1:v.maxSpeed,Math.sqrt(2*1.5*clearance)),old=v.speed||0,change=desired-old;
    v.speed=Math.max(0,old+Math.max(-1.8*dt,Math.min(.62*dt,change)));
    const distance=Math.min(v.speed*dt,clearance,turn?Math.max(0,turn.s-v.s):Infinity,v.yieldPath120?v.yieldPath120.run-v.yieldPath120.progress:Infinity);v.s=mod(v.s+distance,lane.length);v.travel=(v.travel||0)+distance;
    v.braking=desired<old-.02||clearance<.15;v.waiting=v.speed<.04&&clearance<.2;v.reason=reason;
    const q=lane.dir>0?lane.start+v.s:lane.end-v.s;
    v.p=lane.axis===0?[q,-.1275,lane.cross]:[lane.cross,-.1275,q];
    v.p[lane.axis===0?2:0]+=v.offset115||0;
    if(v.yieldPath120){const path=v.yieldPath120;path.progress+=distance;Object.assign(v,sampleYield120(v,lane,path,path.progress));if(path.progress>=path.run-1e-6){v.yieldPath120=null;v.steer115=0;if(v.yieldTimer>0){v.speed=0;v.emergencyBrake=true;}}}
    else v.steer115=0;
    if(v.yielding){v.reason=v.behind120?'hold behind ambulance':v.departure121?'clear ambulance exit':v.emergencyBrake?'stop for ambulance':'steering to shoulder';v.braking=v.emergencyBrake||desired<old-.02;}
    if(turn&&turnClear&&Math.abs(v.s-turn.s)<1e-6&&clearance>1e-4&&phase[lane.signal]==='green'){v.turn114={...turn,distance:0};v.reason='turn';}
   }
  }
  // A final swept-step reservation prevents a turning car from clipping a
  // queue after the signal logic has already evaluated that junction.
  const bins=new Map();for(const v of vehicles){const key=Math.floor(v.p[0]/6)+','+Math.floor(v.p[2]/6);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(v);}
  const rollback=v=>{const old=before.get(v.id);if(!old)return;Object.assign(v,old);v.speed=0;v.braking=true;v.waiting=true;v.reason='yield to traffic';};
  for(const a of vehicles){const x=Math.floor(a.p[0]/6),z=Math.floor(a.p[2]/6);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const b of bins.get((x+dx)+','+(z+dz))||[]){
   if(a.id>=b.id||a.crashed&&b.crashed||!overlap(a,b))continue;
   const first=a.turn114&&!b.turn114?a:b,second=first===a?b:a,oldFirst=before.get(first.id),oldSecond=before.get(second.id);
   if(oldFirst&&!overlap({...first,...oldFirst},second))rollback(first);
   else if(oldSecond&&!overlap(first,{...second,...oldSecond}))rollback(second);
   else{rollback(first);rollback(second);}
  }}
 }
 return {sampleWalk,advanceWalk,walkEndMargin,insideWalk,walkRoute,walkSegment,recoverWalk,coordinateWalk,trafficStep,turnOptions,sampleTurn,sampleYield120,wheelSteer,resolveVehiclePoint,emergencyStep,overlap,ambulanceObstacle,pedestrianStep,TRAFFIC_STEP,vehicleFrame,sameVehicleFrame,interpolateVehicle,scaledVehicle144,scaledVehiclePart144};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=CityLifeCore111;
if(typeof window!=='undefined')window.CityLife111=(()=>{
 const disabled=new URLSearchParams(location.search).has('city111off'),parts=new Map(),hands=new Map(),baseURL=new URL('.',document.currentScript.src);
 let config=null,vehicles=[],agents=[],dogs=[],elapsed=0,accumulator=0,initialized=false,visiblePeople=0,lodStatus='waiting',lodError=null,lodStats=[],dogStatus='waiting',dogError=null,dogModel=null;
 const units=[1,1,1],jointSkins117=new Map(),presentation132=new Map();
 function configure(c){if(disabled||!c)return;config=c;vehicles=c.vehicles.map(v=>({...CityLifeCore111.scaledVehicle144(v),speed:0,travel:0,health:100}));dogs=c.dogs.map(d=>({...d}));accumulator=0;presentation132.clear();}
 function attach(n,batch){
  if(!n.extras?.life111)return;
  if(disabled){batch.color=[0,0,0,0];return;}
  const a=n.extras.life111,vehicle=vehicles.find(v=>v.id===a.id),factor=vehicle?.scale144||1,list=parts.get(a.id)||[];
  list.push({batch,...CityLifeCore111.scaledVehiclePart144(a,n.scale||units,factor),spin:0,lastTravel:0});parts.set(a.id,list);
  if(vehicle)batch.cullRadius*=factor;
  if(a.role==='joint'){
   if(!jointSkins117.has(a.id)){
    const texture=gl.createTexture(),data=new Float32Array(32);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,4,2,0,gl.RGBA,gl.FLOAT,data);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.activeTexture(gl.TEXTURE0);jointSkins117.set(a.id,{texture,data});
   }
   batch.boneTexture=jointSkins117.get(a.id).texture;batch.sceneInstance=false;
  }
  batch.vehicle114=vehicle?{id:a.id,role:a.role,front:!!a.front,twoSided:vehicle.kind==='bus'}:null;
  if(batch.paint114&&a.paint){batch.color=a.paint;batch.sharedKey+=':paint:'+a.paint.join(',');}
  batch.vehicleBaseKey114=batch.sharedKey;
  batch.animated=!!n.extras.motion111;batch.life111=true;
 }
 function setPart(part,p,yaw,rx=0,steer=0){
  const {batch:b,offset:o,scale:k}=part,c=Math.cos(yaw+steer),s=Math.sin(yaw+steer),bc=Math.cos(yaw),bs=Math.sin(yaw),cx=Math.cos(rx),sx=Math.sin(rx),m=b.modelMatrix;
  m.set([c*k[0],0,-s*k[0],0,s*sx*k[1],cx*k[1],c*sx*k[1],0,s*cx*k[2],-sx*k[2],c*cx*k[2],0,p[0]+bc*o[0]+bs*o[2],p[1]+o[1],p[2]-bs*o[0]+bc*o[2],1]);
  const local=b.localBounds106.center;b.center=tp(m,...local);
 }
 function poseVehicle(v,frame=v){
  const old=v.poseCache117,changed=!old||old.x!==frame.p[0]||old.y!==frame.p[1]||old.z!==frame.p[2]||old.yaw!==frame.yaw;
  // Copy the whole vehicle record only when its road pose must be re-fitted.
  const rendered=changed?{...v,p:frame.p,yaw:frame.yaw}:null,pose=changed?RoadPose117.vehicle(rendered,(x,z)=>window.District115?.heightAt(x,z)??-.1275):old.pose;
  if(changed){v.trailer117=rendered.trailer117;v.poseCache117={x:frame.p[0],y:frame.p[1],z:frame.p[2],yaw:frame.yaw,pose};v.roadPose117={pitch:pose.front.pitch,rearPitch:pose.rear.pitch,bend:pose.bend||0};}
  if(!v.parked){const m=RoadPose117.matrix(pose.front);v.light134={id:v.id+' headlights',p:tp(m,0,v.height*.43,(v.frontZ??v.length/2)+.03),direction:norm([m[8],m[9]-.13,m[10]]),outer:.78,radius:6.2,power:5.2,color:[1,.90,.72]};}
  const skin=jointSkins117.get(v.id);
  if(skin&&changed){skin.data.set(RoadPose117.matrix(pose.front),0);skin.data.set(RoadPose117.matrix(pose.rear),16);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,skin.texture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,4,2,gl.RGBA,gl.FLOAT,skin.data);gl.activeTexture(gl.TEXTURE0);}
  for(const part of parts.get(v.id)||[]){
  const wheel=part.role==='wheel',steer=frame.steer?frame.steer(part.offset,part.front):CityLifeCore111.wheelSteer(v,part.offset,part.front);
  if(wheel){part.spin+=Math.max(0,frame.travel-part.lastTravel)/(part.radius||v.radius)*(v.turn114?1+part.offset[0]/v.turn114.radius:1)*(v.recovery123?.path?.gear||1);part.lastTravel=frame.travel;}
  const f=part.section117==='rear'?pose.rear:pose.front,batch=part.batch;
  if(part.role==='joint')batch.modelMatrix.set(IDENTITY);else RoadPose117.matrix(f,part.offset,wheel?part.spin:0,steer,part.scale,batch.modelMatrix);
  batch.center=part.role==='joint'?pose.pin:tp(batch.modelMatrix,...batch.localBounds106.center);
  if(part.role==='body'&&v.health<100){const damage=Math.min(3,Math.ceil((100-v.health)/25)),b=part.batch,m=b.modelMatrix,f=v.articulation117?1:1-damage*.025;m[8]*=f;m[9]*=f;m[10]*=f;if(!part.originalColor)part.originalColor=[...b.color];b.color=part.originalColor.map((c,i)=>i===3?c:c*(1-damage*.12));}
  if(part.batch.vehicle114)Object.assign(part.batch.vehicle114,{spin:part.spin,steer,braking:!!v.braking});
  if(part.role==='brake'){part.batch.emission=v.braking?[2.1,.045,.012]:v.parked?[.03,.001,0]:[.85,.012,.003];part.batch.color=v.braking?[1,.035,.012,1]:[.40,.012,.005,1];part.batch.sharedKey=part.batch.vehicleBaseKey114+(v.braking?':braking':v.parked?':parked':':running');}
  if(part.role==='headlight'){part.batch.emission=v.parked?[.015,.015,.012]:[2.5,2.3,1.9];part.batch.sharedKey=part.batch.vehicleBaseKey114+(v.parked?':parked':':running');}
  const b=part.batch;if(b.lod114){const far=Math.hypot(v.p[0]-camera[0],v.p[2]-camera[2])>(v.kind==='bus'?22:13);Object.assign(b,b.lod114[far?'far':'near']);b.sharedKey=b.vehicleBaseKey114+(part.role==='brake'?(v.braking?':braking':v.parked?':parked':':running'):part.role==='headlight'?(v.parked?':parked':':running'):'')+(part.role==='body'?':damage'+Math.min(3,Math.ceil((100-v.health)/25)):'')+(far?':far':':near');}
 }}
 function pedestrianObstacles151(){
  const b=window.HotelCore146?.bounds;
  return [...colliders.filter(o=>(o.kind==='cityFurniture'||o.name.startsWith('Gallery105 Entrance boomerang steel footing contact'))&&!window.StreetProps128?.disabled(o.name)),...(b?[{name:'Hotel151 footprint',lo:b.lo,hi:b.hi}]:[])];
 }
 function initPeople(){
  if(initialized||!config||typeof CrowdGraphics==='undefined'||!CrowdGraphics.ready)return;
  const models=['sara_character','roger_character','zoe','jason_character','liz','brad_character'].map(id=>characterState.models.get(id)).filter(m=>m?.walk);
  if(!models.length)return;
  // The park strip beside DeVos became buildings (westfront172): its walk
  // moves to the sidewalk and the grove walk inside the hospitality addition goes.
  if(window.WestFrontCore172)config.walks=WestFrontCore172.walks(config.walks);
  for(const w of config.walks){
   w.width=w.width172||(w.id==='front'?.97:w.id==='east'?.57:w.id==='river'?1.15:w.id.startsWith('park')?.60:.32);
   w.offset=Math.min(.28,w.width-.04,CityLifeCore111.walkEndMargin(w));
   const cross=w.axis===0?2:0;w.obstacles=pedestrianObstacles151().filter(o=>o.hi[w.axis]>w.start-1&&o.lo[w.axis]<w.end+1&&o.lo[cross]<w.cross+w.width+.4&&o.hi[cross]>w.cross-w.width-.4);
  }
  let seed=112;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(const w of config.walks)for(let i=0;i<w.count;i++){
   const id=w.id+'-'+i,model=models[agents.length%models.length];let s=(i+random()*.85)/w.count*(2*(w.end-w.start+Math.PI*w.offset));
   const pattern={bias:(random()-.5)*.04,amplitude:.04,phase:random()*Math.PI*2},outfit=CrowdWardrobe.appearance(150+agents.length,111231,model);
   let p=walkPoint(w,s,pattern);for(let retry=0;(!p.clear||agents.some(a=>Math.hypot(a.x-p.x,a.z-p.z)<.38))&&retry<80;retry++){s+=.4;p=walkPoint(w,s,pattern);}
   agents.push({id,ordinal:agents.length,kind:'cityPedestrian',model,outfit:{...outfit,backpack:false,flags:[0,0,0,1]},path:w,pattern,s,direction:1,speed:.28+random()*.23,pauseAt:2+random()*35,pauseUntil:0,random,...p,renderX:p.x,renderZ:p.z,renderYaw:p.yaw,position:[p.x,w.y,p.z],clock:i*.79,phase:i*.271,mode:'walk',moving:true,walked:0});
  }
  for(const d of dogs){d.person=agents.find(a=>a.id===d.personId);if(d.person)d.person.dog=true;}
  initialized=true;loadLods();loadDogs();
 }
 function refreshFurniture(fallen){
  if(!initialized)return;
  const obstacles=[...pedestrianObstacles151(),...fallen];
  for(const w of config.walks){
   const cross=w.axis===0?2:0,next=obstacles.filter(o=>o.hi[w.axis]>w.start-1&&o.lo[w.axis]<w.end+1&&o.lo[cross]<w.cross+w.width+.4&&o.hi[cross]>w.cross-w.width-.4&&o.hi[1]>w.y+.07&&o.lo[1]<w.y+.75);
   const key=next.map(o=>o.name+':'+o.lo.map(v=>Math.round(v*10)).join(',')+':'+o.hi.map(v=>Math.round(v*10)).join(',')).join('|');if(w.furniture128===key)continue;
   w.furniture128=key;w.obstacles=next;w.graph121=null;
   for(const a of agents)if(a.path===w){a.route121=null;a.recovery121=null;a.detour120=null;a.routeWait161=a.recoverWait161=a.spanWait161=a.detourWait161=0;}
  }
 }
 function walkPoint(w,s,pattern=null){
  const p=CityLifeCore111.sampleWalk(w,s),along=w.axis===0?'x':'z',across=w.axis===0?'z':'x',axis=w.axis===0?2:0;
  if(pattern)p[across]+=pattern.bias+pattern.amplitude*.15*Math.sin(p[along]*.11+pattern.phase);
  const width=w.width||.32;p[across]=Math.max(w.cross-width,Math.min(w.cross+width,p[across]));
  for(const o of w.obstacles||[]){
   const distance=Math.max(o.lo[w.axis]-.2-p[along],0,p[along]-o.hi[w.axis]-.2);if(distance>=.85)continue;
   if(p[across]<o.lo[axis]-.19||p[across]>o.hi[axis]+.19)continue;
   const options=[o.lo[axis]-.22,o.hi[axis]+.22].filter(v=>Math.abs(v-w.cross)<width);if(!options.length)continue;
   const safe=options.sort((a,b)=>Math.abs(a-p[across])-Math.abs(b-p[across]))[0],t=Math.min(1,distance/.85),weight=1-t*t*(3-2*t);p[across]+=(safe-p[across])*weight;
  }
  // Resolve overlapping avoidance bands together instead of letting a later
  // planter push a walker back into a parking meter.
  const active=(w.obstacles||[]).filter(o=>p[along]>o.lo[w.axis]-.18&&p[along]<o.hi[w.axis]+.18);
  const clear=v=>active.every(o=>v<=o.lo[axis]-.18||v>=o.hi[axis]+.18);
  const candidates=[p[across],w.cross-width,w.cross+width,...active.flatMap(o=>[o.lo[axis]-.181,o.hi[axis]+.181])].filter(v=>v>=w.cross-width&&v<=w.cross+width&&clear(v));
  p.clear=candidates.length>0;if(p.clear)p[across]=candidates.sort((a,b)=>Math.abs(a-p[across])-Math.abs(b-p[across]))[0];
  return p;
 }
 async function loadDogs(){
  dogStatus='loading';
  try{
   dogModel=await RobotExhibit20.animatedAsset.loadModel(new URL('dogs112/dog.glb?v=112',baseURL).href,'Street dog');
   for(const d of dogs){d.actor=RobotExhibit20.animatedAsset.actor(dogModel,{position:[0,-100,0],yaw:0,scale:1});d.neck=dogModel.j.nodes.findIndex(n=>(n.name||'').includes('herNeck2'));}
   const prior=RobotExhibit20.draw;RobotExhibit20.draw=function(planes){prior.call(this,planes);drawDogs(planes);};dogStatus='ready';
  }catch(e){dogStatus='error';dogError=e.message;console.warn('Street dogs unavailable',e);}
 }
 function drawDogs(planes){
  if(window.FarmScene63?.active)return;
  for(const d of dogs)if(d.visible&&d.actor&&sphereVisible(add(d.actor.position,[0,.2,0]),.48,planes))RobotExhibit20.animatedAsset.drawOne(d.actor);
 }
 async function loadLods(){
  lodStatus='loading';
  try{
   const manifestResponse=await fetch(new URL('street-lods.json?v=111',baseURL));if(!manifestResponse.ok)throw Error('Street LOD manifest unavailable');
   const manifest=await manifestResponse.json(),response=await fetch(new URL('street-lods.bin?v=111',baseURL));if(!response.ok)throw Error('Street LOD data unavailable');
   lodStats=CrowdGraphics.installStreetLods(manifest,await response.arrayBuffer());lodStatus='ready';
  }catch(e){lodStatus='fallback';lodError=e.message;console.warn('Street pedestrians retain original detail:',e.message);}
 }
 function hand(a){
  const m=a.model;let h=hands.get(m.id);if(!h){h=CharacterFitting.bones(m).RightHand;hands.set(m.id,h||null);}
  if(!h)return [a.x+Math.cos(a.yaw)*.16,a.path.y+.40,a.z-Math.sin(a.yaw)*.16];
  const atlas=CrowdGraphics.atlases.get(m.id),skin=atlas.skins[0],[f,g,t]=CrowdGraphics.animationFrames(a,m,characterState.time);
  const p=tp(skin.data.subarray((f*skin.bones+h.i)*16,(f*skin.bones+h.i+1)*16),...h.p),q=tp(skin.data.subarray((g*skin.bones+h.i)*16,(g*skin.bones+h.i+1)*16),...h.p);
  const v=p.map((x,i)=>(x+(q[i]-x)*t+m.offset[i])*m.scale*sectorScaleAt(a.x,a.z)),c=Math.cos(a.yaw),s=Math.sin(a.yaw);
  return [a.x+c*v[0]+s*v[2],floorHeightAt(a.x,a.z)+.004+v[1],a.z-s*v[0]+c*v[2]];
 }
 function leash(part,a,b){
  const v=sub(b,a),length=len(v),y=norm(v),x=norm(cross(Math.abs(y[2])>.99?[1,0,0]:[0,0,1],y)),z=cross(x,y),m=part.batch.modelMatrix;
  m.set([...x,0,...mul(y,length),0,...z,0,...a,1]);part.batch.center=mul(add(a,b),.5);part.batch.cullRadius=length/2+.015;
 }
 function poseDogs(dt){
  for(const d of dogs){const a=d.person;if(!a)continue;
   d.visible=dogStatus==='ready'&&Math.hypot(a.x-camera[0],a.z-camera[2])<35;
   if(!d.visible){for(const part of parts.get(d.id)||[])setPart(part,[0,-100,0],0);continue;}
   const grip=hand(a),c=Math.cos(a.yaw),s=Math.sin(a.yaw),side=(grip[0]-a.x)*c-(grip[2]-a.z)*s<0?-1:1,p=[a.x+c*.39*side+s*.04,a.path.y,a.z-s*.39*side+c*.04];
   d.actor.position=p;d.actor.yaw=a.yaw;
   RobotExhibit20.animatedAsset.pose(d.actor,a.moving?'walk':'idle',a.walked*2.2,dt);
   const collar=d.neck>=0?tp(transform(p,[1,1,1],0,a.yaw),...d.actor.world[d.neck].slice(12,15)):[p[0]+s*.14,p[1]+.25,p[2]+c*.14];
   for(const part of parts.get(d.id)||[]){
    leash(part,grip,collar);
   }
  }
 }
 function presentation(v,reset=false){
  let frames=presentation132.get(v.id);
  if(reset||!frames||!CityLifeCore111.sameVehicleFrame(frames.current,v)){
   const current=CityLifeCore111.vehicleFrame(v);
   if(frames&&Math.hypot(...current.p.map((p,i)=>p-frames.current.p[i]))>v.length){v.trailer117=null;v.poseCache117=null;}
   frames={previous:current,current};presentation132.set(v.id,frames);
  }
  return frames;
 }
 function present(){if(!config||disabled)return;for(const v of vehicles){const f=presentation(v);poseVehicle(v,CityLifeCore111.interpolateVehicle(f.previous,f.current,accumulator/CityLifeCore111.TRAFFIC_STEP));}}
 function settle(){for(const v of vehicles){presentation(v,true);poseVehicle(v);}}
 function update(dt){
  if(!config||disabled||document.hidden)return;initPeople();dt=Math.min(.065,Math.max(0,dt));elapsed+=dt;accumulator+=dt;
  const step=CityLifeCore111.TRAFFIC_STEP;
  while(accumulator>=step){
   for(const v of vehicles){const f=presentation(v);f.previous=f.current;}
   const ambulance=window.Ambulance35?.snapshot(),active=ambulance?.mounted&&ambulance.phase==='running';
   const emergency=ambulance?{...ambulance,active,y:District115.heightAt(ambulance.x,ambulance.z)??-.1275}:null,obstacles=[...(config.obstacles||[]),...(emergency?[CityLifeCore111.ambulanceObstacle(emergency)]:[])],traffic=[...vehicles,...obstacles];
   CityLifeCore111.emergencyStep(traffic,config.lanes,step,emergency);
   CityLifeCore111.trafficStep(traffic,config.lanes,step,City106.trafficState(City106.trafficSeconds()),active?null:[player.position[0],player.position[2]]);
   for(const v of vehicles)if(!v.crashed)v.p[1]=window.District115?.heightAt(v.p[0],v.p[2])??-.1275;
   for(const v of vehicles)presentation132.get(v.id).current=CityLifeCore111.vehicleFrame(v);
   accumulator-=step;
  }
  // render() presents once after the camera is updated, before all lighting
  // passes. Simulation and collision queries use the authoritative vehicles.
  for(const a of agents)a.resting121=elapsed<a.pauseUntil||Math.hypot(a.x-player.position[0],a.z-player.position[2])<.55;
  CityLifeCore111.coordinateWalk(agents,dt);
  const neighbors=new Map();for(const a of agents){const key=Math.floor(a.x)+','+Math.floor(a.z);if(!neighbors.has(key))neighbors.set(key,[]);neighbors.get(key).push({id:a.id,x:a.x,z:a.z,yaw:a.yaw,moving:a.moving,speed:a.speed});}
  for(const a of agents){
   if(elapsed>a.pauseAt&&elapsed>a.pauseUntil){a.pauseUntil=elapsed+1.5+a.random()*2.8;a.pauseAt=a.pauseUntil+16+a.random()*30;}
   const nearby=[];for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++)nearby.push(...(neighbors.get((Math.floor(a.x)+x)+','+(Math.floor(a.z)+z))||[]));
   let next=a.recovery121?.goal||walkPoint(a.path,a.s+a.direction*.45,a.pattern);
   // A failed recovery search tries up to 30 routes; do not repeat it on the
   // very next frame while the same fallen object still blocks the way.
   if(!next.clear&&!a.resting121&&!(a.recoverWait161>elapsed)){if(CityLifeCore111.recoverWalk(a,agents))next=a.recovery121.goal;else a.recoverWait161=elapsed+.8;}
   let near=elapsed<a.pauseUntil||!next.clear||Math.hypot(next.x-player.position[0],next.z-player.position[2])<.48;
   a.moving=!near;a.mode=near?'idle':'walk';
   if(!near){
    const move=CityLifeCore111.pedestrianStep(a,nearby,dt,next,[player.position[0],player.position[2]]),{x,z}=move;
    const blocked=a.path.obstacles.some(o=>x>o.lo[0]-.14&&x<o.hi[0]+.14&&z>o.lo[2]-.14&&z<o.hi[2]+.14);
    if(blocked){a.speed120=0;a.moving=false;a.mode='idle';}
    else{const distance=Math.hypot(x-a.x,z-a.z);a.s=CityLifeCore111.advanceWalk(a.path,a.s,a,move);a.walked+=distance;a.moving=distance>dt*.025;a.mode=a.moving?'walk':'idle';a.x=a.renderX=x;a.z=a.renderZ=z;a.renderYaw=a.yaw;a.position[0]=x;a.position[2]=z;}
   }
   if(near){a.vx118=0;a.vz118=0;a.speed120=0;const yaw=Math.atan2(next.x-a.x,next.z-a.z),angle=Math.atan2(Math.sin(yaw-a.yaw),Math.cos(yaw-a.yaw));a.yaw+=Math.max(-dt*2.4,Math.min(dt*2.4,angle));a.renderYaw=a.yaw;}
   District115.constrainWalk(a.position,a.position,.15);a.x=a.renderX=a.position[0];a.z=a.renderZ=a.position[2];
   // The floor under a walker is static: raycast again only after a 2 cm move.
   const floor=a.floor161;if(!floor||floor.ready!==!!window.walkSurfacesReady118||Math.abs(floor.x-a.x)>.02||Math.abs(floor.z-a.z)>.02)a.floor161={x:a.x,z:a.z,y:floorHeightAt(a.x,a.z),ready:!!window.walkSurfacesReady118};
   a.position[1]=a.floor161.y;
   a.still121=a.moving?0:(a.still121||0)+dt;a.mode=a.still121>.18?'idle':'walk';
   a.clock+=dt*(a.mode==='walk'?Math.max(.12,a.speed120/.55):1);
  }
  poseDogs(dt);
 }
 function people(){
  if(!initialized||disabled)return [];
  // Keep the closest street actors; silhouettes retain the existing distance LODs.
  const nearby=agents.filter(a=>Math.hypot(a.x-camera[0],a.z-camera[2])<45).sort((a,b)=>Math.hypot(a.x-camera[0],a.z-camera[2])-Math.hypot(b.x-camera[0],b.z-camera[2]));
  visiblePeople=Math.min(64,nearby.length);return nearby.slice(0,64);
 }
 function resolvePlayer(p,previous,r,contacts){if(disabled||window.Ambulance35?.mounted||window.Rivian147?.mounted||state.ghost)return;CityLifeCore111.resolveVehiclePoint(p,previous,r,vehicles,contacts);}
 return {preload:initPeople,configure,attach,settle,update,present,people,resolvePlayer,refreshFurniture,mapLanes:()=>config?.lanes||[],trafficBodies:()=>vehicles,snapshot(){return {ready:!!config,peopleReady:initialized,dogStatus,dogError,dogTriangles:dogModel?.triangles,dogStates:dogs.map(d=>({id:d.id,visible:d.visible,position:d.actor?.position,mode:d.actor?.mode})),lodStatus,lodError,lodStats,elapsed,vehicles:vehicles.length,moving:vehicles.filter(v=>!v.parked&&v.speed>.04).length,waiting:vehicles.filter(v=>v.waiting).length,pedestrians:agents.length,nearbyPedestrians:visiblePeople,dogWalkers:dogs.filter(d=>d.person).length,vehicleStates:vehicles.map(v=>({id:v.id,kind:v.kind,p:v.p,s:v.s,speed:v.speed,travel:v.travel,braking:v.braking,reason:v.reason,lane:v.lane,parked:v.parked,yaw:v.yaw,width:v.width,length:v.length,health:v.health,crashed:!!v.crashed,yielding:!!v.yielding})),people:agents.map(a=>({id:a.id,x:a.x,z:a.z,yaw:a.yaw,clock:a.clock,moving:a.moving,walked:a.walked,model:a.model.id,dog:!!a.dog})),counts:config?.counts||{}};}};
})();
