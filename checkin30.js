/* MiCareerQuest DEV30 - volunteer check-in, fitted to the ACTUAL gallery table.
 * This module is injected by dev-tools.js into the v13 venue runtime.
 * It never edits police23.js, the original GLBs, outfits of attendees, or saved booths.
 * Five existing animated people share the normal character and crowd-render caches.
 * Seven low shirt stacks and four open clear storage totes are generated once.
 */
const CheckIn30 = (() => {
  'use strict';
  const VERSION = 30;
  const EMPTY = Object.freeze([]);
  const MODELS = ['adam_character', 'sara_character', 'liz', 'james_character', 'kate_character'];
  const NAMES = ['Adam', 'Sara', 'Liz', 'James', 'Kate'];
  const LABEL = 'Volunteer check-in';
  const TABLE_NAME = 'EventV6_entrance information tabletop_991';
  // Coordinates below are fractions along the measured 7.2-unit table, not X positions.
  const STATION_Z = [.91, 2.46, 3.98, 5.47, 6.92];
  const STACKS = [
    {s:.61, across:-.075, count:4, width:.205, depth:.150, yaw:-.10},
    {s:1.47,across:-.040, count:2, width:.220, depth:.158, yaw:.13},
    {s:2.41,across:-.066, count:5, width:.212, depth:.160, yaw:-.065},
    {s:4.07,across:-.080, count:3, width:.206, depth:.147, yaw:.095},
    {s:4.42,across:-.042, count:2, width:.192, depth:.151, yaw:-.17},
    {s:5.48,across:-.082, count:4, width:.226, depth:.153, yaw:.04},
    {s:6.88,across:-.060, count:3, width:.218, depth:.162, yaw:-.095}
  ];
  const TOTES = [
    {s:1.31,width:.330,depth:.225,height:.185,fill:[7,5],yaw:.012},
    {s:3.36,width:.350,depth:.228,height:.194,fill:[6,9],yaw:-.018},
    {s:4.93,width:.315,depth:.220,height:.177,fill:[8,4],yaw:.016},
    {s:6.38,width:.345,depth:.222,height:.191,fill:[5,7],yaw:-.01}
  ];
  const state30 = {prepared:false, props:false, enabled:true, loading:false,
    message:'Preparing the volunteer check-in area.', error:null, time:0, lastUI:-1,
    table:null, floor:null, clearedChairs:[], stacks:[], bins:[], stations:[],
    validation:null, triangles:0, batches:0};
  let people = [], batches = [], loading = null, printTexture = null;
  let previousPeople=null, previousBase=null, previousCount=-1, combinedCache=[];
  const $c = id => document.getElementById(id);
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const linear = h => [1,3,5].map(k => {
    const v=parseInt(h.slice(k,k+2),16)/255;
    return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  });
  const purple = linear('#7038aa');
  function bounds(j,node,world) {
    const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
    for(const p of j.meshes[node.mesh].primitives) {
      const a=j.accessors[p.attributes.POSITION];
      if(!a.min||!a.max)throw Error('Check-in table geometry is missing its bounds.');
      for(const x of [a.min[0],a.max[0]])for(const y of [a.min[1],a.max[1]])for(const z of [a.min[2],a.max[2]]) {
        const q=tp(world,x,y,z);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],q[k]);hi[k]=Math.max(hi[k],q[k]);}
      }
    }
    return {lo,hi};
  }
  function prepareVenue(j) {
    if(state30.prepared)return;
    const root=identity();root[0]=root[5]=root[10]=VENUE_SCALE;
    const nodes=[];
    function visit(i,parent) {
      const n=j.nodes[i],world=mm(parent,trs(n));
      if(n.mesh!==undefined && (/entrance information tabletop|entrance folding chair seat|entrance chair back|chair folding leg|chair crossing leg/.test(n.name||''))) {
        nodes.push({i,n,b:bounds(j,n,world)});
      }
      for(const c of n.children||[])visit(c,world);
    }
    for(const i of j.scenes[j.scene||0].nodes)visit(i,root);
    const entry=nodes.find(x=>x.n.name===TABLE_NAME);
    if(!entry)throw Error('The existing Grand Gallery check-in table was not found. No replacement table was created.');
    const t=entry.b, length=t.hi[2]-t.lo[2],depth=t.hi[0]-t.lo[0];
    if(length<6.8||length>7.6||depth<.40||depth>.55)throw Error('The gallery table dimensions differ from the uploaded base. Check-in was not placed.');
    state30.table={name:TABLE_NAME,lo:t.lo.slice(),hi:t.hi.slice(),length,depth,
      x:(t.lo[0]+t.hi[0])/2,top:t.hi[1],frontX:t.lo[0],backX:t.hi[0],z0:t.lo[2]};
    const table=state30.table;
    state30.floor=floorHeightAt(table.backX+.2,table.z0+length/2);
    state30.stations=STATION_Z.map((s,i)=>({id:30000+i,model:MODELS[i],name:NAMES[i],
      x:table.backX+.173+(i%2)*.006,z:table.z0+s,y:state30.floor+.004,yaw:-Math.PI/2}));
    state30.stacks=STACKS.map((s,i)=>({...s,id:i+1,x:table.x+s.across,z:table.z0+s.s,y:table.top+.0007}));
    state30.bins=TOTES.map((s,i)=>({...s,id:i+1,x:table.backX+.384,z:table.z0+s.s,y:state30.floor+.002}));
    // Four existing chairs occupied the storage positions. Clear those complete
    // chair assemblies, not the desk, neighboring chairs, building, or signs.
    const seats=nodes.filter(x=>/entrance folding chair seat/.test(x.n.name||''));
    for(const desired of [1.3125,3.6,5.125,6.65]) {
      const z=table.z0+desired;
      const seat=seats.reduce((best,x)=>!best||Math.abs((x.b.lo[2]+x.b.hi[2])/2-z)<Math.abs((best.b.lo[2]+best.b.hi[2])/2-z)?x:best,null);
      if(!seat)continue;
      const center=(seat.b.lo[2]+seat.b.hi[2])/2;
      for(const o of nodes) {
        if(!/chair/.test(o.n.name||'')||Math.abs((o.b.lo[2]+o.b.hi[2])/2-center)>.14)continue;
        if(o.b.lo[0]<table.backX||o.b.hi[0]>table.backX+.5)continue;
        delete o.n.mesh;
        o.n.extras={...(o.n.extras||{}),walktestCollide:false,checkIn30ClearedChair:true};
        state30.clearedChairs.push(o.n.name);
      }
    }
    state30.prepared=true;
    j.extras={...(j.extras||{}),volunteerCheckIn30:{table:state30.table,
      volunteers:5,tableStacks:7,floorBins:4,policeUnchanged:true}};
  }
  function geometry() {return {p:[],uv:[],i:[]};}
  function vtx(g,p,uv=[0,0]) {const i=g.p.length/3;g.p.push(...p);g.uv.push(...uv);return i;}
  function tri(g,a,b,c) {g.i.push(a,b,c);}
  function quad(g,p,uv=[[0,0],[1,0],[1,1],[0,1]]) {
    const a=p.map((v,i)=>vtx(g,v,uv[i]));tri(g,a[0],a[1],a[2]);tri(g,a[0],a[2],a[3]);
  }
  function rotate(p,angle,origin) {
    const c=Math.cos(angle),s=Math.sin(angle);
    return [origin[0]+c*p[0]+s*p[2],origin[1]+p[1],origin[2]-s*p[0]+c*p[2]];
  }
  function roundedBox(g,center,size,radius,angle=0) {
    const half=size.map(v=>v/2),r=Math.max(.0001,Math.min(radius,...half.map(v=>v*.82))),inner=half.map(v=>v-r);
    for(let ax=0;ax<3;ax++) {
      const u=(ax+1)%3,w=(ax+2)%3;
      const coords=k=>[-half[k],-inner[k],inner[k],half[k]];
      for(const sign of [-1,1]) {
        const base=g.p.length/3;
        for(const z of coords(w))for(const x of coords(u)) {
          const p=[0,0,0];p[ax]=sign*half[ax];p[u]=x;p[w]=z;
          const q=p.map((a,k)=>clamp(a,-inner[k],inner[k])),d=p.map((a,k)=>a-q[k]),L=Math.hypot(...d)||1;
          vtx(g,rotate(q.map((a,k)=>a+d[k]/L*r),angle,center));
        }
        for(let j=0;j<3;j++)for(let i=0;i<3;i++) {
          const a=base+j*4+i,b=a+1,c=b+4,d=a+4;
          if(sign>0){tri(g,a,b,c);tri(g,a,c,d);}else{tri(g,a,c,b);tri(g,a,d,c);}
        }
      }
    }
  }
  function tube(g,points,r,segments=6) {
    if(points.length<2)return;
    const start=g.p.length/3;
    for(let k=0;k<points.length;k++) {
      const a=points[Math.max(0,k-1)],b=points[Math.min(points.length-1,k+1)],t=norm(sub(b,a));
      const u=norm(cross(t,Math.abs(t[1])<.85?[0,1,0]:[1,0,0])),w=cross(t,u);
      for(let n=0;n<segments;n++) {
        const angle=2*Math.PI*n/segments;
        vtx(g,points[k].map((v,i)=>v+r*(u[i]*Math.cos(angle)+w[i]*Math.sin(angle))));
      }
    }
    for(let k=0;k<points.length-1;k++)for(let n=0;n<segments;n++) {
      const a=start+k*segments+n,b=start+k*segments+(n+1)%segments;
      tri(g,a,b,b+segments);tri(g,a,b+segments,a+segments);
    }
  }
  function finish(g,mat,name) {
    if(!g.i.length)return null;
    const positions=new Float32Array(g.p),indices=new Uint32Array(g.i),normals=geometryNormals(positions,indices);
    const verts=new Float32Array(positions.length*2),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
    for(let k=0;k<positions.length;k+=3) {
      verts.set([positions[k],positions[k+1],positions[k+2],normals[k],normals[k+1],normals[k+2]],k*2);
      for(let c=0;c<3;c++){lo[c]=Math.min(lo[c],positions[k+c]);hi[c]=Math.max(hi[c],positions[k+c]);}
    }
    if(![...lo,...hi].every(Number.isFinite))throw Error('Check-in generated a non-finite vertex: '+name);
    const b=uploadBatch(verts,indices,{...mat,uv:new Float32Array(g.uv),checkIn30:true,
      name,center:lo.map((v,k)=>(v+hi[k])/2),cullRadius:Math.hypot(...hi.map((v,k)=>v-lo[k]))/2+.002,
      localBounds30:{lo,hi}});
    // Kept for export/validation of these SMALL props only, never whole-scene copies.
    b.checkInGeometry30={positions,indices,normals};
    state30.triangles+=indices.length/3;batches.push(b);return b;
  }
  function makePrintTexture() {
    if(printTexture)return printTexture;
    const c=document.createElement('canvas');c.width=512;c.height=192;
    const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#f5efff';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='600 44px system-ui';ctx.fillText('MiCareerQuest',256,61,466);
    ctx.font='700 38px system-ui';ctx.fillText('VOLUNTEER',256,120,400);
    printTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,printTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);
    return printTexture;
  }
  function makeProps() {
    if(!state30.prepared)throw Error('Check-in cannot load before the gallery table is located.');
    if(state30.props)return;
    const layers=[geometry(),geometry(),geometry()],seams=geometry(),printing=geometry(),binRims=geometry(),binFeet=geometry();
    const linears=['#7038aa','#733cad','#6d35a5'].map(linear);
    let shirts=0,tableLayers=0;
    function folded(center,width,depth,thickness,yaw,index,isTop,withPrint) {
      roundedBox(layers[index%3],center,[depth,thickness,width],Math.min(.0032,thickness*.36),yaw);
      const T=q=>rotate(q,yaw,center),halfW=width/2,halfD=depth/2,y=thickness/2;
      // Folded sleeve edges are tucked into the underside. Small raised seams,
      // a visible neck fold, and a chest print stop these reading as purple bricks.
      if(isTop)for(const side of [-1,1]) {
        const p=T([halfD*.25,-thickness*.20,side*halfW*.67]);
        roundedBox(layers[(index+1)%3],p,[depth*.63,thickness*.33,width*.29],.0012,yaw+side*.025);
      }
      const fold=[[-halfD*.97,-y*.28,-halfW*.90],[-halfD*1.002,-y*.1,-halfW*.28],[-halfD*.99,-y*.22,halfW*.84]].map(T);
      tube(seams,fold,.00055,5);
      if(isTop) {
        const neck=[];for(let k=0;k<=16;k++){const a=Math.PI*k/16;neck.push(T([halfD*.69-.0125*Math.sin(a),y+.0008,.022*Math.cos(a)]));}
        tube(seams,neck,.0011,6);
        const hem=[];for(let k=0;k<=8;k++)hem.push(T([-halfD*.82,y+.0005,(-.84+k/8*1.68)*halfW]));
        tube(seams,hem,.00045,5);
        if(withPrint) {
          const x0=-depth*.12,x1=depth*.28,z0=-width*.35,z1=width*.35;
          quad(printing,[[x0,y+.0011,z0],[x0,y+.0011,z1],[x1,y+.0011,z1],[x1,y+.0011,z0]].map(T));
        }
      }
      shirts++;
    }
    for(const stack of state30.stacks) {
      let bottom=stack.y;
      for(let k=0;k<stack.count;k++) {
        const t=.0072+(k%2)*.0007,angle=stack.yaw+Math.sin((stack.id*17+k)*1.7)*.023;
        const c=[stack.x+Math.sin(stack.id+k*2)*.0025,bottom+t/2,stack.z+Math.cos(stack.id*2+k*3)*.003];
        folded(c,stack.width*(1-.007*k),stack.depth,t,angle,stack.id+k,k===stack.count-1,k===stack.count-1);
        bottom+=t-.00025;tableLayers++;
      }
      stack.top=bottom;
    }
    for(const bin of state30.bins) {
      const {depth:d,width:w,height:h}=bin,origin=[bin.x,bin.y,bin.z],T=q=>rotate(q,bin.yaw,origin);
      const bx=d*.435,bz=w*.435,tx=d/2,tz=w/2;
      const low=[[-bx,.008,-bz],[bx,.008,-bz],[bx,.008,bz],[-bx,.008,bz]];
      const high=[[-tx,h,-tz],[tx,h,-tz],[tx,h,tz],[-tx,h,tz]];
      // Thin individual transparent walls allow standard back-to-front sorting.
      for(let side=0;side<4;side++) {
        const g=geometry(),n=(side+1)%4;quad(g,[low[side],low[n],high[n],high[side]].map(T));
        finish(g,{color:[.78,.87,.92,.14],rough:.20,metal:0,transparent:true},'CheckIn30 clear bin '+bin.id+' wall '+side);
      }
      const bottom=geometry();quad(bottom,low.map(T));
      finish(bottom,{color:[.65,.76,.82,.19],rough:.30,metal:0,transparent:true},'CheckIn30 clear bin '+bin.id+' bottom');
      const rim=[];for(let k=0;k<=4;k++)rim.push(T(high[k%4]));tube(binRims,rim,.0038,8);
      const foot=low.map(T);foot.push(foot[0]);tube(binRims,foot,.0023,6);
      for(let corner=0;corner<4;corner++)tube(binRims,[T(low[corner]),T(high[corner])],.0015,5);
      // Molded finger grips on the short ends and low corner feet.
      for(const side of [-1,1]) {
        const grip=[[-.030,h-.019,side*(tz+.001)],[-.030,h-.031,side*(tz+.001)],
          [.030,h-.031,side*(tz+.001)],[.030,h-.019,side*(tz+.001)]].map(T);tube(binRims,grip,.0025,6);
      }
      for(const sx of [-1,1])for(const sz of [-1,1])roundedBox(binFeet,T([sx*bx*.75,.004,sz*bz*.76]),[.023,.008,.029],.002,bin.yaw);
      for(let pile=0;pile<2;pile++) {
        let base=.016;const localZ=(pile?1:-1)*w*.225;
        for(let k=0;k<bin.fill[pile];k++) {
          const t=.008,center=T([Math.sin(k+bin.id)*.002,base+t/2,localZ+Math.cos(k*2)*.002]);
          folded(center,w*.385,d*.72,t,bin.yaw+(pile?.035:-.025),k+pile+bin.id,k===bin.fill[pile]-1,k===bin.fill[pile]-1);
          base+=.0078;
        }
      }
      // A simple solid footprint only for the physical tote, never the aisle.
      const g=geometry();roundedBox(g,T([0,h/2,0]),[d,h,w],.001,bin.yaw);
      registerCollider('Volunteer storage tote '+bin.id,'checkInStorageBin',new Float32Array(g.p),new Uint32Array(g.i),false,{walktestCollide:true,checkIn30:true});
    }
    for(let k=0;k<3;k++)finish(layers[k],{color:[...linears[k],1],rough:.94,metal:0,surfaceType:10},'CheckIn30 folded fabric '+k);
    finish(seams,{color:[...linear('#8b57be'),1],rough:.98,metal:0},'CheckIn30 folded hems and collars');
    finish(binFeet,{color:[.44,.53,.57,.55],rough:.42,transparent:true,metal:0},'CheckIn30 bin feet');
    finish(binRims,{color:[.77,.86,.90,.52],rough:.20,transparent:true,metal:0},'CheckIn30 molded clear rims and handles');
    finish(printing,{color:[1,1,1,1],rough:.95,metal:0,baseTexture:makePrintTexture(),transparent:true},'CheckIn30 volunteer shirt printing');
    state30.batches=batches.length;state30.tableLayers=tableLayers;state30.totalFoldedShirts=shirts;
    for(const b of batches)renderBatches.push(b);
    state30.props=true;lastSunRoof=null;
    state30.validation=validatePlacement();
    if(!state30.validation.ok)throw Error('Check-in placement validation failed: '+state30.validation.errors.join('; '));
  }
  function validatePlacement() {
    const errors=[],t=state30.table;
    for(const s of state30.stacks) {
      const radiusX=Math.abs(Math.cos(s.yaw))*s.depth/2+Math.abs(Math.sin(s.yaw))*s.width/2+.005;
      const radiusZ=Math.abs(Math.sin(s.yaw))*s.depth/2+Math.abs(Math.cos(s.yaw))*s.width/2+.005;
      if(s.x-radiusX<t.lo[0]||s.x+radiusX>t.hi[0]||s.z-radiusZ<t.lo[2]||s.z+radiusZ>t.hi[2])errors.push('shirt pile '+s.id+' leaves tabletop');
      if(s.y<t.top-.0001||s.y>t.top+.003)errors.push('shirt pile '+s.id+' is not resting on the table');
      if(s.top-t.top>.05)errors.push('shirt pile '+s.id+' is too tall');
    }
    for(const b of state30.bins) {
      if(Math.abs(b.y-state30.floor)>.004)errors.push('bin '+b.id+' is not on floor');
      if(b.x-b.depth/2<=t.backX+.10)errors.push('bin '+b.id+' is not behind volunteers');
    }
    for(const s of state30.stations) {
      if(s.x<=t.backX+.12||s.z<=t.lo[2]||s.z>=t.hi[2])errors.push(s.name+' is not behind the table');
      if(Math.abs(s.y-(state30.floor+.004))>.0001)errors.push(s.name+' is above/below floor');
      const q=resolveEllipsoid([s.x,s.y+PHYSICS.radii[1],s.z],[0,0,0]).position;
      const distance=Math.hypot(q[0]-s.x,q[2]-s.z);
      if(distance>.035)errors.push(s.name+' overlaps furniture ('+distance.toFixed(3)+')');
    }
    return {ok:errors.length===0,errors,volunteers:state30.stations.length,stacks:state30.stacks.length,bins:state30.bins.length};
  }
  function volunteerOutfit(model,i) {
    const source=CrowdWardrobe.appearance(i,914211001,model);
    return {...source,shirt:'#7038aa',pants:'#253649',shoes:'#20262d',
      colors:[...purple,...linear('#253649'),...linear('#20262d'),...linear('#dddbea')],
      volunteer:true,backpack:false,hat:false,flags:[0,0,1,1]};
  }
  async function load() {
    if(loading)return loading;
    state30.enabled=true;
    if(people.length===5){updateUI();return people;}
    state30.loading=true;state30.error=null;updateUI();
    loading=(async()=>{
      if(!state30.props)makeProps();
      const D=MODELS.every(id=>characterState.models.has(id))?null:await loadCharacterDecoder();
      for(let i=0;i<MODELS.length;i++) {
        state30.message='Preparing check-in volunteer '+(i+1)+' of 5...';updateUI();
        if(!characterState.models.has(MODELS[i]))characterState.models.set(MODELS[i],await loadCharacterModel(MODELS[i],D));
      }
      await CrowdGraphics.prepareModels(text=>{state30.message=text;updateUI();});
      // A concurrent boundary load may have started the shared bake earlier.
      await CrowdGraphics.prepareModels();
      if(gl.isContextLost())throw Error('The graphics context reset while loading volunteers. Reopen the venue.');
      people=state30.stations.map((s,i)=>({
        id:s.id,kind:'checkInVolunteer',line:'welcome-checkin',name:s.name,
        role:'Volunteer check-in and shirt pickup',industry:null,volunteer:true,stationed:true,
        x:s.x,z:s.z,yaw:s.yaw,renderX:s.x,renderZ:s.z,renderYaw:s.yaw,position:[s.x,s.y,s.z],
        model:characterState.models.get(s.model),outfit:volunteerOutfit(characterState.models.get(s.model),i),
        mode:'idle',clock:0,phase:i*.713,displayMode:'idle',transitionStart:-100,lastFrame:0,canWave:false
      }));
      state30.message='5 check-in volunteers ready. 7 low shirt stacks and 4 clear shirt bins are in place.';
      if(window.Crowd)Crowd.invalidate();return people;
    })();
    try{return await loading;}
    catch(e){state30.error=e.message||String(e);state30.message='Check-in volunteers could not load: '+state30.error;throw e;}
    finally{loading=null;state30.loading=false;updateUI();}
  }
  function visible() {return state30.enabled&&state.showStaff!==false?people:EMPTY;}
  function combined(base) {
    const extra=visible();if(!extra.length)return base;
    if(previousBase!==base||previousPeople!==extra||previousCount!==base.length) {
      previousBase=base;previousPeople=extra;previousCount=base.length;combinedCache=base.concat(extra);
    }
    return combinedCache;
  }
  function update(dt) {
    if(!state.ready||state.paused)return;
    const delta=Math.max(0,Math.min(dt,.1));state30.time+=delta;
    if(state30.enabled&&state.animatePeople!==false)for(let i=0;i<people.length;i++) {
      const a=people[i];a.clock+=delta;
      const nearby=Math.hypot(player.position[0]-a.x,player.position[2]-a.z)<2.2;
      a.mode=nearby&&(Math.floor(state30.time/9)+i)%3===0?'talk':'idle';
    }
    // Shipments retain non-shipment batches; this guard also handles a future
    // renderer refresh without re-uploading meshes or duplicating the props.
    if(state30.props&&batches.length&&!renderBatches.includes(batches[0]))for(const b of batches)if(!renderBatches.includes(b))renderBatches.push(b);
    if(state30.time-state30.lastUI>.75){state30.lastUI=state30.time;updateUI();}
  }
  function visit() {
    const t=state30.table;if(!t){toast('The gallery is still loading.');return;}
    const key='checkin30-desk',x=t.frontX-1.20,z=t.z0+4.10;
    places[key]={label:'Volunteer check-in / DEV 30',p:[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.03,z],yaw:-Math.PI/2,scaledPlayer:true};
    teleport(key,true);state.radius=3.7*PLAYER_SCALE;state.pitch=.13;updateCamera(0,true);canvas.focus();
  }
  function visitBins() {
    const t=state30.table;if(!t)return;
    const key='checkin30-floor-bins',x=t.backX+.235,z=t.hi[2]+.48;
    places[key]={label:'Supply bins behind check-in / DEV 30',p:[x,floorHeightAt(x,z)+PHYSICS.radii[1]+.03,z],yaw:0,scaledPlayer:true};
    teleport(key,true);state.radius=2.5*PLAYER_SCALE;state.pitch=.31;updateCamera(0,true);canvas.focus();
  }
  function updateUI() {
    if($c('checkin30Status'))$c('checkin30Status').textContent=state30.message;
    if($c('checkin30Load')) {$c('checkin30Load').disabled=state30.loading;$c('checkin30Load').textContent=state30.loading?'Loading volunteers...':people.length?'Show five volunteers':'Load / retry volunteers';}
    if($c('checkin30Show'))$c('checkin30Show').checked=state30.enabled;
  }
  function init() {
    if($c('checkin30Panel'))return;
    const panel=document.createElement('details');panel.id='checkin30Panel';panel.className='panel';panel.open=true;panel.style.cssText='padding:12px;margin-bottom:9px';
    panel.innerHTML='<summary>Volunteer check-in / DEV 30</summary><p class="ship-hint">Five purple-shirt volunteers stay behind the existing Grand Gallery table. Seven uneven stacks are on the tabletop; four clear supply bins sit on the floor behind them.</p><div class="buttonRow"><button id="checkin30Visit">Visit check-in table</button><button id="checkin30Load">Load five volunteers</button></div><button id="checkin30Bins" style="width:100%">Inspect floor bins</button><label class="setting">Show check-in volunteers<input type="checkbox" id="checkin30Show" checked></label><p id="checkin30Status" class="ship-hint" role="status"></p><p class="ship-foot">This loads only five check-in people, not the student crowd. Officers and boundary-helper spacing are unchanged.</p>';
    $c('rightTools').prepend(panel);
    $c('checkin30Visit').onclick=()=>{visit();load().catch(()=>{});};
    $c('checkin30Load').onclick=()=>load().catch(()=>{});
    $c('checkin30Bins').onclick=visitBins;
    $c('checkin30Show').onchange=e=>{state30.enabled=e.target.checked;if(state30.enabled&&!people.length)load().catch(()=>{});if(window.Crowd)Crowd.invalidate();};
    try{makeProps();state30.message='Table, seven shirt stacks, and four floor bins are ready. Loading the five volunteers...';load().catch(()=>{});}
    catch(e){state30.error=e.message;state30.message='Check-in setup: '+e.message;console.error('CheckIn30',e);}
    updateUI();
  }
  function snapshot() {
    return {version:VERSION,enabled:state30.enabled,loading:state30.loading,error:state30.error,message:state30.message,
      prepared:state30.prepared,propsReady:state30.props,volunteers:people.length,
      shirtStacks:state30.stacks.length,tableShirts:state30.tableLayers||0,floorBins:state30.bins.length,
      propTriangles:state30.triangles,propBatches:state30.batches,table:state30.table,floor:state30.floor,
      stations:state30.stations,stacks:state30.stacks,bins:state30.bins,
      clearedChairParts:state30.clearedChairs.length,validation:state30.validation,policeModified:false};
  }
  return {prepareVenue,init,load,update,visible,combined,visit,visitBins,snapshot,
    get actors(){return people;},get batches(){return batches;}};
})();
window.CheckIn30=CheckIn30;
