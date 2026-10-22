/* World-space material detail and bounded, live exterior lighting passes. */
window.CityMaterials129=(()=>{
 const declarations=`
 uniform highp sampler2DShadow uMovingShadow129;
 uniform mat4 uMovingVP129;uniform float uMovingOn129;
 uniform sampler2D uReflection129;uniform mat4 uReflectionVP129;
 uniform float uReflectionOn129;uniform float uCapture129;
 float movingVisibility129(vec3 p,vec3 n,vec3 light){
  if(uMovingOn129<.5)return 1.;
  vec4 clip=uMovingVP129*vec4(p,1.);vec3 q=clip.xyz/clip.w*.5+.5;
  if(any(lessThan(q,vec3(.002)))||any(greaterThan(q,vec3(.998))))return 1.;
  float bias=max(.000035,.00016*(1.-max(0.,dot(n,light))));
  vec2 t=1./vec2(textureSize(uMovingShadow129,0));float a=0.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)a+=texture(uMovingShadow129,vec3(q.xy+vec2(x,y)*t*.8,q.z-bias));
  return a/9.;
 }
 vec3 relief129(vec3 n,float height){
  vec3 dx=dFdx(vPosition),dy=dFdy(vPosition),a=cross(dy,n),b=cross(n,dx);
  float determinant=dot(dx,a);
  vec3 gradient=sign(determinant)*(dFdx(height)*a+dFdy(height)*b);
  return normalize(abs(determinant)*n-gradient);
 }
 float line129(vec2 p,vec2 a,vec2 b){vec2 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.));}
 float wetness129(vec2 p){
  float basin=noise(p*.57)*.58+noise(p*1.83+7.)*.28+noise(p*6.3)*.14;
  return smoothstep(.70,.80,basin);
 }
 float parkPool131(vec2 p,vec2 center,vec2 scale){
  float edge=length((p-center)/scale)+noise(p*8.)*.15;
  return 1.-smoothstep(.72,1.,edge);
 }
 `;
 const surface=`
 float wet129=0.;
 if(uSurface==18.||uSurface==19.||uSurface==20.||uSurface==29.){
  if(!uNormalMapped){n=normalize(vNormal);if(!gl_FrontFacing)n=-n;}
  vec2 p=vPosition.xz;float footprint=max(fwidth(p.x),fwidth(p.y));
  float fine=1.-smoothstep(.003,.025,footprint);
  float grit=noise(p*210.)*.65+noise(p*457.+17.)*.35;
  float dirt=noise(p*1.7+noise(p*.13)*3.);
  if(uSurface==19.&&abs(vNormal.y)>.65){
   // Slab IDs seed stains, pits and branching cracks independently, including paint.
   vec2 cell=floor(p/.6),q=fract(p/.6),seed=vec2(hash(cell),hash(cell+41.));
   float edge=min(min(q.x,1.-q.x),min(q.y,1.-q.y))*.6;
   float joint=1.-smoothstep(.0018,.0048+footprint*.7,edge);
   float bevel=1.-smoothstep(.004,.012+footprint,edge);
   vec2 stainAt=vec2(.12)+seed*.76;
   float stain=exp(-dot((q-stainAt)*vec2(4.,6.),(q-stainAt)*vec2(4.,6.)))*hash(cell+14.);
   float crack=1.;vec2 a=vec2(seed.x,0.);
   for(int i=1;i<=4;i++){vec2 b=vec2(clamp(seed.x+(hash(cell+float(i)*3.9)-.5)*.48,.08,.92),float(i)*.25);crack=min(crack,line129(q,a,b)*.6);a=b;}
   float broken=step(.83,hash(cell+72.))*(1.-smoothstep(.00035,.0009+footprint*.6,crack));
   float pores=smoothstep(.72,.88,noise((p+seed*3.)*310.))*fine;
   vec2 photoUV=mix(q,q.yx,step(.5,seed.y));photoUV=mix(photoUV,1.-photoUV,step(.5,seed.x));
   vec3 concrete=pow(texture(uBaseMap,photoUV*.76+seed*.24).rgb,vec3(2.2));
   base=uColor.rgb*concrete*(.90+.18*seed.x+.075*(dirt-.5));
   base*=1.-stain*.16-joint*.46-broken*.22-pores*.12;
   base*=1.+(grit-.5)*.09*fine;
   n=relief129(n,-bevel*.0015-broken*.0006+(grit-.5)*.00028*fine);
   rough=.78+.16*seed.y;
  }else if(uSurface==18.){
   base*=.73+.19*dirt;rough=.88;
   base*=1.+(grit-.5)*.20*fine;
   n=relief129(n,(grit-.5)*.00065*fine+noise(p*13.)*.0006);
   // Irregular sealed fissures and repaired patches, independent of the photo tile.
   vec2 block=floor(p/5.),q=fract(p/5.);float seam=abs(q.y-.5-(noise(vec2(q.x*13.,hash(block)*41.))-.5)*.15);
   float tar=(1.-smoothstep(.001,.003+footprint/5.,seam))*step(.55,hash(block+4.));
   base*=1.-tar*.38;rough=mix(rough,.54,tar);
  }else{base*=.88+.12*dirt;}
  if(outdoors>.5&&abs(vNormal.y)>.65){
   wet129=wetness129(p+(uSurface==29.?vec2(2.7,-1.3):vec2(0.)))*(uSurface==19.?.80:1.);
   if(uSurface==29.)wet129=max(wet129*.45,max(parkPool131(p,vec2(-27.7,10.),vec2(.48,.72)),max(parkPool131(p,vec2(-28.1,23.),vec2(.36,.6)),parkPool131(p,vec2(-17.5,-25.),vec2(.63,.38)))));
   float damp=smoothstep(.35,.68,noise(p*.57));
   base*=1.-damp*.14-wet129*.25;
   rough=mix(rough,.07,wet129);
   n=normalize(mix(n,vec3((noise(p*12.+uCityTime*.04)-.5)*.002,1.,(noise(p*12.+32.)-.5)*.002),wet129*.96));
  }
 }
 if(uSurface==17.||uSurface==1.||uSurface==7.){
  float glass129=uSurface==17.?smoothstep(.08,.28,detail.a):0.;
  float fine129=1.-smoothstep(.004,.035,max(fwidth(uv.x),fwidth(uv.y)));
  float pores129=noise(uv*280.);float runs129=noise(vec2(uv.x*9.,uv.y*.4));
  base*=mix(.90+.12*noise(uv*.48)+.07*(pores129-.5)*fine129,1.,glass129);
  base*=1.-(1.-glass129)*smoothstep(.72,.95,runs129)*.12;
  rough=mix(clamp(rough+.07*(pores129-.5),.6,.97),.15+.12*hash(floor(vUV*4.)),glass129);
  n=relief129(n,(1.-glass129)*(pores129-.5)*.00018*fine129);
 }
 if(uSurface==26.){
  float micro=noise(uv*290.),mottle=noise(uv*3.1)*.6+noise(uv*18.)*.4;
  float fine=1.-smoothstep(.003,.025,max(fwidth(uv.x),fwidth(uv.y)));
  base*=.89+.15*mottle+(micro-.5)*.12*fine;
  base*=1.-smoothstep(.75,.9,noise(uv*155.))*.16*fine;
  n=relief129(n,(micro-.5)*.00025*fine);rough=.86;
 }
 if(uSurface==27.){
  vec2 cloth=vUV;
  float fine=1.-smoothstep(.001,.008,max(fwidth(cloth.x),fwidth(cloth.y)));
  float weave=sin(cloth.x*2900.)*sin(cloth.y*2900.)*fine;
  float folds=sin(cloth.x*31.+cloth.y*2.)*.06+sin(cloth.y*39.+cloth.x*3.)*.025;
  base*=.94+folds+weave*.045+(noise(cloth*95.)-.5)*.035;
  n=relief129(n,folds*.006+weave*.00006);rough=.94;
 }
 `;
 const reflection=`
 if(wet129>.015){
  vec3 reflected=sky(reflect(-v,n));
  if(uReflectionOn129>.5){vec4 clip=uReflectionVP129*vec4(vPosition,1.);vec2 q=clip.xy/clip.w*.5+.5;
   float edge=smoothstep(0.,.05,min(min(q.x,1.-q.x),min(q.y,1.-q.y)));
   if(clip.w>0.&&edge>0.){
    vec2 at=q+n.xz*.006,texel=1./vec2(textureSize(uReflection129,0));
    vec3 capture=texture(uReflection129,at).rgb*.5;
    capture+=(texture(uReflection129,at+vec2(texel.x,0.)*.55).rgb+texture(uReflection129,at-vec2(texel.x,0.)*.55).rgb+texture(uReflection129,at+vec2(0.,texel.y)*.55).rgb+texture(uReflection129,at-vec2(0.,texel.y)*.55).rgb)*.125;
    capture=pow(capture,vec3(2.2));reflected=mix(reflected,capture,edge);
   }
  }
  float fresnel=.035+.88*pow(1.-ndv,5.);
  lit=mix(lit,reflected,wet129*fresnel*.92);
  lit+=uSunColor131*pow(max(dot(n,h),0.),380.)*wet129*sh*.55*uSunPower131;
 }
 `;
 let pass=null,depthProgram,depthUniforms,depth,FBO,movingVP,reflectionVP,reflectFBO,reflectTexture,reflectDepth;
 let movingAt=0,frames=0,reflectionFrames=0,casters=0,shadowCasters=0,error=null,enabled=true,movingEnabled=true,reflectionsEnabled=true,reflectWidth=768,reflectHeight=512,movingSize=2048,driving=false;
 let reduced160=false,slowSince160=null,quality160=null;
 function budget160(now){
  if(quality160!==state.quality){quality160=state.quality;reduced160=false;slowSince160=null;}
  if(document.hidden||state.paused||window.Loading155?.blocked||!state.fps){slowSince160=null;return;}
  if(state.fps<40){
   slowSince160??=now;
   if(now-slowSince160>=1500)reduced160=true;
  }else if(state.fps>=45)slowSince160=null;
  // Keep the recovered frame rate stable. Retry full effects only after an
  // explicit quality change or reload, not in an endless quality/FPS oscillation.
 }
 function outside(){
  const p=player.position,b=window.HotelCore146?.bounds;
  if(b&&p.every((v,k)=>v>=b.lo[k]&&v<=b.hi[k]))return false;
  return !window.HospitalityCore140?.inside(p[0],p[2])&&(p[0]<-24.4||p[0]>65.8||p[2]<-30.8||p[2]>35.9);
 }
 function targetTexture(width,height,isDepth){
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,isDepth?gl.DEPTH_COMPONENT24:gl.RGBA8,width,height,0,isDepth?gl.DEPTH_COMPONENT:gl.RGBA,isDepth?gl.UNSIGNED_INT:gl.UNSIGNED_BYTE,null);
  for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);
  for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
  if(isDepth){gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);}return t;
 }
 function init(vs){
  depthProgram=gl.createProgram();gl.attachShader(depthProgram,shader(gl.VERTEX_SHADER,vs));
  gl.attachShader(depthProgram,shader(gl.FRAGMENT_SHADER,`#version 300 es
   precision highp float;in vec2 vUV;uniform sampler2D uBaseMap;uniform float uAlphaCutoff;uniform vec4 uColor;
   void main(){if(uColor.a<.5)discard;if(uAlphaCutoff>=0.&&texture(uBaseMap,vUV).a<uAlphaCutoff)discard;}`));
  gl.linkProgram(depthProgram);if(!gl.getProgramParameter(depthProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(depthProgram));
  depthUniforms={};for(const name of Object.keys(uniforms))depthUniforms[name]=gl.getUniformLocation(depthProgram,name);
  for(const name of['uMovingShadow129','uMovingVP129','uMovingOn129','uReflection129','uReflectionVP129','uReflectionOn129','uCapture129'])uniforms[name]=gl.getUniformLocation(program,name);
  gl.activeTexture(gl.TEXTURE7);depth=targetTexture(2048,2048,true);FBO=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,FBO);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depth,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Moving shadow target unavailable');
  gl.activeTexture(gl.TEXTURE8);reflectTexture=targetTexture(768,512,false);reflectFBO=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,reflectFBO);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,reflectTexture,0);
  reflectDepth=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,reflectDepth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,768,512);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,reflectDepth);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Wet street reflection target unavailable');
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.activeTexture(gl.TEXTURE0);
 }
 function actors(planes){
  const a=characterState.player;
  if(a&&!window.Ambulance35?.mounted&&!window.Rivian147?.mounted){const matrix=actorMatrix(a);
  for(const p of a.model.parts){const b=p.batch;if(b.transparent||b.accessoryCode&&((b.accessoryCode===1&&!a.outfit?.backpack)||(b.accessoryCode===2&&!a.outfit?.hat)||(b.accessoryCode===3&&!a.outfit?.volunteer)))continue;
   b.activeOutfit=a.outfit;b.boneTexture=a.textures[p.skin].t;drawBatch(b,matrix);
  }}
  window.Scooter100?.drawLighting?.(planes);window.Ambulance35?.drawLighting?.(planes);window.Rivian147?.drawLighting?.(planes);
 }
 // The moving-object shadow draws animated batches only. Keep that subset,
 // plus street props (animated while knocked over), instead of testing all
 // ~40,000 city batches again on every frame. Order is unchanged.
 let movers=null,moversSource=null,moversLength=-1,moversAt=0;
 function movingBatches(){
  const now=performance.now();
  if(!movers||moversSource!==renderBatches||moversLength!==renderBatches.length||now-moversAt>2000){movers=renderBatches.filter(b=>b.animated||b.streetProp128);moversSource=renderBatches;moversLength=renderBatches.length;moversAt=now;}
  return movers;
 }
 function scene(planes,shadow){
  const groups=new Map();casters=0;
  for(const b of shadow?movingBatches():renderBatches){
   if(b.hidden128||b.anchor||b.transparent||b.color[3]<.995||b.roof&&!roofsVisible())continue;
   if(shadow&&!b.animated)continue;
   if(shadow&&b.sky)continue;
   if(!shadow&&[8,18,19,20,29].includes(b.surfaceType))continue;
   if(b.cullRadius&&!sphereVisible(b.center,b.cullRadius,planes))continue;
   if(!b.sky&&b.cullRadius&&Math.hypot(b.center[0]-player.position[0],b.center[2]-player.position[2])-b.cullRadius>(shadow?18:75))continue;
   casters++;if(b.sceneInstance||b.skyline){if(!groups.has(b.sharedKey))groups.set(b.sharedKey,[]);groups.get(b.sharedKey).push(b);}else drawBatch(b);
  }
  for(const group of groups.values())drawBuildingInstances(group[0],group);
  actors(planes);
 }
 function frame(vp,width,height){
  // An upstairs preview can start indoors before any outdoor pass has run.
  // Sampler types still need distinct units even when their effects are off.
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,depth);gl.uniform1i(uniforms.uMovingShadow129,7);
  gl.activeTexture(gl.TEXTURE8);gl.bindTexture(gl.TEXTURE_2D,reflectTexture);gl.uniform1i(uniforms.uReflection129,8);gl.activeTexture(gl.TEXTURE0);
  if(!enabled||window.FarmScene63?.active||!outside()){gl.uniform1f(uniforms.uMovingOn129,0);gl.uniform1f(uniforms.uReflectionOn129,0);return;}
  const now=performance.now();driving=!!window.Driving154?.mounted();budget160(now);
  // Retain wet-surface sky lighting without a second shaded city/cabin while
  // driving, or when sustained low frame rates exhaust the walking budget.
  const captureReflection=reflectionsEnabled&&!driving&&!reduced160;
  // The local shadow must use the same interpolated cars and camera frame.
  if(movingEnabled&&state.sunShadows!==false){
   const desiredSize=driving||reduced160?1024:2048;
   if(movingSize!==desiredSize){movingSize=desiredSize;gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,depth);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,movingSize,movingSize,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);gl.activeTexture(gl.TEXTURE0);}
   const center=[player.position[0],player.position[1],player.position[2]],size=14,near=1,far=85;
   const ortho=[1/size,0,0,0,0,1/size,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1];
   movingVP=new Float32Array(mm(ortho,lookAt(add(center,mul(norm(City106.sunDirection),40)),center)));
   const savedProgram=program,savedUniforms=uniforms;
   try{pass='shadow';program=depthProgram;uniforms=depthUniforms;gl.useProgram(program);gl.bindFramebuffer(gl.FRAMEBUFFER,FBO);gl.viewport(0,0,movingSize,movingSize);gl.depthMask(true);gl.disable(gl.BLEND);gl.clear(gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(uniforms.uVP,false,movingVP);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);scene(frustumPlanes(movingVP),true);shadowCasters=casters;frames++;movingAt=now;}
   finally{gl.disable(gl.POLYGON_OFFSET_FILL);program=savedProgram;uniforms=savedUniforms;gl.useProgram(program);pass=null;}
  }
  gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,depth);gl.uniform1i(uniforms.uMovingShadow129,7);gl.uniformMatrix4fv(uniforms.uMovingVP129,false,movingVP||IDENTITY);gl.uniform1f(uniforms.uMovingOn129,movingEnabled&&state.sunShadows!==false&&!!movingVP?1:0);
  if(captureReflection){
   // Camera and capture must share a frame. Throttling this pass caused puddles
   // to hold an old viewpoint for several frames while the player kept moving.
   // Puddles already blur this capture. Keep their camera and motion current
   // without shading a second near-full-resolution city on every frame.
   const scale=Math.min(1,(state.quality>=2?1600:960)/width),rw=Math.max(1,Math.round(width*scale)),rh=Math.max(1,Math.round(height*scale));
   if(rw!==reflectWidth||rh!==reflectHeight){
    reflectWidth=rw;reflectHeight=rh;gl.activeTexture(gl.TEXTURE8);gl.bindTexture(gl.TEXTURE_2D,reflectTexture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,rw,rh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindRenderbuffer(gl.RENDERBUFFER,reflectDepth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,rw,rh);
   }
   const realCamera=camera,realTarget=target,plane=-.055;
   try{pass='reflection';camera=[realCamera[0],2*plane-realCamera[1],realCamera[2]];target=[realTarget[0],2*plane-realTarget[1],realTarget[2]];
    reflectionVP=new Float32Array(mm(perspective(width/height),lookAt(camera,target)));
    gl.activeTexture(gl.TEXTURE8);gl.bindTexture(gl.TEXTURE_2D,whiteBaseMap);gl.uniform1i(uniforms.uReflection129,8);gl.uniform1f(uniforms.uReflectionOn129,0);gl.uniform1f(uniforms.uCapture129,1);
    gl.bindFramebuffer(gl.FRAMEBUFFER,reflectFBO);gl.viewport(0,0,reflectWidth,reflectHeight);gl.depthMask(true);gl.disable(gl.BLEND);gl.clearColor(.48,.57,.62,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uniforms.uVP,false,reflectionVP);gl.uniform3fv(uniforms.uCamera,camera);scene(frustumPlanes(reflectionVP),false);reflectionFrames++;
   }finally{camera=realCamera;target=realTarget;pass=null;gl.uniform1f(uniforms.uCapture129,0);}
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.disable(gl.CULL_FACE);gl.depthMask(true);gl.disable(gl.BLEND);
  gl.uniformMatrix4fv(uniforms.uVP,false,new Float32Array(vp));gl.uniform3fv(uniforms.uCamera,camera);
  gl.activeTexture(gl.TEXTURE8);gl.bindTexture(gl.TEXTURE_2D,reflectTexture);gl.uniform1i(uniforms.uReflection129,8);gl.uniformMatrix4fv(uniforms.uReflectionVP129,false,reflectionVP||IDENTITY);gl.uniform1f(uniforms.uReflectionOn129,captureReflection&&reflectionVP?1:0);gl.activeTexture(gl.TEXTURE0);
 }
 return {declarations,surface,reflection,init,frame,get pass(){return pass;},setEnabled(value){enabled=!!value;},configure({movingShadows=true,reflections=true}={}){movingEnabled=movingShadows;reflectionsEnabled=reflections;},test:{budget160,get depth(){return depth;},get matrix(){return movingVP;}},snapshot:()=>({frames,reflectionFrames,reflectionSize:[reflectWidth,reflectHeight],movingSize,driving,reducedEffects:reduced160,casters,shadowCasters,error,enabled,movingVP:movingVP&&Array.from(movingVP),reflectionVP:reflectionVP&&Array.from(reflectionVP)})};
})();
