import * as T from '../pc66/vendor/three/three.core.js';
import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';

export async function addStreetDetails({doc,scene,original,worldBounds,mesh,geo,box,rod,material,texture,treePlacements}){
 const counts={},placements=[];
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><linearGradient id="glass" x2=".2" y2="1"><stop stop-color="#728c98"/><stop offset=".4" stop-color="#bea88c"/><stop offset="1" stop-color="#2a3d41"/></linearGradient><linearGradient id="room" x2="0" y2="1"><stop stop-color="#dbc39c"/><stop offset="1" stop-color="#5e5c4c"/></linearGradient></defs><rect width="1024" height="1024" fill="#343d3b"/>';
 // Atlas: drain, iron cover, tree grate, stone, three shopfronts, metal swatches.
 svg+='<rect x="6" y="6" width="244" height="244" fill="#747873"/><rect x="16" y="16" width="224" height="224" fill="#242a28"/>';
 for(let i=0;i<12;i++)svg+=`<path d="M26 ${26+i*18}h204" stroke="#687068" stroke-width="7"/><path d="M26 ${28+i*18}h204" stroke="#92988c" stroke-width="1"/>`;
 svg+='<rect x="256" width="256" height="256" fill="#575d58"/><circle cx="384" cy="128" r="119" fill="#252f2e" stroke="#949c90" stroke-width="4"/><circle cx="384" cy="128" r="106" fill="#4c5853" stroke="#161f20" stroke-width="4"/>';
 for(let i=0;i<21;i++)svg+=`<path d="M${294+i*9} 66v124M323 ${48+i*8}h122" stroke="#2c3433" stroke-width="3"/>`;
 svg+='<rect x="343" y="110" width="82" height="35" rx="3" fill="#667065"/><text x="384" y="132" text-anchor="middle" font-family="Arial" font-size="13" fill="#293530">CITY WATER</text><rect x="512" width="256" height="256" fill="#404d42"/>';
 for(let r=26;r<126;r+=9)svg+=`<circle cx="640" cy="128" r="${r}" fill="none" stroke="#151f1c" stroke-width="5"/>`;
 for(let i=0;i<16;i++){const a=i*Math.PI/8;svg+=`<path d="M${640+Math.cos(a)*24} ${128+Math.sin(a)*24}L${640+Math.cos(a)*123} ${128+Math.sin(a)*123}" stroke="#627060" stroke-width="5"/>`;}
 svg+='<rect x="768" width="256" height="256" fill="#989b91"/>';
 for(let i=0;i<8;i++)svg+=`<path d="M768 ${i*32}h256" stroke="#4b554d" stroke-width="2"/><path d="M${768+i*32} 0v256" stroke="#d4d3c4" stroke-opacity=".25"/>`;
 ['RIVER BOOKS','CORNER CAFE','MARKET &amp; CO.'].forEach((name,row)=>{
  const y=256+row*192;
  svg+=`<rect x="0" y="${y}" width="768" height="192" fill="#c0b6a2"/><rect x="8" y="${y+8}" width="752" height="28" fill="${['#274c4f','#4b4c42','#56413e'][row]}"/><text x="384" y="${y+28}" font-family="Georgia" font-size="19" text-anchor="middle" fill="#e1dcca">${name}</text>`;
  for(let c=0;c<5;c++){const x=18+c*147;svg+=`<rect x="${x}" y="${y+45}" width="140" height="129" fill="#283b3f"/><rect x="${x+5}" y="${y+50}" width="130" height="117" fill="url(#${c%2?'glass':'room'})"/><path d="M${x+6} ${y+57}h126" stroke="#e6d8ae" stroke-width="3"/>`;for(let k=0;k<6;k++)svg+=`<rect x="${x+13+k*19}" y="${y+111+k%3*3}" width="12" height="32" fill="${['#586555','#95714e','#6e7776'][k%3]}"/>`;svg+=`<path d="M${x+7} ${y+145}h126M${x+7} ${y+155}h126" stroke="#494c40" stroke-width="4"/>`;}
  svg+=`<rect x="352" y="${y+44}" width="65" height="137" fill="#394446"/><rect x="359" y="${y+51}" width="50" height="119" fill="url(#glass)"/><path d="M399 ${y+111}v22" stroke="#d0ceba" stroke-width="3"/><path d="M0 ${y+187}h768" stroke="#434b48" stroke-width="10"/>`;
 });
 ['#313e3b','#63756e','#a64b35','#b7bcaf','#9e947d','#ede1bb'].forEach((c,i)=>{svg+=`<rect x="${i*128}" y="850" width="128" height="174" fill="${c}"/>`;});
 svg+='</svg>';
 const atlas=material('City109 street atlas',[1,1,1,1],await texture('City109 drains storefronts and street hardware',await sharp(Buffer.from(svg)).png().toBuffer()),.25,.7);
 const uvRect=(g,r)=>{const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(r[0]+2+uv.getX(i)*(r[2]-4))/1024,(r[1]+2+(1-uv.getY(i))*(r[3]-4))/1024);return geo(g,atlas);};
 const tint=(p,i=0)=>{const uv=p.g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,(i*128+64)/1024,.93);p.m=atlas;return p;};
 const b=(c,s,i=0)=>tint(box(c,s,atlas),i),r=(a,z,r0,r1,i=0,sides=8)=>tint(rod(a,z,r0,r1,atlas,sides),i);
 function plane(w,h,rect,ground=false){const g=new T.PlaneGeometry(w,h);if(ground)g.rotateX(-Math.PI/2);return uvRect(g,rect);}
 function place(type,model,p,yaw=0,scale=[1,1,1],collider=null){
  counts[type]=(counts[type]||0)+1;const name='City109 '+type+' '+counts[type];
  scene.addChild(doc.createNode(name).setMesh(model).setTranslation(p).setRotation([0,Math.sin(yaw/2),0,Math.cos(yaw/2)]).setScale(scale).setExtras({cityProp:true,detail109:type,...(collider?{collider107:collider}:{})}));
  placements.push({name,type,p,yaw,scale});
 }
 const drain=mesh('City109 recessed storm drain',[plane(.45,.31,[0,0,256,256],true)]);
 const cover=mesh('City109 utility cover',[plane(.52,.52,[256,0,256,256],true)]);
 const treeGrateParts=[];
 for(const [c,s]of[[[0,0,-.22],[.65,.21]],[[0,0,.22],[.65,.21]],[[-.22,0,0],[.21,.23]],[[.22,0,0],[.21,.23]]]){const g=new T.PlaneGeometry(...s);g.rotateX(-Math.PI/2);g.translate(...c);const uv=g.attributes.uv,p=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(512+128+p.getX(i)/.65*248)/1024,(128+p.getZ(i)/.65*248)/1024);treeGrateParts.push(geo(g,atlas));}
 const treeGrate=mesh('City109 cast iron tree grate',treeGrateParts);
 const binParts=[b([0,.018,0],[.24,.036,.24]),r([0,.04,0],[0,.44,0],.115,.125,0,12),r([0,.44,0],[0,.47,0],.135,.135,1,12)];
 for(let i=0;i<14;i++){const a=i*Math.PI/7;binParts.push(r([Math.cos(a)*.118,.07,Math.sin(a)*.118],[Math.cos(a)*.13,.425,Math.sin(a)*.13],.005,.005,1,4));}
 const bin=mesh('City109 ribbed litter bin',binParts);
 const hydrantParts=[r([0,.02,0],[0,.34,0],.065,.061,2,10),r([0,.34,0],[0,.38,0],.074,.055,2,10),r([-.115,.24,0],[.115,.24,0],.038,.038,2,8),r([-.13,.24,0],[-.10,.24,0],.049,.049,3,6),r([.10,.24,0],[.13,.24,0],.049,.049,3,6),r([0,.38,0],[0,.398,0],.024,.024,3,6)];
 const hydrant=mesh('City109 fire hydrant',hydrantParts);
 const bollard=mesh('City109 safety bollard',[r([0,0,0],[0,.43,0],.035,.035,0,8),r([0,.32,0],[0,.35,0],.036,.036,5,8),r([0,.43,0],[0,.45,0],.035,.025,1,8)]);
 const rackParts=[];
 for(const x of[-.28,0,.28]){const curve=new T.CubicBezierCurve3(new T.Vector3(x,0,-.1),new T.Vector3(x,.7,-.15),new T.Vector3(x,.7,.15),new T.Vector3(x,0,.1));rackParts.push(tint(geo(new T.TubeGeometry(curve,10,.014,6,false),atlas),1));}
 const rack=mesh('City109 tubular cycle rack',rackParts);
 const shopModels=[0,1,2].map(i=>{
  const face=plane(1,.96,[0,256+i*192,768,192]);face.g.translate(0,.51,.035);
  const parts=[face,b([0,.018,0],[1,.036,.10],0),b([0,1.03,.075],[1.035,.075,.23],i===0?1:i===1?0:2)];
  for(const x of[-.5,.5])parts.push(b([x,.52,.025],[.018,.98,.08],3));
  return mesh('City109 shopfront '+i,parts);
 });
 // Add surface details only to existing road spans; no roads or crossings move.
 const roads=[];
 for(const n of original.getRoot().listNodes())if(n.getMesh()&&n.getExtras().kind==='cityStreet'){
  const {lo,hi}=worldBounds(n),along=hi[0]-lo[0]>hi[2]-lo[2]?0:2,cross=along===0?2:0,mid=lo.map((v,k)=>(v+hi[k])/2);roads.push({lo,hi});
  for(let q=lo[along]+5;q<hi[along]-2;q+=13.7){
   const p=[...mid];p[along]=q;p[1]=hi[1]+.002;p[cross]+=Math.min(.46,(hi[cross]-lo[cross])*.12);place('covers',cover,p,q*.37);
   for(const side of[-1,1]){const d=[...p];d[cross]=side<0?lo[cross]+.17:hi[cross]-.17;d[along]+=.8;place('drains',drain,d,along===0?Math.PI/2:0);}
  }
 }
 for(const p of treePlacements){if(p[2]>-31&&p[2]<33&&p[0]>-29&&p[0]<67)continue;place('treeGrates',treeGrate,[p[0],p[1]+.007,p[2]]);}
 const binCollider={center:[0,.23,0],size:[.28,.46,.28]},rackCollider={center:[0,.20,0],size:[.68,.4,.32]};
 for(const x of[-25,-12,17,32,47,60]){place('bins',bin,[x===-25?-29.7:x,-.027,36.65],0,[1,1,1],binCollider);place('bins',bin,[x,-.018,-36],0,[1,1,1],binCollider);}
 for(const x of[-21,21,54])place('hydrants',hydrant,[x,-.028,39.1],0,[1,1,1],{center:[0,.2,0],size:[.26,.4,.16]});
 for(const x of[-6,-4,4,6])place('bollards',bollard,[x,-.027,39.15],0,[1,1,1],{center:[0,.225,0],size:[.075,.45,.075]});
 for(const x of[-18,35])place('cycleRacks',rack,[x,-.027,36.7],0,[1,1,1],rackCollider);
 let building=0;
 for(const n of original.getRoot().listNodes()){
  if(!n.getMesh()||n.getExtras().kind!=='cityBuildingDetailed')continue;
  const {lo,hi}=worldBounds(n),cx=(lo[0]+hi[0])/2,cz=(lo[2]+hi[2])/2;
  if(Math.hypot(Math.max(-27-cx,0,cx-65),Math.max(-31-cz,0,cz-39))>53)continue;
  const y=Math.max(-.101,lo[1]),height=Math.min(1.32,(hi[1]-lo[1])*.14);
  for(const side of[-1,1])for(const axis of[0,2]){
   const width=hi[axis===0?2:0]-lo[axis===0?2:0];if(width<2)continue;
   const p=[cx,y,cz];p[axis]=(side<0?lo[axis]:hi[axis])+side*.035;
   const yaw=axis===2?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2);
   place('shopfronts',shopModels[(building+axis)%3],p,yaw,[width*.94,height,1]);
  }building++;
 }
 return {counts,placements};
}
