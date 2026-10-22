/* Crop and hay accounting is independent of rendering and vehicle physics. */
(function(root){
 'use strict';
 const vehicleScale=.4,ratio=vehicleScale/.6;
 const rows=Array.from({length:9},(_,i)=>-60.8+i*3.2),spacing=.8,columns=36,length=40;
 const field={left:-68,right:-26,north:-25,south:35};
 const inField=(x,z)=>x>=field.left&&x<=field.right&&z>=field.north&&z<=field.south;
 const hayOutlet=(x,z,yaw)=>({x:x-Math.sin(yaw)*2.2*ratio,z:z-Math.cos(yaw)*2.2*ratio});
 function create(){
  const cells=Array.from({length:columns*length},(_,i)=>({x:-62+(i%columns)*spacing,z:-11.6+Math.floor(i/columns)*spacing,cut:false}));
  const hay=[],bales=[];let cut=0,damaged=0,collected=0,fill=0,cycle=-1,emitted=false,baleAmount=0,grain=0,delivered=0;
  const capacity=Math.ceil(cells.length/2);
  function unload(amount){const moved=Math.min(grain,Math.max(0,amount));grain-=moved;delivered+=moved;return moved;}
  function damage(x,z,yaw,width,length){let count=0;const sn=Math.sin(yaw),cs=Math.cos(yaw);for(const c of cells){if(c.cut)continue;const dx=c.x-x,dz=c.z-z;if(Math.abs(dx*cs-dz*sn)>width/2||Math.abs(dx*sn+dz*cs)>length/2)continue;c.cut=true;c.damaged=true;cut++;damaged++;collected++;count++;}return count;}
  function startCycle(){
   if(cycle<0&&(fill>=120||(cut===cells.length&&collected===cut&&fill>0))){
    baleAmount=Math.min(120,fill);fill-=baleAmount;cycle=0;emitted=false;
   }
  }
  function harvest(x,z,yaw){
   const sn=Math.sin(yaw),cs=Math.cos(yaw),hx=x+sn*3.02*ratio,hz=z+cs*3.02*ratio;
   let count=0;
   for(const c of cells){
    if(grain+1>capacity)break;
    if(c.cut||Math.abs(c.x-hx)>3||Math.abs(c.z-hz)>3)continue;
    const dx=c.x-hx,dz=c.z-hz;
    if(Math.abs(dx*cs-dz*sn)<=2.55*ratio&&Math.abs(dx*sn+dz*cs)<=.48*ratio){c.cut=true;cut++;count++;grain++;}
   }
   if(count){
    const {x:px,z:pz}=hayOutlet(x,z,yaw),last=hay.at(-1);
    if(last&&!last.collected&&Math.hypot(last.x-px,last.z-pz)<.65)last.amount+=count;
    else hay.push({x:px,z:pz,yaw,amount:count,collected:false});
   }
   return count;
  }
  function collect(x,z){
   let count=0;
   for(const h of hay){if(h.collected||Math.hypot(h.x-x,h.z-z)>.83*ratio)continue;
    h.collected=true;count+=h.amount;collected+=h.amount;fill+=h.amount;
   }
   startCycle();
   return count;
  }
  function tick(dt,trailer){
   for(const b of bales)b.age=Math.min(2,b.age+dt);
   if(cycle<0)return;
   cycle+=dt;
   if(cycle>=.9&&!emitted){
    bales.push({x:trailer.x,z:trailer.z,yaw:trailer.yaw,age:0,amount:baleAmount});emitted=true;
   }
   if(cycle>=2.6){cycle=-1;startCycle();}
  }
  const snapshot=()=>({total:cells.length,cut,damaged,yieldPercent:Math.round((1-damaged/cells.length)*100),collected,fill,cycle,grain,capacity,grainFull:grain+1>capacity,delivered,bales:bales.length,remaining:hay.filter(h=>!h.collected).length,complete:cut===cells.length&&collected===cut&&cycle<0&&fill===0&&grain===0});
  return {cells,hay,bales,harvest,collect,tick,unload,damage,snapshot};
 }
 const api={create,rows,spacing,field,inField,vehicleScale,hayOutlet};root.HarvestCore36=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
