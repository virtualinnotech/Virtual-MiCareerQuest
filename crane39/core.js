(function(root){
 const site={tower:[74.8,0,48.8],building:[79,.40,56],scale:.25,roof:2.85,boom:11.5,statue:[57.25,.06,23.65]};
 const source=[[-.8,5.8],[-.8,7.2],[-.8,8.6]].map(([x,z])=>[site.tower[0]+x,0,site.tower[2]+z]);
 const targets=[0,3.3,6.6].map(x=>[site.building[0]+(x-4.19)*.25,site.roof,site.building[2]+(13-9.576)*.25]);
 function create(){
  const s={yaw:0,radius:5.8,hookY:1,held:-1,delivered:0,points:0,message:'Position the hook over a pipe bundle.',phase:'ready',bundles:[],debris:[],time:0,impactAt:-10};
  function reset(){Object.assign(s,{yaw:Math.atan2(-.8,5.8),radius:Math.hypot(.8,5.8),hookY:1,held:-1,delivered:0,points:0,message:'Position the hook over a pipe bundle.',phase:'ready',bundles:source.map(p=>({p:[...p],delivered:false,slot:-1,falling:false,vy:0})),debris:[],time:0,impactAt:-10});}
  function hook(){return [site.tower[0]+Math.sin(s.yaw)*s.radius,s.hookY,site.tower[2]+Math.cos(s.yaw)*s.radius];}
  function attach(){if(s.held>=0||s.phase==='complete')return false;const h=hook(),i=s.bundles.findIndex(b=>!b.delivered&&!b.falling&&Math.hypot(b.p[0]-h[0],b.p[2]-h[2])<.65&&Math.abs(h[1]-b.p[1]-1)<.4);if(i<0){s.message='Center the hook over a bundle and lower it to the lifting straps.';return false;}s.held=i;s.message='Bundle attached. Raise it clear of the building before slewing.';return true;}
  function release(){if(s.held<0)return false;const i=s.held,b=s.bundles[i],h=hook(),slot=targets.findIndex((t,k)=>!s.bundles.some(b=>b.delivered&&b.slot===k)&&Math.hypot(h[0]-t[0],h[2]-t[2])<.48&&Math.abs(h[1]-1-t[1])<.35);s.held=-1;
   if(slot>=0){b.p=[...targets[slot]];b.delivered=true;b.slot=slot;s.delivered++;s.message='Bundle secured on the top floor.';if(s.delivered===3){s.phase='complete';s.points=200;s.message='Challenge complete! Three bundles delivered. +200 points';}return true;}
   b.falling=true;b.vy=0;b.p=[h[0],h[1]-1,h[2]];s.message='Load released outside its landing spot. It will return to the pickup area.';return false;
  }
  function impact(p){if(s.time-s.impactAt<.7)return;s.impactAt=s.time;s.message='Building contact! Reverse the swing and keep the load clear.';for(let i=0;i<14;i++)s.debris.push({p:[...p],v:[Math.sin(i*2.4)*1.8,1.5+(i%4)*.3,Math.cos(i*2.4)*1.8],life:2.5});}
  function tick(dt,input={},collision=()=>null){dt=Math.min(.05,Math.max(0,dt));s.time+=dt;
   if(s.phase!=='complete'){
    const old=[s.yaw,s.radius,s.hookY];s.yaw+=Number(input.turn||0)*dt*.35;s.radius=Math.max(2,Math.min(10.6,s.radius+Number(input.trolley||0)*dt*1.4));s.hookY=Math.max(1,Math.min(10.8,s.hookY+Number(input.hoist||0)*dt*1.6));
    const hit=collision(s,hook());if(hit){[s.yaw,s.radius,s.hookY]=old;impact(hit);}
    if(s.held>=0){const h=hook(),b=s.bundles[s.held];b.p=[h[0],h[1]-1,h[2]];}
   }
   s.bundles.forEach((b,i)=>{if(b.falling){b.vy-=9.8*dt;b.p[1]+=b.vy*dt;if(b.p[1]<=0){impact([b.p[0],.2,b.p[2]]);b.p=[...source[i]];b.falling=false;}}});
   for(const d of s.debris){d.life-=dt;d.v[1]-=9.8*dt;d.p=d.p.map((v,i)=>v+d.v[i]*dt);}s.debris=s.debris.filter(d=>d.life>0&&d.p[1]>-.3);
  }
  reset();return {state:s,hook,attach,release,reset,tick};
 }
 const api={create,site,source,targets};root.CraneCore39=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
