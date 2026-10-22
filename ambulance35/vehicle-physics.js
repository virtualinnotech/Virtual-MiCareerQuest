/* Horizontal rigid-body vehicle physics. Rendering and terrain elevation stay in the venue. */
globalThis.AmbulancePhysics35=(()=>{
  const M=globalThis.Matter,U=100,HZ=60;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create(shapes,onImpact,options={}){
    const width=options.width??1.02,length=options.length??2.65,top=options.height??1.02;
    const engine=M.Engine.create({gravity:{x:0,y:0},positionIterations:8,velocityIterations:8});
    const car=M.Bodies.rectangle(0,0,width*U,length*U,{friction:.12,frictionStatic:.15,frictionAir:0,restitution:.48,slop:.015*U,chamfer:{radius:7}});
    M.Body.setMass(car,120);M.Composite.add(engine.world,car);
    const bins=new Map(),global=[],active=new Set(),cooldowns=new Map(),traffic=new Map(),incomingBodies=new Map();
    const recoveryProbes=new WeakMap(),planning=[];
    const recoveryWork={probeBuilds:0,checks:0,plans:0,maxChecksPerTick:0};
    let planningTick=-1,planningBudget=0,planningStarted=false;
    let grace=0,impactAt=-Infinity,travel=0,incoming={x:0,y:0},activeAt=-Infinity,activeX=0,activeZ=0,prunedAt=0;
    for(const shape of shapes){
      const options={isStatic:true,friction:.12,restitution:.3,label:shape.name};let body;
      if(shape.radius)body=M.Bodies.circle(shape.x*U,shape.z*U,shape.radius*U,options,16);
      else{
        const points=M.Vertices.hull(shape.points.map(p=>({x:p[0]*U,y:p[1]*U})));
        if(points.length<3||M.Vertices.area(points)<1)continue;
        const center=M.Vertices.centre(points);
        body=M.Bodies.fromVertices(center.x,center.y,[points],options,false,0,0);
      }
      body.plugin.obstacle=shape;
      const lo=body.bounds.min,hi=body.bounds.max,x0=Math.floor(lo.x/U/8),x1=Math.floor(hi.x/U/8),z0=Math.floor(lo.y/U/8),z1=Math.floor(hi.y/U/8);
      if((x1-x0+1)*(z1-z0+1)>200){global.push(body);continue;}
      for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=x+','+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(body);}
    }
    function nearby(x,z,y){
      const out=new Set(global);
      for(let bx=Math.floor((x-5)/8);bx<=Math.floor((x+5)/8);bx++)for(let bz=Math.floor((z-5)/8);bz<=Math.floor((z+5)/8);bz++)for(const b of bins.get(bx+','+bz)||[])out.add(b);
      return [...out].filter(b=>!globalThis.StreetProps128?.disabled(b.plugin.obstacle.name)&&b.plugin.obstacle.maxY>y+.18&&b.plugin.obstacle.minY<y+top);
    }
    function activate(x,z,y){
      const next=new Set(nearby(x,z,y));
      for(const b of traffic.values())if(b.plugin.traffic.crashed)for(const o of nearby(b.position.x/U,b.position.y/U,b.plugin.traffic.p[1]))next.add(o);
      for(const body of active)if(!next.has(body)){M.Composite.remove(engine.world,body);active.delete(body);}
      for(const body of next)if(!active.has(body)){M.Composite.add(engine.world,body);active.add(body);}
    }
    M.Events.on(engine,'collisionStart',event=>{
      let strongest;
      for(const pair of event.pairs){
        const a=pair.bodyA,b=pair.bodyB,n=pair.collision.normal,ta=a.plugin.traffic,tb=b.plugin.traffic;
        if(a!==car&&b!==car&&!ta?.crashed&&!tb?.crashed)continue;
        const va=incomingBodies.get(a.id)||{x:0,y:0},vb=incomingBodies.get(b.id)||{x:0,y:0};
        const speed=Math.abs((va.x-vb.x)*n.x+(va.y-vb.y)*n.y),key=[a.id,b.id].sort().join(':');
        if(speed>.35&&engine.timing.timestamp-(cooldowns.get(key)??-Infinity)>500){
          cooldowns.set(key,engine.timing.timestamp);
          for(const v of[ta,tb])if(v){v.crashed=true;v.turn114=null;v.recovery123={age:0,quiet:0,retry:0,path:null,stalled:0};v.yieldPath120=null;v.steer115=0;v.health=Math.max(0,(v.health??100)-Math.max(2,Math.round(speed*2+speed*speed*1.3)));v.braking=true;v.reason='collision';}
        }
        if(a!==car&&b!==car)continue;
        const other=a===car?b:a;
        if(speed<.65||engine.timing.timestamp-(cooldowns.get(other.id)??-Infinity)<600)continue;
        if(!strongest||speed>strongest.speed){const p=pair.collision.supports[0]||car.position;strongest={speed,x:p.x/U,z:p.y/U,other};}
      }
      if(strongest&&engine.timing.timestamp-impactAt>200){
        impactAt=engine.timing.timestamp;cooldowns.set(strongest.other.id,impactAt);grace=.22;
        onImpact({...strongest,name:strongest.other.label});
      }
    });
    function reset(x,z,yaw){
      M.Body.setPosition(car,{x:x*U,y:z*U});M.Body.setAngle(car,-yaw);M.Body.setVelocity(car,{x:0,y:0});M.Body.setAngularVelocity(car,0);
      M.Engine.clear(engine);M.Composite.setModified(engine.world,true);cooldowns.clear();grace=0;impactAt=-Infinity;travel=0;incoming={x:0,y:0};activeAt=-Infinity;
    }
    function syncTraffic(){
      const available=options.traffic?.()||[],keep=new Set(),crashes=available.filter(v=>v.crashed),carHeight=options.heightAt?.(car.position.x/U,car.position.y/U);
      for(const v of available){
        const near=Math.hypot(v.p[0]-car.position.x/U,v.p[2]-car.position.y/U)<18||v.crashed||crashes.some(c=>Math.hypot(v.p[0]-c.p[0],v.p[2]-c.p[2])<24);
        if(!near||Math.abs(v.p[1]-(carHeight??v.p[1]))>1.6&&!v.crashed)continue;
        keep.add(v.id);let b=traffic.get(v.id);
        if(!b){b=M.Bodies.rectangle(v.p[0]*U,v.p[2]*U,v.width*U,v.length*U,{label:v.id,angle:-v.yaw,friction:.3,frictionAir:.018,restitution:.16,slop:.005*U,chamfer:{radius:3}});M.Body.setMass(b,v.kind==='bus'?280:v.kind==='delivery'?160:v.kind==='van'||v.kind==='pickup'?100:65);b.plugin.traffic=v;traffic.set(v.id,b);M.Composite.add(engine.world,b);}
        if(!v.crashed){M.Body.setPosition(b,{x:v.p[0]*U,y:v.p[2]*U});M.Body.setAngle(b,-v.yaw);M.Body.setVelocity(b,{x:Math.sin(v.yaw)*(v.speed||0)*U/HZ,y:Math.cos(v.yaw)*(v.speed||0)*U/HZ});M.Body.setAngularVelocity(b,0);}
      }
      for(const[id,b]of traffic)if(!keep.has(id)){M.Composite.remove(engine.world,b);traffic.delete(id);}
      incomingBodies.clear();incomingBodies.set(car.id,incoming);
      for(const b of traffic.values())incomingBodies.set(b.id,{x:b.velocity.x*HZ/U,y:b.velocity.y*HZ/U});
    }
    function publishTraffic(dt){
      for(const b of traffic.values()){const v=b.plugin.traffic;if(!v.crashed)continue;
        const x=b.position.x/U,z=b.position.y/U;v.travel=(v.travel||0)+Math.hypot(x-v.p[0],z-v.p[2]);v.p=[x,options.heightAt?.(x,z)??v.p[1],z];v.yaw=-b.angle;v.speed=Math.hypot(b.velocity.x,b.velocity.y)*HZ/U;
        if(v.speed<.025){M.Body.setVelocity(b,{x:0,y:0});M.Body.setAngularVelocity(b,0);}
      }
    }
    function recoveryProbe(v,p,margin=0){
      let probes=recoveryProbes.get(v);if(!probes){probes=new Map();recoveryProbes.set(v,probes);}
      const key=[v.width,v.length,margin].join(':');let probe=probes.get(key);
      if(!probe){probe=M.Bodies.rectangle(0,0,(v.width+margin)*U,(v.length+margin)*U);probe.label=v.id;probes.set(key,probe);recoveryWork.probeBuilds++;}
      M.Body.setPosition(probe,{x:p.x*U,y:p.z*U});M.Body.setAngle(probe,-p.yaw);return probe;
    }
    function recoveryContacts(v,p,all=false,margin=0){
      const y=options.heightAt?.(p.x,p.z)??v.p[1],probe=recoveryProbe(v,p,margin);
      const bodies=[car,...nearby(p.x,p.z,y),...traffic.values()].filter(b=>b.plugin.traffic!==v&&(!b.plugin.traffic||Math.abs(b.plugin.traffic.p[1]-y)<1.5));
      if(all)for(const o of options.traffic?.()||[])if(o!==v&&!traffic.has(o.id)&&Math.abs(o.p[1]-y)<1.5&&Math.hypot(o.p[0]-p.x,o.p[2]-p.z)<o.length+v.length+2)bodies.push(recoveryProbe(o,{x:o.p[0],z:o.p[2],yaw:o.yaw}));
      const contacts=new Map();
      for(const hit of M.Query.collides(probe,bodies)){const b=hit.bodyA===probe?hit.bodyB:hit.bodyA;contacts.set(b.id,hit.depth/U);}
      const person=options.player?.();if(person&&Math.hypot(p.x-person[0],p.z-person[1])<v.length/2+.5)contacts.set('player',1);
      if(options.driveable?.(p.x,p.z)===false)contacts.set('terrain',1);
      return contacts;
    }
    function planRecoveries(){
      // A pileup shares one planning budget. Actual movement still checks
      // current contacts at every physics step before moving any vehicle.
      const tick=Math.floor(engine.timing.timestamp/(1000/HZ));
      if(tick!==planningTick){planningTick=tick;planningBudget=24;planningStarted=false;}
      while(planning.length&&planningBudget>0){
        const job=planning.shift(),{b,r,lane}=job,v=b.plugin.traffic;
        if(!v.crashed||v.recovery123!==r)continue;
        if(!job.paths){
          if(planningStarted){planning.unshift(job);break;}
          planningStarted=true;recoveryWork.plans++;
          job.initial=recoveryContacts(v,{x:v.p[0],z:v.p[2],yaw:v.yaw});
          job.paths=globalThis.TrafficRecovery123.paths(v,lane);job.index=0;job.sample=0;
        }
        const path=job.paths[job.index];
        if(!path){r.planning=false;r.retry=.85;r.resetDue=r.age>24;continue;}
        if(!job.depths)job.depths=new Map(job.initial);
        const hits=recoveryContacts(v,path.samples[job.sample]);planningBudget--;recoveryWork.checks++;
        recoveryWork.maxChecksPerTick=Math.max(recoveryWork.maxChecksPerTick,24-planningBudget);
        let clear=true;
        for(const[id,depth]of hits){
          if(depth>(job.depths.get(id)||0)+.004||job.sample>path.samples.length*.35&&depth>.003){clear=false;break;}
          job.depths.set(id,Math.min(job.depths.get(id)??depth,depth));
        }
        if(!clear){job.index++;job.sample=0;job.depths=null;}
        else if(++job.sample===path.samples.length){Object.assign(r,{path,distance:0,speed:0,stalled:0,planning:false});continue;}
        planning.push(job);
      }
    }
    function finishRecovery(b,end,reset=false){
      const v=b.plugin.traffic;
      M.Body.setPosition(b,{x:end.x*U,y:end.z*U});M.Body.setAngle(b,-end.yaw);M.Body.setVelocity(b,{x:0,y:0});M.Body.setAngularVelocity(b,0);
      Object.assign(v,{p:[end.x,options.heightAt?.(end.x,end.z)??v.p[1],end.z],yaw:end.yaw,lane:end.lane,s:end.s,speed:0,crashed:false,parked:false,recovery123:null,offset115:0,steer115:0,yieldTimer:0,yielding:false,yieldPath120:null,emergencyBrake:false,behind120:false,turn114:null,waiting:false,braking:false,reason:reset?'traffic recovery reset':'rejoined route'});
      v.recoveries123=(v.recoveries123||0)+1;if(reset)v.recoveryResets123=(v.recoveryResets123||0)+1;
    }
    function recoverTraffic(dt){
      const R=globalThis.TrafficRecovery123,lanes=options.lanes?.()||[];if(!R||!lanes.length)return;
      for(const b of traffic.values()){
        const v=b.plugin.traffic;if(!v.crashed)continue;
        const r=v.recovery123||(v.recovery123={age:0,quiet:0,retry:0,path:null,stalled:0});r.age+=dt;r.retry-=dt;const retryDue=r.retry<=0;
        const lane=lanes.find(l=>l.id===v.lane)||lanes.slice().sort((a,b)=>Math.abs(v.p[a.axis===0?2:0]-a.cross)-Math.abs(v.p[b.axis===0?2:0]-b.cross))[0];
        if(!r.path){
          r.quiet=v.speed<.18&&Math.abs(b.angularVelocity)<.005?r.quiet+dt:0;
          v.reason='settling after collision';v.braking=true;
          if(r.age<1.2||r.quiet<.6&&r.age<4)continue;
          // End the slide before planning; traffic resumes through its steering path.
          M.Body.setVelocity(b,{x:0,y:0});M.Body.setAngularVelocity(b,0);v.speed=0;v.reason='waiting for recovery gap';r.stalled+=dt;
          if(r.retry<=0&&!r.planning){r.planning=true;planning.push({b,r,lane});}
        }
        if(r.path){
          const path=r.path;r.speed=Math.min(path.gear<0?.55:1.15,r.speed+dt*.65,Math.sqrt(1.6*Math.max(0,path.length-r.distance)));
          const distance=Math.min(path.length,r.distance+r.speed*dt),p=R.sample(path,distance),current=recoveryContacts(v,{x:v.p[0],z:v.p[2],yaw:v.yaw});
          const blocked=[...recoveryContacts(v,p)].some(([id,depth])=>depth>(current.get(id)||0)+.004);
          if(blocked){r.speed=0;r.stalled+=dt;v.speed=0;v.reason='waiting for recovery gap';M.Body.setVelocity(b,{x:0,y:0});M.Body.setAngularVelocity(b,0);if(r.stalled>1.5){r.path=null;r.retry=.5;}}
          else{
            r.stalled=0;r.distance=distance;v.travel=(v.travel||0)+Math.hypot(p.x-v.p[0],p.z-v.p[2]);
            M.Body.setPosition(b,{x:p.x*U,y:p.z*U});M.Body.setAngle(b,-p.yaw);M.Body.setVelocity(b,{x:0,y:0});M.Body.setAngularVelocity(b,0);
            Object.assign(v,{p:[p.x,options.heightAt?.(p.x,p.z)??v.p[1],p.z],yaw:p.yaw,speed:r.speed,steer115:p.steer,braking:false,reason:path.gear<0?'reversing to rejoin route':'steering back to route'});
            if(path.length-distance<.008)finishRecovery(b,path.end);
          }
        }
        // A trapped wreck must not hold a whole queue indefinitely. Only reset
        // into an empty, off-camera lane slot with space ahead and behind it.
        if(v.crashed&&r.age>24&&(retryDue||r.resetDue)&&!r.path&&!r.planning){
          r.retry=1.5;r.resetDue=false;
          const candidates=[];for(let s=v.length+2;s<lane.length-v.length-2;s+=Math.max(2,v.length)){const p=R.lanePose(lane,s);if(!(lane.junctions||[]).some(j=>Math.abs((lane.axis===0?p.x:p.z)-j.q)<j.half+v.length+2))candidates.push(p);}
          candidates.sort((a,c)=>Math.hypot(a.x-v.p[0],a.z-v.p[2])-Math.hypot(c.x-v.p[0],c.z-v.p[2]));
          const end=candidates.find(p=>Math.hypot(p.x-car.position.x/U,p.z-car.position.y/U)>30&&options.resetVisible?.(p.x,p.z)!==true&&![0,-v.length-1,v.length+1].some(d=>recoveryContacts(v,R.lanePose(lane,p.s+d),true,.3).size));
          if(end)finishRecovery(b,end,true);
        }
      }
      planRecoveries();
    }
    function stop(){M.Body.setVelocity(car,{x:0,y:0});M.Body.setAngularVelocity(car,0);}
    function pose(){const yaw=-car.angle,vx=car.velocity.x*HZ/U,vz=car.velocity.y*HZ/U;return {x:car.position.x/U,z:car.position.y/U,yaw,speed:vx*Math.sin(yaw)+vz*Math.cos(yaw),vx,vz,distance:travel};}
    function step(dt,input,y){
      // Static obstacles within 5 m are loaded; refreshing that set every
      // 1/30 s or 0.5 m of travel is enough at 6.8 m/s top speed.
      const now=engine.timing.timestamp,cx=car.position.x/U,cz=car.position.y/U;
      if(now-activeAt>=1000/30||Math.hypot(cx-activeX,cz-activeZ)>.5){activate(cx,cz,y);activeAt=now;activeX=cx;activeZ=cz;}
      // Impact cooldowns only matter for 600 ms; drop older pairs so a long
      // session of crashes does not grow this table without bound.
      if(now-prunedAt>2000){prunedAt=now;for(const[key,at]of cooldowns)if(now-at>1000)cooldowns.delete(key);}
      const yaw=-car.angle,fx=Math.sin(yaw),fz=Math.cos(yaw),rx=fz,rz=-fx;
      let vx=car.velocity.x*HZ/U,vz=car.velocity.y*HZ/U,forward=vx*fx+vz*fz,side=vx*rx+vz*rz;
      const wanted=input.brake?0:input.throttle*(input.throttle<0?(options.reverseSpeed??2.4):(options.maxSpeed??6.8));
      if(grace<=0||input.brake)forward+=clamp(wanted-forward,-dt*(input.brake?18:8),dt*5);
      grace=Math.max(0,grace-dt);side*=Math.exp(-(options.lateralGrip??4)*dt);
      incoming={x:fx*forward+rx*side,y:fz*forward+rz*side};
      M.Body.setVelocity(car,{x:incoming.x*U/HZ,y:incoming.y*U/HZ});
      const angular=-forward*Math.tan(input.steer*(options.steerAngle??.55))/(options.wheelbase??1.65)/HZ;
      M.Body.setAngularVelocity(car,clamp(car.angularVelocity+(angular-car.angularVelocity)*Math.min(1,dt*18),-.07,.07));
      const x=car.position.x/U,z=car.position.y/U;
      const drag=globalThis.StreetProps128?.strike({id:options.id||'ambulance',from:[x,z],x:x+incoming.x*dt,z:z+incoming.y*dt,y,yaw,width,length,height:top,vx:incoming.x,vz:incoming.y,mass:options.mass||3600,onImpact:hit=>{if(hit.speed>.65&&engine.timing.timestamp-impactAt>200){impactAt=engine.timing.timestamp;onImpact({...hit,kind:'furniture'});}}})||0;
      if(drag){M.Body.setVelocity(car,{x:car.velocity.x*(1-drag),y:car.velocity.y*(1-drag)});activate(x,z,y);}
      syncTraffic();M.Engine.update(engine,dt*1000);publishTraffic(dt);recoverTraffic(dt);travel+=forward*dt;
      return pose();
    }
    function overlaps(x,z,yaw,y){
      const probe=M.Bodies.rectangle(x*U,z*U,width*U,length*U,{angle:-yaw});
      return M.Query.collides(probe,[...nearby(x,z,y),...traffic.values()]).map(hit=>(hit.bodyA===probe?hit.bodyB:hit.bodyA).label);
    }
    function coast(dt,y){if(![...traffic.values()].some(b=>b.plugin.traffic.crashed))return;stop();incoming={x:0,y:0};activate(car.position.x/U,car.position.y/U,y);const steps=Math.max(1,Math.ceil(dt*60));for(let i=0;i<steps;i++){syncTraffic();M.Engine.update(engine,dt*1000/steps);publishTraffic(dt/steps);recoverTraffic(dt/steps);}}
    return {reset,step,stop,coast,pose,overlaps,shapes,body:car,engine,traffic,recoveryWork};
  }
  return {create};
})();
