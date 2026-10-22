/* Shared farm perimeter, field-access tracks and imported red barn. */
const FarmBoundary48=(()=>{
 const bounds={left:-118,right:-8,north:-28,south:60},barnPosition=[-46,.14,34.1],batches=[],trees=[],collisions=[];
 let barn,ready=false;
 const S=NetworkScene40;
 function solid(name,m){const v=[];for(let i=0;i<m.v.length;i+=6)v.push(...m.v.slice(i,i+3));registerCollider('Farm48 '+name,'solidCollider',new Float32Array(v),new Uint32Array(m.i),false,{});baselineColliders.push(colliders.at(-1));}
 function build(){
  const grass=new S.Mesh([.25,.34,.17,1]),wood=new S.Mesh([.53,.49,.37,1]),caps=new S.Mesh([.72,.69,.57,1]),concrete=new S.Mesh([.58,.61,.59,1]),joints=new S.Mesh([.38,.41,.39,1]),dirt=new S.Mesh([.39,.29,.19,1]),rut=new S.Mesh([.29,.22,.15,1]),trunks=new S.Mesh([.24,.20,.14,1]);
  for(const m of [grass,concrete,joints,dirt,rut])m.plane=(p,d)=>FarmSurface91.plane(p,d,m.color);
  const leaves=[new S.Mesh([.16,.29,.10,1]),new S.Mesh([.25,.38,.14,1]),new S.Mesh([.31,.41,.16,1])];
  // Tile around the harvest field; never place grass beneath its coplanar soil.
  for(const [x,z,w,d] of [[-94,16,52,92],[-16,16,20,92],[-47,-27.5,42,5],[-47,48.5,42,27]])grass.plane([x,.14,z],[w,d]);
  // Cut the corn field out of the lawn instead of layering near-coplanar paint.
  FarmSurface91.plane([-95,.14,4.5],[46,65],[.23,.20,.12,1]);
  for(let i=0;i<68;i++)FarmSurface91.plane([-115+i*.6,.14,4.5],[.085,59],[.17,.145,.09,1]);
  FarmSurface91.plane([-72,.14,36],[3,3],[.12,.2,.23,1]);
  for(const size of [[1.7,.13],[.13,1.7]])FarmSurface91.plane([-72,.14,36],size,[.95,.84,.26,1]);
  function fence(ax,az,bx,bz){const length=Math.hypot(bx-ax,bz-az),count=Math.ceil(length/2.2);
   for(let i=0;i<=count;i++){const x=ax+(bx-ax)*i/count,z=az+(bz-az)*i/count;wood.box([x,.40,z],[.065,.52,.065]);caps.box([x,.67,z],[.085,.035,.085]);}
   for(const y of [.28,.44,.59])wood.line([ax,y,az],[bx,y,bz],.035);
   const m=new S.Mesh([1,1,1,1]);m.box([(ax+bx)/2,.40,(az+bz)/2],[Math.abs(bx-ax)+.065,.52,Math.abs(bz-az)+.065]);solid('fence',m);
   collisions.push({x:(ax+bx)/2,z:(az+bz)/2,width:Math.abs(bx-ax)+.14,depth:Math.abs(bz-az)+.14});
  }
  fence(-118,-28,-118,60);fence(-118,-28,-8,-28);fence(-118,60,-74,60);fence(-68,60,-8,60);fence(-8,-28,-8,24);fence(-8,34,-8,60);
  // The rear barn doorway opens directly into the grazing paddock.
  grass.plane([-56,.14,32.9],[10,4.2]);
  fence(-51,30.8,-61,30.8);fence(-61,30.8,-61,37);fence(-61,37,-51,37);
  fence(-51,30.8,-51,31.61);fence(-51,36.59,-51,37);
  // A continuous sidewalk outside the fence joins the existing roadside path.
  for(const [x,z,w,d] of [[-119.2,16,1.5,91],[-63,-29.2,114,1.5],[-63,61.2,114,1.5],[-6.8,16,1.5,91]])concrete.plane([x,.1405,z],[w,d]);
  for(let x=-119.8;x<-6;x+=1.5)for(const z of [-29.2,61.2])joints.plane([x,.141,z],[.018,1.5]);
  for(let z=-28.5;z<61;z+=1.5)for(const x of [-119.2,-6.8])joints.plane([x,.141,z],[1.5,.018]);
  // Keep access open without painted paired tire tracks across the grass.
  dirt.plane([-46,.1405,34.1],[12,7]);
  function tree(x,z,i){const h=2.7+(i%5)*.23;trees.push([x,z]);trunks.tube([[x,.12,z],[x,h*.65,z]],.10);
   for(let j=0;j<5;j++){const a=j*2.4+i,center=[x+Math.sin(a)*.46,h*.64+(j%3)*.34,z+Math.cos(a)*.46],r=.72+(j%2)*.18,m=leaves[(i+j)%3];
    const point=(u,v)=>[center[0]+r*Math.sin(v)*Math.cos(u),center[1]+r*1.2*Math.cos(v),center[2]+r*Math.sin(v)*Math.sin(u)];
    for(let v=0;v<5;v++)for(let u=0;u<8;u++){const k=m.v.length/6;for(const [a,b] of [[u,v],[u+1,v],[u+1,v+1],[u,v+1]]){const p=point(a*Math.PI/4,b*Math.PI/5);m.v.push(...p,...norm(sub(p,center)));}m.i.push(k,k+1,k+2,k,k+2,k+3);}
   }
  }
  let index=0;for(let x=-115;x<-9;x+=5.8){tree(x,-26.7,index++);if(x<-75||x>-66)tree(x,59.2,index++);}for(let z=-22;z<57;z+=5.8){tree(-116.8,z,index++);if(z<22||z>36)tree(-9.2,z,index++);}
  for(const [m,y] of [[concrete,.150],[joints,.158],[dirt,.150],[rut,.158]])for(let i=1;i<m.v.length;i+=6)m.v[i]=y;
  for(const m of [grass,wood,caps,concrete,joints,dirt,rut,trunks,...leaves])if(m.i.length)batches.push(m.build());
  // Pedestrians use the authored walls and open doorways, not a solid footprint.
  const root=transform(barnPosition,[1.25,1.25,1.25],0,Math.PI/2);
  for(const [i,part] of barn.entries()){const m=mm(root,part.matrix),v=new Float32Array(part.positions.length);for(let k=0;k<v.length;k+=3)v.set(tp(m,...part.positions.subarray(k,k+3)),k);registerCollider('Farm52 barn shell '+i,'solidCollider',v,part.indices,false,{});baselineColliders.push(colliders.at(-1));delete part.positions;delete part.indices;}
  // Keep tractors out of the pedestrian stable even though visitors can enter.
  collisions.push({x:-46,z:34.1,width:10,depth:4.98});
  const floor=new Float32Array([-120,.14,-30,-6,.14,-30,-6,.14,62,-120,.14,62]);registerCollider('Farm48 surface','floor',floor,new Uint32Array([0,2,1,0,3,2]),false,{});baselineColliders.push(colliders.at(-1));
  // Register the same new obstructions with both driving simulations.
  for(const sim of Object.values(Farming36.test.physics))for(const c of collisions)Matter.Composite.add(sim.engine.world,Matter.Bodies.rectangle(c.x*100,c.z*100,c.width*100,c.depth*100,{isStatic:true,label:'Farm48 boundary'}));
  refreshShipments();if(!window.FarmScene63?.active)Ambulance35.refreshWorld();
 }
 async function init(){barn=await DroneAssets44.load('barn',{collision:true});build();ready=true;}
 function draw(planes){if(!ready||!sphereVisible([-63,2,16],75,planes))return;for(const b of batches)drawBatch(b);DroneAssets44.draw(barn,transform(barnPosition,[1.25,1.25,1.25],0,Math.PI/2));}
 return {init,draw,bounds,barnPosition,collisions,treePositions:trees,snapshot:()=>({ready,trees:trees.length,barnPosition,bounds,fenceHeight:.55,paddock:{left:-61,right:-51,north:30.8,south:37}})};
})();
