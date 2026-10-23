/* DeVos west front (172): builds the street wall that replaced the park strip.
 * Geometry is generated here and handed to the venue renderer once, so it is
 * culled, lit and shadowed like the rest of the building. Textures are drawn
 * on canvases (no downloads). Layout lives in core.js. */
window.WestFront172=(()=>{
 const C=WestFrontCore172,B=C.blocks,X0=C.front,Y0=C.ground;
 let ready=false,error=null,stats={batches:0,triangles:0,colliders:0};

 // ---- textures ----
 const canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return CharacterFitting.canvasTexture(c);};
 let seed=172;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 function glassWall(g,w,h,bays,rows,topBand){
  const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#34414f');sky.addColorStop(.45,'#18212b');sky.addColorStop(1,'#0a0f14');g.fillStyle=sky;g.fillRect(0,0,w,h);
  // Faint reflections of the towers across the street.
  for(let i=0;i<14;i++){const x=rnd()*w,bw=w*(.03+rnd()*.07),top=h*(.05+rnd()*.35);g.fillStyle=`rgba(${120+rnd()*60|0},${135+rnd()*60|0},${150+rnd()*60|0},${.05+rnd()*.07})`;g.fillRect(x,top,bw,h-top);}
  g.fillStyle='rgba(140,170,200,.10)';g.beginPath();g.moveTo(0,h*.2);g.lineTo(w*.35,0);g.lineTo(w*.5,0);g.lineTo(w*.1,h*.6);g.closePath();g.fill();
  g.fillStyle='#06080b';const t=topBand*h;g.fillRect(0,0,w,t);
  const mw=Math.max(5,w/bays*.07);for(let i=0;i<=bays;i++){const x=i*w/bays;g.fillRect(x-mw/2,0,mw,h);}
  for(let r=0;r<=rows;r++){const y=t+(h-t)*r/rows;g.fillRect(0,y-mw*.45,w,mw*.9);}
 }
 function panels(g,w,h){g.fillStyle='#1c1f23';g.fillRect(0,0,w,h);const cols=4,rows=2;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const v=62+rnd()*14|0,x=c*w/cols+3,y=r*h/rows+3,pw=w/cols-6,ph=h/rows-6,grad=g.createLinearGradient(x,y,x,y+ph);grad.addColorStop(0,`rgb(${v+12},${v+15},${v+19})`);grad.addColorStop(1,`rgb(${v-8},${v-5},${v-1})`);g.fillStyle=grad;g.fillRect(x,y,pw,ph);g.fillStyle='rgba(255,255,255,.10)';g.fillRect(x,y,pw,3);}
 }
 function brick(g,w,h){g.fillStyle='#8f7d70';g.fillRect(0,0,w,h);const rows=32,cols=12,bh=h/rows,bw=w/cols;
  for(let r=0;r<rows;r++)for(let c=-1;c<=cols;c++){const x=c*bw+(r%2?bw/2:0),k=rnd();g.fillStyle=`rgb(${120+k*30|0},${55+k*16|0},${38+k*12|0})`;g.fillRect(x+1.5,r*bh+1.5,bw-3,bh-3);}
 }
 function hotelBay(g,w,h){brick(g,w,h);
  const ww=w*.44,wh=h*.56,x=(w-ww)/2,y=h*.22;g.fillStyle='#e9e3d6';g.fillRect(x-w*.06,y-h*.08,ww+w*.12,wh+h*.14);g.fillRect(x-w*.09,y-h*.13,ww+w*.18,h*.06);
  g.fillStyle='#1b2630';g.fillRect(x,y,ww,wh);g.fillStyle='rgba(150,180,210,.18)';g.fillRect(x,y,ww,wh*.45);g.fillStyle='#e9e3d6';g.fillRect(x+ww/2-2,y,4,wh);g.fillRect(x,y+wh*.5-2,ww,4);
 }
 function hotelBase(g,w,h){g.fillStyle='#d9ccb4';g.fillRect(0,0,w,h);g.fillStyle='rgba(120,100,70,.18)';for(let y=h/6;y<h;y+=h/6)g.fillRect(0,y,w,2);
  const ww=w*.5,x=(w-ww)/2,top=h*.22,bottom=h*.9;g.fillStyle='#c4b498';g.fillRect(x-w*.05,top-w*.05,ww+w*.1,bottom-top+w*.05);g.fillStyle='#1a232c';g.beginPath();g.moveTo(x,bottom);g.lineTo(x,top+ww/2);g.arc(x+ww/2,top+ww/2,ww/2,Math.PI,0);g.lineTo(x+ww,bottom);g.closePath();g.fill();g.fillStyle='rgba(150,180,210,.15)';g.fillRect(x,top+ww/2,ww,(bottom-top)*.3);
 }
 function stoneWindows(g,w,h){g.fillStyle='#cdb99a';g.fillRect(0,0,w,h);g.fillStyle='rgba(110,90,60,.15)';g.fillRect(0,h-4,w,4);const ww=w*.42,wh=h*.56;g.fillStyle='#26323d';g.fillRect((w-ww)/2,h*.2,ww,wh);g.fillStyle='rgba(160,190,215,.16)';g.fillRect((w-ww)/2,h*.2,ww,wh*.4);}
 function granite(g,w,h){g.fillStyle='#cfc4b1';g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const k=rnd();g.fillStyle=k<.5?'rgba(90,80,70,.25)':'rgba(255,255,255,.25)';g.fillRect(rnd()*w,rnd()*h,1.5,1.5);}g.fillStyle='rgba(80,70,60,.35)';g.fillRect(0,h-3,w,3);g.fillRect(w-3,0,3,h);}
 function concrete(g,w,h){g.fillStyle='#b8b4ab';g.fillRect(0,0,w,h);for(let i=0;i<1600;i++){g.fillStyle=rnd()<.5?'rgba(60,60,60,.12)':'rgba(255,255,255,.14)';g.fillRect(rnd()*w,rnd()*h,2,2);}}
 const FLAGS=[
  (g,w,h)=>{g.fillStyle='#111';g.fillRect(0,0,w,h);g.strokeStyle='#eee';g.lineWidth=6;g.beginPath();g.arc(w*.5,h*.5,h*.3,0,7);g.stroke();g.fillStyle='#eee';g.font=`bold ${h*.16|0}px sans-serif`;g.textAlign='center';g.fillText('POW',w*.5,h*.17);g.fillText('MIA',w*.5,h*.96);g.beginPath();g.arc(w*.5,h*.46,h*.1,0,7);g.fill();g.fillRect(w*.44,h*.53,w*.12,h*.18);},
  (g,w,h)=>{g.fillStyle='#1d2f74';g.fillRect(0,0,w,h);g.fillStyle='#3f68b5';g.beginPath();g.moveTo(w*.38,h*.25);g.lineTo(w*.62,h*.25);g.lineTo(w*.62,h*.55);g.quadraticCurveTo(w*.5,h*.78,w*.38,h*.55);g.closePath();g.fill();g.fillStyle='#b98b3a';g.fillRect(w*.27,h*.3,w*.08,h*.36);g.fillRect(w*.65,h*.3,w*.08,h*.36);g.fillStyle='#e8e2c8';g.fillRect(w*.3,h*.74,w*.4,h*.07);g.fillStyle='#d9b04a';g.beginPath();g.arc(w*.5,h*.17,h*.06,0,7);g.fill();},
  (g,w,h)=>{for(let i=0;i<13;i++){g.fillStyle=i%2?'#f4f4f4':'#b22234';g.fillRect(0,i*h/13,w,h/13+1);}g.fillStyle='#3c3b6e';g.fillRect(0,0,w*.4,h*7/13);g.fillStyle='#fff';for(let r=0;r<9;r++)for(let c=0;c<(r%2?5:6);c++){g.beginPath();g.arc(w*.4*(c+(r%2?1:.5))/6,h*7/13*(r+.7)/9.4,h*.012,0,7);g.fill();}},
  (g,w,h)=>{g.fillStyle='#24429a';g.fillRect(0,0,w,h);g.fillStyle='#f2efe4';g.beginPath();g.arc(w*.5,h*.5,h*.27,0,7);g.fill();g.fillStyle='#24429a';g.beginPath();g.arc(w*.5,h*.5,h*.2,0,7);g.fill();g.fillStyle='#d9b04a';g.beginPath();g.arc(w*.5,h*.5,h*.1,0,7);g.fill();},
  (g,w,h)=>{g.fillStyle='#f3f1ea';g.fillRect(0,0,w,h);g.fillStyle='#1f4b8f';g.fillRect(0,h*.8,w,h*.2);g.beginPath();g.arc(w*.5,h*.42,h*.22,0,7);g.fill();g.fillStyle='#f3f1ea';g.beginPath();g.moveTo(w*.42,h*.5);g.lineTo(w*.5,h*.28);g.lineTo(w*.58,h*.5);g.closePath();g.fill();}
 ];

 // ---- geometry ----
 function builder(){const v=[],uv=[],idx=[];
  function quad(p,n,u=[[0,1],[1,1],[1,0],[0,0]]){const a=p[0],b=p[1],c=p[2],e=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],f=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],cr=[e[1]*f[2]-e[2]*f[1],e[2]*f[0]-e[0]*f[2],e[0]*f[1]-e[1]*f[0]];
   const s=v.length/6;for(let i=0;i<4;i++){v.push(...p[i],...n);uv.push(...u[i]);}
   if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]>=0)idx.push(s,s+1,s+2,s,s+2,s+3);else idx.push(s,s+2,s+1,s,s+3,s+2);}
  // A face split into texture tiles (textures clamp, so each tile maps 0..1).
  function face(o,uDir,vDir,uLen,vLen,n,tu,tv){
   for(let a=0;a<uLen-1e-6;a+=tu)for(let b=0;b<vLen-1e-6;b+=tv){const da=Math.min(tu,uLen-a),db=Math.min(tv,vLen-b),P=(x,y)=>[o[0]+uDir[0]*x+vDir[0]*y,o[1]+uDir[1]*x+vDir[1]*y,o[2]+uDir[2]*x+vDir[2]*y];
    quad([P(a,b),P(a+da,b),P(a+da,b+db),P(a,b+db)],n,[[0,1],[da/tu,1],[da/tu,1-db/tv],[0,1-db/tv]]);}
  }
  // Box with tiled sides; skip lists faces left out (e.g. against the wall).
  function box(lo,hi,tile=[1e9,1e9],skip=[]){const [x0,y0,z0]=lo,[x1,y1,z1]=hi,[tu,tv]=tile;
   if(!skip.includes('-x'))face([x0,y0,z0],[0,0,1],[0,1,0],z1-z0,y1-y0,[-1,0,0],tu,tv);
   if(!skip.includes('+x'))face([x1,y0,z1],[0,0,-1],[0,1,0],z1-z0,y1-y0,[1,0,0],tu,tv);
   if(!skip.includes('-z'))face([x1,y0,z0],[-1,0,0],[0,1,0],x1-x0,y1-y0,[0,0,-1],tu,tv);
   if(!skip.includes('+z'))face([x0,y0,z1],[1,0,0],[0,1,0],x1-x0,y1-y0,[0,0,1],tu,tv);
   if(!skip.includes('+y'))face([x0,y1,z0],[0,0,1],[1,0,0],z1-z0,x1-x0,[0,1,0],1e9,1e9);
   if(!skip.includes('-y'))face([x0,y0,z1],[0,0,-1],[1,0,0],z1-z0,x1-x0,[0,-1,0],1e9,1e9);
  }
  function cylinder(cx,cz,y0,y1,r,seg=10){for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,m=(a+b)/2;quad([[cx+Math.cos(a)*r,y0,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,y0,cz+Math.sin(b)*r],[cx+Math.cos(b)*r,y1,cz+Math.sin(b)*r],[cx+Math.cos(a)*r,y1,cz+Math.sin(a)*r]],[Math.cos(m),0,Math.sin(m)]);}}
  function sphere(c,r,sy=1,seg=9,rings=6){for(let j=0;j<rings;j++){const t0=j/rings*Math.PI,t1=(j+1)/rings*Math.PI;for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,P=(t,p)=>[c[0]+Math.sin(t)*Math.cos(p)*r,c[1]+Math.cos(t)*r*sy,c[2]+Math.sin(t)*Math.sin(p)*r],N=(t,p)=>[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)],tm=(t0+t1)/2,pm=(a+b)/2;quad([P(t1,a),P(t1,b),P(t0,b),P(t0,a)],N(tm,pm));}}}
  function upload(name,material){if(!idx.length)return null;const b=uploadBatch(new Float32Array(v),new Uint32Array(idx),{name:'WestFront172 '+name,westFront172:true,uv:new Float32Array(uv),rough:.8,metal:0,...material});renderBatches.push(b);stats.batches++;stats.triangles+=idx.length/3;return b;}
  return {quad,face,box,cylinder,sphere,upload};
 }
 const colliderIds=[0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3];
 function collider(name,lo,hi){const p=[];for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]])for(const x of [lo[0],hi[0]])p.push(x,y,z);registerCollider('WestFront172 '+name,'westFront172',new Float32Array(p),new Uint32Array(colliderIds),false,{});stats.colliders++;}

 function build(){
  const tex={glass:canvas(2048,1024,(g,w,h)=>glassWall(g,w,h,12,4,.1)),ribbon:canvas(1024,128,(g,w,h)=>glassWall(g,w,h,16,1,0)),slot:canvas(64,512,(g,w,h)=>glassWall(g,w,h,1,18,0)),panel:canvas(256,256,panels),brick:canvas(512,512,brick),bay:canvas(256,256,hotelBay),base:canvas(256,256,hotelBase),stone:canvas(256,256,stoneWindows),granite:canvas(256,128,granite),concrete:canvas(256,256,concrete),flags:FLAGS.map(f=>canvas(256,160,f))};
  const d=B.devos,e=B.entrance,t=B.tower,h=B.hotel,k=B.behind;
  // Dark-paneled DeVos block with a covered drive-under next to the entrance.
  const drive={z:[1.0,d.z[1]],x:-28.25,top:1.45};
  let m=builder();
  m.box([X0,Y0,d.z[0]],[d.back,d.height,drive.z[0]],[2.4,1.2],['+x','-z','-y','+y']);
  m.box([X0,drive.top,drive.z[0]],[d.back,d.height,d.z[1]],[2.4,1.2],['+x','-y','-z','+y']);
  m.upload('DeVos dark panels',{baseTexture:tex.panel,color:[1,1,1,1],metal:.35,rough:.45});
  m=builder();m.face([X0-.02,2.9,-12.6],[0,0,1],[0,1,0],13.4,.85,[-1,0,0],13.4,.85);m.upload('DeVos ribbon window',{baseTexture:tex.ribbon,color:[1,1,1,1],metal:.7,rough:.12});
  m=builder();// drive-under: soffit, back wall, columns, rooftop fence
  m.face([X0,drive.top-.001,drive.z[1]],[0,0,-1],[1,0,0],drive.z[1]-drive.z[0],drive.x-X0,[0,-1,0],1e9,1e9);
  for(const z of [2.35,4.15])m.box([X0+.08,Y0,z-.15],[X0+.38,drive.top,z+.15],[1e9,1e9],['+y','-y']);
  m.face([X0,-.075,drive.z[1]],[0,0,-1],[1,0,0],drive.z[1]-drive.z[0],drive.x-X0,[0,1,0],1e9,1e9);
  m.upload('DeVos drive-under concrete',{baseTexture:tex.concrete,color:[1,1,1,1],rough:.9});
  m=builder();m.face([drive.x-.001,Y0,drive.z[0]],[0,0,1],[0,1,0],drive.z[1]-drive.z[0],drive.top-Y0,[-1,0,0],1e9,1e9);m.upload('DeVos drive-under back',{color:[.09,.1,.11,1],rough:.9});
  m=builder();for(let z=d.z[0]+.4;z<d.z[1];z+=1.6)m.box([X0+.15,d.height,z-.025],[X0+.2,d.height+.55,z+.025]);m.box([X0+.15,d.height+.52,d.z[0]],[X0+.2,d.height+.56,d.z[1]]);m.upload('DeVos roof fence',{color:[.05,.05,.06,1],metal:.4,rough:.5});
  // Glass entrance: dark curtain wall set back behind the planter, black
  // frame, roof railing, granite base and the beige hotel behind it.
  m=builder();m.face([e.glass,.05,e.z[0]],[0,0,1],[0,1,0],e.z[1]-e.z[0],e.height-.05,[-1,0,0],e.z[1]-e.z[0],e.height-.05);m.upload('entrance glass wall',{baseTexture:tex.glass,color:[1,1,1,1],metal:.85,rough:.08});
  m=builder();m.box([e.glass-.06,e.height,e.z[0]],[e.back,e.height+.12,e.z[1]],[1e9,1e9],['+x']);m.box([e.glass,e.height,e.z[0]],[e.back,e.height+.01,e.z[1]]);
  for(const z of [e.z[0],e.z[1]])m.box([X0,Y0,z-(z===e.z[0]?0:.12)],[e.glass+.01,e.height+.12,z+(z===e.z[0]?.12:0)],[1e9,1e9],['+x']);
  m.upload('entrance black frame',{color:[.04,.045,.05,1],metal:.5,rough:.35});
  m=builder();for(let z=e.z[0]+.2;z<e.z[1];z+=.72)m.box([e.glass+.1,e.height+.12,z-.02],[e.glass+.14,e.height+.5,z+.02]);m.box([e.glass+.09,e.height+.47,e.z[0]],[e.glass+.15,e.height+.51,e.z[1]]);m.upload('entrance roof railing',{color:[.86,.87,.86,1],metal:.3,rough:.45});
  m=builder();m.box([e.glass-.04,Y0,e.z[0]],[e.glass+.02,.05,e.z[1]],[1.2,.5]);m.upload('entrance granite sill',{baseTexture:tex.granite,color:[1,1,1,1]});
  m=builder();m.box([k.x[0],e.height,k.z[0]],[k.x[1],k.height,k.z[1]],[.9,.9],['+x','-y','+y']);m.box([k.x[0]-.08,k.height,k.z[0]-.08],[k.x[1],k.height+.3,k.z[1]+.08],[1e9,1e9],['-y']);m.upload('hotel behind the entrance',{baseTexture:tex.stone,color:[1,1,1,1],rough:.85});
  // Brick tower (hotel), tall and mostly solid with dark glass slots.
  m=builder();m.box([X0,.55,t.z[0]],[t.back,t.height,t.z[1]],[1.2,1.2],['+x','-y']);m.upload('brick tower',{baseTexture:tex.brick,color:[1,1,1,1],rough:.9});
  m=builder();for(const z of [t.z[0]+.35,t.z[0]+.75])m.face([X0-.02,.8,z],[0,0,1],[0,1,0],.22,t.height-1.4,[-1,0,0],.22,t.height-1.4);m.face([X0+.4,.8,t.z[0]-.02],[1,0,0],[0,1,0],.25,t.height-1.4,[0,0,-1],.25,t.height-1.4);
  m.face([X0-.02,Y0,t.z[1]-1.05],[0,0,1],[0,1,0],.75,.75,[-1,0,0],.75,.75);m.upload('brick tower glass',{baseTexture:tex.slot,color:[1,1,1,1],metal:.8,rough:.1});
  m=builder();m.box([X0-.02,Y0,t.z[0]],[t.back,.55,t.z[1]],[1,.5],['+x']);m.box([X0-.06,t.height,t.z[0]-.04],[t.back,t.height+.18,t.z[1]+.04],[1,.5],['+x']);m.upload('brick tower stone',{baseTexture:tex.granite,color:[1,1,1,1]});
  // Older hotel: stone base, brick upper floors with framed windows, cornice.
  const bays=Math.round((h.z[1]-h.z[0])/1.07),bw=(h.z[1]-h.z[0])/bays;
  m=builder();m.box([X0,Y0,h.z[0]],[h.back,1.5,h.z[1]],[bw,1.6],['+x','-z','-y','+y']);m.upload('older hotel stone base',{baseTexture:tex.base,color:[1,1,1,1],rough:.85});
  m=builder();m.box([X0,1.5,h.z[0]],[h.back,h.height,h.z[1]],[bw,.92],['+x','-z','-y','+y']);m.upload('older hotel brick',{baseTexture:tex.bay,color:[1,1,1,1],rough:.85});
  m=builder();m.box([X0-.12,1.45,h.z[0]],[h.back,1.6,h.z[1]+.12],[1,.5],['+x','-z']);m.box([X0-.22,h.height,h.z[0]],[h.back,h.height+.32,h.z[1]+.22],[1,.5],['+x','-z']);
  for(let i=0;i<=bays;i+=3){const z=h.z[0]+Math.min(i,bays)*bw;m.box([X0-.3,h.height+.32,z-.08],[X0-.14,h.height+.62,z+.08]);}
  m.upload('older hotel cornice',{baseTexture:tex.granite,color:[1,1,1,1]});
  // Plain roofs (seen from the overview camera).
  m=builder();for(const [x0,z0,x1,z1,y] of [[X0,d.z[0],d.back,d.z[1],d.height],[k.x[0],k.z[0],k.x[1],k.z[1],k.height+.3]])m.face([x0,y+.002,z0],[0,0,1],[1,0,0],z1-z0,x1-x0,[0,1,0],1e9,1e9);m.upload('roofs',{color:[.27,.28,.29,1],rough:.95});
  // Granite planter with bushes, flowers and the five flagpoles.
  const pz=[e.z[0]+.15,e.z[1]-.15];
  m=builder();m.box([X0,Y0,pz[0]],[e.glass-.05,.3,7.05],[1,.5],['-y']);m.box([X0,Y0,7.05],[e.glass-.05,.12,7.35],[1,.5],['-y']);m.box([X0,Y0,7.35],[e.glass-.05,.3,pz[1]],[1,.5],['-y']);
  const poles=[-2,-1,0,1,2].map(i=>9.9+i*1.25);for(const z of poles)m.box([X0-.06,Y0,z-.12],[X0+.18,.42,z+.12],[1,.5],['-y']);
  m.upload('entrance planter',{baseTexture:tex.granite,color:[1,1,1,1]});
  m=builder();m.box([X0+.05,.28,pz[0]+.05],[e.glass-.1,.29,pz[1]-.05]);m.upload('planter soil',{color:[.17,.12,.08,1],rough:1});
  m=builder();const bush=(x,z,r,sy=.8)=>m.sphere([x,.3+r*sy*.7,z],r,sy);
  bush(-30.0,6.05,.34,.85);bush(-29.85,6.6,.3,.8);bush(-30.05,13.55,.32,.85);bush(-29.85,13.0,.28,.8);
  for(let z=7.6;z<12.8;z+=.32)bush(-29.82,z,.2+rnd()*.04,.85);
  m.upload('planter bushes',{color:[.17,.36,.13,1],rough:.95});
  const flowers=[[.75,.08,.08],[.93,.45,.08],[.92,.8,.15],[.55,.05,.18]];
  for(let f=0;f<flowers.length;f++){m=builder();for(let z=7.5+f*.07;z<12.9;z+=.28)m.sphere([-30.18+rnd()*.12,.38,z+rnd()*.1],.06+rnd()*.02,.9,6,4);m.upload('planter flowers '+f,{color:[...flowers[f],1],rough:.9});}
  m=builder();for(const z of poles)m.cylinder(X0+.06,z,.42,3.25,.028,8);m.upload('flagpoles',{color:[.78,.79,.8,1],metal:.85,rough:.3});
  m=builder();for(const z of poles)m.sphere([X0+.06,3.29,z],.05,1,8,5);m.upload('flagpole finials',{color:[.85,.68,.25,1],metal:.9,rough:.3});
  poles.forEach((z,i)=>{m=builder();const top=3.2,len=.86,hh=.55,P=(s,y)=>{const out=s*len,droop=s*len*.62,wave=Math.sin(s*7.5+i)*.06*s;return [X0+.06-out*.55+wave,top-y-droop,z+out*.5+wave*.6];};
   const N=8;for(let a=0;a<N;a++){const s0=a/N,s1=(a+1)/N;m.quad([P(s0,hh),P(s1,hh),P(s1,0),P(s0,0)],[-.6,0,-.8],[[s0,1],[s1,1],[s1,0],[s0,0]]);}
   m.upload('flag '+(i+1),{baseTexture:tex.flags[i],color:[1,1,1,1],rough:.9,doubleSided:true});});
  // Contacts: solid blocks, the drive-under columns and the planter.
  collider('DeVos block',[X0,Y0,d.z[0]],[d.back,d.height,drive.z[0]]);
  collider('DeVos block above drive-under',[X0,drive.top,drive.z[0]],[d.back,d.height,d.z[1]]);
  collider('DeVos drive-under back',[drive.x,Y0,drive.z[0]],[d.back,drive.top,d.z[1]]);
  for(const z of [2.35,4.15])collider('drive-under column',[X0+.08,Y0,z-.15],[X0+.38,drive.top,z+.15]);
  collider('drive-under floor',[X0,-.4,drive.z[0]],[drive.x,-.075,drive.z[1]]);
  collider('entrance',[e.glass,Y0,e.z[0]],[e.back,e.height+.5,e.z[1]]);
  collider('entrance planter',[X0-.06,Y0,pz[0]],[e.glass,.42,pz[1]]);
  collider('brick tower',[X0,Y0,t.z[0]],[t.back,t.height,t.z[1]]);
  collider('older hotel',[X0,Y0,h.z[0]],[h.back,h.height,h.z[1]]);
 }
 async function init(){
  try{build();window.Crowd?.invalidate?.();ready=true;}
  catch(e){error=e.message;console.error('WestFront172',e);}
 }
 return {init,snapshot:()=>({ready,error,...stats})};
})();
