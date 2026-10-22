/* Small batched meshes keep the patch leads and 250 activity LEDs inexpensive. */
const NetworkScene40=(()=>{
 class Mesh{
  constructor(color){this.color=color;this.v=[];this.i=[];}
  plane(p,size,m=IDENTITY){const k=this.v.length/6,N=norm(sub(tp(m,0,1,0),tp(m,0,0,0)));for(const [x,z] of [[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5]])this.v.push(...tp(m,p[0]+x*size[0],p[1],p[2]+z*size[1]),...N);this.i.push(k,k+1,k+2,k,k+2,k+3);return this;}
  box(p,size,m=IDENTITY){const faces=[[[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]],[[-1,0,0],[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]]],[[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]]],[[0,0,1],[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]]],[[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]]]];
   for(const[n,ps]of faces){const k=this.v.length/6,N=norm(sub(tp(m,...n),tp(m,0,0,0)));for(const q of ps)this.v.push(...tp(m,...q.map((a,i)=>p[i]+a*size[i])),...N);this.i.push(k,k+1,k+2,k,k+2,k+3);}return this;
  }
  line(a,b,w){const d=sub(b,a),y=norm(d),x=norm(cross(Math.abs(y[1])>.9?[1,0,0]:[0,1,0],y)),z=cross(x,y),mid=mul(add(a,b),.5);return this.box([0,0,0],[w,len(d),w],[...x,0,...y,0,...z,0,...mid,1]);}
  tube(points,r){for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],axis=norm(sub(b,a)),x=norm(cross(Math.abs(axis[1])>.9?[1,0,0]:[0,1,0],axis)),z=cross(axis,x),start=this.v.length/6;for(const p of [a,b])for(let k=0;k<6;k++){const n=add(mul(x,Math.cos(k*Math.PI/3)),mul(z,Math.sin(k*Math.PI/3)));this.v.push(...add(p,mul(n,r)),...n);}for(let k=0;k<6;k++){const a=start+k,b=start+(k+1)%6;this.i.push(a,b,a+6,b,b+6,a+6);}}return this;}
  build(extra={}){return uploadBatch(new Float32Array(this.v),new Uint32Array(this.i),{color:this.color,rough:.65,...extra});}
 }
 async function load(name){const r=await fetch('./network40/'+name+'.glb');if(!r.ok)throw Error('Missing network model: '+name);const {json:j,bin}=parseGLB(await r.arrayBuffer()),parts=[],cache=new Map();
  for(const n of j.nodes){if(n.mesh===undefined)continue;for(const p of j.meshes[n.mesh].primitives){const pos=accessor(j,bin,p.attributes.POSITION),idx=accessor(j,bin,p.indices),nor=p.attributes.NORMAL===undefined?geometryNormals(pos,idx):accessor(j,bin,p.attributes.NORMAL),v=new Float32Array(pos.length*2);for(let i=0;i<pos.length;i+=3)v.set([...pos.subarray(i,i+3),...nor.subarray(i,i+3)],i*2);const m=j.materials[p.material]||{},pbr=m.pbrMetallicRoughness||{},ti=pbr.baseColorTexture?.index;if(ti!=null&&!cache.has(ti))cache.set(ti,await embeddedGLBTexture(j,bin,ti));parts.push(uploadBatch(v,idx,{color:pbr.baseColorFactor||[1,1,1,1],baseTexture:cache.get(ti),uv:p.attributes.TEXCOORD_0==null?null:accessor(j,bin,p.attributes.TEXCOORD_0),rough:.7,doubleSided:true}));parts.at(-1).sourceMaterial=m.name||'';}}
  gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);return parts;
 }
 const port=n=>[-.19+(n%5)*.083,1.13-Math.floor(n/5)*.085,.225];
 function patch(missing=-1){
  const metal=new Mesh([.27,.32,.34,1]),black=new Mesh([.018,.026,.03,1]),cable=new Mesh([.055,.38,.76,1]),silver=new Mesh([.55,.64,.67,1]),contacts=new Mesh([.85,.69,.27,1]);
  metal.box([0,.74,.209],[.51,.93,.02]);for(const x of [-.258,.258])black.box([x,.71,.243],[.023,1.06,.05]);
  for(let row=0;row<10;row++)black.box([0,1.107-row*.085,.233],[.46,.005,.022]);
  for(let n=0;n<50;n++){const p=port(n);black.box(p,[.048,.028,.016]);silver.box([p[0],p[1]+.016,.238],[.045,.005,.008]);for(let k=0;k<8;k++)contacts.box([p[0]-.016+k*.0045,p[1]+.007,.235],[.002,.006,.006]);if(n===missing)continue;
   silver.box([p[0],p[1],.248],[.025,.019,.04]);const side=n%5<2?-.25:.25,drop=.027+(n%5)*.005,depth=.274+(n%5)*.002,control=[[p[0],p[1],.27],[p[0],p[1]-drop,depth],[side,p[1]-drop,depth],[side,p[1]-.06,.26]],points=[];for(let i=0;i<=9;i++){const t=i/9,u=1-t;points.push([0,1,2].map(k=>u*u*u*control[0][k]+3*u*u*t*control[1][k]+3*u*t*t*control[2][k]+t*t*t*control[3][k]));}cable.tube(points,.002);
  }
  return [metal.build(),black.build(),cable.build(),silver.build(),contacts.build()];
 }
 function screen(width,height,paint){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d'),texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const b=uploadBatch(new Float32Array([-.5,-.5,0,0,0,1,.5,-.5,0,0,0,1,.5,.5,0,0,0,1,-.5,.5,0,0,0,1]),new Uint32Array([0,1,2,0,2,3]),{color:[1,1,1,1],unlit:true,baseTexture:texture,uv:new Float32Array([0,1,1,1,1,0,0,0])});
  const update=fn=>{fn(ctx,c);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.activeTexture(gl.TEXTURE0);};update(paint);return {batch:b,update};
 }
 function label(text){return screen(512,96,(q,c)=>{q.fillStyle='#1b2327';q.fillRect(0,0,c.width,c.height);q.fillStyle='#d4e4e9';q.font='bold 40px sans-serif';q.textAlign='center';q.fillText(text,256,62);}).batch;}
 return {Mesh,load,patch,port,screen,label};
})();
