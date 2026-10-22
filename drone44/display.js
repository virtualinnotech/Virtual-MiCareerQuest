/* The seven exhibits share model buffers but have independent hover motion. */
const DroneDisplay47=(()=>{
 const position=[10.7,0,24.25],parts=[],phases=Array.from({length:7},(_,i)=>({phase:i*2.399,speed:.7+i*.137,amplitude:.035+(i%3)*.012}));
 let cornModel;const cornMatrices=[];
 function slab(radius,bottom,top,color){
  const m=new NetworkScene40.Mesh(color),quad=(a,b,c,d,n)=>{const k=m.v.length/6;for(const p of [a,b,c,d])m.v.push(...p,...n);m.i.push(k,k+1,k+2,k,k+2,k+3);};
  for(let i=0;i<64;i++){const a=i*Math.PI/64,b=(i+1)*Math.PI/64,pa=[radius*Math.cos(a),0,-radius*Math.sin(a)],pb=[radius*Math.cos(b),0,-radius*Math.sin(b)];
   quad([0,top,0],[pa[0],top,pa[2]],[pb[0],top,pb[2]],[0,top,0],[0,1,0]);
   quad([pa[0],bottom,pa[2]],[pb[0],bottom,pb[2]],[pb[0],top,pb[2]],[pa[0],top,pa[2]],[Math.cos((a+b)/2),0,-Math.sin((a+b)/2)]);
  }
  quad([-radius,bottom,0],[radius,bottom,0],[radius,top,0],[-radius,top,0],[0,0,1]);return m;
 }
 function init(corn){
  position[1]=floorHeightAt(position[0],position[2]);
  cornModel=corn;
  for(const [r,b,t,c] of [[1.35,.02,.09,[.11,.15,.17,1]],[1.12,.09,.35,[.22,.29,.31,1]],[1.55,.35,.375,[.2,.85,.77,1]],[1.55,.375,.43,[.78,.83,.84,1]]])parts.push(slab(r,b,t,c).build({rough:.35,metal:.35}));
  // Hang the plaque in front of the overhang so the countertop cannot hide it.
  const plaque=new NetworkScene40.Mesh([.10,.14,.16,1]);plaque.box([0,.29,-1.565],[.98,.17,.018]);
  for(const x of [-.36,.36])plaque.box([x,.36,-1.54],[.018,.14,.025]);parts.push(plaque.build({metal:.3}));
  const planter=new NetworkScene40.Mesh([.13,.20,.17,1]),soil=new NetworkScene40.Mesh([.19,.13,.08,1]);
  planter.box([0,.46,-.23],[2.75,.06,.34]);soil.box([0,.487,-.23],[2.70,.008,.29]);parts.push(planter.build(),soil.build());
  // Reuse the field's GPU assets; cache the tabletop stalk transforms once.
  for(let i=0;i<11;i++){const scale=.50+(i%3)*.045;cornMatrices.push(transform(add(position,[(i-5)*.24,.49,-.23]),[scale,scale,scale],0,i*2.399));}
  const m=slab(1.55,0,.43,[1,1,1,1]),v=[];for(let i=0;i<m.v.length;i+=6)v.push(...add(position,m.v.slice(i,i+3)));
  registerCollider('Drone47 display','solidCollider',new Float32Array(v),new Uint32Array(m.i),false,{});baselineColliders.push(colliders.at(-1));refreshShipments();Crowd.invalidate();
 }
 function poses(t){return phases.map((p,i)=>{const x=(i-3)*.40,z=-Math.sqrt(1.36*1.36-x*x);return {position:add(position,[x,.61+Math.sin(t*p.speed+p.phase)*p.amplitude+Math.sin(t*.31+i)*.016,z]),yaw:Math.PI+Math.sin(t*.23+p.phase)*.13};});}
 function draw(model,t,sign){for(const p of parts)drawBatch(p,transform(position));if(cornModel)DroneAssets44.instances(cornModel,cornMatrices);DroneAssets44.instances(model,poses(t).map(p=>transform(p.position,[.48,.48,.48],0,p.yaw)));drawBatch(sign,transform(add(position,[0,.29,-1.578]),[.94,.145,1],0,Math.PI));}
 return {position,init,draw,poses};
})();
