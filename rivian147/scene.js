window.RivianScene147=(()=>{
 const SCALE=.4,parts=[],pivots={LF:[.875,.41348,1.54724],RF:[-.875,.41348,1.5466],LR:[.8625,.41348,-1.56566],RR:[-.8625,.41348,-1.56778]};
 let ready=false,gauges,display,screenKey='',poseKey='',models=new Map();
 const root=s=>transform([s.x,s.y,s.z],[SCALE,SCALE,SCALE],0,s.yaw);
 function axisRotation(a,t){const [x,y,z]=norm(a),c=Math.cos(t),s=Math.sin(t),v=1-c;return [x*x*v+c,y*x*v+z*s,z*x*v-y*s,0,x*y*v-z*s,y*y*v+c,z*y*v+x*s,0,x*z*v+y*s,y*z*v-x*s,z*z*v+c,0,0,0,0,1];}
 function pivot(p,rotation){return mm(mm(transform(p),rotation),transform(p.map(v=>-v)));}
 const suspension=s=>pivot([0,.42,0],mm(axisRotation([0,0,1],s.roll||0),axisRotation([1,0,0],s.pitch||0)));
 function motion(part,s){if(part.group==='steering')return mm(suspension(s),pivot([.385,1.205,.45],axisRotation([0,.40,-.9165],s.steer*2.1)));
  const match=part.group.match(/^(wheel|caliper)-(LF|RF|LR|RR)$/);if(!match)return suspension(s);
  const front=match[2].endsWith('F'),rotation=transform([0,0,0],[1,1,1],match[1]==='wheel'?s.spin:0,front?s.steer:0);return pivot(pivots[match[2]],rotation);
 }
 function lamp(name,s){
  if(/brake|tail emitter|emitter_ch1\.145/.test(name))return s.braking?[1,.008,.004]:s.lights?[.3,.002,.001]:[.03,0,0];
  if(/reverse lamp/.test(name))return s.mounted&&s.speed<-.03?[.9,.95,1]:[0,0,0];
  if(/side marker|mirror lamp/.test(name))return s.signal&&Math.floor(s.time*2.5)%2===0?[1,.28,.015]:s.lights?[.16,.06,.004]:[0,0,0];
  if(/emitter_ch1\.(149|148|147|153|152)|glass\.(223|220|224)/.test(name))return s.lights?[1.1,1.08,.98]:[.05,.05,.045];
  return null;
 }
 function screens(s){const mph=Math.round(Math.abs(s.speed)/SCALE*2.23694),gear=!s.mounted?'P':s.speed<-.02?'R':'D',key=[mph,gear,s.lights,s.braking].join('|');if(key===screenKey)return;screenKey=key;
  gauges.update((q,c)=>{q.fillStyle='#10191a';q.fillRect(0,0,c.width,c.height);q.fillStyle='#edf5ef';q.textAlign='center';q.font='600 108px sans-serif';q.fillText(mph,c.width*.50,140);q.font='24px sans-serif';q.fillStyle='#a5bab1';q.fillText('MPH',c.width*.50,179);q.fillStyle='#e3eee7';q.font='bold 46px sans-serif';q.fillText(gear,75,133);q.font='22px sans-serif';q.fillText('R1S',c.width-77,100);q.fillStyle=s.lights?'#93df99':'#60706a';q.fillText(s.lights?'LIGHTS ON':'LIGHTS OFF',c.width-100,150);q.strokeStyle='#d8e5dc';q.lineWidth=5;q.beginPath();q.moveTo(205,217);q.lineTo(235,185);q.moveTo(435,217);q.lineTo(405,185);q.stroke();});
  display.update((q,c)=>{q.fillStyle='#d3ded7';q.fillRect(0,0,c.width,c.height);q.strokeStyle='#faf7eb';q.lineWidth=27;for(let x=50;x<600;x+=125){q.beginPath();q.moveTo(x,0);q.lineTo(x,410);q.stroke();}for(let y=70;y<400;y+=90){q.beginPath();q.moveTo(0,y);q.lineTo(600,y);q.stroke();}q.fillStyle='#75a3a4';q.fillRect(0,0,56,410);q.fillStyle='#476e54';q.fillRect(180,92,95,65);q.fillStyle='#164852';q.beginPath();q.moveTo(320,180);q.lineTo(300,225);q.lineTo(320,215);q.lineTo(340,225);q.closePath();q.fill();q.fillStyle='#142b2c';q.fillRect(0,0,c.width,43);q.fillRect(0,c.height-48,c.width,48);q.fillStyle='#edf2ed';q.font='22px sans-serif';q.fillText('RIVIAN',20,30);q.fillText('Grand Rapids',c.width-175,30);q.fillText('70 F',25,c.height-16);q.fillText('ALL-PURPOSE',210,c.height-16);q.fillText(gear+'  '+mph+' MPH',c.width-140,c.height-16);});
 }
 let pending;
 function init(){return pending??=(async()=>{await load();})();}
 async function load(){
  const response=await fetch('./rivian147/assets/rivian.glb?v=147');if(!response.ok)throw Error('Rivian model unavailable');
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),textures=new Map();
  async function tex(i){if(i==null)return null;if(!textures.has(i))textures.set(i,await embeddedGLBTexture(j,bin,i));return textures.get(i);}
  for(const node of j.nodes){if(node.mesh==null)continue;for(const pr of j.meshes[node.mesh].primitives){
   const pos=accessor(j,bin,pr.attributes.POSITION),idx=new Uint32Array(accessor(j,bin,pr.indices)),nor=accessor(j,bin,pr.attributes.NORMAL),vertices=new Float32Array(pos.length*2),material=j.materials[pr.material],pbr=material.pbrMetallicRoughness||{},name=material.name||'';
   for(let i=0;i<pos.length;i+=3)vertices.set([...pos.subarray(i,i+3),...nor.subarray(i,i+3)],i*2);
   const digital=/digitalscreen/.test(name),emitter=material.emissiveTexture?.index!=null,base=await tex(digital||emitter?material.emissiveTexture.index:pbr.baseColorTexture?.index),color=digital||emitter?[1,1,1,1]:[...(pbr.baseColorFactor||[1,1,1,1])];
   const transparent=material.alphaMode==='BLEND';if(transparent&&/glass\./.test(name))color[3]=Math.min(color[3],.16);if(/window glass/.test(name))color[3]=Math.min(color[3],.12);
   const normalCoord=pr.attributes['TEXCOORD_'+(material.normalTexture?.texCoord||0)],baseCoord=pr.attributes.TEXCOORD_0??normalCoord;
   const batch=uploadBatch(vertices,idx,{color,rough:pbr.roughnessFactor??.4,metal:pbr.metallicFactor??0,baseTexture:base,normalTexture:await tex(material.normalTexture?.index),normalScale:material.normalTexture?.scale??.65,uv:baseCoord==null?null:accessor(j,bin,baseCoord),unlit:digital,alphaCutoff:material.alphaMode==='MASK'?.2:-1,sharedKey:'rivian147-'+node.name});
   gl.bindVertexArray(batch.vao);
   if(pr.attributes.COLOR_0!=null){const values=accessor(j,bin,pr.attributes.COLOR_0),a=j.accessors[pr.attributes.COLOR_0];batch.vertexColor147=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,batch.vertexColor147);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);gl.enableVertexAttribArray(15);gl.vertexAttribPointer(15,a.type==='VEC3'?3:4,a.componentType,!!a.normalized,0,0);}
   if(normalCoord!=null&&baseCoord!=null){const uv=accessor(j,bin,baseCoord),nuv=accessor(j,bin,normalCoord),packed=new Float32Array(uv.length*2);for(let i=0;i<uv.length;i+=2)packed.set([uv[i],uv[i+1],nuv[i],nuv[i+1]],i*2);gl.bindBuffer(gl.ARRAY_BUFFER,batch.uvbo);gl.bufferData(gl.ARRAY_BUFFER,packed,gl.STATIC_DRAW);gl.vertexAttribPointer(6,4,gl.FLOAT,false,0,0);batch.normalUV147=true;}
   parts.push({batch,name,group:node.extras?.motion||'body',transparent});
  }}
  gauges=NetworkScene40.screen(640,240,()=>{});display=NetworkScene40.screen(640,410,()=>{});gauges.batch.unlit=display.batch.unlit=true;ready=true;gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);
 }
 function draw(s,planes,lighting=false){if(!ready||!s.visible||!sphereVisible([s.x,s.y+.36,s.z],1.3,planes))return;
  // Materials in the same rigid group share one pose across all render passes.
  const key=[s.x,s.y,s.z,s.yaw,s.roll,s.pitch,s.steer,s.spin].join('|');
  if(key!==poseKey){poseKey=key;models.clear();const r=root(s);for(const part of parts)if(!models.has(part.group))models.set(part.group,mm(r,motion(part,s)));}
  gl.disable(gl.CULL_FACE);
  for(const part of parts){if(part.transparent)continue;part.batch.emission=lighting?[0,0,0]:(lamp(part.name,s)||[0,0,0]);drawBatch(part.batch,models.get(part.group));}
  if(!lighting){screens(s);const body=models.get('body');drawBatch(gauges.batch,mm(body,transform([.38525,1.23123,.6913],[.2425,.1186,1],-.336,Math.PI)));drawBatch(display.batch,mm(body,transform([.00383,1.16128,.6071],[.3391,.2144,1],-.292,Math.PI)));}
  if(lighting&&window.CityMaterials129?.pass==='shadow'){gl.uniform1i(uniforms.uVertexColor147,0);gl.uniform1i(uniforms.uNormalUV147,0);return;}
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  for(const part of parts){if(!part.transparent)continue;part.batch.emission=[0,0,0];drawBatch(part.batch,models.get(part.group));}
  gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1i(uniforms.uVertexColor147,0);gl.uniform1i(uniforms.uNormalUV147,0);
 }
 return {init,draw,root,motion,parts,pivots,SCALE,get ready(){return ready;},axisRotation,pivot};
})();
