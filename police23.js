/* DEV25 shoulder correction: one uniformed variant of the existing James character, shared by three
   stationary traffic officers. The original head, body, rig and animations are
   reused, never replaced by an image or block character. No changes to students.
   A surface-fitted reflective vest, fitted service cap and radio are generated
   once, after the original mesh has decoded. No per-frame remeshing. */
const TrafficPolice23 = (() => {
  'use strict';
  const ID='traffic_officer23', BASE='james_character';
  const rgb=h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16)/255);
  const linear=h=>rgb(h).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const sub3=(a,b)=>a.map((v,k)=>v-b[k]);
  const dot3=(a,b)=>a.reduce((r,v,k)=>r+v*b[k],0);
  const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
  const fixed=j=>({j:[j,0,0,0],w:[1,0,0,0]});
  const stations=[
    {id:23001,line:'front-arrival-apron',label:'Left curb officer',x:-4.20,z:38.34},
    {id:23002,line:'front-arrival-apron',label:'Center curb officer',x:0,z:38.87},
    {id:23003,line:'front-arrival-apron',label:'Right curb officer',x:4.35,z:38.40}
  ];
  function outfit(){return {shirt:'#80afe3',pants:'#202e4c',shoes:'#141a20',accent:'#17263c',colors:[...linear('#80afe3'),...linear('#202e4c'),...linear('#141a20'),...linear('#17263c')],flags:[0,0,0,1],volunteer:false,backpack:false,hat:false,police:true};}
  function mesh(name,mi){return {name,skin:0,fitted:true,materialIndex:mi,source:{positions:[],normals:[],indices:[],uv:[],joints:[],weights:[]}};}
  function vertex(m,p,uv,b){const s=m.source,n=s.positions.length/3;s.positions.push(...p);s.uv.push(...uv);s.joints.push(...b.j);s.weights.push(...b.w);return n;}
  function face(m,a,b,c){m.source.indices.push(a,b,c);}
  function finish(m){const s=m.source;for(const k of ['positions','uv','joints','weights'])s[k]=new Float32Array(s[k]);s.indices=new Uint32Array(s.indices);s.normals=geometryNormals(s.positions,s.indices);return m;}
  function tube(m,pts,r,bind,segments=8){const first=m.source.positions.length/3;for(let k=0;k<pts.length;k++){const t=unit(sub3(pts[Math.min(k+1,pts.length-1)],pts[Math.max(0,k-1)])),u=unit(cross3(t,Math.abs(t[1])<.85?[0,1,0]:[1,0,0])),v=cross3(t,u);for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,p=pts[k].map((q,j)=>q+r*(u[j]*Math.cos(a)+v[j]*Math.sin(a)));vertex(m,p,[i/segments,k/Math.max(1,pts.length-1)],typeof bind==='function'?bind(p):bind);}}for(let k=0;k<pts.length-1;k++)for(let i=0;i<segments;i++){const a=first+k*segments+i,b=first+k*segments+(i+1)%segments;face(m,a,b,b+segments);face(m,a,b+segments,a+segments);}}
  function roundedBox(m,center,size,bind,radius){const half=size.map(x=>x/2),r=Math.min(radius,...half.map(x=>x*.8)),inner=half.map(x=>x-r);for(let ax=0;ax<3;ax++){const u=(ax+1)%3,v=(ax+2)%3,coords=k=>[-half[k],-inner[k],inner[k],half[k]];for(const sign of [-1,1]){const off=m.source.positions.length/3;for(const y of coords(v))for(const x of coords(u)){const p=[0,0,0];p[ax]=sign*half[ax];p[u]=x;p[v]=y;const c=p.map((q,k)=>clamp(q,-inner[k],inner[k])),n=unit(sub3(p,c));vertex(m,c.map((q,k)=>q+n[k]*r+center[k]),[x,y],bind);}for(let y=0;y<3;y++)for(let x=0;x<3;x++){const a=off+y*4+x,b=a+1,c=b+4,d=a+4;if(sign>0){face(m,a,b,c);face(m,a,c,d);}else{face(m,a,c,b);face(m,a,d,c);}}}}}
  /* DEV25: cut the vest from the decoded shirt surface, rather than stopping a
     radial tube below the shoulder tops. The retained shirt triangles include
     both shoulders. Original skeletal weights are copied/interpolated, so the
     front, shoulder and back fabric follow the same idle pose as the shirt.
     This is built once for the shared officer model, not once per frame. */
  function fittedVest25(base,b,U,vestMat,trimMat){
    const cloth=mesh('Police25_Continuous_Shoulder_Vest',vestMat);
    const trim=mesh('Police25_Neck_Armhole_And_Hem_Binding',trimMat);
    const cx=b.Spine2.p[0],cz=b.Spine2.p[2],neck=b.Neck.p[1];
    const hem=b.Hips.p[1]+.024*U,clearance=.007*U;
    const sourceParts=base.parts.filter(p=>!p.fitted&&
      [1,8].includes(base.j.materials[p.materialIndex]?.extras?.crowdOutfitRole||0));
    if(!sourceParts.length)throw Error('The officer shirt surface was not found. Keep the original James character in this game.');
    const keyOf=p=>p.map(x=>Math.round(x/(U*.000002))).join(',');
    const smooth=new Map();
    // Smooth through duplicated UV vertices without welding or altering the
    // original character. Equal seam positions receive equal outward offsets.
    for(const part of sourceParts){const s=part.source;
      for(let i=0;i<s.positions.length/3;i++){
        const p=Array.from(s.positions.subarray(i*3,i*3+3));
        if(p[1]<hem-.04*U||p[1]>neck+.065*U||Math.abs(p[0]-cx)>.31*U)continue;
        const k=keyOf(p),sum=smooth.get(k)||[0,0,0];
        for(let c=0;c<3;c++)sum[c]+=s.normals[i*3+c];smooth.set(k,sum);
      }
    }
    function canonicalBind(part,index){const s=part.source,j=[],w=[];
      for(let k=0;k<4;k++){const node=base.skins[part.skin].joints[Math.round(s.joints[index*4+k])];
        const n=base.skins[0].joints.indexOf(node);j.push(Math.max(0,n));w.push(n<0?0:s.weights[index*4+k]);}
      const sum=w.reduce((a,v)=>a+v,0)||1;return {j,w:w.map(v=>v/sum)};
    }
    function blendBind(a,b,t){const weights=new Map();
      for(let k=0;k<4;k++){weights.set(a.j[k],(weights.get(a.j[k])||0)+a.w[k]*(1-t));weights.set(b.j[k],(weights.get(b.j[k])||0)+b.w[k]*t);}
      const chosen=Array.from(weights).filter(q=>q[1]>1e-9).sort((a,b)=>b[1]-a[1]).slice(0,4),total=chosen.reduce((s,q)=>s+q[1],0)||1;
      return {j:chosen.map(q=>q[0]).concat([0,0,0,0]).slice(0,4),w:chosen.map(q=>q[1]/total).concat([0,0,0,0]).slice(0,4)};
    }
    const interpolate=(a,b,t)=>({p:a.p.map((v,k)=>v+(b.p[k]-v)*t),
      n:unit(a.n.map((v,k)=>v+(b.n[k]-v)*t)),bind:blendBind(a.bind,b.bind,t)});
    function clip(poly,distance){const result=[];if(!poly.length)return result;
      let a=poly[poly.length-1],da=distance(a.p);
      for(const z of poly){const dz=distance(z.p),ain=da>=0,zin=dz>=0;
        if(ain!==zin)result.push(interpolate(a,z,clamp(da/(da-dz),0,1)));
        if(zin)result.push(z);a=z;da=dz;}
      return result;
    }
    function limitX(y){const h=(y-neck)/U;
      // Narrow at the armpit; widen over the actual shoulder, leaving the
      // blue sleeves uncovered. Below the armholes the vest wraps the torso.
      const knots=[[-.55,.29],[-.235,.255],[-.165,.176],[-.105,.156],[-.035,.190],[.065,.205]];
      for(let i=1;i<knots.length;i++)if(h<=knots[i][0]){const a=knots[i-1],z=knots[i],t=clamp((h-a[0])/(z[0]-a[0]),0,1);return U*(a[1]+(z[1]-a[1])*t);}
      return .205*U;
    }
    function neckline(p){const front=clamp((p[2]-cz)/(.06*U)+.5,0,1);
      const span=clamp(Math.abs(p[0]-cx)/(.071*U),0,1);
      // A real front V, a shallow back neckline, and an open neck hole.
      return neck-U*(.024+.120*front)+U*(.065+.115*front)*span-p[1];
    }
    const clips=[p=>p[1]-hem,p=>neck+.055*U-p[1],
      p=>limitX(p[1])-Math.abs(p[0]-cx),neckline];
    const cache=new Map();let sourceTriangles=0;
    function addPoint(v,u){const p=v.p.map((x,k)=>x+v.n[k]*clearance);
      const uv=[u,clamp(1-(v.p[1]-hem)/(neck-hem),.001,.999)];
      const key=keyOf(p)+':'+Math.round(u*1e6)+':'+v.bind.j.join(',')+':'+v.bind.w.map(w=>Math.round(w*1e5)).join(',');
      if(cache.has(key))return cache.get(key);
      const id=vertex(cloth,p,uv,v.bind);cache.set(key,id);return id;
    }
    for(const part of sourceParts){const s=part.source;
      for(let k=0;k<s.indices.length;k+=3){const ids=Array.from(s.indices.subarray(k,k+3));
        let poly=ids.map(i=>{const p=Array.from(s.positions.subarray(i*3,i*3+3));return {p,
          n:unit(smooth.get(keyOf(p))||Array.from(s.normals.subarray(i*3,i*3+3))),bind:canonicalBind(part,i)};});
        if(poly.every(v=>v.p[1]<hem)||poly.every(v=>v.p[1]>neck+.055*U)||poly.every(v=>v.p[0]>cx+.3*U)||poly.every(v=>v.p[0]<cx-.3*U))continue;
        for(const cut of clips){poly=clip(poly,cut);if(poly.length<3)break;}
        if(poly.length<3)continue;sourceTriangles++;
        const uu=poly.map(v=>{let a=Math.atan2(v.p[0]-cx,v.p[2]-cz)/(2*Math.PI);return a<0?a+1:a;});
        if(Math.max(...uu)-Math.min(...uu)>.5)for(let i=0;i<uu.length;i++)if(uu[i]<.5)uu[i]+=1;
        const out=poly.map((v,i)=>addPoint(v,uu[i]));
        for(let i=1;i<out.length-1;i++){
          const pa=poly[0].p,pb=poly[i].p,pc=poly[i+1].p;
          if(Math.hypot(...cross3(sub3(pb,pa),sub3(pc,pa)))>U*U*1e-11)face(cloth,out[0],out[i],out[i+1]);}
      }
    }
    if(cloth.source.indices.length<90)throw Error('The officer vest could not be fitted to the source shirt.');
    // Find garment edges by physical position, not by UV chart index, so a
    // texture seam does not acquire a false dark pipe through the shoulders.
    const s=cloth.source,edges=new Map(),pointKeys=[];
    for(let i=0;i<s.positions.length/3;i++)pointKeys.push(keyOf(s.positions.slice(i*3,i*3+3)));
    for(let i=0;i<s.indices.length;i+=3)for(let e=0;e<3;e++){
      const a=s.indices[i+e],z=s.indices[i+(e+1)%3],ka=pointKeys[a],kz=pointKeys[z];
      if(ka===kz)continue;const key=ka<kz?ka+'|'+kz:kz+'|'+ka;
      if(edges.has(key))edges.get(key).count++;else edges.set(key,{a,z,count:1});}
    let boundaryEdges=0;
    for(const edge of edges.values())if(edge.count===1){
      const a=s.positions.slice(edge.a*3,edge.a*3+3),z=s.positions.slice(edge.z*3,edge.z*3+3);
      if(Math.hypot(...sub3(z,a))<U*1e-6)continue;boundaryEdges++;
      const direction=unit(sub3(z,a)),u=unit(cross3(direction,Math.abs(direction[1])<.85?[0,1,0]:[1,0,0])),v=cross3(direction,u),off=trim.source.positions.length/3;
      for(const [point,id] of [[a,edge.a],[z,edge.z]])for(let n=0;n<6;n++){
        const angle=n*Math.PI/3,r=.0011*U;
        vertex(trim,point.map((x,k)=>x+r*(u[k]*Math.cos(angle)+v[k]*Math.sin(angle))),[n/6,0],
          {j:s.joints.slice(id*4,id*4+4),w:s.weights.slice(id*4,id*4+4)});}
      for(let n=0;n<6;n++){const a=off+n,z=off+(n+1)%6;face(trim,a,z,z+6);face(trim,a,z+6,a+6);}
    }
    // Record whether each upper shoulder has a connected front-to-back path.
    // This is diagnostic only and does not alter the original body or its rig.
    function shoulderPath(sign){const ids=new Map(),adj=new Map(),eligible=new Set();
      for(let i=0;i<s.positions.length/3;i++){
        const p=s.positions.slice(i*3,i*3+3),key=pointKeys[i];ids.set(key,p);
        if((p[0]-cx)*sign>.045*U&&p[1]>neck-.115*U)eligible.add(key);}
      for(const e of edges.values()){
        const a=pointKeys[e.a],z=pointKeys[e.z];if(!eligible.has(a)||!eligible.has(z))continue;
        if(!adj.has(a))adj.set(a,[]);if(!adj.has(z))adj.set(z,[]);adj.get(a).push(z);adj.get(z).push(a);}
      const seen=new Set(),queue=Array.from(eligible).filter(k=>ids.get(k)[2]>cz+.038*U);
      for(const k of queue)seen.add(k);
      for(let n=0;n<queue.length;n++){const k=queue[n];if(ids.get(k)[2]<cz-.028*U)return true;
        for(const v of adj.get(k)||[])if(!seen.has(v)){seen.add(v);queue.push(v);}}
      return false;
    }
    const report={revision:25,construction:'Original shirt surface with real shoulder coverage and copied skin weights',
      clearanceInModelUnits:clearance,sourceTriangles,vestTriangles:s.indices.length/3,bindingEdges:boundaryEdges,
      leftShoulderFrontToBack:shoulderPath(1),rightShoulderFrontToBack:shoulderPath(-1)};
    return {meshes:[cloth,trim],report};
  }
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function vestTexture(){
    const c=canvas(2048,1024),g=c.getContext('2d');g.fillStyle='#d8fa14';g.fillRect(0,0,c.width,c.height);
    // Fine woven texture is restrained; uniform remains recognizably high-visibility.
    g.fillStyle='rgba(26,40,0,.045)';for(let y=0;y<1024;y+=5)g.fillRect(0,y,2048,1);
    const band=(x,y,w,h)=>{g.fillStyle='#27343a';g.fillRect(x-5,y-5,w+10,h+10);const gr=g.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#f1f3ee');gr.addColorStop(.4,'#cbd1d1');gr.addColorStop(.55,'#edf1ef');gr.addColorStop(1,'#aeb9bb');g.fillStyle=gr;g.fillRect(x,y,w,h);};
    for(const u of [.085,.915,.40,.60])band(u*2048-38,0,76,1024);
    band(0,655,2048,100);band(640,175,768,70);
    g.fillStyle='#10191d';g.font='bold 100px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('POLICE',1024,421,520);
    g.font='bold 51px Arial, sans-serif';for(let k=0;k<6;k++)g.fillText('POLICE'[k],.085*2048,280+k*58,67);
    // Sewn front zipper joins the two edges of the cylindrical texture.
    g.fillStyle='#263238';g.fillRect(0,0,9,1024);g.fillRect(2039,0,9,1024);g.fillStyle='#a1aaaf';for(let y=210;y<1000;y+=12){g.fillRect(2,y,4,5);g.fillRect(2042,y,4,5);}
    return c;
  }
  function badgeTexture(){const c=canvas(256,320),g=c.getContext('2d');g.clearRect(0,0,256,320);g.fillStyle='#bf8d23';g.beginPath();g.moveTo(35,30);g.lineTo(85,33);g.lineTo(128,12);g.lineTo(171,33);g.lineTo(221,30);g.lineTo(213,185);g.quadraticCurveTo(202,257,128,303);g.quadraticCurveTo(54,257,43,185);g.closePath();g.fill();g.strokeStyle='#fce49a';g.lineWidth=9;g.stroke();g.fillStyle='#203c65';g.font='bold 31px Arial';g.textAlign='center';g.fillText('POLICE',128,99);g.fillStyle='#ffe6a2';g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?25:60,x=128+Math.cos(a)*r,y=185+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();return c;}
  function textureInto(m,c,name){const raw=Uint8Array.from(atob(c.toDataURL('image/png').split(',')[1]),ch=>ch.charCodeAt(0));const old=m.exportBin,pad=(4-old.byteLength%4)%4,bytes=new Uint8Array(old.byteLength+pad+raw.length);bytes.set(new Uint8Array(old.buffer,old.byteOffset,old.byteLength));bytes.set(raw,old.byteLength+pad);const vi=m.j.bufferViews.length;m.j.bufferViews.push({buffer:0,byteOffset:old.byteLength+pad,byteLength:raw.length});m.exportBin=bytes;const ii=m.j.images.length;m.j.images.push({name,bufferView:vi,mimeType:'image/png'});const ti=m.j.textures.length;m.j.textures.push({source:ii});m.j.buffers[0].byteLength=bytes.byteLength;return ti;}
  function makeModel(base){
    if(characterState.models.has(ID))return characterState.models.get(ID);
    if(!base||!base.parts.length)throw Error('The existing James character must finish loading first.');
    const b=CharacterFitting.bones(base),U=(base.hi[1]-base.lo[1])/1.78;
    if(!b.Head||!b.Neck||!b.Spine2||!b.Hips)throw Error('Officer character is missing its expected skeleton joints.');
    const m={...base,id:ID,walk:null,back:null,wave:null,j:structuredClone(base.j),parts:base.parts.filter(p=>!p.fitted).map(p=>({...p,batch:{...p.batch}})),logoInkMaps:new Map(),textureRefs18:[],exportBin:base.exportBin};
    m.j.extras={...m.j.extras,trafficPolice23:{base:BASE,fixedUniform:true,stationary:true,allowUniformServiceCap:true,vestRevision:25,capRevision:30,visorRaised:true,visorAnchored:true,visorBridged:true,visorSeamClosed:true,visorRounded:true}};
    m.j.extras.crowdAppearanceV11={...m.j.extras.crowdAppearanceV11,hatDefault:false,backpackDefault:false,volunteerDefault:false};
    const textures=new Map(),generated=[];
    function material(name,color,rough=.75,metal=0,c=null){const mat={name,pbrMetallicRoughness:{baseColorFactor:[...linear(color),1],roughnessFactor:rough,metallicFactor:metal},doubleSided:true,extras:{trafficPolice23:true,crowdOutfitRole:0}};if(c){const ti=textureInto(m,c,name);mat.pbrMetallicRoughness.baseColorTexture={index:ti};textures.set(m.j.materials.length,CharacterFitting.canvasTexture(c));}const mi=m.j.materials.length;m.j.materials.push(mat);return mi;}
    const vestMat=material('Traffic officer reflective safety vest','#ffffff',.72,.08,vestTexture()),navy=material('Traffic officer navy cap fabric','#17263c',.67),black=material('Traffic officer black radio and visor','#11191e',.4),silver=material('Traffic officer silver hardware','#c3cbd0',.29,.7),blue=material('Traffic officer light blue collar','#80afe3',.83),badge=material('Traffic officer gold badge','#ffffff',.38,.22,badgeTexture());
    const originals=base.parts.filter(p=>!p.fitted),sampler=CharacterFitting.makeSampler(base,originals,()=>true),cx=b.Spine2.p[0],centerZ=b.Spine2.p[2],bottom=b.Hips.p[1]+.024*U,neck=b.Neck.p[1],torsoBind=fixed(b.Spine2.i),headBind=fixed(b.Head.i);
    const fittedVest=fittedVest25(base,b,U,vestMat,black);
    generated.push(...fittedVest.meshes);
    // Light-blue pointed collar closes the visual gap between the T-shirt and vest.
    const collar=mesh('Police23_Uniform_Collar',blue);
    for(const side of [-1,1]){const coords=[[side*.021,neck-.001],[side*.063,neck-.018],[side*.070,neck-.077],[side*.015,neck-.040]],ids=[];for(const [xx,yy]of coords){const x=cx+xx*U,q=sampler.hit(x,yy,2,true);ids.push(vertex(collar,[x,yy,(q?.depth??centerZ+.075*U)+.006*U],[0,0],q?.skin||torsoBind));}face(collar,ids[0],ids[1],ids[2]);face(collar,ids[0],ids[2],ids[3]);}generated.push(collar);
    // Smooth short service cap sized from a narrow upper-head slice, not from the
    // whole character bounding box or a radius that cancels the requested scale.
    const head=[];for(const p of originals){const s=p.source;for(let i=0;i<s.positions.length/3;i++){const y=s.positions[i*3+1];if(y<b.Head.p[1]+.075*U)continue;let hw=0;for(let k=0;k<4;k++){const ni=base.skins[p.skin].joints[Math.round(s.joints[i*4+k])];if(/Head/.test(base.j.nodes[ni]?.name||''))hw+=s.weights[i*4+k];}if(hw>.8)head.push(Array.from(s.positions.subarray(i*3,i*3+3)));}}
    const quant=(values,q)=>{const a=values.slice().sort((a,b)=>a-b);return a[Math.min(a.length-1,Math.floor(q*(a.length-1)))]??0;};
    const topHead=head.length?quant(head.map(p=>p[1]),.998):base.hi[1],bandY=Math.max(b.Head.p[1]+.112*U,topHead-.085*U),near=head.filter(p=>Math.abs(p[1]-bandY)<.012*U),ss=near.length>10?near:head;
    const centerX=b.Head.p[0],zLo=ss.length?quant(ss.map(p=>p[2]),.015):b.Head.p[2]-.07*U,zHi=ss.length?quant(ss.map(p=>p[2]),.985):b.Head.p[2]+.095*U,cz=(zLo+zHi)/2;
    const rx=clamp(ss.length?quant(ss.map(p=>Math.abs(p[0]-centerX)),.99)+.003*U:.079*U,.070*U,.096*U),rz=clamp((zHi-zLo)/2+.003*U,.082*U,.112*U),capH=clamp(topHead-bandY+.007*U,.069*U,.105*U);
    const crown=mesh('Police23_Fitted_Service_Crown',navy),capBlack=mesh('Police23_Service_Band_And_Short_Visor',black),hardware=mesh('Police23_Hardware',silver);
    const rings=[[0,1],[.12,1.045],[.76,1.10],[.93,1.025],[1,.83],[1.01,0]],segments=48;
    for(const [yy,rr]of rings)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;vertex(crown,[centerX+rx*rr*Math.sin(a),bandY+capH*yy,cz+rz*rr*Math.cos(a)],[i/segments,yy],headBind);}
    for(let v=0;v<rings.length-1;v++)for(let u=0;u<segments;u++){const a=v*(segments+1)+u;face(crown,a,a+segments+2,a+1);face(crown,a,a+segments+1,a+segments+2);}
    const band=[];for(let k=0;k<=64;k++){const a=k/64*Math.PI*2;band.push([centerX+rx*Math.sin(a),bandY+.008*U,cz+rz*Math.cos(a)]);}tube(capBlack,band,.008*U,headBind,8);
    // DEV28: rebuild the visor with a sewn bridge strip so the brim visibly joins the cap body.
    // Row 0 sits slightly inside the front band, row 1 crosses the seam, and the remaining rows project outward.
    // DEV30: narrower overall span, and a half-cosine taper on every outward-growing
    // term so the two side columns (u=0/32) stay pinned near the band at every row -
    // that's what turns the old pie-slice corners into a smooth rounded "duckbill".
    const visorRows=7, visorCols=33, visorHalfAngle=.68;
    for(let v=0;v<visorRows;v++)for(let u=0;u<visorCols;u++){
      const nu=u/16-1,a=nu*visorHalfAngle,t=v/(visorRows-1),taper=Math.cos(nu*Math.PI/2),spread=.10*U*t*taper;
      const y=bandY+.0085*U-(.0065*U*Math.min(t,.2)/.2+.0095*U*Math.max(0,t-.2)/.8+.003*U*t*t)*taper;
      const z=cz+(rz-.004*U+(.010*U*Math.min(t,.2)/.2+.040*U*Math.max(0,t-.2)/.8)*taper)*Math.cos(a);
      vertex(capBlack,[centerX+(rx+spread)*Math.sin(a),y,z],[u/32,t],headBind);
    }
    const off=capBlack.source.positions.length/3-visorRows*visorCols;for(let v=0;v<visorRows-1;v++)for(let u=0;u<visorCols-1;u++){const a=off+v*visorCols+u;face(capBlack,a,a+visorCols+1,a+1);face(capBlack,a,a+visorCols,a+visorCols+1);}
    // Thin underside so the front edge reads as a physical brim rather than a loose floating sheet.
    const visorBottomOff=capBlack.source.positions.length/3;
    for(let v=0;v<visorRows;v++)for(let u=0;u<visorCols;u++){
      const nu=u/16-1,a=nu*visorHalfAngle,t=v/(visorRows-1),taper=Math.cos(nu*Math.PI/2),spread=.10*U*t*taper;
      const y=bandY+.0068*U-(.006*U*Math.min(t,.2)/.2+.0108*U*Math.max(0,t-.2)/.8+.004*U*t*t)*taper;
      const z=cz+(rz-.003*U+(.010*U*Math.min(t,.2)/.2+.041*U*Math.max(0,t-.2)/.8)*taper)*Math.cos(a);
      vertex(capBlack,[centerX+(rx+spread)*Math.sin(a),y,z],[u/32,t],headBind);
    }
    for(let v=0;v<visorRows-1;v++)for(let u=0;u<visorCols-1;u++){const a=visorBottomOff+v*visorCols+u;face(capBlack,a,a+1,a+visorCols+1);face(capBlack,a,a+visorCols+1,a+visorCols);}
    // Close the front rim between top and bottom surfaces.
    for(let u=0;u<visorCols-1;u++){
      const a=off+(visorRows-1)*visorCols+u,b=a+1,c=visorBottomOff+(visorRows-1)*visorCols+u,d=c+1;
      face(capBlack,a,c,b);face(capBlack,b,c,d);
    }
    // Close the left and right visor edges so there is no visible gap at the corners.
    for(const col of [0,visorCols-1])for(let v=0;v<visorRows-1;v++){
      const topA=off+v*visorCols+col, topB=topA+visorCols, botA=visorBottomOff+v*visorCols+col, botB=botA+visorCols;
      if(col===0){face(capBlack,topA,topB,botB);face(capBlack,topA,botB,botA);} else {face(capBlack,topA,botB,topB);face(capBlack,topA,botA,botB);}
    }
    // DEV29: the row-0 (inner, band-side) edge of the visor was never closed between
    // its top and bottom surfaces, so despite sitting inside the band tube there was
    // an open slit there - the actual hole that read as the bill "floating" off the
    // hat, since you could see through the brim to whatever was behind it. Seal that
    // edge with a facing strip, the same way the outer tip and side edges are sealed,
    // so the brim is a single closed shell that visibly plugs into the band.
    for(let u=0;u<visorCols-1;u++){
      const a=off+u,b=a+1,c=visorBottomOff+u,d=c+1;
      face(capBlack,a,b,c);face(capBlack,b,d,c);
    }
    const silverBand=[];for(let k=0;k<=32;k++){const a=(k/32-.5)*2.75;silverBand.push([centerX+(rx+.002*U)*Math.sin(a),bandY+.019*U,cz+(rz+.002*U)*Math.cos(a)]);}tube(hardware,silverBand,.003*U,headBind,8);
    const insignia=mesh('Police23_Cap_Badge',badge),bw=.034*U,bh=.044*U,bz=cz+rz*1.09+.002*U,by=bandY+.055*U;
    for(const [x,y,u,v]of [[-bw/2,-bh/2,0,1],[bw/2,-bh/2,1,1],[bw/2,bh/2,1,0],[-bw/2,bh/2,0,0]])vertex(insignia,[centerX+x,by+y,bz],[u,v],headBind);face(insignia,0,1,2);face(insignia,0,2,3);m.j.materials[badge].alphaMode='MASK';m.j.materials[badge].alphaCutoff=.15;
    generated.push(crown,capBlack,hardware,insignia);
    const radio=mesh('Police23_Shoulder_And_Belt_Radio',black),radioMetal=mesh('Police23_Radio_Grille',silver),rxPos=cx-.098*U,ry=neck-.116*U;
    const front=sampler.hit(rxPos,ry,2,true),rzPos=(front?.depth??centerZ+.11*U)+.022*U;
    roundedBox(radio,[rxPos,ry,rzPos],[.050*U,.078*U,.027*U],torsoBind,.010*U);
    for(let k=0;k<6;k++)roundedBox(radioMetal,[rxPos,ry+.022*U-k*.008*U,rzPos+.014*U],[.032*U,.0025*U,.002*U],torsoBind,.001*U);
    const beltP=[cx-.155*U,bottom+.052*U,centerZ+.079*U];roundedBox(radio,beltP,[.050*U,.108*U,.030*U],fixed(b.Hips.i),.006*U);
    tube(radio,[[beltP[0]+.015*U,beltP[1]+.052*U,beltP[2]],[beltP[0]+.015*U,beltP[1]+.137*U,beltP[2]]],.003*U,fixed(b.Hips.i),8);
    const cord=[];for(let i=0;i<=80;i++){const t=i/80,y=ry-.032*U+(beltP[1]+.05*U-ry+.032*U)*t,x=rxPos+(beltP[0]-rxPos)*t,q=sampler.hit(x,y,2,true);cord.push([x+Math.sin(t*Math.PI*38)*.004*U,y,(q?.depth??centerZ+.11*U)+.02*U+Math.cos(t*Math.PI*38)*.004*U]);}
    tube(radio,cord,.0026*U,p=>sampler.nearest(p)?.skin||torsoBind,6);generated.push(radio,radioMetal);
    for(const p of generated){finish(p);const s=p.source,data=new Float32Array(s.positions.length*2);for(let i=0;i<s.positions.length;i+=3)data.set([s.positions[i],s.positions[i+1],s.positions[i+2],s.normals[i],s.normals[i+1],s.normals[i+2]],i*2);const mat=m.j.materials[p.materialIndex],pbr=mat.pbrMetallicRoughness;
      const batch=uploadBatch(data,s.indices,{uv:s.uv,color:pbr.baseColorFactor,baseTexture:textures.get(p.materialIndex)||null,rough:pbr.roughnessFactor,metal:pbr.metallicFactor,emission:[0,0,0],unlit:false,transparent:false,doubleSided:true,forceOpaque:mat.alphaMode!=='MASK',alphaCutoff:mat.alphaMode==='MASK'?.15:-1,outfitRole:0,accessoryCode:0});
      gl.bindVertexArray(batch.vao);for(const [loc,field,values]of [[7,'jointsBuffer',s.joints],[8,'weightsBuffer',s.weights]]){batch[field]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,batch[field]);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,0,0);}m.parts.push({...p,batch});
    }
    gl.bindVertexArray(null);m.fitReport={model:ID,sourceModel:BASE,source:'Existing James mesh and original skeleton, fitted uniform geometry',hat:{uniformServiceCap:true,headSamples:head.length,baseY:bandY,rx,rz,height:capH},backpack:{disabled:true},logo:{rectangle:[0,0,0,0],frontGateZ:0,triangles:0,inkPixels:0},police23:{vestFit:fittedVest.report,vestRevision:25,originalTriangles:originals.reduce((n,p)=>n+p.source.indices.length/3,0),uniformTriangles:generated.reduce((n,p)=>n+p.source.indices.length/3,0),colors:{shirt:'#80afe3',pants:'#202e4c',shoes:'#141a20',vest:'#d8fa14'},sharedCopies:3,capBillFix:'DEV29: closed the open inner seam so the visor is a sealed shell plugged into the band. DEV30: narrowed the bill and tapered its side columns back to the band, rounding off the old sharp pie-slice corners'}};
    m.j.extras.trafficPolice23.fit=m.fitReport;characterState.models.set(ID,m);return m;
  }
  function actors(){const model=characterState.models.get(ID);if(!model)return [];return stations.map((p,i)=>{const yaw=Math.atan2(-p.x,33.8-p.z);return {...p,kind:'trafficOfficer',name:'Traffic officer',role:'Please remain on the sidewalk and use the main entrance',industry:'Grand Gallery',police:true,volunteer:false,stationed:true,mode:'idle',model,outfit:outfit(),yaw,position:[p.x,floorHeightAt(p.x,p.z)+.004,p.z],renderX:p.x,renderZ:p.z,renderYaw:yaw,clock:0,phase:i*.83,displayMode:'idle',transitionStart:-100,lastFrame:0};});}
  function inspect(){if(characterState.models.has(ID)){CharacterInspector.open(ID);const e=document.getElementById('fitDetails');if(e)e.textContent='Traffic officer: existing James character, light-blue shirt, navy pants, black shoes, continuous over-shoulder POLICE vest (DEV 25) with raised attached service-cap visor (DEV 29, sealed brim seam), service cap and radio. Same model as the three stationed officers.';}}
  return {ID,BASE,makeModel,actors,outfit,stations,inspect,isOfficer:m=>m?.id===ID||!!m?.j?.extras?.trafficPolice23};
})();
window.TrafficPolice23=TrafficPolice23;
