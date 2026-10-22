import * as T from '../../pc66/vendor/three/three.core.js';

// The counter backs onto the west wall; the canopy and returns form an alcove
// under the balcony, between the entry ribs. The main gallery remains untouched.
export async function addBoxOffice133({mesh,geo,box,rod,material,print,place,queue,pale,black,steel,floor}){
 const z0=22.95,z1=28.05,zc=(z0+z1)/2,face=-4.73,front=-3.86,top=1.84;
 const cream=material('Gallery133 box office limestone',[.78,.74,.61,1],null,0,.7);
 const brass=material('Gallery133 aged brass frames',[.29,.19,.085,1],null,.8,.3);
 const backing=material('Gallery133 warm ticket room',[.22,.17,.075,1],null,0,.78);
 const glass=material('Gallery133 ticket glazing',[.38,.43,.31,.20],null,.18,.16).setAlphaMode('BLEND');
 const lens=material('Gallery133 warm downlight diffuser',[1,.91,.72,1],null,0,.26).setEmissiveFactor([.8,.57,.28]);
 const darkCounter=material('Gallery133 polished counter',[.042,.033,.029,1],null,.3,.19);
 const put=(name,parts,extra={})=>place('Grand Gallery box office '+name,mesh('Gallery133 '+name,parts),[0,0,0],0,{boxOffice133:true,...extra});
 const architecture=[box([-4.87,(floor+top)/2,zc],[.07,top-floor,z1-z0],cream),box([-4.82,.295,zc],[.07,.11,z1-z0],black)];
 // A lower soffit closes up to the existing balcony, instead of a floating kiosk roof.
 architecture.push(box([(front-4.9)/2,top,zc],[front+4.9,.075,z1-z0],pale),box([front,2.33,zc],[.09,.98,z1-z0],pale));
 for(const z of[z0,z1]){
  const c=[(front-4.9)/2,(floor+top)/2,z],size=[front+4.9,top-floor,.085];
  put('alcove return '+z,[box(c,size,pale)],{collider107:{center:c,size}});
 }
 put('recessed wall and soffit',architecture);
 const counterCenter=[-4.66,.70,zc],counterSize=[.43,.045,z1-z0-.10];
 put('continuous counter',[box(counterCenter,counterSize,darkCounter)],{collider107:{center:[-4.72,.47,zc],size:[.43,.46,z1-z0-.10]}});
 const windows=[],lights=[];
 for(let i=0;i<6;i++){
  const z=z0+.48+i*.828,w=.68,bottom=.725,height=.655,y=bottom+height/2;
  const parts=[box([-4.81,y,z],[.025,height,w],backing)];
  for(const dz of[-w/2,w/2])parts.push(box([face,y,z+dz],[.055,height+.065,.025],brass));
  for(const yy of[bottom, bottom+height])parts.push(box([face,yy,z],[.055,.027,w+.045],brass));
  parts.push(box([-4.72,bottom+.19,z],[.013,.008,w],brass));
  parts.push(geo(new T.PlaneGeometry(w-.025,height-.025).rotateY(Math.PI/2).translate(face+.006,y,z),glass));
  parts.push(rod([face+.009,bottom+.25,z],[face+.026,bottom+.25,z],.032,.032,steel,24));
  for(let j=0;j<6;j++){const angle=j*Math.PI/3;parts.push(rod([face+.027,bottom+.25+Math.sin(angle)*.019,z+Math.cos(angle)*.019],[face+.03,bottom+.25+Math.sin(angle)*.019,z+Math.cos(angle)*.019],.003,.003,black,6));}
  parts.push(box([-4.59,.73,z-.22],[.11,.013,.12],brass),box([-4.63,.77,z+.20],[.025,.085,.065],black));
  put('ticket window '+(i+1),parts);windows.push({z,width:w,height,counter:.70-floor});
  const p=[-4.35,top-.06,z],light={p,radius:1.45,power:1.7,color:[1,.81,.52],alwaysOn:true};
  put('downlight '+i,[rod([p[0],top-.039,z],p,.043,.043,steel,24),rod(p,[p[0],p[1]-.004,z],.033,.033,lens,24)],{interiorLight133:light});lights.push(light);
 }
 const soffitLines=[];
 for(let z=z0+.26;z<z1;z+=.27)soffitLines.push(box([-4.38,top-.039,z],[1.03,.003,.004],cream));
 for(const x of[-4.65,-4.38,-4.11])soffitLines.push(box([x,top-.039,zc],[.004,.003,z1-z0],cream));
 put('soffit panel joints',soffitLines);
 const sign=await print('Grand Gallery box office lettering',`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="256"><rect width="2400" height="256" fill="#cec4a6"/><text x="480" y="150" text-anchor="middle" font-family="Georgia" font-size="58" fill="#282721">GRAND GALLERY</text><text x="1640" y="174" text-anchor="middle" font-family="Georgia" font-size="122" fill="#26251f">box office</text></svg>`);
 put('lettering',[geo(new T.PlaneGeometry(4.75,.34).rotateY(Math.PI/2).translate(-4.827,1.59,zc),sign)]);
 queue('box office queue',[[ -3.66,27.62],[-3.66,25.62],[-3.66,23.58],[-4.19,23.58],[-4.19,25.18],[-4.19,26.87]]);
 return {windows,lights,bounds:{lo:[-4.905,floor,z0-.043],hi:[-3.815,2.82,z1+.043]},queueClearWidth:.53,mainAisleEdge:-3.54};
}
