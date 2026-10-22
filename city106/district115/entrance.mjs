import * as T from '../../pc66/vendor/three/three.core.js';

export function addRiverEntrance({doc,scene,mesh,box,rod,geo,material}){
 const stone=material('River entrance light concrete',[.63,.65,.64,1]),trim=material('River entrance aluminum',[.67,.72,.74,1],null,.78,.23),glass=material('River entrance door glass',[.38,.56,.61,.32],null,.22,.12).setAlphaMode('BLEND'),dark=material('River entrance dark weather seal',[.035,.045,.049,1]);
 let serial=0;
 const add=(name,parts,extra={})=>{const n=doc.createNode('District115 River entrance '+name+' '+serial++).setMesh(mesh('River entrance '+name+' '+serial,parts)).setExtras({cityProp:true,...extra});scene.addChild(n);return n;};
 const landingTop=.24;
 add('upper landing',[box([0,.10,-30.725],[7.8,.28,.85],stone)],{surface115:true});
 // The promenade itself is the fourth level; a duplicate box there flickers.
 for(let i=1;i<=3;i++){
  const top=landingTop-i*.06525,z=-31.15-(i-.5)*.23;
  add('stair tread '+i,[box([0,(top-.14)/2,z],[7.8,top+.14,.23],stone)],{surface115:true});
  add('stair nosing '+i,[box([0,top+.001,z-.105],[7.8,.004,.018],trim)]);
 }
 for(const x of[-3.87,0,3.87]){
  const rails=[];
  for(const z of[-30.88,-31.35,-31.9]){const y=z> -31.15?.24:.24-Math.min(4,Math.ceil((-31.15-z)/.23))*.06525;rails.push(rod([x,y,z],[x,y+.34,z],.012,.012,trim,8));}
  rails.push(rod([x,.58,-30.88],[x,.58,-31.15],.014,.014,trim,8),rod([x,.58,-31.15],[x,.32,-32.07],.014,.014,trim,8));
  add('stair handrail',rails,{surface115:true});
 }
 const z=-30.30,bottom=.244,h=1.13,w=.53;
 add('door header',[box([0,bottom+h+.03,z],[3.34,.06,.10],trim)],{surface115:true});
 for(const x of[-1.64,-.55,.55,1.64])add('fixed jamb',[box([x,bottom+h/2,z],[.04,h,.10],trim)],{surface115:true});
 for(let pair=0;pair<3;pair++)for(const side of[-1,1]){
  const center=(pair-1)*1.10,hinge=center+side*.53,dir=-side,parts=[];
  parts.push(box([dir*w/2,h/2,0],[w-.025,h-.035,.018],glass));
  for(const x of[dir*.014,dir*(w-.014)])parts.push(box([x,h/2,0],[.028,h,.046],trim));
  for(const y of[.016,.13,h-.016])parts.push(box([dir*w/2,y,0],[w,.032,.046],trim));
  parts.push(box([dir*(w-.045),h/2,0],[.008,h,.048],dark));
  for(const face of[-1,1]){parts.push(rod([dir*(w-.095),.41,face*.054],[dir*(w-.095),.72,face*.054],.010,.010,trim,8),rod([dir*.07,.53,face*.050],[dir*(w-.07),.53,face*.050],.009,.009,trim,8));}
  const node=add('swinging glass door',parts,{swingDoor115:{hinge:[hinge,bottom,z],direction:dir,width:w,height:h}});node.setTranslation([hinge,bottom,z]);
 }
 // Seal the openings between the side walls and rear curtain wall.
 for(const side of[-1,1]){
  const x=side*5.046,z=-29.56,depth=1.56;
  add('sealed side return '+side,[box([x,3.72,z],[.075,6.96,depth],glass),box([x,.11,z],[.16,.26,depth],stone)],{collider107:{center:[x,3.60,z],size:[.16,7.2,depth]}});
  const frame=[];
  for(const q of[-30.31,-29.55,-28.79])frame.push(box([x,3.60,q],[.16,7.2,.05],trim));
  for(const y of[.24,1.2,2.4,3.6,4.8,6,7.2])frame.push(box([x,y,z],[.16,.05,depth],trim));
  add('return mullions '+side,frame);
 }
 add('rear slab fascia',[-1,1].map(side=>box([side*4.5,.10,-30.30],[1.2,.28,.10],stone)),{surface115:true});
 // Human-scale closed risers replace the original eighteen floating glass treads.
 const count=40,rise=(3.027-.24)/count,run=(6.93-1.2)/count,width=1.08;
 let q=-22.2,y=.24;
 for(let i=1;i<=count;i++){
  const depth=run+([14,28].includes(i)?.6:0);y=.24+i*rise;
  add('gallery stair tread '+i,[box([-2.25,(.24+y)/2,q-depth/2],[width,y-.24,depth],stone)],{surface115:true});
  for(const x of[-2.79,-1.71]){
   const rails=[rod([x,y-rise+.38,q],[x,y+.38,q-run],.013,.013,dark,8)];
   if(depth>run)rails.push(rod([x,y+.38,q-run],[x,y+.38,q-depth],.013,.013,dark,8));
   if(i%3===0||depth>run||i===count)rails.push(rod([x,y,q-depth],[x,y+.38,q-depth],.009,.009,trim,6));
   add('gallery stair handrail '+i,rails);
  }
  q-=depth;
 }
 return {doors:6,steps:3,gallerySteps:count,sealedReturns:2};
}
