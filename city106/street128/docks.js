window.RideDocks128=(()=>{
 const stations=[{id:'front-west',x:14.4,z:38.15,yaw:0},{id:'front-east',x:44.9,z:38.15,yaw:0},{id:'riverwalk',x:22.4,z:-36.55,yaw:0}];
 const stands=[];let ready=false,error=null;
 function rides(){const out={};for(const s of stations)for(let i=0;i<4;i++){
  const dx=(i-1.5)*.45,kind=i<2?'bike':'scooter',parked={x:s.x+Math.cos(s.yaw)*dx,z:s.z-Math.sin(s.yaw)*dx+Math.cos(s.yaw)*.38,yaw:s.yaw+Math.PI};
  out[s.id+'-'+kind+'-'+i]={label:kind==='bike'?'E-bike':'E-scooter',kind,parked,dockHome:{...parked},parts:null,angles:{},offset:kind==='bike'?[0,.115,-.32]:[0,.15,-.12]};
 }return out;}
 async function init(){
  try{
   const source=await DroneAssets44.load('stand',{base:'./city106/street128/'});
   for(const station of stations){
    const id='Dock128 '+station.id,root=transform([station.x,floorHeightAt(station.x,station.z),station.z],[.4,.4,.4],0,station.yaw),parts=source.map(p=>({...p,batch:{...p.batch,modelMatrix:new Float32Array(mm(root,p.matrix))}}));
    for(const p of parts){const b=p.batch,local=b.localBounds106;local.center=local.lo.map((v,k)=>(v+local.hi[k])/2);StreetProps128.attach({name:id,matrix:root,extras:{street128:'dock'}},b,local,'Dock painted steel');}
    stands.push({id,parts,root});
   }
   StreetProps128.finish();ready=true;
  }catch(e){error=e.message;console.error('Ride docks',e);}
 }
 function registerRide(id,v,root){
  for(const p of v.parts){const batch={...p.batch,modelMatrix:new Float32Array(mm(root,p.matrix))},local=batch.localBounds106;local.center=local.lo.map((v,k)=>(v+local.hi[k])/2);
   p.batch=batch;StreetProps128.attach({name:'Ride128 '+id,matrix:root,extras:{street128:v.kind||id}},batch,local,/licht|light/i.test(p.name)?'Lamp lens':'Ride frame');
  }
 }
 function draw(){for(const s of stands)for(const p of s.parts)if(!p.batch.hidden128)drawBatch(p.batch,p.batch.modelMatrix);}
 return {rides,init,registerRide,draw,snapshot:()=>({ready,error,stations})};
})();
