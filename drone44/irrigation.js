/* Five aligned farm irrigation rigs, each with three independently inspected spans. */
window.DroneIrrigation46=(()=>{
 const Y=.18,groups={},nozzles=[],labels=[];
 function cylinder(){
  const v=[],indices=[],N=12;
  for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,x=Math.cos(a),z=Math.sin(a);for(const y of [-.5,.5])v.push(x*.5,y,z*.5,x,0,z);if(i<N){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  for(const y of [-.5,.5]){const start=v.length/6;v.push(0,y,0,0,y*2,0);for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;v.push(Math.cos(a)*.5,y,Math.sin(a)*.5,0,y*2,0);if(i<N)indices.push(start,start+i+1,start+i+2);}}
  return uploadBatch(new Float32Array(v),new Uint32Array(indices),{color:[.62,.66,.67,1],rough:.5,metal:.65,doubleSided:true});
 }
 function group(name,color,round=true){const batch=round?cylinder():createCube();batch.color=color;batch.sharedKey='irrigation46-'+name;groups[name]={batch,instances:[]};}
 function part(name,p,size,rx=0,ry=0){groups[name].instances.push({modelMatrix:transform(p,size,rx,ry)});}
 function bar(name,a,b,width){const y=norm(sub(b,a)),x=norm(cross(Math.abs(y[1])>.9?[1,0,0]:[0,1,0],y)),z=cross(x,y);groups[name].instances.push({modelMatrix:new Float32Array([...mul(x,width),0,...mul(y,len(sub(b,a))),0,...mul(z,width),0,...mul(add(a,b),.5),1])});}
 function pipeHeight(x,center){return Y+3.25+.6*Math.sin((x-center+7)/14*Math.PI);}
 function supplyHose(points){
  let last=points[0];
  for(let i=1;i<points.length-1;i++){const p=points[i],a=add(mul(points[i-1],.2),mul(p,.8)),b=add(mul(points[i+1],.2),mul(p,.8));bar('hoses',last,a,.08);last=a;for(let j=1;j<=6;j++){const t=j/6,next=add(add(mul(a,(1-t)**2),mul(p,2*t*(1-t))),mul(b,t*t));bar('hoses',last,next,.08);last=next;}}
  bar('hoses',last,points.at(-1),.08);
 }
 function tower(x,z,fixed){
  const top=[x,Y+3.25,z];
  for(const side of [-1,1]){
   const foot=[x,Y+.48,z+side*1.55];bar('frame',top,foot,.09);
   if(fixed){bar('frame',[x-.6,Y,z+side*1.2],top,.10);bar('frame',[x+.6,Y,z+side*1.2],top,.10);}
   else{bar('tires',[x-.15,Y+.48,foot[2]],[x+.15,Y+.48,foot[2]],.96);bar('hubs',[x-.17,Y+.48,foot[2]],[x+.17,Y+.48,foot[2]],.50);}
  }
  bar('frame',[x,Y+.48,z-1.55],[x,Y+.48,z+1.55],.10);
  bar('frame',[x,Y+1.6,z-.9],[x,Y+1.6,z+.9],.065);
  part('motors',[x,Y+.65,z],[.32,.23,.30]);
  if(fixed){bar('pipe',[x,Y,z],[x,Y+3.25,z],.18);bar('pipe',[x-.7,Y+.35,z],[x,Y+.35,z],.18);part('motors',[x,Y+3.6,z],[.26,.48,.26]);}
 }
 function init(){
  group('pipe',[.70,.73,.71,1]);group('frame',[.36,.42,.44,1],false);group('hoses',[.055,.075,.07,1]);group('tires',[.025,.033,.034,1]);group('hubs',[.25,.32,.36,1]);group('motors',[.045,.17,.30,1],false);group('buttons',[.13,.65,.34,1]);group('water',[.67,.80,.82,.6],false);
  for(let row=0;row<5;row++){
   const z=-19+row*12;
   for(const side of [-1,1]){
    const end=side<0?-116:-74,supply=side<0?-117:-71;
    part('motors',[supply,Y+.17,z],[.24,.30,.30]);
    const points=[[supply,Y+.18,z],[supply,Y+.09,z+.35],[end+side*.4,Y+.09,z+.7],[end,Y+.15,z+.35],[end,Y+1.5,z],[end,Y+3.25,z]];
    supplyHose(points);
    part('hubs',[end,Y+1.5,z],[.23,.15,.23]);
   }
   for(let k=0;k<4;k++)tower(-116+k*14,z,k===0);
   for(let col=0;col<3;col++){
    const id=row*3+col,center=-109+col*14;
    for(let i=0;i<10;i++){
     const x=center-7+i*1.4,nx=x+1.4,h=pipeHeight(x,center),nh=pipeHeight(nx,center);
     bar('pipe',[x,h,z],[nx,nh,z],.15);
     for(const side of [-1,1]){
      const low=[x,h-.78,z+side*.30],next=[nx,nh-.78,z+side*.30];
      bar('frame',low,next,.04);bar('frame',[x,h,z],next,.035);bar('frame',low,[nx,nh,z],.035);
     }
    }
    for(let n=0;n<5;n++){
     const x=center+(n-2)*2.5,h=pipeHeight(x,center),nz=z+.26;
     // Curved gooseneck from the main pipe into the hanging drop hose.
     for(let k=0;k<6;k++){const a=k/6*Math.PI,b=(k+1)/6*Math.PI;bar('hoses',[x,h+.17*Math.sin(a),z+.13-.13*Math.cos(a)],[x,h+.17*Math.sin(b),z+.13-.13*Math.cos(b)],.026);}
     bar('hoses',[x,h,nz],[x,Y+1.58,nz],.025);part('hubs',[x,Y+1.59,nz],[.13,.065,.13]);
     nozzles.push({id,p:[x,Y+1.56,nz]});
    }
   }
  }
  for(const p of DroneCore44.pumps){
   part('frame',[p.x,Y+.18,p.z],[.04,.36,.04]);
   part('motors',[p.x,Y+.40,p.z],[.18,.12,.18]);
   bar('buttons',[p.x+.09,Y+.37,p.z],[p.x+.11,Y+.37,p.z],.035);
   labels.push({p:[p.x+.095,Y+.43,p.z],batch:NetworkScene40.label('RESET '+String(p.id+1).padStart(2,'0'))});
  }
 }
 function draw(time,fault){
  for(const [name,g] of Object.entries(groups))if(name!=='water'&&g.instances.length)drawBuildingInstances(g.batch,g.instances);
  for(const l of labels)drawBatch(l.batch,transform(l.p,[.17,.05,1],0,Math.PI/2));
  const drops=[];
  for(const {id,p} of nozzles){if(id===fault)continue;for(let k=0;k<18;k++){const t=(time*.75+k/18)%1,a=k*2.39996+time*.35+id,spread=t*1.7;drops.push({modelMatrix:transform([p[0]+Math.cos(a)*spread,p[1]-.45*t-t*t,p[2]+Math.sin(a)*spread],[.018,.045,.018])});}}
  gl.enable(gl.BLEND);gl.depthMask(false);drawBuildingInstances(groups.water.batch,drops);gl.depthMask(true);gl.disable(gl.BLEND);
 }
 return{init,draw,nozzles,snapshot:()=>({rigs:5,sections:15,drops:nozzles.length})};
})();
