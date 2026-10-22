const Stables52=(()=>{
 const assets=RobotExhibit20.animatedAsset,actors=[],batches=[],stalls=[],center=[-46,.16,34.1];
 let ready=false,error=null,time=0,elapsed=0;
 function obstacle(name,p,size){const m=new NetworkScene40.Mesh([1,1,1,1]);m.box(p,size);const v=[];for(let i=0;i<m.v.length;i+=6)v.push(...m.v.slice(i,i+3));registerCollider('Stable52 '+name,'solidCollider',new Float32Array(v),new Uint32Array(m.i),false,{});baselineColliders.push(colliders.at(-1));}
 function build(){
  const wood=new NetworkScene40.Mesh([.31,.21,.12,1]),metal=new NetworkScene40.Mesh([.13,.17,.18,1]),straw=new NetworkScene40.Mesh([.65,.54,.27,1]),hay=new NetworkScene40.Mesh([.78,.66,.33,1]),water=new NetworkScene40.Mesh([.13,.34,.4,1]);
  for(const side of [-1,1])for(let i=0;i<3;i++){
   const x=-49+i*3,z=34.1+side*1.52,front=34.1+side*.76;stalls.push({x,z,side});
   straw.box([x,.17,z],[2.65,.04,1.34]);
   for(let j=0;j<160;j++){const a=(j*73%157)/157,b=(j*41%163)/163;hay.line([x-1.24+a*2.48,.195,z-.59+b*1.18],[x-1.18+a*2.48,.195,z-.57+b*1.18],.006);}
   for(const dx of [-1.4,1.4]){wood.box([x+dx,.58,z],[.07,.84,1.5]);metal.box([x+dx,1.01,z],[.085,.04,1.5]);obstacle('partition',[x+dx,.58,z],[.07,.84,1.5]);}
   for(const y of [.27,.39,.51])wood.box([x,y,front],[2.8,.11,.055]);
   for(const dx of [-1.4,1.4])metal.box([x+dx,.63,front],[.07,.94,.07]);
   for(const y of [.60,.98])metal.box([x,y,front],[2.8,.04,.045]);
   for(let dx=-1.3;dx<=1.3;dx+=.14)metal.box([x+dx,.79,front],[.016,.36,.016]);
   metal.box([x+.65,.53,front-side*.04],[.15,.026,.025]);obstacle('stall gate',[x,.59,front],[2.8,.86,.06]);
   metal.box([x+1.02,.31,z+side*.35],[.30,.22,.30]);water.box([x+1.02,.424,z+side*.35],[.26,.009,.26]);
   hay.box([x-1.03,.28,z+side*.35],[.35,.17,.35]);
  }
  for(const m of [wood,metal,straw,hay,water])batches.push(m.build());refreshShipments();
 }
 async function init(){try{
  const models=[await assets.loadModel('./drone44/horse-white.glb','Stable horse'),await assets.loadModel('./drone44/horse-brown.glb','Stable horse')];build();
  stalls.forEach((s,i)=>{const model=models[i%2],a=assets.actor(model,{position:[s.x,.195,s.z],scale:1,yaw:s.side===-1?0:Math.PI});a.offset=i*1.713;actors.push(a);assets.pose(a,model.clips[0].name,a.offset,1);});
  for(let i=0;i<2;i++){const model=models[i],a=assets.actor(model,{position:[-55-i*3,.17,32.5+i*2.5],scale:1,yaw:i*2.1});a.offset=2.3+i*3.7;actors.push(a);assets.pose(a,model.clips[0].name,a.offset,1);obstacle('paddock horse',[-55-i*3,.5,32.5+i*2.5],[.55,.7,1.1]);}ready=true;
  if(new URLSearchParams(location.search).get('exhibit')==='stables')visit();
 }catch(e){error=e.message;console.error('Stables52',e);}}
 function update(dt){if(!window.FarmScene63?.active||!ready||document.hidden||state.paused)return;time+=Math.min(dt,.1);elapsed+=dt;if(elapsed<1/24||len(sub(camera,center))>24)return;for(const a of actors)assets.pose(a,a.model.clips[0].name,time+a.offset,elapsed);elapsed=0;}
 function draw(planes){if(!window.FarmScene63?.active||!ready||!sphereVisible([-51,1,34],12,planes))return;for(const b of batches)drawBatch(b);for(const a of actors)assets.drawOne(a);}
 function visit(){if(!ready)return;if(Farming36.mounted)Farming36.exit();places.stables52={label:'Horse stables',p:[-39.9,.16+PHYSICS.radii[1]+.02,34.1],scaledPlayer:true,yaw:Math.PI/2};teleport('stables52');state.radius=2;state.pitch=.1;updateCamera(0,true);}
 return {init,draw,update,visit,snapshot:()=>({ready,error,horses:actors.length,stalls:stalls.length,time}),test:{actors,stalls}};
})();
{
 const draw=RobotExhibit20.draw,update=RobotExhibit20.update;
 RobotExhibit20.draw=function(p){draw(p);Stables52.draw(p);};RobotExhibit20.update=function(dt){update(dt);Stables52.update(dt);};
 const start=()=>{if(typeof FarmBoundary48==='undefined'||!FarmBoundary48.snapshot().ready){setTimeout(start,250);return;}Stables52.init();};start();
}
