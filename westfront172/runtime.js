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
 // Amway Grand Plaza base: vertical charcoal-blue metal panels, louvered
 // ribbon window, lobby glass with sconces, dark granite (lettered) planter.
 function vpanels(g,w,h){g.fillStyle='#22262c';g.fillRect(0,0,w,h);const cols=4,pw=w/cols;
  for(let c=0;c<cols;c++){const v=84+rnd()*16|0,joint=(c%2?.35:.75)*h,grad=g.createLinearGradient(c*pw,0,(c+1)*pw,0);grad.addColorStop(0,`rgb(${v+12},${v+16},${v+24})`);grad.addColorStop(1,`rgb(${v-14},${v-10},${v-2})`);g.fillStyle=grad;g.fillRect(c*pw+2,0,pw-4,h);g.fillStyle='rgba(18,20,24,.9)';g.fillRect(c*pw,joint-2,pw,4);}
 }
 function louverBand(g,w,h){glassWall(g,w,h,24,1,0);g.fillStyle='rgba(28,30,35,.92)';for(let i=0;i<5;i++)g.fillRect(0,h*(.04+i*.08),w,h*.04);}
 function lobby(g,w,h){g.fillStyle='#0c0f13';g.fillRect(0,0,w,h);g.fillStyle='#1c2b55';g.fillRect(0,0,w,h*.16);
  for(let i=0;i<12;i++){const x=w*(i+.5)/12;g.fillStyle='rgba(70,82,96,.45)';g.fillRect(x-w*.035,h*.3,w*.07,h*.7);}
  g.fillStyle='#ffc66e';for(let i=0;i<14;i++){const x=w*(i+.5)/14;g.fillRect(x-7,h*.42,5,h*.12);g.fillRect(x+2,h*.42,5,h*.12);}}
 function darkGranite(g,w,h){g.fillStyle='#2f2b29';g.fillRect(0,0,w,h);for(let i=0;i<w*h/10;i++){g.fillStyle=rnd()<.5?'rgba(140,128,116,.35)':'rgba(8,8,8,.45)';g.fillRect(rnd()*w,rnd()*h,1.5,1.5);}g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,0,w,3);}
 function lettered(g,w,h){darkGranite(g,w,h);g.fillStyle='#caa55a';g.font=`italic ${h*.5|0}px Georgia, 'Times New Roman', serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('AMWAY  GRAND  PLAZA',w/2,h*.56);}
 function pavers(g,w,h){g.fillStyle='#303337';g.fillRect(0,0,w,h);const n=8;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=42+rnd()*14|0;g.fillStyle=`rgb(${v},${v+2},${v+5})`;g.fillRect(x*w/n+1,y*h/n+1,w/n-2,h/n-2);}g.fillStyle='rgba(160,128,96,.55)';g.fillRect(0,h*.46,w,h*.08);}
 function redBrick(g,w,h){g.fillStyle='#6d3a30';g.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=-1;c<9;c++){const k=rnd();g.fillStyle=`rgb(${140+k*30|0},${72+k*15|0},${60+k*12|0})`;g.fillRect(c*w/8+(r%2?w/16:0)+1,r*h/16+1,w/8-2,h/16-2);}}
 // Blue reflective curtain wall for the tower: 10 bays by 4 floors per tile.
 function towerGlass(g,w,h){const bays=10,floors=4;for(let f=0;f<floors;f++)for(let b=0;b<bays;b++){const k=rnd(),x=b*w/bays,y=f*h/floors,gr=g.createLinearGradient(x,y,x,y+h/floors);gr.addColorStop(0,`rgb(${118+k*55|0},${160+k*45|0},${205+k*30|0})`);gr.addColorStop(1,`rgb(${48+k*30|0},${82+k*30|0},${128+k*30|0})`);g.fillStyle=gr;g.fillRect(x,y,w/bays,h/floors);}
  for(let i=0;i<9;i++){g.fillStyle='rgba(255,255,255,.13)';g.beginPath();g.ellipse(rnd()*w,rnd()*h,w*.13,h*.05,0,0,7);g.fill();}
  g.fillStyle='#1e2935';for(let b=0;b<=bays;b++)g.fillRect(b*w/bays-2,0,4,h);for(let f=0;f<=floors;f++)g.fillRect(0,f*h/floors-4,w,8);}
 function stained(g,w,h){g.fillStyle='#958d80';g.fillRect(0,0,w,h);for(let i=0;i<70;i++){g.fillStyle=`rgba(${58+rnd()*30|0},${54+rnd()*24|0},${46+rnd()*20|0},${.08+rnd()*.16})`;g.fillRect(rnd()*w,rnd()*h*.3,3+rnd()*10,h);}for(let i=0;i<1500;i++){g.fillStyle=rnd()<.5?'rgba(40,40,40,.15)':'rgba(255,255,255,.12)';g.fillRect(rnd()*w,rnd()*h,2,2);}}
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
  function tube(a,b,r,seg=6){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d),u=d.map(v=>v/L),n1=norm(cross(u,Math.abs(u[1])<.9?[0,1,0]:[1,0,0])),n2=cross(u,n1),o=t=>n1.map((v,k)=>v*Math.cos(t)+n2[k]*Math.sin(t));
   for(let i=0;i<seg;i++){const t0=i/seg*Math.PI*2,t1=(i+1)/seg*Math.PI*2,p0=o(t0),p1=o(t1);quad([a.map((v,k)=>v+p0[k]*r),a.map((v,k)=>v+p1[k]*r),b.map((v,k)=>v+p1[k]*r),b.map((v,k)=>v+p0[k]*r)],o((t0+t1)/2));}}
  function sphere(c,r,sy=1,seg=9,rings=6){for(let j=0;j<rings;j++){const t0=j/rings*Math.PI,t1=(j+1)/rings*Math.PI;for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,P=(t,p)=>[c[0]+Math.sin(t)*Math.cos(p)*r,c[1]+Math.cos(t)*r*sy,c[2]+Math.sin(t)*Math.sin(p)*r],N=(t,p)=>[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)],tm=(t0+t1)/2,pm=(a+b)/2;quad([P(t1,a),P(t1,b),P(t0,b),P(t0,a)],N(tm,pm));}}}
  function upload(name,material){if(!idx.length)return null;const b=uploadBatch(new Float32Array(v),new Uint32Array(idx),{name:'WestFront172 '+name,westFront172:true,uv:new Float32Array(uv),rough:.8,metal:0,...material});renderBatches.push(b);stats.batches++;stats.triangles+=idx.length/3;return b;}
  return {quad,face,box,cylinder,tube,sphere,upload};
 }
 const colliderIds=[0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3];
 function collider(name,lo,hi){const p=[];for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]])for(const x of [lo[0],hi[0]])p.push(x,y,z);registerCollider('WestFront172 '+name,'westFront172',new Float32Array(p),new Uint32Array(colliderIds),false,{});stats.colliders++;}

 function build(){
  const tex={glass:canvas(2048,1024,(g,w,h)=>glassWall(g,w,h,12,4,.1)),ribbon:canvas(1024,128,(g,w,h)=>glassWall(g,w,h,16,1,0)),slot:canvas(64,512,(g,w,h)=>glassWall(g,w,h,1,18,0)),panel:canvas(256,256,panels),brick:canvas(512,512,brick),bay:canvas(256,256,hotelBay),base:canvas(256,256,hotelBase),stone:canvas(256,256,stoneWindows),granite:canvas(256,128,granite),concrete:canvas(256,256,concrete),flags:FLAGS.map(f=>canvas(256,160,f)),vpanels:canvas(256,256,vpanels),louver:canvas(1024,128,louverBand),lobby:canvas(1024,128,lobby),darkGranite:canvas(256,128,darkGranite),lettered:canvas(1024,128,lettered),pavers:canvas(256,256,pavers),redBrick:canvas(256,256,redBrick),towerGlass:canvas(1024,1024,towerGlass),stained:canvas(256,128,stained)};
  const d=B.devos,e=B.entrance,t=B.tower,h=B.hotel,k=B.behind;
  // Amway Grand Plaza base (left of the glass entrance): vertical metal
  // panels, a louvered ribbon window with ten US flags on angled poles, and
  // a canopy over a drive-through: entrance lane, lettered planter, exit lane.
  const cp=d.canopy,[cz0,cz1]=cp.z,cols=[-8.05,-3.25,1.15,4.78];
  let m=builder();
  m.box([X0,Y0,d.z[0]],[d.back,d.height,cz0],[1.2,1.2],['+x','-z','-y','+y']);
  m.box([X0,Y0,cz1],[d.back,d.height,d.z[1]],[1.2,1.2],['+x','-y','+y']);
  m.box([X0,cp.top,cz0],[d.back,d.height,cz1],[1.2,1.2],['+x','-y','-z','+z','+y']);
  m.upload('Amway base panels',{baseTexture:tex.vpanels,color:[1,1,1,1],metal:.45,rough:.35});
  m=builder();m.face([X0-.02,2.25,-12.8],[0,0,1],[0,1,0],17.4,.8,[-1,0,0],17.4,.8);m.upload('Amway ribbon window',{baseTexture:tex.louver,color:[1,1,1,1],metal:.7,rough:.12});
  m=builder();for(const y of [2.98,3.06,3.14])m.box([X0-.28,y,-12.8],[X0,y+.025,4.6]);for(let i=0;i<10;i++){const z=-12.2+i*1.45;m.box([X0-.04,1.8,z-.07],[X0,2.18,z+.07]);}
  m.upload('Amway louvers and flag brackets',{color:[.13,.14,.16,1],metal:.5,rough:.4});
  m=builder();m.box([X0-.14,cp.soffit-.02,cz0],[X0+.1,cp.top,cz1],[1e9,1e9],['+x']);m.face([X0+.1,cp.soffit-.001,cz1],[0,0,-1],[1,0,0],cz1-cz0,cp.back-X0-.1,[0,-1,0],1e9,1e9);
  m.upload('Amway canopy',{color:[.84,.81,.75,1],rough:.8});
  m=builder();for(let z=cz0+.08;z<cz1;z+=.16){m.sphere([X0-.15,cp.soffit+.08,z],.026,1,5,3);m.sphere([X0-.06,cp.soffit-.035,z+.08],.026,1,5,3);}
  for(let z=cz0+1;z<cz1;z+=2.4)for(const x of [X0+.9,X0+2.2])m.cylinder(x,z,cp.soffit-.14,cp.soffit,.06,8);
  m.upload('Amway canopy lights',{color:[1,.95,.82,1],emission:[.9,.78,.5],rough:.6});
  m=builder();for(const z of cols)for(const x of [X0+.3,cp.back-.55])m.cylinder(x,z,Y0,cp.soffit,.14,12);m.upload('Amway granite columns',{baseTexture:tex.granite,color:[1,1,1,1],rough:.75});
  m=builder();m.face([cp.back,Y0,cz0],[0,0,1],[0,1,0],cz1-cz0,cp.soffit-Y0,[-1,0,0],cz1-cz0,cp.soffit-Y0);m.upload('Amway lobby',{baseTexture:tex.lobby,color:[1,1,1,1],emission:[.05,.04,.03],rough:.4});
  m=builder();m.face([X0,-.075,cz1],[0,0,-1],[1,0,0],cz1-cz0,cp.back-X0,[0,1,0],2,2);m.upload('Amway drive paving',{baseTexture:tex.pavers,color:[1,1,1,1],rough:.85});
  m=builder();for(const [a,b] of cp.lanes)m.face([-31.66,-.068,b],[0,0,-1],[1,0,0],b-a,X0+31.66,[0,1,0],1.2,1.2);m.upload('Amway driveway brick',{baseTexture:tex.redBrick,color:[1,1,1,1],rough:.9});
  m=builder();m.box([X0-.12,Y0,cp.planter[0]],[X0+.66,.36,cp.planter[1]],[1,.5],['-y','-x']);m.box([X0-.1,Y0,cp.small[0]],[X0+.6,.32,cp.small[1]],[1,.5],['-y']);m.upload('Amway planters',{baseTexture:tex.darkGranite,color:[1,1,1,1],rough:.35,metal:.2});
  m=builder();m.face([X0-.12,Y0,cp.planter[0]],[0,0,1],[0,1,0],cp.planter[1]-cp.planter[0],.36-Y0,[-1,0,0],cp.planter[1]-cp.planter[0],.36-Y0);m.upload('Amway planter lettering',{baseTexture:tex.lettered,color:[1,1,1,1],rough:.35,metal:.2});
  m=builder();for(const [x,z,r] of [[X0+.25,-2.62,.26],[X0+.32,-2.08,.21],[X0+.25,.5,.25],[X0+.32,-.05,.2],[X0+.25,-8.85,.24]])m.sphere([x,.36+r*.55,z],r,.85);m.upload('Amway bushes',{color:[.16,.36,.12,1],rough:.95});
  for(const [i,c] of [[.85,.32,.45],[.82,.12,.12],[.95,.5,.15]].entries()){m=builder();for(const [z0,z1] of [cp.planter,cp.small])for(let z=z0+.18+i*.05;z<z1-.15;z+=.17)m.sphere([X0-.02+rnd()*.1,.4,z+rnd()*.06],.05+rnd()*.02,.9,6,4);m.upload('Amway flowers '+i,{color:[...c,1],rough:.9});}
  m=builder();for(const [x,z] of [[X0+.45,-1.55],[X0+.4,-.85],[X0+.42,-8.7]])for(let k=0;k<9;k++){const a=k/9*Math.PI*2+rnd()*.4,r=.2+rnd()*.12,tip=[x+Math.cos(a)*r,.36+.45+rnd()*.2,z+Math.sin(a)*r],side=[Math.sin(a)*.025,0,-Math.cos(a)*.025];m.quad([[x-side[0],.36,z-side[2]],[x+side[0],.36,z+side[2]],tip,tip],[0,1,0]);}
  m.upload('Amway palms',{color:[.2,.42,.16,1],rough:.9,doubleSided:true});
  m=builder();const flagPoles=[];for(let i=0;i<10;i++){const z=-12.2+i*1.45,a=[X0-.05,1.98,z],dir=[-.7071,.7071,0],b=a.map((v,k)=>v+dir[k]);flagPoles.push({a,dir,z,i});m.tube(a,b,.018,6);}m.upload('Amway flagpoles',{color:[.08,.08,.09,1],metal:.6,rough:.4});
  m=builder();for(const {a,dir,i} of flagPoles){const H=u=>a.map((v,k)=>v+dir[k]*(.5+.5*u)),P=(s,u)=>{const h=H(u),wave=Math.sin(s*6+i)*.04*s;return [h[0]+wave,h[1]-.1*s*s,h[2]-s*.62];};
   for(let q=0;q<6;q++){const s0=q/6,s1=(q+1)/6;m.quad([P(s0,0),P(s1,0),P(s1,1),P(s0,1)],[-.8,.2,0],[[s0,1],[s1,1],[s1,0],[s0,0]]);}}
  m.upload('Amway US flags',{baseTexture:tex.flags[2],color:[1,1,1,1],rough:.9,doubleSided:true});
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
  // Door in front of the stone base (not in its plane, which flickered).
  m.face([X0-.05,Y0+.02,t.z[1]-1.05],[0,0,1],[0,1,0],.75,.5,[-1,0,0],.75,.5);m.upload('brick tower glass',{baseTexture:tex.slot,color:[1,1,1,1],metal:.8,rough:.1});
  m=builder();m.box([X0-.02,Y0,t.z[0]],[t.back,.55,t.z[1]],[1,.5],['+x']);m.box([X0-.06,t.height,t.z[0]-.04],[t.back,t.height+.18,t.z[1]+.04],[1,.5],['+x']);m.upload('brick tower stone',{baseTexture:tex.granite,color:[1,1,1,1]});
  // Older hotel: stone base, brick upper floors with framed windows, cornice.
  const bays=Math.round((h.z[1]-h.z[0])/1.07),bw=(h.z[1]-h.z[0])/bays;
  m=builder();m.box([X0,Y0,h.z[0]],[h.back,1.5,h.z[1]],[bw,1.6],['+x','-z','-y','+y']);m.upload('older hotel stone base',{baseTexture:tex.base,color:[1,1,1,1],rough:.85});
  m=builder();m.box([X0,1.5,h.z[0]],[h.back,h.height,h.z[1]],[bw,.92],['+x','-z','-y','+y']);m.upload('older hotel brick',{baseTexture:tex.bay,color:[1,1,1,1],rough:.85});
  m=builder();m.box([X0-.12,1.45,h.z[0]],[h.back,1.6,h.z[1]+.12],[1,.5],['+x','-z']);m.box([X0-.22,h.height,h.z[0]],[h.back,h.height+.32,h.z[1]+.22],[1,.5],['+x','-z']);
  for(let i=0;i<=bays;i+=3){const z=h.z[0]+Math.min(i,bays)*bw;m.box([X0-.3,h.height+.32,z-.08],[X0-.14,h.height+.62,z+.08]);}
  m.upload('older hotel cornice',{baseTexture:tex.granite,color:[1,1,1,1]});
  // The older hotel's back shows past the DeVos front: finish it to match.
  if(h.exposedBack){const zb=h.exposedBack,w=h.z[1]-zb;
   m=builder();m.face([h.back,Y0,h.z[1]],[0,0,-1],[0,1,0],w,1.5-Y0,[1,0,0],w,1.6);m.upload('older hotel back base',{baseTexture:tex.base,color:[1,1,1,1],rough:.85});
   m=builder();m.face([h.back,1.5,h.z[1]],[0,0,-1],[0,1,0],w,h.height-1.5,[1,0,0],w/Math.max(1,Math.round(w/1.07)),.92);m.upload('older hotel back brick',{baseTexture:tex.bay,color:[1,1,1,1],rough:.85});
   m=builder();m.box([h.back,1.45,zb],[h.back+.12,1.6,h.z[1]+.12],[1,.5]);m.box([h.back,h.height,zb],[h.back+.22,h.height+.32,h.z[1]+.22],[1,.5]);m.upload('older hotel back cornice',{baseTexture:tex.granite,color:[1,1,1,1]});}
  // Ten glass floors on the hospitality addition, like the Amway glass tower.
  const gt=B.glassTower,gtop=gt.base+gt.floors*gt.floorHeight;
  m=builder();m.box([gt.x[0],gt.base,gt.z[0]],[gt.x[1],gtop,gt.z[1]],[4.2,4.2],['-y','+y']);m.upload('glass tower',{baseTexture:tex.towerGlass,color:[1,1,1,1],metal:.85,rough:.08});
  m=builder();m.face([gt.x[0],gtop+.001,gt.z[0]],[0,0,1],[1,0,0],gt.z[1]-gt.z[0],gt.x[1]-gt.x[0],[0,1,0],1e9,1e9);m.box([gt.x[0]+2,gtop,gt.z[0]+2],[gt.x[1]-2,gtop+.7,gt.z[1]-2],[1e9,1e9],['-y']);m.upload('glass tower roof',{color:[.22,.24,.26,1],rough:.9});
  // Skywalk over westbridge: stained concrete with a dark glass barrel vault.
  const sw=B.skywalk,zc=(sw.z[0]+sw.z[1])/2,hw=(sw.z[1]-sw.z[0])/2,N=10,arc=(t,out=0)=>[sw.deck+(sw.vault+out)*Math.sin(t),zc+(hw+out)*Math.cos(t)];
  m=builder();m.box([sw.x[0],sw.bottom,sw.z[0]],[sw.x[1],sw.deck,sw.z[1]],[1.4,.62],['-x','+x']);m.upload('skywalk',{baseTexture:tex.stained,color:[1,1,1,1],rough:.9});
  m=builder();for(let i=0;i<N;i++){const t0=i/N*Math.PI,t1=(i+1)/N*Math.PI,[y0,z0]=arc(t0),[y1,z1]=arc(t1),tm=(t0+t1)/2;m.quad([[sw.x[1],y0,z0],[sw.x[0],y0,z0],[sw.x[0],y1,z1],[sw.x[1],y1,z1]],[0,Math.sin(tm),Math.cos(tm)]);}m.upload('skywalk glass vault',{color:[.07,.09,.11,1],metal:.75,rough:.1});
  m=builder();for(let x=sw.x[0]+.2;x<sw.x[1];x+=.45)for(let i=0;i<N;i++){const t0=i/N*Math.PI,t1=(i+1)/N*Math.PI,[y0,z0]=arc(t0,.01),[y1,z1]=arc(t1,.01),tm=(t0+t1)/2;m.quad([[x+.018,y0,z0],[x-.018,y0,z0],[x-.018,y1,z1],[x+.018,y1,z1]],[0,Math.sin(tm),Math.cos(tm)]);}m.upload('skywalk ribs',{color:[.9,.9,.88,1],metal:.3,rough:.4});
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
  collider('Amway base',[X0,Y0,d.z[0]],[d.back,d.height,cz0]);
  collider('Amway pier',[X0,Y0,cz1],[d.back,d.height,d.z[1]]);
  collider('Amway above canopy',[X0,cp.soffit,cz0],[d.back,d.height,cz1]);
  collider('Amway lobby',[cp.back,Y0,cz0],[d.back,cp.soffit,cz1]);
  for(const z of cols)for(const x of [X0+.3,cp.back-.55])collider('Amway column',[x-.14,Y0,z-.14],[x+.14,cp.soffit,z+.14]);
  collider('Amway planter',[X0-.12,Y0,cp.planter[0]],[X0+.66,.36,cp.planter[1]]);
  collider('Amway small planter',[X0-.1,Y0,cp.small[0]],[X0+.6,.32,cp.small[1]]);
  collider('Amway drive floor',[X0-.01,-.4,cz0],[cp.back,-.075,cz1]);
  collider('entrance',[e.glass,Y0,e.z[0]],[e.back,e.height+.5,e.z[1]]);
  collider('entrance planter',[X0-.06,Y0,pz[0]],[e.glass,.42,pz[1]]);
  collider('brick tower',[X0,Y0,t.z[0]],[t.back,t.height,t.z[1]]);
  collider('older hotel',[X0,Y0,h.z[0]],[h.back,h.height,h.z[1]]);
  collider('glass tower',[gt.x[0],gt.base,gt.z[0]],[gt.x[1],gtop+.7,gt.z[1]]);
  collider('skywalk',[sw.x[0],sw.bottom,sw.z[0]],[sw.x[1],sw.deck+sw.vault,sw.z[1]]);
 }
 async function init(){
  try{build();window.Crowd?.invalidate?.();ready=true;}
  catch(e){error=e.message;console.error('WestFront172',e);}
 }
 return {init,snapshot:()=>({ready,error,...stats})};
})();
