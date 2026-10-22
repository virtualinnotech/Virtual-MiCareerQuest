/* Fictional training reservation, deterministic assessment and architectural bounds. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HotelCore146=api;})(globalThis,()=>{
 'use strict';
 const building='City_Front_103_Building-Medium-01',origin=[-26.7315,-.099,51.7019],kiosk=[-19.25,3.027,-14.15];
 const reception={position:[-2.58,0,-1.5],scale:[1.45,2.30,1.65],yaw:Math.PI,employee:[-3.16,0,-1.48],guest:[-1.73,0,-1.5],logo:[-2.168,.28,-1.5],computer:[-2.34,.456,-2.04],computerScale:.85,monitor:[-2.3043,.59625,-2.06635]};
 const kioskDesk={scale:[1.45,2.30,1.90],yaw:-Math.PI/2,approach:[0,0,-.95],logo:[0,.28,-.412]};
 const windowBays151=[-3.22,-1.96,-.70,.56,1.82,3.08];
 const windows=[{y:.12,height:1.90},{y:2.20,height:2.05}].flatMap(row=>[
  ...[-1,1].flatMap(side=>windowBays151.map(z=>({axis:0,wall:side*3.39,along:z,width:1.12,yaw:side<0?Math.PI/2:-Math.PI/2,...row}))),
  ...[-2.64,-1.41,1.41,2.64].map(x=>({axis:2,wall:-3.97,along:x,width:1.08,yaw:0,...row}))
 ]);
 windows.push({axis:2,wall:-3.97,along:0,y:2.20,width:1.38,height:2.05,yaw:0});
 const envelope151={lo:[-3.51,0,-4.08],hi:[3.51,16.14,4.08]},door151={z:-3.76,front:-3.97,radius:.502,height:1.02,openingWidth:1.12,openingHeight:1.06,infillInner:.375};
 const reading153=[
  ['victorian-details',[.65,0,.38],1,-Math.PI/2],
  ['reading-chair',[-.64,0,1.55],1,Math.PI+.32],
  ['reading-chair',[.64,0,1.55],1,Math.PI-.32],
  ['coffee-table',[0,0,1.95],1.25,Math.PI/2],
  ['reading-bookcase',[-1.28,0,3.40],1,0],
  ['reading-bookcase',[1.28,0,3.40],1,0]
 ];
 const name='Grand Plaza Hotel';
 const waiting154=[
  ['sofa',[2.95,0,-.30],1,Math.PI],
  ['sofa',[2.96,0,-2.45],1.2,Math.PI],
  ['sofa',[1.90,0,-3.50],1.2,-Math.PI/2],
  ['reading-chair',[1.17,0,-2.63],1,-1.72],
  ['reading-chair',[1.85,0,-1.27],1,-.15],
  ['coffee-table',[2.10,0,-2.46],1.2,0],
  ['side-table',[2.95,0,-1.45],1,0],
  ['side-table',[2.90,0,-3.40],1,0]
 ];
 const doorman154=['doorman-idle',[.83,0,-4.14],1,Math.PI];
 const staff154=['staff-idle',[-3.16,0,-.38],1,Math.PI/2];
 const bounds={lo:[-30.30,-.12,47.55],hi:[-23.163,5.75,55.854]},cutHeight=5.70;
 const lobbyBounds150={lo:[origin[0]-3.25,origin[1]+.03,origin[2]-3.8],hi:[origin[0]+3.25,origin[1]+4.2,origin[2]+3.6]};
 const portals150=windows.map(w=>({axis:w.axis,plane:origin[w.axis]+w.wall,u:w.axis===0?2:0,low:[origin[w.axis===0?2:0]+w.along-w.width/2-.16,origin[1]+w.y-.14],high:[origin[w.axis===0?2:0]+w.along+w.width/2+.16,origin[1]+w.y+w.height+.14]}));
 for(const x of [-2.15,2.15])portals150.push({axis:2,plane:origin[2]+3.62,u:0,low:[origin[0]+x-.6,origin[1]+2.4],high:[origin[0]+x+.6,origin[1]+4.2]});
 portals150.push({axis:2,plane:origin[2]-3.97,u:0,low:[origin[0]-1.2,origin[1]-.1],high:[origin[0]+1.2,origin[1]+1.9]});
 const insideLobby150=p=>p.every((v,k)=>v>lobbyBounds150.lo[k]&&v<lobbyBounds150.hi[k]);
 function lobbyOccludes150(lo,hi,eye){
  if(!insideLobby150(eye)||lo.every((v,k)=>v<=lobbyBounds150.hi[k]&&hi[k]>=lobbyBounds150.lo[k]))return false;
  // Conservatively project the entire object's bounds through each opening.
  // Straddling an opening plane is retained, never guessed to be hidden.
  for(const o of portals150){
   const d=o.plane-eye[o.axis],near=d>0?lo[o.axis]:hi[o.axis],far=d>0?hi[o.axis]:lo[o.axis];
   if(d*(far-o.plane)<=0)continue;
   if(d*(near-o.plane)<=0)return false;
   const t0=d/(lo[o.axis]-eye[o.axis]),t1=d/(hi[o.axis]-eye[o.axis]);
   const projected=k=>[eye[k]+t0*(lo[k]-eye[k]),eye[k]+t0*(hi[k]-eye[k]),eye[k]+t1*(lo[k]-eye[k]),eye[k]+t1*(hi[k]-eye[k])];
   const u=projected(o.u),v=projected(1);
   if(Math.max(...u)>=o.low[0]&&Math.min(...u)<=o.high[0]&&Math.max(...v)>=o.low[1]&&Math.min(...v)<=o.high[1])return false;
  }
  return true;
 }
 const stairs={asset:'wooden-stairs',position:[0,0,1.50],scale:[1,2.1/2.016,1],yaw:Math.PI};
 const booking={name:'Jordan Ellis',reference:'AGP-2048',nights:2,adults:1,roomType:'King',preference:'Quiet room',pet:'One dog',rate:189,petFee:50,total:428,room:'412',checkout:'11:00 AM'};
 const steps=[
  {id:'welcome',title:'Welcome the guest',guest:'Hi, I have a reservation. It has been a long trip, and I have my dog with me.',choices:[['Welcome to the Grand Plaza Hotel. I would be happy to help. May I have the name on your reservation?',2,'A warm greeting and an open question make the guest feel welcome.'],['Name?',1,'You can be efficient and still offer a warm welcome.'],['You need to wait. I am busy.',0,'Acknowledge the guest and offer help.']]},
  {id:'reservation',title:'Find the reservation',guest:'It is Jordan Ellis, for two nights. I requested a quiet king room.',choices:[['AGP-2048 | Jordan Ellis | 2 nights | King',2,'Correct reservation selected.'],['AGP-2051 | Jordan Evans | 1 night | Twin',0,'The name, dates, and room type must match.'],['Create a new walk-in reservation without checking.',0,'Look for the existing reservation to avoid duplicate bookings.']],required:true},
  {id:'identity',title:'Verify privately',guest:'What do you need from me?',choices:[['May I see your photo ID and the payment card for the reservation? I will verify them privately.',2,'Identity and payment checked discreetly. No real details are collected in this simulation.'],['Please say your full card number out loud.',0,'Protect payment information. Never ask a guest to announce card details.'],['No verification is needed.',0,'Complete the identity and payment check before issuing access.']],required:true},
  {id:'room',title:'Assign a suitable room',guest:'A quiet room would be wonderful. Is there one where my dog can stay?',choices:[['412 | King | Ready | Quiet | Pet-friendly',2,'The room is ready and meets every request.'],['309 | King | Occupied | Quiet | Pet-friendly',0,'An occupied room cannot be assigned.'],['216 | Twin | Ready | Street-facing | No pets',0,'This room does not match the reservation or guest needs.']],required:true},
  {id:'care',title:'Care for the guest',guest:'Could someone help with my bags, and where can I take my dog?',choices:[['Of course. I can call our bellhop and show you the designated outdoor pet area.',2,'You offered practical help for both the guest and their companion.'],['The exit is behind you.',1,'Offer clear directions and help with the luggage as requested.'],['You will have to work that out yourself.',0,'Hospitality includes helping guests find the services they need.']]},
  {id:'charges',title:'Confirm the charges',guest:'Before we finish, what is the total for this stay?',choices:[['Two nights at $189 plus the $50 pet fee: $428 in this training booking. May I confirm that with you?',2,'You explained the full simulated total and requested confirmation.'],['$378. I will add the pet fee later.',0,'Disclose all charges before confirmation.'],['I cannot tell you until checkout.',0,'Give a clear explanation of the reservation charges.']],required:true},
  {id:'keys',title:'Issue the key',guest:'Great, thank you. Where should I go?',choices:[['Hand over the key sleeve privately and point out the room number and elevator route.',2,'The key is issued discreetly, with useful directions.'],['Announce the room number loudly across the lobby.',0,'Keep the guest room number private.'],['Give a key to the nearest available room.',0,'The key must match the verified assigned room.']],required:true},
  {id:'farewell',title:'Finish the arrival',guest:'That is everything. Thanks for helping us settle in.',choices:[['You are very welcome. Checkout is at 11 AM for this booking. Is there anything else I can help with?',2,'A complete, welcoming close.'],['Here is your key. Have a nice stay.',1,'Friendly, but include checkout details and offer further help.'],['Next!',0,'Close with courtesy rather than rushing the guest away.']]}
 ];
 function create(){let state;const reset=()=>state={step:0,score:0,answers:[],attempts:0,feedback:'',complete:false,tip:0,room:null,verified:false,confirmed:false};reset();
  return {get state(){return state;},reset,choose(index){const step=steps[state.step];if(state.complete||!Number.isInteger(index)||!step?.choices[index])return false;
   const [text,points,feedback]=step.choices[index];state.feedback=feedback;
   state.answers.push({step:step.id,index,points,attempt:state.attempts});
   if(step.required&&points<2){state.attempts++;return false;}
   state.score+=state.attempts?0:points*6.25;state.attempts=0;
   if(step.id==='identity')state.verified=true;if(step.id==='room')state.room=booking.room;if(step.id==='charges')state.confirmed=true;
   state.step++;if(state.step===steps.length){state.complete=state.verified&&state.confirmed&&state.room===booking.room;state.score=Math.round(state.score);state.tip=state.score>=90?20:state.score>=70?10:0;}return true;
  }};
 }
 const owns=name=>name?.startsWith(building);
 // Clip triangles at the lobby roof, preserving normals and UVs on upper stories.
 function clip(data,idx,uv,height=cutHeight){const out=[],indices=[],tex=[];
  for(let i=0;i<idx.length;i+=3){const poly=[idx[i],idx[i+1],idx[i+2]].map(v=>[...data.subarray(v*6,v*6+6),...(uv?uv.subarray(v*2,v*2+2):[])]),kept=[];
   for(let k=0;k<3;k++){const a=poly[k],b=poly[(k+1)%3],da=a[1]-height,db=b[1]-height;if(da>=0)kept.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);kept.push(a.map((v,n)=>v+(b[n]-v)*t));}}
   for(let k=1;k+1<kept.length;k++)for(const v of [kept[0],kept[k],kept[k+1]]){indices.push(out.length/6);out.push(...v.slice(0,6));if(uv)tex.push(...v.slice(6));}
  }return {data:new Float32Array(out),idx:new Uint32Array(indices),uv:uv?new Float32Array(tex):null};
 }
 // Subtract only the street doorway from the visible brick facade. The solid
 // footprint collider is clipped separately so the interior remains walkable.
 function source(g,world,lo=[origin[0]-.75,-1,47.2],hi=[origin[0]+.75,origin[1]+1.35,47.85]){const pos=[],nor=[],uv=[],idx=[];
  const coordinate=(v,k)=>world[k]*v[0]+world[4+k]*v[1]+world[8+k]*v[2]+world[12+k];
  const split=(poly,k,bound,sign)=>{const inside=[],outside=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(coordinate(a,k)-bound)*sign,db=(coordinate(b,k)-bound)*sign;(da>=0?inside:outside).push(a);if((da>=0)!==(db>=0)){const t=da/(da-db),v=a.map((x,n)=>x+(b[n]-x)*t);inside.push(v);outside.push(v);}}return [inside,outside];};
  const emit=poly=>{for(let i=1;i+1<poly.length;i++)for(const v of [poly[0],poly[i],poly[i+1]]){idx.push(pos.length/3);pos.push(...v.slice(0,3));nor.push(...v.slice(3,6));if(g.uv)uv.push(...v.slice(6));}};
  for(let i=0;i<g.idx.length;i+=3){let poly=Array.from(g.idx.subarray(i,i+3),v=>[...g.pos.subarray(v*3,v*3+3),...g.nor.subarray(v*3,v*3+3),...(g.uv?g.uv.subarray(v*2,v*2+2):[])]);for(let k=0;k<3&&poly.length;k++)for(const [bound,sign]of [[lo[k],1],[hi[k],-1]]){const parts=split(poly,k,bound,sign);emit(parts[1]);poly=parts[0];}}
  return {...g,pos:new Float32Array(pos),nor:new Float32Array(nor),idx:new Uint32Array(idx),uv:g.uv?new Float32Array(uv):null};
 }
 const groundNames=new Set(['Block126 courtyard paving 5 0','District115 fallen leaves 857','District115 fallen leaves 859','District115 fallen leaves 1729']);
 function pavingSource(g,world){
  g=source(g,world,[origin[0]-3.57,-1,origin[2]-4.15],[origin[0]+3.57,.20,origin[2]+4.15]);return g;
 }
 const retired=new Set(['City109 shopfronts 133','City109 shopfronts 134','City109 shopfronts 135','City109 shopfronts 136','City111 shopAwnings 31','City111 shopAwnings 32','City111 menus 11','City111 fireEscapes 17','District115 sidewalk green tree 1728']);
 const removeOriginal=name=>retired.has(name);
 return {building,origin,kiosk,reception,kioskDesk,windows,windowBays151,envelope151,door151,reading153,name,waiting154,doorman154,staff154,bounds,cutHeight,stairs,booking,steps,create,owns,clip,source,removeOriginal,groundNames,pavingSource,insideLobby150,lobbyOccludes150};
});
