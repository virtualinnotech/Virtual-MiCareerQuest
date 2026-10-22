/* Medical characters keep their authored materials and share the venue skinning renderer. */
window.MRIPeople42={
 outfit(){return {colors:new Float32Array(12).fill(1),backpack:false,hat:false,volunteer:false,flags:[0,0,0,0]};},
 async load(id,url='./mri42/'+(id==='doctor'?'doctor-runtime':id)+'.glb?v=20261002-memory50'){
  const response=await fetch(url);if(!response.ok)throw Error('Missing '+id+' model');
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),parents=new Map(),order=[];
  j.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>parents.set(k,i)));
  const visit=i=>{order.push(i);for(const k of j.nodes[i].children||[])visit(k);};j.scenes[j.scene||0].nodes.forEach(visit);
  const model={id:'mri-'+id,j,parents,order,parts:[],clips:[],idle:{duration:1,channels:[]},skins:j.skins.map(s=>({...s,ibm:accessor(j,bin,s.inverseBindMatrices)})),lo:[Infinity,Infinity,Infinity],hi:[-Infinity,-Infinity,-Infinity]},textures=new Map();
  for(const node of j.nodes){if(node.mesh==null)continue;for(const p of j.meshes[node.mesh].primitives){
   const v=accessor(j,bin,p.attributes.POSITION),idx=accessor(j,bin,p.indices),normal=accessor(j,bin,p.attributes.NORMAL),uv=accessor(j,bin,p.attributes.TEXCOORD_0),joints=accessor(j,bin,p.attributes.JOINTS_0),weights=accessor(j,bin,p.attributes.WEIGHTS_0),data=new Float32Array(v.length*2);
   for(let k=0;k<v.length;k+=3){data.set([...v.subarray(k,k+3),...normal.subarray(k,k+3)],k*2);for(let a=0;a<3;a++){model.lo[a]=Math.min(model.lo[a],v[k+a]);model.hi[a]=Math.max(model.hi[a],v[k+a]);}}
   const mat=j.materials[p.material],m=mat.pbrMetallicRoughness||{},ti=m.baseColorTexture?.index;if(ti!=null&&!textures.has(ti))textures.set(ti,await embeddedGLBTexture(j,bin,ti));
   const batch=uploadBatch(data,idx,{uv,color:m.baseColorFactor||[1,1,1,1],baseTexture:textures.get(ti),rough:.8,doubleSided:true,forceOpaque:true});
   gl.bindVertexArray(batch.vao);
   for(const [slot,value] of [[7,new Float32Array(joints)],[8,weights]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,value,gl.STATIC_DRAW);gl.enableVertexAttribArray(slot);gl.vertexAttribPointer(slot,4,gl.FLOAT,false,0,0);}
   model.parts.push({name:node.name,skin:node.skin,batch});
  }}
  model.bindWorld=[];for(const i of order)model.bindWorld[i]=mm(model.bindWorld[parents.get(i)]||IDENTITY,trs(j.nodes[i]));
  model.scale=CHARACTER_HEIGHT/(model.hi[1]-model.lo[1]);model.offset=[0,-model.lo[1],0];gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);return model;
 },
 gait(model,source){
  if(model.walk||!source?.walk)return;
  const identity=[0,0,0,1],mul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]],inv=q=>[-q[0],-q[1],-q[2],q[3]];
  const world=(m,pose)=>{const w=[];for(const i of m.order)w[i]=mul(w[m.parents.get(i)]||identity,pose[i].rotation||identity);return w;};
  const sb=world(source,source.j.nodes),tb=world(model,model.j.nodes),names=new Map(source.j.nodes.map((n,i)=>[n.name,i]));
  const sourceBind=[];for(const i of source.order)sourceBind[i]=mm(sourceBind[source.parents.get(i)]||IDENTITY,trs(source.j.nodes[i]));
  const hip=model.skins[0].joints[0],sourceHip=names.get(model.j.nodes[hip].name),heightRatio=model.bindWorld[hip][13]/sourceBind[sourceHip][13];
  // Transfer the actual NPC clips in world space to account for different rig rest axes.
  for(const mode of ['idle','walk','back']){
   const clip=source[mode]||source.walk,count=Math.ceil(clip.duration*30),times=Float32Array.from({length:count+1},(_,i)=>i*clip.duration/count),channels=model.skins[0].joints.map(node=>({node,path:'rotation',times,values:new Float32Array((count+1)*4),interpolation:'LINEAR'}));
   const hips={node:hip,path:'translation',times,values:new Float32Array((count+1)*3),interpolation:'LINEAR'};
   for(let frame=0;frame<=count;frame++){
    const pose=source.j.nodes.map(n=>({...n,rotation:[...(n.rotation||identity)]}));
    for(const ch of clip.channels)if(['rotation','translation','scale'].includes(ch.path))pose[ch.node][ch.path]=sampleLandmarkChannel(ch,times[frame]);
    const sw=world(source,pose),tw=[],local=[];
    for(const i of model.order){const k=names.get(model.j.nodes[i].name),parent=tw[model.parents.get(i)]||identity;tw[i]=k==null?mul(parent,model.j.nodes[i].rotation||identity):mul(mul(sw[k],inv(sb[k])),tb[i]);local[i]=mul(inv(parent),tw[i]);}
    for(const ch of channels)ch.values.set(local[ch.node],frame*4);
    const matrices=[];for(const i of source.order)matrices[i]=mm(matrices[source.parents.get(i)]||IDENTITY,trs(pose[i]));
    const position=[...model.j.nodes[hip].translation];position[1]+=(matrices[sourceHip][13]-sourceBind[sourceHip][13])*heightRatio;hips.values.set(position,frame*3);
   }
   model[mode]={name:'NPC '+mode,duration:clip.duration,channels:[...channels,hips]};
  }
  model.gaitSource=source.id;
 },
 rotateWorld(a,i,axis,angle){
  const m=a.model.bindWorld[i],direction=[m[axis],m[4+axis],m[8+axis]],length=Math.hypot(...direction),sn=Math.sin(angle/2),q=[...direction.map(v=>v/length*sn),Math.cos(angle/2)];const [x,y,z,w]=a.pose[i].rotation,[u,v,t,d]=q;
  delete a.pose[i].matrix;a.pose[i].rotation=[w*u+x*d+y*t-z*v,w*v-x*t+y*d+z*u,w*t+x*v-y*u+z*d,w*d-x*u-y*v-z*t];
 },
 pose(a){
  if(!a.model.id.startsWith('mri-')||a.model.id==='mri-doctor')return;
  const moving=a.player?player.walkAmount:0,step=Math.sin(a.clock*7)*.40*Math.sign(moving||1)*(moving?1:0);
  for(let i=0;i<a.pose.length;i++){
   const n=a.model.j.nodes[i],name=n.name||'',p=a.pose[i];p.rotation=[...(n.rotation||[0,0,0,1])];
   let angle=0,axis=0;
   if(/LeftArm$/.test(name)){angle=-1.43;axis=2;}
   if(/RightArm$/.test(name)){angle=1.43;axis=2;}
   if(/LeftUpLeg$/.test(name))angle=step;
   if(/RightUpLeg$/.test(name))angle=-step;
   if(/LeftLeg$/.test(name))angle=-Math.max(0,step);
   if(/RightLeg$/.test(name))angle=-Math.max(0,-step);
   if(!angle)continue;
   const m=a.model.bindWorld[i],direction=[m[axis],m[4+axis],m[8+axis]],length=Math.hypot(...direction),sn=Math.sin(angle/2),q=[...direction.map(v=>v/length*sn),Math.cos(angle/2)];const [x,y,z,w]=p.rotation,[a1,b,c,d]=q;
   p.rotation=[w*a1+x*d+y*c-z*b,w*b-x*c+y*d+z*a1,w*c+x*b-y*a1+z*d,w*d-x*a1-y*b-z*c];
  }
 }
};
