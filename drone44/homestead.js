/* Batched farm-home details share the venue renderer and its existing materials. */
window.Homestead89=(()=>{
 const garage={x:-30.5,z:49.2,width:5.8,depth:4.4},garden={x:-19,z:55.3,width:8,depth:4.4};
 const driveway=[[-4,29],[-9,29],[-12,31],[-13,36],[-16,40],[-22,43]];
 let batches=[],triangles=0;
 function build(registerObstacle){
  let origin=null,starts=[];
  const size=PLAYER_SCALE;
  const point=p=>origin?p.map((v,i)=>origin[i]+(v-origin[i])*size):p;
  function begin(p){origin=p;starts=all.map(([m])=>m.v.length);}
  function end(){all.forEach(([m],j)=>{for(let i=starts[j];i<m.v.length;i+=6){const p=point(m.v.slice(i,i+3));m.v.splice(i,3,...p);}});origin=null;}
  function obstacle(name,x,z,w,d,h){const p=point([x,.14,z]);registerObstacle(name,p[0],p[2],w*(origin?size:1),d*(origin?size:1),h*(origin?size:1));}
  const M=NetworkScene40.Mesh,all=[];
  const mat=(color,props={})=>{const m=new M([...color,1]);all.push([m,props]);return m;};
  const asphalt=mat([.16,.175,.18],{surfaceType:10,rough:.96}),gravel=mat([.39,.40,.37],{surfaceType:10}),concrete=mat([.62,.63,.59],{surfaceType:1});
  const siding=mat([.73,.75,.69],{surfaceType:2}),trim=mat([.89,.9,.85]),roof=mat([.105,.145,.15],{metal:.35,rough:.56}),door=mat([.13,.20,.19],{surfaceType:13});
  const metal=mat([.075,.09,.10],{metal:.6,rough:.38}),glass=mat([.10,.21,.27],{metal:.4,rough:.22}),wood=mat([.36,.27,.17],{surfaceType:13}),soil=mat([.15,.105,.068],{surfaceType:10});
  const leaf=[mat([.045,.14,.025],{surfaceType:9}),mat([.09,.23,.045],{surfaceType:9}),mat([.18,.31,.075],{surfaceType:9})],flower=[mat([.7,.16,.23]),mat([.9,.65,.16]),mat([.56,.40,.68])],stone=mat([.40,.43,.41],{surfaceType:10});
  const warm=mat([.95,.76,.41],{emission:[.26,.17,.06]}),tomato=mat([.52,.025,.012]);
  for(const m of [asphalt,gravel,concrete,soil]){m.ground=true;m.plane=(p,d)=>{FarmSurface91.add([[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5]].map(([x,z])=>point([p[0]+x*d[0],.14,p[2]+z*d[1]])),m.color,all.find(([a])=>a===m)[1]);};}
  const quad=(m,points,n)=>{if(m.ground){FarmSurface91.add(points.map(point),m.color,all.find(([a])=>a===m)[1]);return;}const k=m.v.length/6;for(const p of points)m.v.push(...p,...n);m.i.push(k,k+1,k+2,k,k+2,k+3);};
  function disk(m,x,y,z,r){if(m.ground){FarmSurface91.add(Array.from({length:32},(_,i)=>point([x+Math.cos(i*Math.PI/16)*r,.14,z+Math.sin(i*Math.PI/16)*r])),m.color,{surfaceType:10});return;}const k=m.v.length/6;m.v.push(x,y,z,0,1,0);for(let i=0;i<=32;i++){const a=i*Math.PI/16;m.v.push(x+Math.cos(a)*r,y,z+Math.sin(a)*r,0,1,0);}for(let i=1;i<=32;i++)m.i.push(k,k+i,k+i+1);}
  function mound(m,x,y,z,rx,ry,rz,seed=0){
   if(leaf.includes(m)){
    // Individual overlapping leaf clusters break up the silhouette without alpha sorting.
    for(let i=0;i<145;i++){const a=i*2.39996+seed,h=1-2*(i+.5)/145,r=Math.sqrt(1-h*h),p=[x+rx*r*Math.cos(a),y+ry*h,z+rz*r*Math.sin(a)],normal=norm([r*Math.cos(a),h,r*Math.sin(a)]),u=norm(cross(normal,Math.abs(h)>.9?[1,0,0]:[0,1,0])),v=cross(normal,u),size=.045+Math.min(rx,ry,rz)*(.16+.06*Math.sin(i*7));
     const tip=(du,dv)=>add(p,add(mul(u,du*size),mul(v,dv*size)));quad(m,[tip(-1,0),tip(0,1.7),tip(1,0),tip(0,-1.7)],normal);
    }return;
   }
   for(let a=0;a<10;a++)for(let b=0;b<6;b++){const ps=[];for(const [u,v]of [[a,b],[a+1,b],[a+1,b+1],[a,b+1]]){const t=u*Math.PI/5,p=v*Math.PI/6,r=1+.08*Math.sin(u*2.1+v*3.7+seed);ps.push([x+rx*r*Math.cos(t)*Math.sin(p),y+ry*r*Math.cos(p),z+rz*r*Math.sin(t)*Math.sin(p)]);}const k=m.v.length/6;for(const p of ps)m.v.push(...p,...norm([(p[0]-x)/rx,(p[1]-y)/ry,(p[2]-z)/rz]));m.i.push(k,k+1,k+2,k,k+2,k+3);}
  }
  function shrub(x,z,r=.42,i=0){const own=!origin;if(own)begin([x,.14,z]);for(let k=0;k<3;k++)mound(leaf[(i+k)%3],x+Math.sin(k*2.2+i)*r*.4,.22+r*.62+k*.06,z+Math.cos(k*2.2+i)*r*.35,r*.70,r*.62,r*.7,i+k);if(own)end();}
  function ribbon(m,points,width,y){
   // Catmull-Rom samples keep the lane edges continuous through the bends.
   const samples=[];for(let i=0;i<points.length-1;i++)for(let s=0;s<12;s++){const t=s/12,a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];samples.push([0,1].map(k=>.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t)));}samples.push(points.at(-1));
   const edges=samples.map((p,i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len*width/2,nz=(b[0]-a[0])/len*width/2;return [[p[0]+nx,y,p[1]+nz],[p[0]-nx,y,p[1]-nz]];});
   for(let i=1;i<edges.length;i++)quad(m,[edges[i-1][0],edges[i][0],edges[i][1],edges[i-1][1]],[0,1,0]);
  }
  // Paths are cut into the lawn mesh at exactly the same walking height.
  gravel.plane([-48.5,.17,46.5],[26,21]);
  asphalt.plane([-25,.175,43.8],[25,5.6]);
  ribbon(asphalt,driveway,3.7,.175);
  ribbon(gravel,[[-61.5,39],[-49,39],[-38,39.2],[-33,41.5],[-28,43]],3.5,.17);
  concrete.plane([-30.5,.14,46.8],[6.1,.8]);
  asphalt.plane([-30.5,.14,45.5],[6.1,2.3]);
  ribbon(concrete,[[-17,46.95],[-17,45.4],[-18.8,44.9]],1.15,.20);
  // Roadside entrance uses the existing gap in the fence.
  asphalt.plane([-3.65,.17,15],[4.7,128]);
  for(let z=-48;z<78;z+=5)FarmSurface91.plane([-3.65,.14,z],[.07,2],trim.color);
  for(const x of [-5.75,-1.55])FarmSurface91.plane([x,.14,15],[.06,128],trim.color);
  begin([-9.6,.14,25.5]);
  wood.box([-9.6,.61,25.5],[.12,.94,.12]);metal.box([-9.6,1.13,25.5],[.38,.30,.58]);trim.box([-9.795,1.12,25.5],[.012,.16,.27]);flower[0].box([-9.39,1.26,25.45],[.025,.22,.09]);
  end();for(const z of [24.2,33.8]){begin([-8.25,.14,z]);stone.box([-8.25,.53,z],[.36,.78,.36]);trim.box([-8.25,.95,z],[.46,.07,.46]);warm.box([-8.25,1.04,z],[.15,.13,.15]);end();}
  Garage93.build(registerObstacle);
  // An open timber pergola makes a usable side patio between the house and garage.
  begin([-23.25,.14,49]);
  concrete.plane([-23.2,.19,49],[5.1,2.9]);
  for(const xx of [-25.5,-21])for(const zz of [47.8,50.2])wood.box([xx,1.26,zz],[.12,2.16,.12]);
  for(const zz of [47.8,50.2])wood.box([-23.25,2.37,zz],[4.8,.16,.12]);
  for(let xx=-25.5;xx<=-21;xx+=.42)wood.box([xx,2.51,49],[.09,.14,2.9]);
  wood.box([-23.3,.77,49],[1.8,.09,.8]);for(const xx of [-24,-22.6])wood.box([xx,.44,49],[.1,.64,.65]);
  for(const zz of [48.2,49.8]){wood.box([-23.3,.49,zz],[1.8,.09,.3]);for(const xx of [-24,-22.6])wood.box([xx,.30,zz],[.08,.3,.26]);}
  end();
  // Foundation planting beds flank, but do not cover, the front steps.
  for(const [xx,zz,ww,dd]of [[-20,46.65,2.8,1.4],[-13.7,46.6,2.1,1.3],[-12.9,49,1.3,4.2],[-35,50,1.4,6.5],[-30.5,54,7.5,1.1]]){
   begin([xx,.14,zz]);soil.plane([xx,.18,zz],[ww,dd]);for(let v=-ww/2;v<ww/2;v+=.26)mound(stone,xx+v,.22,zz-dd/2,.14,.08,.10,v);for(let j=0;j<Math.max(2,Math.floor(ww));j++){const sx=xx+(j-(Math.max(2,Math.floor(ww))-1)/2)*.75;shrub(sx,zz,.42,j);for(let k=0;k<3;k++)mound(flower[(j+k)%3],sx+.16*Math.sin(k*2),.55,zz+.15*Math.cos(k*2),.07,.06,.07,k);}
   end();
  }
  // Raised vegetable beds, tomato stakes, bean trellises, compost and a rain barrel.
  begin([garden.x,.14,garden.z]);
  gravel.plane([garden.x,.17,garden.z],[garden.width,garden.depth]);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const bx=-21.5+col*2.35,bz=54.1+row*2.15;soil.box([bx,.31,bz],[1.75,.26,1.3]);
   for(const dz of [-.69,.69])wood.box([bx,.33,bz+dz],[1.88,.28,.09]);for(const dx of [-.92,.92])wood.box([bx+dx,.33,bz],[.09,.28,1.46]);
   for(let j=0;j<4;j++)for(let k=0;k<2;k++){const px=bx-.62+j*.41,pz=bz-.32+k*.64;if(row===0){for(let l=0;l<3;l++)mound(leaf[(col+l)%3],px+.07*Math.sin(l*2),.54,pz+.07*Math.cos(l*2),.14,.10,.14,l);}else{wood.line([px,.4,pz],[px,1.12,pz],.021);shrub(px,pz,.23,j);for(let l=0;l<2;l++){mound(leaf[(j+l)%3],px-.055,.73+l*.16,pz,.10,.08,.13,l);mound(tomato,px+.085,.72+l*.16,pz,.044,.044,.044,l);}}}
  }
  for(const xx of [-23.1,-14.9])for(let zz=53.2;zz<=57.4;zz+=.7)wood.box([xx,.56,zz],[.055,.82,.055]);
  for(const xx of [-23.1,-14.9])for(const yy of [.45,.83])wood.line([xx,yy,53.2],[xx,yy,57.4],.035);
  for(let x=-23.1;x<=-14.9;x+=.7)wood.box([x,.56,57.4],[.055,.82,.055]);for(const y of [.45,.83])wood.line([-23.1,y,57.4],[-14.9,y,57.4],.035);
  for(const c of [[-23.1,55.3,.12,4.4],[-14.9,55.3,.12,4.4],[-19,57.4,8.3,.12]])obstacle('garden fence',...c,.85);
  wood.box([-24.6,.47,55.8],[1.05,.65,1.0]);for(let y=.25;y<.85;y+=.13)trim.box([-24.6,y,55.27],[1.08,.03,.05]);
  end();begin([-12.6,.14,51]);
  mound(door,-12.6,.56,51,.31,.42,.31);metal.box([-12.6,.93,51],[.62,.055,.62]);
  end();
  // Irregular ornamental trees and shrubs soften the broad empty lawn.
  for(const [i,[tx,tz,r]]of [[-11,38,.8],[-36.5,55,1.1],[-38,44,1],[-25,35.9,.9],[-11,54,.8]].entries()){
   begin([tx,.14,tz]);disk(soil,tx,.17,tz,r*1.1);wood.tube([[tx,.14,tz],[tx,1.6,tz],[tx+.22,2.05,tz]],.07);
   for(let k=0;k<7;k++){const a=k*2.4+i;mound(leaf[(i+k)%3],tx+Math.cos(a)*r*.48,1.8+(k%3)*.33,tz+Math.sin(a)*r*.48,r*.62,r*.8,r*.62,k);}
   obstacle('home tree',tx,tz,.22,.22,2.5);end();
  }
  for(const [x,z]of [[-11.8,41.5],[-13,43.8],[-25.5,46.4],[-35.6,46]])shrub(x,z,.55);
  for(const x of [-16.0,-20.7]){begin([x,1.54,46.82]);metal.box([x,1.54,46.82],[.12,.29,.13]);warm.box([x,1.54,46.745],[.085,.19,.045]);metal.box([x,1.71,46.79],[.20,.05,.20]);end();}
  for(const x of [-19.1,-13.6]){begin([x,.68,46.65]);wood.box([x,.68,46.65],[.85,.20,.25]);soil.box([x,.79,46.65],[.79,.025,.20]);for(let i=0;i<7;i++){const xx=x-.34+i*.11;mound(leaf[i%3],xx,.88,46.65,.09,.10,.1,i);mound(flower[i%3],xx,.96,46.65,.045,.045,.045,i);}end();}
  batches=all.filter(([m])=>m.i.length).map(([m,p])=>m.build(p));triangles=all.reduce((n,[m])=>n+m.i.length/3,0);
 }
 function draw(planes){if(!batches.length||!sphereVisible([-28,2,45],42,planes))return;gl.disable(gl.CULL_FACE);for(const b of batches)drawBatch(b);Garage93.draw(planes);}
 return {build,draw,snapshot:()=>({garage,garden,driveway,road:{x:-3.65,width:4.7},batches:batches.length,triangles,twoTracks:false,surfaceHeight:.14,detailScale:PLAYER_SCALE,garageSize:[garage.width,2.55,garage.depth],tableHeight:.14+(.815-.14)*PLAYER_SCALE})};
})();
